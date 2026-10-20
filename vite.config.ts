import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  // Server-side only (no VITE_ prefix, so never bundled into the browser JS):
  // the consumer key the backend requires on /api/chat, and an optional backend
  // override. Read from the process env (Dokploy) or .env.local.
  const env = loadEnv(mode, process.cwd(), '');
  const bimaApiKey = env.BIMA_API_KEY || '';
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Proxy: same-origin calls from the browser hit this prefix and are
      // forwarded server-side to the AI backend (mirrors the Vercel rewrite
      // `/bima-api/*` -> `/api/bima-chat`). `vite preview` (the Dokploy
      // container) reuses it, since preview.proxy defaults to server.proxy.
      // Origin is pinned to an allowed dev origin so a CORS allowlist on the
      // backend doesn't reject the hop. The consumer key is added here, not in
      // the browser; lowercase so it replaces any key the client sent instead
      // of going out as a second header.
      proxy: {
        '/bima-api': {
          target: env.BIMA_BACKEND_ORIGIN || 'https://api.llmsorgum.online',
          changeOrigin: true,
          rewrite: (p: string) => p.replace(/^\/bima-api/, '/api'),
          headers: {
            Origin: 'http://localhost:3000',
            ...(bimaApiKey ? { 'x-api-key': bimaApiKey } : {}),
          },
        },
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    preview: {
      allowedHosts: true as any,
    },
  };
});
