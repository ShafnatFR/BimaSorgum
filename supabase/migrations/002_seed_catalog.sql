-- ============================================================
-- SorghumCare (BimaSorgum) — SEED DATA
-- Jalankan SETELAH 001_schema_core.sql (Source: src/data/*.ts)
-- ============================================================

-- ---------- BAHAN (dari DEFAULT_INGREDIENTS, mockData.ts) ----------
insert into public.ingredients (slug, name, category, icon_name, unit, default_price) values
  ('biji-sorgum',        'Biji Sorgum',              'utama',     'grain',   '1 porsi (100g)',        3000),
  ('tepung-sorgum',      'Tepung Sorgum',            'utama',     'blur_on', '100g',                  3500),
  ('sayuran-hijau',      'Sayuran Hijau',            'sayur',     'eco',     '1 ikat kecil',          1500),
  ('protein-ayam-telur', 'Protein Ayam/Telur',       'protein',   'egg',     '1 butir / 50g ayam',    2500),
  ('bawang-merah',       'Bawang Merah',             'bumbu',     'spa',     '3 siung',               1000),
  ('bawang-putih',       'Bawang Putih',             'bumbu',     'spa',     '2 siung',               1000),
  ('santan',             'Santan',                   'pelengkap', 'water_drop', '50ml',               1500),
  ('wortel',             'Wortel Segar',             'sayur',     'nutrition', '1 buah kecil',        1000),
  ('kecap-manis-garam',  'Kecap Manis & Garam',      'bumbu',     'soup_kitchen', 'Secukupnya',       1000),
  ('minyak-kelapa',      'Minyak Kelapa / Goreng',   'pelengkap', 'oil_barrel', '1 sdm',              1000),
  ('madu-alami',         'Madu Alami',               'pelengkap', 'hive',    '1 sdm',                 2000),
  ('pisang-buah-segar',  'Pisang / Buah Segar',      'pelengkap', 'temp_preferences_custom', '1 buah', 1500)
on conflict (slug) do nothing;

-- ---------- RESEP SISTEM (contoh: Nasi Goreng Sorgum SD) ----------
-- (ID di-snapshot agar referensi konsisten antar run)
insert into public.recipes (
  id, slug, title, subtitle, description, image_url, tags,
  target_age_label, dish_category, prep_time_minutes, cook_time_minutes,
  servings, estimated_cost, difficulty, calories_estimate,
  fiber_grams, protein_grams, glycemic_index, nutrition_note,
  is_system, is_published
) values (
  '9f2c1e4a-0000-4000-8000-000000000001',
  'nasi-goreng-sorgum-ceria-sd-edition',
  'Nasi Goreng Sorgum Ceria (SD Edition)',
  'Tentu! Ini resep bergizi, lezat, dan sangat terjangkau untuk bekal sekolah.',
  'Nasi goreng berbahan sorgum, tinggi serat, bebas gluten, cocok untuk bekal anak sekolah.',
  NULL,
  array['nasi goreng','bekal sekolah','hemat','bebas gluten'],
  'Anak Sekolah (6-12 thn)',
  'makanan_berat', 10, 15, 1, 9500, 'Mudah', 340, 8.5, 9.2, 'Rendah (Low GI)',
  'Tinggi serat untuk energi tahan lama & bebas gluten (aman untuk pencernaan sensitif anak).',
  true, true
);

insert into public.recipe_ingredients (recipe_id, ingredient_ref, name, amount, estimated_price, sort_order) values
  ('9f2c1e4a-0000-4000-8000-000000000001',
     (select id from public.ingredients where slug='biji-sorgum'),
     'Nasi sorgum dingin', '1 piring (150g)', 3000, 0),
  ('9f2c1e4a-0000-4000-8000-000000000001',
     (select id from public.ingredients where slug='protein-ayam-telur'),
     'Telur, kocok lepas', '1 butir', 2000, 1),
  ('9f2c1e4a-0000-4000-8000-000000000001',
     (select id from public.ingredients where slug='wortel'),
     'Wortel kecil, potong dadu', '1/2 buah', 1000, 2),
  ('9f2c1e4a-0000-4000-8000-000000000001',
     (select id from public.ingredients where slug='bawang-merah'),
     'Bawang merah & putih', '2 siung each', 1500, 3),
  ('9f2c1e4a-0000-4000-8000-000000000001',
     (select id from public.ingredients where slug='kecap-manis-garam'),
     'Kecap manis & garam', 'Secukupnya', 1000, 4),
  ('9f2c1e4a-0000-4000-8000-000000000001',
     (select id from public.ingredients where slug='minyak-kelapa'),
     'Minyak goreng', '1 sdm', 1000, 5);

insert into public.recipe_steps (recipe_id, step_number, title, instruction, timer_minutes, tip) values
  ('9f2c1e4a-0000-4000-8000-000000000001', 1, 'Persiapan Bahan',
   'Pastikan nasi sorgum sudah dalam keadaan dingin agar teksturnya butiran tidak menggumpal saat ditumis.',
   2, 'Masak sorgum dengan perbandingan 1:3 air semalam sebelumnya.'),
  ('9f2c1e4a-0000-4000-8000-000000000001', 2, 'Menumis Bumbu',
   'Panaskan minyak, tumis bawang merah dan bawang putih hingga harum.',
   3, NULL),
  ('9f2c1e4a-0000-4000-8000-000000000001', 3, 'Masak Telur & Sayur',
   'Masukkan telur, orak-arik hingga matang lalu tambah wortel dan sayuran lain.',
   4, NULL),
  ('9f2c1e4a-0000-4000-8000-000000000001', 4, 'Nasi Goreng',
   'Masukkan nasi sorgum, bumbui kecap manis dan garam. Aduk rata hingga panas.',
   3, 'Gunakan api besar agar tekstur nasi tetap pulen.');

insert into public.recipe_targets (recipe_id, target) values
  ('9f2c1e4a-0000-4000-8000-000000000001', 'anak_sd'),
  ('9f2c1e4a-0000-4000-8000-000000000001', 'anak_sekolah'),
  ('9f2c1e4a-0000-4000-8000-000000000001', 'siswa_smp')
on conflict do nothing;

-- ---------- VERIFIKASI CEPAT ----------
-- select 'recipes' as t, count(*) from public.recipes
-- union all select 'ingredients', count(*) from public.ingredients;