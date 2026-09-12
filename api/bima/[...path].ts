/**
 * Same-origin proxy to the BIMA AI backend (api.llmsorgum.online).
 *
 * Why: the backend only allows a whitelist of CORS origins (localhost), so a
 * direct browser call from the deployed Vercel domain is blocked by the browser
 * and the app silently falls back to the offline generator. Proxying through
 * this same-origin function removes CORS from the equation entirely (no
 * preflight, no Access-Control-Allow-Origin required).
 *
 * Route:  POST /api/bima/chat   ->   POST https://api.llmsorgum.online/api/chat
 *
 * Deliberately NOT forwarded: Origin / Referer / Cookie / Host, so the backend
 * cannot reject the request on origin grounds, and no user data leaks through.
 */
export const config = { maxDuration: 60 };

const BACKEND_ORIGIN = process.env.BIMA_BACKEND_ORIGIN || 'https://api.llmsorgum.online';
const UPSTREAM_TIMEOUT_MS = 55_000;

// Headers the frontend may control, forwarded verbatim (lowercase -> canonical).
const PASSTHROUGH_HEADERS = ['x-use-rag', 'x-stream', 'x-model', 'x-api-key'];

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ detail: 'Proxy hanya menerima method POST.' });
    return;
  }

  const rawPath = req.query?.path;
  const segments = Array.isArray(rawPath) ? rawPath : rawPath ? [rawPath] : ['chat'];
  const upstreamUrl = `${BACKEND_ORIGIN}/api/${segments.join('/')}`;

  const body =
    typeof req.body === 'string'
      ? req.body
      : req.body === undefined || req.body === null
        ? '{}'
        : JSON.stringify(req.body);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    // Some upstreams sit behind Cloudflare and 403 a request without a UA.
    'User-Agent': 'Mozilla/5.0 (compatible; BimaSorgum-Proxy/1.0)',
  };
  for (const name of PASSTHROUGH_HEADERS) {
    const value = req.headers?.[name];
    if (value) headers[canonical(name)] = Array.isArray(value) ? value[0] : value;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const upstream = await fetch(upstreamUrl, {
      method: 'POST',
      headers,
      body,
      signal: controller.signal,
    });
    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.send(text);
  } catch (err: any) {
    const aborted = err?.name === 'AbortError';
    res.status(aborted ? 504 : 502).json({
      detail: aborted
        ? 'Backend AI tidak merespons dalam batas waktu proxy (55 detik).'
        : `Gagal menghubungi backend AI: ${err?.message || String(err)}`,
    });
  } finally {
    clearTimeout(timer);
  }
}

function canonical(name: string): string {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('-');
}
