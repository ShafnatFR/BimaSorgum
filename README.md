# SorghumCare (BimaSorgum) — Web

AI recipe generator berbasis sorgum. SPA React 19 + Vite + Tailwind v4, database
Supabase, AI dari backend RAG `https://api.llmsorgum.online`.

Catatan fitur, alur, tabel database, dan temuan pengujian: lihat [`memory.md`](memory.md).

## Menjalankan

```bash
npm ci
npm run dev        # http://localhost:3000
npm run build      # hasil ke dist/
npm run preview    # menyajikan dist/ di port 4173 (sama seperti produksi)
npm run lint       # cek tipe TypeScript
```

## Env (`.env`)

| Variabel | Dipakai di | Fungsi |
|---|---|---|
| `VITE_SUPABASE_URL` | browser | URL project Supabase |
| `VITE_SUPABASE_ANON_KEY` | browser | Anon key Supabase (aman publik, dilindungi RLS) |
| `VITE_UNSPLASH_ACCESS_KEY` | browser | Opsional — gambar resep dari Unsplash |
| `BIMA_API_KEY` | server (proxy) | Consumer key backend (`bima_live_…`), **tanpa** prefix `VITE_` agar tidak ter-bundle |
| `BIMA_BACKEND_ORIGIN` | server (proxy) | Opsional — default `https://api.llmsorgum.online` |

Browser memanggil `/bima-api/*`; proxy di `vite.config.ts` meneruskannya ke
`{BIMA_BACKEND_ORIGIN}/api/*` sambil menambahkan `X-Api-Key`, jadi key backend
tidak pernah sampai ke browser.

## Deploy

Dokploy membangun `Dockerfile`: `npm ci` → `npm run build` → `npm run preview`
(port 4173). Env di atas diisi di pengaturan Dokploy. `package-lock.json` harus
sinkron dengan `package.json`, kalau tidak `npm ci` gagal.

## Database

Migrasi SQL ada di `supabase/migrations/` (urut nomor); panduan setup di
`supabase/README-setup.md`.
