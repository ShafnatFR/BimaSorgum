/**
 * Server lokal untuk pengujian end-to-end:
 *  - melayani hasil build `dist/` (SPA fallback ke index.html)
 *  - mem-proxy /bima-api/* -> https://api.llmsorgum.online/api/*
 *    (meniru rewrite Vercel; Origin dipatok ke http://localhost:3000 yang diizinkan backend)
 * Jalankan: node server_local.cjs   (bind 127.0.0.1:3000)
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = process.argv[2] || path.join(__dirname, "dist");
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

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);

  if (url.pathname.startsWith("/bima-api/")) {
    const target = BACKEND + url.pathname.replace(/^\/bima-api/, "/api") + url.search;
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const body = Buffer.concat(chunks);
    const headers = {
      "Content-Type": req.headers["content-type"] || "application/json",
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0 Safari/537.36",
      Origin: "http://localhost:3000", // origin yang diizinkan backend
    };
    for (const h of ["x-use-rag", "x-stream", "x-model", "x-api-key"]) {
      if (req.headers[h]) headers[h] = req.headers[h];
    }
    const t0 = Date.now();
    try {
      const up = await fetch(target, { method: req.method, headers, body: req.method === "GET" ? undefined : body });
      const text = await up.text();
      console.log(`[proxy] ${req.method} ${url.pathname} -> ${up.status} ${Date.now() - t0}ms ${text.length}b`);
      res.writeHead(up.status, { "Content-Type": up.headers.get("content-type") || "application/json", "Cache-Control": "no-store" });
      res.end(text);
    } catch (e) {
      console.log(`[proxy] ERROR ${e.message}`);
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ detail: `Proxy error: ${e.message}` }));
    }
    return;
  }

  let filePath = path.join(ROOT, decodeURIComponent(url.pathname));
  if (!filePath.startsWith(ROOT)) filePath = path.join(ROOT, "index.html");
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(ROOT, "index.html"); // SPA fallback
  }
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, "127.0.0.1", () => console.log(`server_local siap: http://127.0.0.1:${PORT} (root=${ROOT})`));
