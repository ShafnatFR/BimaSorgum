-- ============================================================
-- SorghumCare (BimaSorgum) — Migration 008
-- Laporan (reports) + hak akses admin untuk hapus konten:
--   * Tabel public.reports untuk laporan user terhadap konten
--     (komentar / resep / user / konten lain) yang bisa
--     di-review admin (terima / tolak).
--   * Policy baru di tabel existing (recipe_comments, recipes)
--     supaya admin bisa menghapus data bermasalah.
-- ============================================================

-- ============================================================
-- 1. TABEL LAPORAN (REPORTS)
-- ============================================================
-- reporter_id  : user yang mengirim laporan (boleh null bila akun dihapus)
-- target_type  : jenis objek yang dilaporkan
-- target_id    : id objek yang dilaporkan (disimpan sbg text agar
--                bisa menunjuk ke berbagai tabel: uuid/ teks)
-- status       : pending -> accepted (diterima) / rejected (ditolak)
-- admin_note   : catatan dari admin saat memproses laporan
-- reviewed_by  : admin yang memproses laporan
create table if not exists public.reports (
  id            uuid primary key default gen_random_uuid(),
  reporter_id   uuid references auth.users (id) on delete set null,
  target_type   text not null
                check (target_type in ('comment','recipe','user','content')),
  target_id     text not null,
  reason        text not null,
  status        text not null default 'pending'
                check (status in ('pending','accepted','rejected')),
  admin_note    text,
  reviewed_by   uuid references public.profiles (id) on delete set null,
  reviewed_at   timestamptz,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- 2. INDEX
-- ============================================================
-- Index untuk filter laporan berdasarkan status (antrian review admin)
create index if not exists idx_reports_status
  on public.reports (status);

-- Index untuk mencari semua laporan atas satu objek tertentu
create index if not exists idx_reports_target
  on public.reports (target_type, target_id);

-- Catatan: tabel reports tidak punya kolom updated_at, jadi tidak ada
-- trigger moddatetime di sini. created_at memakai default now().

-- ============================================================
-- 3. ROW LEVEL SECURITY (RLS) untuk reports
-- ============================================================
alter table public.reports enable row level security;

-- Insert: hanya user yang login (auth.uid() = reporter_id) boleh melapor
drop policy if exists "users can insert reports" on public.reports;
create policy "users can insert reports"
  on public.reports for insert
  to public
  with check (auth.uid() = reporter_id);

-- Select: laporan bisa dibaca semua (anon maupun user) — dipakai
-- untuk statistik jumlah laporan pada konten
drop policy if exists "reports are readable by everyone" on public.reports;
create policy "reports are readable by everyone"
  on public.reports for select
  to public
  using (true);

-- Update: hanya admin yang boleh menerima / menolak laporan
drop policy if exists "admins manage reports" on public.reports;
create policy "admins manage reports"
  on public.reports for update
  to public
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ============================================================
-- 4. HAK AKSES ADMIN UNTUK HAPUS KONTEN (TABEL EXISTING)
-- ============================================================

-- Admin boleh menghapus komentar mana pun (tidak hanya komentarnya sendiri)
drop policy if exists "admins can delete any comment" on public.recipe_comments;
create policy "admins can delete any comment"
  on public.recipe_comments for delete
  to public
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Admin boleh menghapus resep mana pun (termasuk resep user lain)
drop policy if exists "admins can delete any recipe" on public.recipes;
create policy "admins can delete any recipe"
  on public.recipes for delete
  to public
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Admin boleh membaca SEMUA resep (termasuk draft milik user lain)
drop policy if exists "admins can read any recipe" on public.recipes;
create policy "admins can read any recipe"
  on public.recipes for select
  to public
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
