-- ============================================================
-- SorghumCare (BimaSorgum) — Migration 006
-- Resep privat vs publik:
--   * Setiap resep hasil generate disimpan dgn is_published = false
--     (PRIVATE) — hanya pemiliknya yg bisa membaca.
--   * Tombol "Unggah" (di kartu resep) men-set is_published = true
--     sehingga muncul di Explore.
--   * Membaca resep privat milik sendiri butuh policy baru.
-- ============================================================

-- Owner dapat membaca resepnya sendiri meski is_published = false
create policy "recipes owner read own"
  on public.recipes
  for select
  to public
  using (created_by = auth.uid());
