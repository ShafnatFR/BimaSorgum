/**
 * BIMA AI client — talks to the SorghumCare LLM backend.
 *
 * Routes: browser → `/bima-api/chat` (same-origin proxy) → backend.
 * Streaming: enabled by default. The Vercel proxy relays SSE chunks so the
 * function stays alive beyond the 60s Hobby timeout.
 */
const BIMA_CHAT_PATH = '/bima-api/chat';
const BIMA_MODEL = import.meta.env.VITE_BIMA_MODEL || '';
const BIMA_API_KEY = import.meta.env.VITE_BIMA_API_KEY || '';

export interface BimaChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface BimaChatResult {
  response: string;
  sources?: { documentName: string; text: string }[];
  model?: string;
}

/**
 * Extract only the first complete JSON object from text.
 * The backend SSE often appends metadata ("summary", "reviewer_ran", ...)
 * after the recipe JSON, which would cause JSON.parse to fail with "Extra data".
 * This trims everything after the first balanced closing brace.
 */
function extractFirstJson(text: string): string {
  const start = text.indexOf('{');
  if (start === -1) return text;
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') { depth--; if (depth === 0) return text.substring(start, i + 1); }
  }
  return text;
}

async function parseSSE(reader: ReadableStreamDefaultReader<Uint8Array>): Promise<string> {
  const decoder = new TextDecoder();
  let full = '';
  let buffer = '';
  let validationData: any = null;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      // Skip SSE comments (heartbeat keepalive from backend)
      if (line.startsWith(':')) continue;
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice(6).trim();
      if (payload === '[DONE]') continue;
      try {
        const obj = JSON.parse(payload);
        if (obj.delta) full += obj.delta;
        if (obj.response) full = obj.response;
        if (obj.validation) validationData = obj.validation;
      } catch { /* ignore malformed line */ }
    }
  }
  
  // 🔧 If the backend RAG guard flagged the recipe as unfit/dangerous, DO NOT render the food!
  // Force it into an 'unpayload' refusal so the frontend displays the warning instead.
  if (validationData && validationData.verdict === 'tidak_valid') {
    const issues = validationData.issues || [];
    const reasons = issues.map((i: any) => `- **${i.aspect}**: ${i.problem}`).join('\n');
    const msg = `**Resep Ditolak (Skor Kelayakan: ${validationData.score}/100)**\n\nResep ini dinilai belum layak dipraktikkan karena:\n${reasons}\n\n*Sistem AI BIMA telah memblokir resep ini demi keamanan dan kenyamanan.*`;
    return msg;
  }

  // The backend appends metadata after the recipe JSON, which would break JSON.parse
  // (e.g. ""summary": "", "reviewer_ran": false, ..." after the closing brace).
  // Extract only the first complete JSON object.
  const trimmedFull = full.trim();
  if (trimmedFull.startsWith('{')) {
    const clean = extractFirstJson(trimmedFull);
    try {
      // If the LLM hallucinated a JSON wrapper { "type": "text", "text": "..." }
      const parsedClean = JSON.parse(clean);
      if (parsedClean && parsedClean.type === 'text' && typeof parsedClean.text === 'string') {
        full = parsedClean.text;
      } else if (clean !== full) {
        full = clean;
      }
    } catch (e) {
      if (clean !== full) full = clean;
    }
  }
  return full;
}
export async function bimaChat(
  message: string,
  history: BimaChatMessage[] = [],
  opts: { model?: string; useRag?: boolean; stream?: boolean } = {}
): Promise<BimaChatResult> {
  const stream = opts.stream !== false; // default true
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Use-RAG': String(opts.useRag ?? true),
        'X-Stream': stream ? 'true' : 'false',
        'X-Max-Tokens': '8192',
      };
    
    // We intentionally do NOT send X-Model, X-Server-Url, or X-LLM-API-Key from the frontend.
    // This forces the backend to use the default LLM settings configured by the Admin in the dashboard.
    // The X-Api-Key header below is strictly for Consumer API Keys (bima_...), not LLM provider keys.
    if (BIMA_API_KEY) headers['X-Api-Key'] = BIMA_API_KEY;
      const payload: Record<string, unknown> = { message };
  if (history && history.length) payload.history = history;

  // 🔧 Client-side timeout: 300s (5 min) — matches backend LLM timeout.
  // Heartbeat SSE comments from backend keep the connection alive through proxies.
  const CLIENT_TIMEOUT_MS = 300_000;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), CLIENT_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(BIMA_CHAT_PATH, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: ctl.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    let cleanMsg = errText;
    try {
      const parsed = JSON.parse(errText);
      if (parsed.detail) cleanMsg = parsed.detail;
    } catch (e) {
      cleanMsg = errText.slice(0, 300);
    }
    throw new Error(`BIMA AI error ${res.status}: ${cleanMsg}`);
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

/** Attempt to repair a truncated JSON string by closing open brackets/braces/strings. */
function repairTruncatedJson(s: string): string | null {
  // Close any open string value
  let text = s;
  // Count unmatched quotes (simple: count non-escaped quotes, odd = open string)
  const quotes = text.match(/(?<!\\)"/g);
  if (quotes && quotes.length % 2 !== 0) {
    // Last quote is unclosed — close the string
    text += '"';
  }

  // Track open { and [ (ignoring those inside strings — simplified: count all)
  const stack: string[] = [];
  let inString = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"' && (i === 0 || text[i - 1] !== '\\')) {
      inString = !inString;
    }
    if (inString) continue;
    if (ch === '{') stack.push('}');
    else if (ch === '[') stack.push(']');
    else if (ch === '}' || ch === ']') stack.pop();
  }

  // Also close any trailing comma before closing
  text = text.replace(/,\s*$/, '');

  // Append closing brackets in reverse order
  while (stack.length > 0) {
    text += stack.pop();
  }

  return text;
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

  // 🔧 NEW: try to repair truncated JSON by auto-closing brackets/braces
  const firstCandidate = candidates[0];
  if (firstCandidate && /^\s*\{/.test(firstCandidate)) {
    const repaired = repairTruncatedJson(firstCandidate);
    if (repaired) {
      const parsed = tryParse(repaired);
      if (parsed) return parsed;
    }
  }

  return null;
}