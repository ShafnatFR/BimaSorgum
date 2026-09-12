/**
 * BIMA AI client — talks to the SorghumCare LLM backend.
 * Base URL: https://api.llmsorgum.online
 * Endpoint: POST /api/chat  body {message, history?} → {response}
 *
 * The backend is a RAG-powered FastAPI service with ChromaDB knowledge base
 * (34 chunks on sorgum). X-Api-Key is optional; X-Use-RAG true enriches the
 * prompt with relevant knowledge chunks.
 */
/**
 * Base URL resolution (CORS-safe).
 *
 * The backend `api.llmsorgum.online` only allows a whitelist of CORS origins
 * (localhost), so a DIRECT browser call from the Vercel domain is blocked by the
 * browser (preflight -> 400 "Disallowed CORS origin", fetch -> "Failed to fetch")
 * and the app silently fell back to the offline generator.
 *
 * In the browser we therefore call our OWN origin (`/bima-api/chat`), which
 * `vercel.json` rewrites to the backend. Same-origin requests are not subject to
 * CORS, so no preflight is sent and the block disappears entirely.
 *
 * `VITE_BIMA_API_URL` still overrides everything (custom backend / self-host).
 */
const DIRECT_BACKEND = 'https://api.llmsorgum.online';
const envBase = (import.meta.env.VITE_BIMA_API_URL || '').replace(/\/+$/, '');
const inBrowser = typeof window !== 'undefined' && /^https?:$/.test(window.location.protocol);
// '' = same-origin proxy (browser default), otherwise the explicit absolute URL.
const BIMA_BASE_URL = envBase || (inBrowser ? '' : DIRECT_BACKEND);
/** Path of the chat endpoint: proxied same-origin in the browser, direct elsewhere. */
const BIMA_CHAT_PATH = BIMA_BASE_URL ? `${BIMA_BASE_URL}/api/chat` : '/bima-api/chat';
// Leave empty to use the backend's default model (from its /api/config).
const BIMA_MODEL = import.meta.env.VITE_BIMA_MODEL || '';
const BIMA_API_KEY = import.meta.env.VITE_BIMA_API_KEY || '';

export interface BimaChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface BimaChatResult {
  response: string;
  sources?: { documentName: string; text: string }[];
  model?: string;
}

/** Single-turn or multi-turn chat against the BIMA AI backend. */
export async function bimaChat(
  message: string,
  history: BimaChatMessage[] = [],
  opts: { model?: string; useRag?: boolean; stream?: boolean } = {}
): Promise<BimaChatResult> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Use-RAG': String(opts.useRag ?? true),
    'X-Stream': String(opts.stream ?? false),
  };
  // Only send X-Model when a model was explicitly chosen; the backend's
  // default model is used otherwise (sending an invalid id returns 502).
  const model = opts.model || BIMA_MODEL;
  if (model) headers['X-Model'] = model;
  if (BIMA_API_KEY) headers['X-Api-Key'] = BIMA_API_KEY;

  const payload: Record<string, unknown> = { message };
  if (history && history.length) payload.history = history;

  const res = await fetch(BIMA_CHAT_PATH, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`BIMA AI error ${res.status}: ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  const response = data.response ?? data.answer ?? '';
  // Backend sometimes returns a sentinel empty-string message instead of a real answer.
  if (!response || !response.trim()) {
    throw new Error('BIMA AI returned an empty response.');
  }
  if (/tidak ada teks respons/i.test(response)) {
    throw new Error('BIMA AI backend failed to produce a response (empty text).');
  }
  return {
    response,
    sources: data.sources,
    model: data.model,
  };
}

/** Parse a recipe JSON from LLM text (tolerant of markdown fences, prose & minor JSON defects). */
export function extractJsonFromLlm(text: string): Record<string, any> | null {
  if (!text) return null;

  const tryParse = (s: string): Record<string, any> | null => {
    try {
      const v = JSON.parse(s);
      return v && typeof v === 'object' ? v : null;
    } catch {
      return null;
    }
  };

  const candidates: string[] = [text.trim()];

  // Strip markdown code fences into separate candidate blocks
  const fenced = text.replace(/```json/gi, '```').split('```');
  for (let i = 0; i < fenced.length; i++) {
    const block = fenced[i].trim();
    if (block.startsWith('{') || block.startsWith('[')) candidates.push(block);
  }

  // Balanced substring from first { or [ to the LAST matching close
  const start = text.search(/[{[]/);
  if (start !== -1) {
    const open = text[start];
    const close = open === '{' ? '}' : ']';
    const lastClose = text.lastIndexOf(close);
    if (lastClose > start) candidates.push(text.slice(start, lastClose + 1));
  }

  for (const raw of candidates) {
    const direct = tryParse(raw);
    if (direct) return direct;
    // Repair common LLM defect: a field key with no value ("key",) becomes ("key": null,).
    // Only matches a bare key that is preceded by ',' or '{' (not a value), followed by a comma.
    const repaired = raw.replace(/(?<=[,{]\s*)"([^"]+)"\s*,/g, '"$1": null,');
    const fixed = tryParse(repaired);
    if (fixed) return fixed;
  }

  return null;
}
