-- 007_recipe_image_meta.sql
-- Metadata gambar per resep + view pemakaian gambar.
-- Dipakai oleh src/services/recipeImageResolver.ts supaya tiap resep dapat foto yang
-- sesuai nama menunya dan tidak diulang-ulang.

alter table recipes add column if not exists image_key text;      -- "<menu-key>#<index foto>"
alter table recipes add column if not exists image_credit text;   -- atribusi (judul · author · license · sumber)
alter table recipes add column if not exists image_page text;     -- URL halaman sumber foto

create index if not exists recipes_image_key_idx on recipes (image_key);

-- Pemakaian tiap foto: resolver memilih foto dengan `uses` paling kecil untuk menu yang sama.
create or replace view recipe_image_usage as
  select image_key, count(*)::int as uses
  from recipes
  where image_key is not null
  group by image_key;

grant select on recipe_image_usage to anon, authenticated;
