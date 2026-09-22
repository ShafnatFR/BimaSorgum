import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Dev proxy: same-origin calls from the browser hit this prefix and are
      // forwarded server-side to the AI backend (mirrors the Vercel rewrite
      // `/bima-api/*` -> `/api/bima/*`). Origin is pinned to an allowed dev
      // origin so the backend's CORS allowlist doesn't reject the hop.
      proxy: {
        '/bima-api': {
          target: 'https://api.llmsorgum.online',
          changeOrigin: true,
          rewrite: (p: string) => p.replace(/^\/bima-api/, '/api'),
          headers: { Origin: 'http://localhost:3000' },
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
