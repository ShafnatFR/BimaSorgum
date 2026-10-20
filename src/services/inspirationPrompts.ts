import { bimaChat } from './bimaClient';

/**
 * Inspiration prompts ("Inspirasi" chips on the Generate page).
 *
 * Previously the chips were only refreshed as a side effect of parsing trailing
 * ">>>" lines off a general-chat reply — a brittle contract that silently failed
 * whenever the model deviated from the format, so users almost always saw the
 * same four hard-coded fallbacks.
 *
 * This module instead asks the model for a small, structured JSON array. That
 * removes the dependency on trailing-line formatting entirely.
 */

/** Backend always appends a reviewer block; drop it so it never pollutes parsing. */
function stripReviewerArtifacts(text: string): string {
  return text
    .replace(/\n*###\s*Catatan Verifikasi[\s\S]*$/i, '')
    .replace(/\n*_Skor kelayakan:[\s\S]*$/i, '')
    .trim();
}

/**
 * Pull the first balanced JSON string-array out of a reply and validate it.
 * Handles the double-wrapped shape the model produces: `[["a","b","c","d"]]`.
 * Returns null when nothing usable is found so callers keep existing prompts.
 */
export function extractPromptArray(rawText: string): string[] | null {
  const text = stripReviewerArtifacts(rawText || '');
  const start = text.indexOf('[');
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (ch === '\\') { i++; continue; }
      if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === '[') depth++;
    else if (ch === ']') {
      depth--;
      if (depth !== 0) continue;
      let parsed: unknown;
      try {
        parsed = JSON.parse(text.slice(start, i + 1));
      } catch {
        return null;
      }
      // Unwrap `[["a","b"]]` -> `["a","b"]`.
      if (Array.isArray(parsed) && parsed.length === 1 && Array.isArray(parsed[0])) {
        parsed = parsed[0];
      }
      if (!Array.isArray(parsed)) return null;
      const strings = parsed.filter((x): x is string => typeof x === 'string');
      // Reject non-list payloads (e.g. the model answered with a recipe object).
      if (strings.length < 2 || strings.length < Math.ceil(parsed.length * 0.7)) return null;
      return strings;
    }
  }
  return null;
}

/** Normalise raw suggestions into clean, de-duplicated chips (max 4). */
export function normalizePrompts(items: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of items) {
    const label = raw
      .replace(/^[\s>*\-*–—•]+/, '')
      .replace(/\s+/g, ' ')
      .trim();
    // Keep chips short enough to fit the horizontally-scrolling row.
    if (label.length < 3 || label.length > 60) continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(label);
    if (out.length >= 4) break;
  }
  return out;
}

/** Short context blurb so suggestions follow the current conversation topic. */
export function buildInspirationContext(
  recentMessages: { sender: string; text?: string; recipeTitle?: string }[],
  fallbackTopic: string
): string {
  const lines = recentMessages
    .slice(-4)
    .map((m) => {
      const body = m.text || m.recipeTitle || '';
      if (!body.trim()) return '';
      return `${m.sender === 'user' ? 'User' : 'AI'}: ${body.slice(0, 300)}`;
    })
    .filter(Boolean);
  if (!lines.length) return fallbackTopic;
  return lines.join('\n');
}

/**
 * Ask the AI for a fresh set of follow-up question suggestions.
 * Returns [] on any failure — callers should keep the previous prompts rather
 * than clearing them, so a slow or failing model never blanks the chips.
 */
export async function fetchInspirationPrompts(context: string): Promise<string[]> {
  const topic = context.trim() || 'sorgum';
  const message = [
    'Kamu adalah asisten aplikasi resep sorgum (SorghumCare).',
    'Tugasmu HANYA membuat ide pertanyaan lanjutan untuk pengguna, bukan menjawab, bukan membuat resep.',
    '',
    'Buat tepat 4 pertanyaan lanjutan singkat (masing-masing maksimal 8 kata, bahasa Indonesia)',
    'yang paling relevan dengan konteks percakapan di bawah.',
    '',
    'Konteks:',
    topic,
    '',
    'Balas HANYA dengan array JSON berisi tepat 4 string.',
    'Jangan tulis teks lain, jangan markdown, jangan nomor, jangan blok Catatan Verifikasi.',
    'Contoh format yang benar:',
    '["Pertanyaan satu","Pertanyaan dua","Pertanyaan tiga","Pertanyaan empat"]',
  ].join('\n');

  try {
    const res = await bimaChat(message, [], { useRag: false });
    const arr = extractPromptArray(res.response);
    if (!arr) return [];
    return normalizePrompts(arr);
  } catch (e) {
    console.warn('fetchInspirationPrompts error:', e);
    return [];
  }
}
