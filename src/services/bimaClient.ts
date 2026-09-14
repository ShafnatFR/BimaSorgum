/**
 * BIMA AI client — talks to the SorghumCare LLM backend.
 *
 * Routes: browser → `/bima-api/chat` (same-origin proxy) → backend.
 * Streaming: enabled by default. The Vercel proxy relays SSE chunks so the
 * function stays alive beyond the 60s Hobby timeout.
 */
const DIRECT_BACKEND = 'https://api.llmsorgum.online';
const envBase = (import.meta.env.VITE_BIMA_API_URL || '').replace(/\/+$/, '');
const inBrowser = typeof window !== 'undefined' && /^https?:$/.test(window.location.protocol);
const BIMA_BASE_URL = envBase || (inBrowser ? '' : DIRECT_BACKEND);
const BIMA_CHAT_PATH = BIMA_BASE_URL ? `${BIMA_BASE_URL}/api/chat` : '/bima-api/chat';
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

/** Parse SSE delta stream into a single accumulated response string. */
async function parseSSE(reader: ReadableStreamDefaultReader<Uint8Array>): Promise<string> {
  const decoder = new TextDecoder();
  let full = '';
  let buffer = '';
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice(6).trim();
      if (payload === '[DONE]') continue;
      try {
        const obj = JSON.parse(payload);
        if (obj.delta) full += obj.delta;
        if (obj.response) full = obj.response; // overwrite with final aggregated
      } catch { /* ignore malformed line */ }
    }
  }
  return full;
}

/** Single-turn or multi-turn chat against the BIMA AI backend. */
export async function bimaChat(
  message: string,
  history: BimaChatMessage[] = [],
  opts: { model?: string; useRag?: boolean; stream?: boolean } = {}
): Promise<BimaChatResult> {
  const stream = opts.stream !== false; // default true
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Use-RAG': opts.useRag ? 'true' : 'false',
    'X-Stream': stream ? 'true' : 'false',
  };
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

  let response: string;
  let sources: any[] = [];
  let modelUsed: string | undefined;

  if (stream && res.body) {
    response = await parseSSE(res.body.getReader());
    if (!response || !response.trim()) {
      throw new Error('BIMA AI returned an empty response.');
    }
  } else {
    const data = await res.json();
    response = data.response ?? data.answer ?? '';
    sources = data.sources;
    modelUsed = data.model;
  }

  if (!response || !response.trim()) {
    throw new Error('BIMA AI returned an empty response.');
  }
  if (/tidak ada teks respons/i.test(response)) {
    throw new Error('BIMA AI backend failed to produce a response (empty text).');
  }
  return { response, sources, model: modelUsed };
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

  const fenced = text.replace(/```json/gi, '```').split('```');
  for (let i = 0; i < fenced.length; i++) {
    const block = fenced[i].trim();
    if (block.startsWith('{') || block.startsWith('[')) candidates.push(block);
  }

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
    const repaired = raw.replace(/(?<=[,{]\s*)"([^"]+)"\s*,/g, '"$1": null,');
    const fixed = tryParse(repaired);
    if (fixed) return fixed;
  }

  return null;
}