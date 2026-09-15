/**
 * Same-origin proxy to the BIMA AI backend (api.llmsorgum.online).
 *
 * Routes:  POST /api/bima/chat (also supports streaming SSE relay)
 * Why: bypasses CORS; streaming SSE keeps the Vercel function alive beyond
 * the 60s timeout because data flows continuously.
 */

export const config = { maxDuration: 60 };

const BACKEND_ORIGIN = process.env.BIMA_BACKEND_ORIGIN || 'https://api.llmsorgum.online';
const UPSTREAM_TIMEOUT_MS = 55_000;
const STREAM_CHUNK_TIMEOUT_MS = 30_000; // reset setiap kali data diterima
const PASSTHROUGH_HEADERS = ['x-use-rag', 'x-stream', 'x-model', 'x-api-key'];

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ detail: 'Proxy hanya menerima method POST.' });
    return;
  }

  const body = typeof req.body === 'string' ? req.body
    : req.body == null ? '{}' : JSON.stringify(req.body);
  const upstreamUrl = BACKEND_ORIGIN + '/api/chat';
  const wantStream = String(req.headers?.['x-stream'] || '').toLowerCase() === 'true';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: wantStream ? 'text/event-stream' : 'application/json',
    'User-Agent': 'Mozilla/5.0 (compatible; BimaSorgum-Proxy/1.0)',
  };
  for (const name of PASSTHROUGH_HEADERS) {
    const value = req.headers?.[name];
    if (value) headers[canonical(name)] = Array.isArray(value) ? value[0] : value;
  }
  if (wantStream) headers['X-Stream'] = 'true';

  const ctl = new AbortController();
    let timer = setTimeout(() => ctl.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const upstream = await fetch(upstreamUrl, { method: 'POST', headers, body, signal: ctl.signal });

    if (!upstream.ok || !upstream.body) {
      const errText = await upstream.text().catch(() => '');
      res.status(upstream.status).json({ detail: errText.slice(0, 500) || `Upstream error ${upstream.status}` });
      return;
    }

    if (wantStream) {
      // Relay SSE chunks to the client as they arrive, keeping the connection alive.
      res.status(200);
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Connection', 'keep-alive');

      const reader = upstream.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let lastFlush = Date.now();

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
                  res.write(line + '\n');
                }

                // 🔧 Reset timer setiap chunk diterima — streaming keepalive
                clearTimeout(timer);
                timer = setTimeout(() => ctl.abort(), STREAM_CHUNK_TIMEOUT_MS);

        // Flush every 500ms or when we have data pending.
        if (Date.now() - lastFlush > 500) {
          // Node http: calling res.write is enough — Vercel sends it.
          lastFlush = Date.now();
        }
      }
      // Flush any remaining buffered data.
      if (buffer) res.write(buffer + '\n');
      res.end();
    } else {
      const text = await upstream.text();
      res.status(upstream.status);
      res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
      res.setHeader('Cache-Control', 'no-store');
      res.send(text);
    }
  } catch (err: any) {
    clearTimeout(timer);
    if (res.headersSent) return; // streaming already started — can't send error
    const aborted = err?.name === 'AbortError';
    res.status(aborted ? 504 : 502).json({
      detail: aborted
        ? 'Backend AI tidak merespons dalam batas waktu proxy (50 detik).'
        : `Gagal menghubungi backend AI: ${err?.message || String(err)}`,
    });
  } finally {
    clearTimeout(timer);
  }
}

function canonical(name: string): string {
  return name.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('-');
}