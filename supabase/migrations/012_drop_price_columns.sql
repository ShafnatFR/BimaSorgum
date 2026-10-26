-- 012_drop_price_columns.sql
-- Hapus semua kolom harga: harga tidak lagi dipakai di mana pun (UI, prompt AI, mapper).
-- Backup nilai: C:\Users\shafnats\Documents\Key\backup_harga_bimasorgum_2026.json
-- (187 recipes, 12 ingredients, 1830 recipe_ingredients) — restore manual bila perlu.

alter table public.recipes drop column if exists estimated_cost;
alter table public.recipes drop column if exists target_budget;
alter table public.recipe_ingredients drop column if exists estimated_price;
alter table public.ingredients drop column if exists default_price;
