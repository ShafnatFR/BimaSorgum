/**
 * BIMA AI client — talks to the Living Labs BIMA Dashboard LLM backend.
 * Base URL: https://bima-dashboard.livinglabs.id
 * Endpoint: POST /api/chat  body {message, history?} → {response}
 *
 * The backend is a RAG-powered FastAPI service with ChromaDB knowledge base
 * (34 chunks on sorgum). X-Api-Key is optional; X-Use-RAG true enriches the
 * prompt with relevant knowledge chunks.
 */
const BIMA_BASE_URL = import.meta.env.VITE_BIMA_API_URL || 'https://bima-dashboard.livinglabs.id';
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

  const res = await fetch(`${BIMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`BIMA AI error ${res.status}: ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  return {
    response: data.response ?? data.answer ?? '',
    sources: data.sources,
    model: data.model,
  };
}

/** Parse a recipe JSON from LLM text (tolerant of markdown fences & prose). */
export function extractJsonFromLlm(text: string): Record<string, any> | null {
  if (!text) return null;

  // 1) Direct JSON parse
  try {
    return JSON.parse(text);
  } catch {
    /* continue */
  }

  // 2) Strip markdown code fences
  const fenced = text.replace(/```json/gi, '```').split('```');
  for (let i = 0; i < fenced.length; i++) {
    const block = fenced[i].trim();
    if (block.startsWith('{') || block.startsWith('[')) {
      try {
        return JSON.parse(block);
      } catch {
        /* continue */
      }
    }
  }

  // 3) Extract the first {...} or [...] balanced substring
  const start = text.search(/[{[]/);
  if (start === -1) return null;
  const open = text[start];
  const close = open === '{' ? '}' : ']';
  let depth = 0;
  let inString = false;
  let esc = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (inString) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inString = false;
      continue;
    }
    if (c === '"') inString = true;
    else if (c === open) depth++;
    else if (c === close) {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(text.slice(start, i + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}
