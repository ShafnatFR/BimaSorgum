/**
 * Server lokal untuk pengujian end-to-end:
 *  - melayani hasil build `dist/` (SPA fallback ke index.html)
 *  - mem-proxy /bima-api/* -> https://api.llmsorgum.online/api/*
 *    (meniru rewrite Vercel; Origin dipatok ke http://localhost:3000 yang diizinkan backend)
 * Jalankan: node server_local.cjs [root] [port]
 *
 * Penting: setiap error ditangkap supaya proses tidak mati (unhandled rejection
 * di Node >=15 mematikan proses, dan itu yang bikin sisa request jadi "refused").
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

process.on("unhandledRejection", (e) => console.log("[fatal-kept-alive] unhandledRejection:", e && e.message));
process.on("uncaughtException", (e) => console.log("[fatal-kept-alive] uncaughtException:", e && e.message));

const ROOT = path.resolve(process.argv[2] || path.join(__dirname, "..", "dist"));
const PORT = Number(process.argv[3] || 3000);
const BACKEND = "https://api.llmsorgum.online";
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

async function handleProxy(req, res, url) {
  const target = BACKEND + url.pathname.replace(/^\/bima-api/, "/api") + url.search;
  let body = Buffer.alloc(0);
  try {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    body = Buffer.concat(chunks);
  } catch (e) {
    console.log("[proxy] body read error:", e.message);
  }
  const headers = {
    "Content-Type": req.headers["content-type"] || "application/json",
    Accept: "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0 Safari/537.36",
    Origin: "http://localhost:3000",
  };
  for (const h of ["x-use-rag", "x-stream", "x-model", "x-api-key"]) {
    if (req.headers[h]) headers[h] = req.headers[h];
  }
  const t0 = Date.now();
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 90000);
  try {
    const up = await fetch(target, { method: "POST", headers, body, signal: ctl.signal });
    const text = await up.text();
    console.log(`[proxy] POST ${url.pathname} -> ${up.status} ${Date.now() - t0}ms ${text.length}b`);
    res.writeHead(up.status, { "Content-Type": up.headers.get("content-type") || "application/json", "Cache-Control": "no-store" });
    res.end(text);
  } catch (e) {
    const aborted = e.name === "AbortError";
    console.log(`[proxy] ERROR setelah ${Date.now() - t0}ms: ${e.name}: ${e.message}`);
    if (!res.headersSent) {
      res.writeHead(aborted ? 504 : 502, { "Content-Type": "application/json" });
    }
    res.end(JSON.stringify({ detail: aborted ? "timeout proxy 90s" : `Proxy error: ${e.message}` }));
  } finally {
    clearTimeout(timer);
  }
}

function serveStatic(res, url) {
  let filePath = path.join(ROOT, decodeURIComponent(url.pathname));
  if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(ROOT, "index.html");
  }
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  if (url.pathname.startsWith("/bima-api/")) {
    handleProxy(req, res, url).catch((e) => {
      console.log("[proxy] handler crash:", e && e.message);
      try { res.end(JSON.stringify({ detail: "handler crash: " + (e && e.message) })); } catch {}
    });
    return;
  }
  try {
    serveStatic(res, url);
  } catch (e) {
    console.log("[static] error:", e && e.message);
    try { res.writeHead(500).end("err"); } catch {}
  }
});

server.on("clientError", (err, socket) => {
  try { socket.end("HTTP/1.1 400 Bad Request\r\n\r\n"); } catch {}
});

server.listen(PORT, "127.0.0.1", () => console.log(`server_local siap: http://127.0.0.1:${PORT} (root=${ROOT})`));
