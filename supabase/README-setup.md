# SorghumCare (BimaSorgum) — Supabase Setup Guide

Aplikasi: AI Recipe Generator berbasis sorgum (React/Vite SPA).
Status: frontend sudah live di Vercel; DB belum dibuat.

## 1. Prasyarat (sekali saja)

Login Supabase CLI (token Personal Access, format `sbp_...`):

    supabase login

Buat token di: https://supabase.com/dashboard/account/tokens
(tombol "Generate new token", pilih scope, copy).

## 2. Buat project baru

    supabase projects create bimasorgum \
      --org-id <ORG_ID> \
      --region ap-southeast-1 \
      --db-password "<PASSWORD_KUAT>"

- `ORG_ID` bisa dilihat dengan: `supabase orgs list`
- Region Singapore (ap-southeast-1) = latensi terbaik utk Indonesia.
- Catat Project Ref (id) dari output: `Created project at .../project/<ref>`

## 3. Terapkan schema + seed

    supabase db push   # (jika sudah `supabase link --project-ref <ref>`)
    # ATAU lewat dashboard:
    #   SQL Editor -> buka supabase/migrations/001_schema_core.sql -> RUN
    #   SQL Editor -> buka supabase/migrations/002_seed_catalog.sql -> RUN

Verifikasi cepat di SQL Editor:

    select count(*) from public.recipes;      -- expect >= 1
    select count(*) from public.ingredients;  -- expect 12

## 4. Ambil kredensial API

Dashboard -> Project Settings -> API:
- Project URL: `https://<ref>.supabase.co`
- anon / publishable key: utk klien (VITE_SUPABASE_ANON_KEY)
- service_role: utk server/backend (JANGAN bocor ke frontend)

Catatan penting dari pengalaman proyek lain:
- Pakai PUBLISHABLE key (`sb_publishable_...`) bila tersedia, bukan legacy anon.
- service_role key MENEMBUS RLS — hanya untuk kode server/trusted.

## 5. Set env di Vercel

    vercel env add VITE_SUPABASE_URL production
    vercel env add VITE_SUPABASE_ANON_KEY production

lalu redeploy:

    vercel deploy --prod --yes

## 6. Struktur tabel (ringkas)

| Tabel               | Isi                                   | RLS        |
|---------------------|---------------------------------------|------------|
| profiles            | Profil pengguna (1:1 auth.users)      | pemilik    |
| ingredients         | Master bahan + harga (wizard)         | publik baca|
| recipes             | Master resep (sistem + AI)            | publik baca|
| recipe_ingredients  | Bahan per resep (berurut)             | publik baca|
| recipe_steps        | Langkah masak per resep (berurut)     | publik baca|
| recipe_targets      | Target konsumen per resep (M:N)       | publik baca|
| saved_recipes       | Simpan/favorit pengguna               | pemilik    |
| chat_sessions       | Sesi chat AI                          | pemilik    |
| chat_messages       | Pesan chat (user/ai, lampiran resep)  | pemilik    |

Auth: Supabase Auth (email/password, Google OAuth). Trigger `handle_new_user`
otomatis membuat baris `profiles` saat signup.

## 7. Selanjutnya (opsional, integrasi kode)

Repo saat ini masih SPA statis (data mock client-side, belum ada @supabase/supabase-js).
Untuk benar-benar memakai DB, tambahkan:
- `@supabase/supabase-js`
- `lib/supabase.ts` (createClient URL + anon key)
- Ganti mock data di `src/data/*` dengan fetch dari Supabase (RLS sudah siap).
- Backend AI (Gemini) via API route / fungsi serverless kalau mau simpan resep hasil generate.
