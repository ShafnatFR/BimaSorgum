-- ============================================================
-- SorghumCare (BimaSorgum) — Migration 003
-- Tambahan kolom untuk integrasi frontend↔DB
--   source_id            : id string asal dari data frontend (stabil utk relasi)
--   target_budget        : budget target per porsi (Rp) — dari Recipe.targetBudget
--   nutrition_title      : judul blok nutrisi ("Nutrisi Unggulan")
--   nutrition_description: deskripsi nutrisi unggulan
--   prep_time_limit      : batas waktu persiapan (dari wizard), utk resep user
-- ============================================================

alter table public.recipes
  add column if not exists source_id        text,
  add column if not exists target_budget    integer,
  add column if not exists nutrition_title  text,
  add column if not exists nutrition_description text,
  add column if not exists prep_time_limit  text;

create unique index if not exists idx_recipes_source_id
  on public.recipes (source_id)
  where source_id is not null;
