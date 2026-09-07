-- ============================================================
-- SorghumCare (BimaSorgum) — Migration 004: FULL SYSTEM CATALOG SEED
-- Generated from src/data (source of truth). Idempotent (upsert by source_id).
-- ============================================================

-- ---------- RECIPES ----------
insert into public.recipes (id, source_id, slug, title, subtitle, image_url, tags, target_age_label, dish_category, prep_time_minutes, cook_time_minutes, servings, estimated_cost, target_budget, calories_estimate, fiber_grams, protein_grams, glycemic_index, nutrition_title, nutrition_description, is_system, is_published, created_at)
values ('3cb225e7-55bf-4732-6e9c-ae08e5de0a83', 'nasi-goreng-sorgum-sd', 'nasi-goreng-sorgum-ceria-sd-edition', 'Nasi Goreng Sorgum Ceria (SD Edition)', 'Tentu! Ini resep bergizi, lezat, dan sangat terjangkau untuk bekal sekolah:', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&auto=format&fit=crop&q=80', array['Bekal Sekolah','Bebas Gluten','Budget Friendly','Tinggi Serat'], 'Anak Sekolah (6-12 thn)', 'makanan_berat', 10, 15, 1, 9500, 10000, 340, 8.5, 9.2, 'Rendah (Low GI)', 'Nutrisi Unggulan', 'Tinggi serat untuk energi tahan lama & bebas gluten (aman untuk pencernaan sensitif anak).', true, true, '2026-08-26T10:42:00Z')
on conflict (slug) do update set source_id=excluded.source_id, title=excluded.title, subtitle=excluded.subtitle, image_url=excluded.image_url, tags=excluded.tags, target_age_label=excluded.target_age_label, dish_category=excluded.dish_category, prep_time_minutes=excluded.prep_time_minutes, cook_time_minutes=excluded.cook_time_minutes, servings=excluded.servings, estimated_cost=excluded.estimated_cost, target_budget=excluded.target_budget, calories_estimate=excluded.calories_estimate, fiber_grams=excluded.fiber_grams, protein_grams=excluded.protein_grams, glycemic_index=excluded.glycemic_index, nutrition_title=excluded.nutrition_title, nutrition_description=excluded.nutrition_description;

insert into public.recipes (id, source_id, slug, title, subtitle, image_url, tags, target_age_label, dish_category, prep_time_minutes, cook_time_minutes, servings, estimated_cost, target_budget, calories_estimate, fiber_grams, protein_grams, glycemic_index, nutrition_title, nutrition_description, is_system, is_published, created_at)
values ('8104aefe-a5fa-40e5-67c1-b03c757b4d9e', 'pancakes-sorghum', 'pancakes-sorghum-gluten-free', 'Sorghum Pancakes Bebas Gluten', 'Pancake lembut mengenyangkan dari tepung sorgum dengan madu kelapa murni.', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&auto=format&fit=crop&q=80', array['Gluten Free','Sarapan','Manis Alami'], 'Balita & Anak Sekolah', 'camilan_sehat', 10, 10, 2, 11000, 12000, 280, 6.2, 7.8, 'Rendah (Low GI)', 'Nutrisi Unggulan', 'Kaya kalsium, fosfor, dan bebas protein gluten untuk sarapan sehat keluarga.', true, true, '2026-08-25T08:00:00Z')
on conflict (slug) do update set source_id=excluded.source_id, title=excluded.title, subtitle=excluded.subtitle, image_url=excluded.image_url, tags=excluded.tags, target_age_label=excluded.target_age_label, dish_category=excluded.dish_category, prep_time_minutes=excluded.prep_time_minutes, cook_time_minutes=excluded.cook_time_minutes, servings=excluded.servings, estimated_cost=excluded.estimated_cost, target_budget=excluded.target_budget, calories_estimate=excluded.calories_estimate, fiber_grams=excluded.fiber_grams, protein_grams=excluded.protein_grams, glycemic_index=excluded.glycemic_index, nutrition_title=excluded.nutrition_title, nutrition_description=excluded.nutrition_description;

insert into public.recipes (id, source_id, slug, title, subtitle, image_url, tags, target_age_label, dish_category, prep_time_minutes, cook_time_minutes, servings, estimated_cost, target_budget, calories_estimate, fiber_grams, protein_grams, glycemic_index, nutrition_title, nutrition_description, is_system, is_published, created_at)
values ('efd83b54-a70a-4c26-aeef-dc4e45548abe', 'rustic-loaf-sorghum', 'roti-tawar-biji-sorgum-artisanal', 'Rustic Sorghum Loaf Bread', 'Roti tawar artisanal kaya serat bertekstur padat lembut tanpa terigu gandum.', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80', array['Artisanal','Bebas Gluten','Low GI'], 'Remaja & Dewasa', 'makanan_berat', 20, 40, 6, 14500, 15000, 210, 12, 11.5, 'Rendah (Low GI)', 'Nutrisi Unggulan', 'Karbohidrat kompleks tahan lama dengan indeks glikemik stabil, baik untuk penderita diabetes.', true, true, '2026-08-24T14:30:00Z')
on conflict (slug) do update set source_id=excluded.source_id, title=excluded.title, subtitle=excluded.subtitle, image_url=excluded.image_url, tags=excluded.tags, target_age_label=excluded.target_age_label, dish_category=excluded.dish_category, prep_time_minutes=excluded.prep_time_minutes, cook_time_minutes=excluded.cook_time_minutes, servings=excluded.servings, estimated_cost=excluded.estimated_cost, target_budget=excluded.target_budget, calories_estimate=excluded.calories_estimate, fiber_grams=excluded.fiber_grams, protein_grams=excluded.protein_grams, glycemic_index=excluded.glycemic_index, nutrition_title=excluded.nutrition_title, nutrition_description=excluded.nutrition_description;

insert into public.recipes (id, source_id, slug, title, subtitle, image_url, tags, target_age_label, dish_category, prep_time_minutes, cook_time_minutes, servings, estimated_cost, target_budget, calories_estimate, fiber_grams, protein_grams, glycemic_index, nutrition_title, nutrition_description, is_system, is_published, created_at)
values ('02089fec-da16-4138-2301-5ca731e88017', 'healthy-bowl-sorghum', 'sorghum-power-bowl', 'Healthy Buddha Bowl Sayur & Sorgum', 'Mangkok nutrisi lengkap dengan paduan biji sorgum pulen, selada, dan saus wijen.', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80', array['Plant-Based','Superfood','Antioksidan'], 'Remaja, Dewasa & Lansia', 'makanan_berat', 15, 15, 1, 10500, 12000, 310, 10.4, 14.2, 'Sangat Rendah', 'Nutrisi Unggulan', 'Tinggi antioksidan polifenol & serat pangan pangan prebiotik untuk mikrobioma usus sehat.', true, true, '2026-08-23T11:20:00Z')
on conflict (slug) do update set source_id=excluded.source_id, title=excluded.title, subtitle=excluded.subtitle, image_url=excluded.image_url, tags=excluded.tags, target_age_label=excluded.target_age_label, dish_category=excluded.dish_category, prep_time_minutes=excluded.prep_time_minutes, cook_time_minutes=excluded.cook_time_minutes, servings=excluded.servings, estimated_cost=excluded.estimated_cost, target_budget=excluded.target_budget, calories_estimate=excluded.calories_estimate, fiber_grams=excluded.fiber_grams, protein_grams=excluded.protein_grams, glycemic_index=excluded.glycemic_index, nutrition_title=excluded.nutrition_title, nutrition_description=excluded.nutrition_description;

insert into public.recipes (id, source_id, slug, title, subtitle, image_url, tags, target_age_label, dish_category, prep_time_minutes, cook_time_minutes, servings, estimated_cost, target_budget, calories_estimate, fiber_grams, protein_grams, glycemic_index, nutrition_title, nutrition_description, is_system, is_published, created_at)
values ('5ba7c469-5d20-4cea-d642-2f6996e1645e', 'sorghum-mushroom-risotto', 'risotto-jamur-liar-sorgum-creamy', 'Sorghum Mushroom Creamy Risotto', 'Alternatif risotto bebas gluten dengan biji sorgum pulen kenyal, jamur champignon, dan kaldu gurih nabati.', 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=800&auto=format&fit=crop&q=80', array['Low GI','Gourmet Sehat','Gluten Free','Tinggi Serat'], 'Remaja, Dewasa & Lansia', 'makanan_berat', 10, 25, 2, 16000, 18000, 360, 9.8, 11.2, 'Rendah (Low GI)', 'Nutrisi Unggulan', 'Serat larut beta-glukan sorgum berpadu dengan antioksidan jamur untuk kesehatan jantung dan imun.', true, true, '2026-08-25T11:00:00Z')
on conflict (slug) do update set source_id=excluded.source_id, title=excluded.title, subtitle=excluded.subtitle, image_url=excluded.image_url, tags=excluded.tags, target_age_label=excluded.target_age_label, dish_category=excluded.dish_category, prep_time_minutes=excluded.prep_time_minutes, cook_time_minutes=excluded.cook_time_minutes, servings=excluded.servings, estimated_cost=excluded.estimated_cost, target_budget=excluded.target_budget, calories_estimate=excluded.calories_estimate, fiber_grams=excluded.fiber_grams, protein_grams=excluded.protein_grams, glycemic_index=excluded.glycemic_index, nutrition_title=excluded.nutrition_title, nutrition_description=excluded.nutrition_description;

insert into public.recipes (id, source_id, slug, title, subtitle, image_url, tags, target_age_label, dish_category, prep_time_minutes, cook_time_minutes, servings, estimated_cost, target_budget, calories_estimate, fiber_grams, protein_grams, glycemic_index, nutrition_title, nutrition_description, is_system, is_published, created_at)
values ('3f90e0c3-27cf-4763-0c26-52f8afe72bf5', 'bubur-manado-tinutuan-sorgum', 'bubur-tinutuan-sorgum-manado', 'Tinutuan Bubur Sayur Sorgum Manado', 'Kreasi bubur Manado tradisional kaya serat dari biji sorgum pulen berpadu labu kuning, kangkung, dan jagung manis.', 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=800&auto=format&fit=crop&q=80', array['Tradisional','Kaya Vitamin A','Low GI','Ramah Lansia & Balita'], 'Semua Usia (Balita - Lansia)', 'makanan_berat', 10, 20, 2, 11000, 12000, 290, 11.5, 8.9, 'Sangat Rendah', 'Nutrisi Unggulan', 'Super kaya vitamin A beta-karoten, kalium, dan serat pangan prebiotik tanpa risiko lonjakan glukosa darah.', true, true, '2026-08-25T14:15:00Z')
on conflict (slug) do update set source_id=excluded.source_id, title=excluded.title, subtitle=excluded.subtitle, image_url=excluded.image_url, tags=excluded.tags, target_age_label=excluded.target_age_label, dish_category=excluded.dish_category, prep_time_minutes=excluded.prep_time_minutes, cook_time_minutes=excluded.cook_time_minutes, servings=excluded.servings, estimated_cost=excluded.estimated_cost, target_budget=excluded.target_budget, calories_estimate=excluded.calories_estimate, fiber_grams=excluded.fiber_grams, protein_grams=excluded.protein_grams, glycemic_index=excluded.glycemic_index, nutrition_title=excluded.nutrition_title, nutrition_description=excluded.nutrition_description;

insert into public.recipes (id, source_id, slug, title, subtitle, image_url, tags, target_age_label, dish_category, prep_time_minutes, cook_time_minutes, servings, estimated_cost, target_budget, calories_estimate, fiber_grams, protein_grams, glycemic_index, nutrition_title, nutrition_description, is_system, is_published, created_at)
values ('a3a939c0-0cba-4c8e-46ea-ee118f05effc', 'sorghum-cookies-chocochip', 'cookies-keping-cokelat-sorgum', 'Crunchy Sorghum Chocochip Cookies', 'Kue kering renyah bebas terigu dari tepung sorgum dengan dark chocolate chips dan aroma gula kelapa harum.', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&auto=format&fit=crop&q=80', array['Camilan Sehat','Bebas Gluten','Bekal Anak','Baking Mudah'], 'Anak Sekolah & Remaja', 'camilan_sehat', 15, 15, 12, 13500, 15000, 160, 5.6, 4.8, 'Rendah (Low GI)', 'Nutrisi Unggulan', 'Camilan manis alami bebas gluten dengan zat besi dan magnesium tinggi untuk konsentrasi belajar anak.', true, true, '2026-08-25T16:00:00Z')
on conflict (slug) do update set source_id=excluded.source_id, title=excluded.title, subtitle=excluded.subtitle, image_url=excluded.image_url, tags=excluded.tags, target_age_label=excluded.target_age_label, dish_category=excluded.dish_category, prep_time_minutes=excluded.prep_time_minutes, cook_time_minutes=excluded.cook_time_minutes, servings=excluded.servings, estimated_cost=excluded.estimated_cost, target_budget=excluded.target_budget, calories_estimate=excluded.calories_estimate, fiber_grams=excluded.fiber_grams, protein_grams=excluded.protein_grams, glycemic_index=excluded.glycemic_index, nutrition_title=excluded.nutrition_title, nutrition_description=excluded.nutrition_description;

insert into public.recipes (id, source_id, slug, title, subtitle, image_url, tags, target_age_label, dish_category, prep_time_minutes, cook_time_minutes, servings, estimated_cost, target_budget, calories_estimate, fiber_grams, protein_grams, glycemic_index, nutrition_title, nutrition_description, is_system, is_published, created_at)
values ('b121262e-9ba0-4c1f-379b-428e84903e6f', 'es-cendol-dawet-sorgum', 'es-cendol-sorgum-nangka-gula-aren', 'Es Dawet Cendol Tepung Sorgum Sehat', 'Minuman segar tradisional dengan cendol kenyal dari tepung sorgum, santan kelapa murni, dan sirup nira aren organik.', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80', array['Minuman Segar','Tradisional','Bebas Gluten','Pencuci Mulut'], 'Semua Usia', 'minuman_nutrisi', 15, 10, 2, 8500, 10000, 190, 6, 3.5, 'Rendah (Low GI)', 'Nutrisi Unggulan', 'Menyegarkan tanpa lonjakan insulin, kaya senyawa klorofil pandan dan serat pencernaan sorgum.', true, true, '2026-08-25T17:30:00Z')
on conflict (slug) do update set source_id=excluded.source_id, title=excluded.title, subtitle=excluded.subtitle, image_url=excluded.image_url, tags=excluded.tags, target_age_label=excluded.target_age_label, dish_category=excluded.dish_category, prep_time_minutes=excluded.prep_time_minutes, cook_time_minutes=excluded.cook_time_minutes, servings=excluded.servings, estimated_cost=excluded.estimated_cost, target_budget=excluded.target_budget, calories_estimate=excluded.calories_estimate, fiber_grams=excluded.fiber_grams, protein_grams=excluded.protein_grams, glycemic_index=excluded.glycemic_index, nutrition_title=excluded.nutrition_title, nutrition_description=excluded.nutrition_description;

insert into public.recipes (id, source_id, slug, title, subtitle, image_url, tags, target_age_label, dish_category, prep_time_minutes, cook_time_minutes, servings, estimated_cost, target_budget, calories_estimate, fiber_grams, protein_grams, glycemic_index, nutrition_title, nutrition_description, is_system, is_published, created_at)
values ('c1f2b15d-c9fc-4430-d3b5-3c5a3b473716', 'bolu-kukus-sorgum-gula-aren', 'bolu-kukus-pandan-sorgum-mekar', 'Bolu Kukus Mekar Sorgum & Pandan Aren', 'Bolu kukus super empuk dan mekar sempurna dibuat dari 100% tepung sorgum bebas gluten beraroma pandan alami.', 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800&auto=format&fit=crop&q=80', array['Bolu Kukus','Bebas Gluten','Kudapan Tradisional','Rendah Gula'], 'Semua Usia', 'dessert_rendah_gi', 10, 15, 6, 10000, 12000, 210, 7.2, 6.5, 'Rendah (Low GI)', 'Nutrisi Unggulan', 'Kudapan manis lembut ramah pencernaan dengan profil asam amino esensial lengkap dan rendah lemak jenuh.', true, true, '2026-08-25T18:00:00Z')
on conflict (slug) do update set source_id=excluded.source_id, title=excluded.title, subtitle=excluded.subtitle, image_url=excluded.image_url, tags=excluded.tags, target_age_label=excluded.target_age_label, dish_category=excluded.dish_category, prep_time_minutes=excluded.prep_time_minutes, cook_time_minutes=excluded.cook_time_minutes, servings=excluded.servings, estimated_cost=excluded.estimated_cost, target_budget=excluded.target_budget, calories_estimate=excluded.calories_estimate, fiber_grams=excluded.fiber_grams, protein_grams=excluded.protein_grams, glycemic_index=excluded.glycemic_index, nutrition_title=excluded.nutrition_title, nutrition_description=excluded.nutrition_description;

insert into public.recipes (id, source_id, slug, title, subtitle, image_url, tags, target_age_label, dish_category, prep_time_minutes, cook_time_minutes, servings, estimated_cost, target_budget, calories_estimate, fiber_grams, protein_grams, glycemic_index, nutrition_title, nutrition_description, is_system, is_published, created_at)
values ('f78a8e5b-a475-4283-5b30-a3c9962b3e43', 'sup-krim-sorgum-jagung', 'sup-krim-jagung-sorgum-hangat', 'Creamy Sorghum & Sweet Corn Chowder', 'Sup hangat kental menenangkan dengan butiran biji sorgum kenyal, jagung manis pipil, dan wortel dadu kaya serat.', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&auto=format&fit=crop&q=80', array['Sup Hangat','Comfort Food','Ramah Balita','Kaya Serat'], 'Balita, Anak Sekolah & Lansia', 'makanan_berat', 10, 15, 2, 10500, 12000, 260, 8.8, 7, 'Rendah (Low GI)', 'Nutrisi Unggulan', 'Menghangatkan tubuh, kaya kalsium dan prebiotik alami untuk imunitas keluarga di musim hujan.', true, true, '2026-08-25T19:00:00Z')
on conflict (slug) do update set source_id=excluded.source_id, title=excluded.title, subtitle=excluded.subtitle, image_url=excluded.image_url, tags=excluded.tags, target_age_label=excluded.target_age_label, dish_category=excluded.dish_category, prep_time_minutes=excluded.prep_time_minutes, cook_time_minutes=excluded.cook_time_minutes, servings=excluded.servings, estimated_cost=excluded.estimated_cost, target_budget=excluded.target_budget, calories_estimate=excluded.calories_estimate, fiber_grams=excluded.fiber_grams, protein_grams=excluded.protein_grams, glycemic_index=excluded.glycemic_index, nutrition_title=excluded.nutrition_title, nutrition_description=excluded.nutrition_description;

-- ---------- RECIPE INGREDIENTS ----------
insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'nasi-goreng-sorgum-ceria-sd-edition'), '1 piring nasi sorgum dingin', '1 piring (150g)', NULL, 3000, 0
where exists (select 1 from public.recipes where slug = 'nasi-goreng-sorgum-ceria-sd-edition')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'nasi-goreng-sorgum-ceria-sd-edition'), '1 butir telur, kocok lepas', '1 butir', NULL, 2000, 1
where exists (select 1 from public.recipes where slug = 'nasi-goreng-sorgum-ceria-sd-edition')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'nasi-goreng-sorgum-ceria-sd-edition'), 'Wortel kecil, potong dadu', '1/2 buah', NULL, 1000, 2
where exists (select 1 from public.recipes where slug = 'nasi-goreng-sorgum-ceria-sd-edition')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'nasi-goreng-sorgum-ceria-sd-edition'), 'Bawang merah & putih', '2 siung each', NULL, 1500, 3
where exists (select 1 from public.recipes where slug = 'nasi-goreng-sorgum-ceria-sd-edition')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'nasi-goreng-sorgum-ceria-sd-edition'), 'Kecap manis & garam', 'Secukupnya', NULL, 1000, 4
where exists (select 1 from public.recipes where slug = 'nasi-goreng-sorgum-ceria-sd-edition')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'nasi-goreng-sorgum-ceria-sd-edition'), 'Sedikit minyak goreng', '1 sdm', NULL, 1000, 5
where exists (select 1 from public.recipes where slug = 'nasi-goreng-sorgum-ceria-sd-edition')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'pancakes-sorghum-gluten-free'), 'Tepung sorgum halus', '100g', NULL, 4000, 0
where exists (select 1 from public.recipes where slug = 'pancakes-sorghum-gluten-free')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'pancakes-sorghum-gluten-free'), '1 butir telur ayam', '1 butir', NULL, 2000, 1
where exists (select 1 from public.recipes where slug = 'pancakes-sorghum-gluten-free')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'pancakes-sorghum-gluten-free'), 'Susu / santan cair', '80ml', NULL, 2000, 2
where exists (select 1 from public.recipes where slug = 'pancakes-sorghum-gluten-free')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'pancakes-sorghum-gluten-free'), 'Madu atau gula kelapa', '1 sdm', NULL, 2000, 3
where exists (select 1 from public.recipes where slug = 'pancakes-sorghum-gluten-free')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'pancakes-sorghum-gluten-free'), 'Baking powder & sejumput garam', '1/2 sdt', NULL, 1000, 4
where exists (select 1 from public.recipes where slug = 'pancakes-sorghum-gluten-free')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'roti-tawar-biji-sorgum-artisanal'), 'Tepung sorgum premium', '250g', NULL, 7500, 0
where exists (select 1 from public.recipes where slug = 'roti-tawar-biji-sorgum-artisanal')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'roti-tawar-biji-sorgum-artisanal'), 'Tepung tapioka / pati garut', '50g', NULL, 1500, 1
where exists (select 1 from public.recipes where slug = 'roti-tawar-biji-sorgum-artisanal')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'roti-tawar-biji-sorgum-artisanal'), 'Ragi instan', '1 sdt', NULL, 1500, 2
where exists (select 1 from public.recipes where slug = 'roti-tawar-biji-sorgum-artisanal')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'roti-tawar-biji-sorgum-artisanal'), 'Minyak kelapa & air hangat', '200ml', NULL, 2000, 3
where exists (select 1 from public.recipes where slug = 'roti-tawar-biji-sorgum-artisanal')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'roti-tawar-biji-sorgum-artisanal'), 'Biji chia / biji sorgum sangrai', '1 sdm', NULL, 2000, 4
where exists (select 1 from public.recipes where slug = 'roti-tawar-biji-sorgum-artisanal')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'sorghum-power-bowl'), 'Biji sorgum rebus empuk', '1 mangkok (120g)', NULL, 3500, 0
where exists (select 1 from public.recipes where slug = 'sorghum-power-bowl')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'sorghum-power-bowl'), 'Sayuran hijau (bayam & selada)', '1 genggam', NULL, 2000, 1
where exists (select 1 from public.recipes where slug = 'sorghum-power-bowl')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'sorghum-power-bowl'), 'Tempe / Tahu panggang', '3 potong dadu', NULL, 2000, 2
where exists (select 1 from public.recipes where slug = 'sorghum-power-bowl')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'sorghum-power-bowl'), 'Irisan tomat & mentimun', '1 buah', NULL, 1500, 3
where exists (select 1 from public.recipes where slug = 'sorghum-power-bowl')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'sorghum-power-bowl'), 'Dressing wijen sangrai', '2 sdm', NULL, 1500, 4
where exists (select 1 from public.recipes where slug = 'sorghum-power-bowl')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'risotto-jamur-liar-sorgum-creamy'), 'Biji sorgum rendam semalam', '150g', NULL, 4500, 0
where exists (select 1 from public.recipes where slug = 'risotto-jamur-liar-sorgum-creamy')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'risotto-jamur-liar-sorgum-creamy'), 'Jamur kancing / champignon iris', '100g', NULL, 4000, 1
where exists (select 1 from public.recipes where slug = 'risotto-jamur-liar-sorgum-creamy')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'risotto-jamur-liar-sorgum-creamy'), 'Bawang bombay & bawang putih', '1/2 buah + 2 siung', NULL, 2000, 2
where exists (select 1 from public.recipes where slug = 'risotto-jamur-liar-sorgum-creamy')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'risotto-jamur-liar-sorgum-creamy'), 'Kaldu sayur hangat / ayam', '350ml', NULL, 2500, 3
where exists (select 1 from public.recipes where slug = 'risotto-jamur-liar-sorgum-creamy')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'risotto-jamur-liar-sorgum-creamy'), 'Minyak zaitun / mentega nabati', '1 sdm', NULL, 1500, 4
where exists (select 1 from public.recipes where slug = 'risotto-jamur-liar-sorgum-creamy')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'risotto-jamur-liar-sorgum-creamy'), 'Keju parmesan parut (opsional)', '1 sdm', NULL, 1500, 5
where exists (select 1 from public.recipes where slug = 'risotto-jamur-liar-sorgum-creamy')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'bubur-tinutuan-sorgum-manado'), 'Biji sorgum giling / utuh rebus', '120g', NULL, 3500, 0
where exists (select 1 from public.recipes where slug = 'bubur-tinutuan-sorgum-manado')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'bubur-tinutuan-sorgum-manado'), 'Labu kuning kukus potong dadu', '80g', NULL, 1500, 1
where exists (select 1 from public.recipes where slug = 'bubur-tinutuan-sorgum-manado')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'bubur-tinutuan-sorgum-manado'), 'Jagung manis pipil', '50g', NULL, 1500, 2
where exists (select 1 from public.recipes where slug = 'bubur-tinutuan-sorgum-manado')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'bubur-tinutuan-sorgum-manado'), 'Daun bayam / kangkung & kemangi', '1 ikat', NULL, 2000, 3
where exists (select 1 from public.recipes where slug = 'bubur-tinutuan-sorgum-manado')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'bubur-tinutuan-sorgum-manado'), 'Serai memar & daun bawang', '1 batang', NULL, 1000, 4
where exists (select 1 from public.recipes where slug = 'bubur-tinutuan-sorgum-manado')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'bubur-tinutuan-sorgum-manado'), 'Ikan asin / tempe renyah (pelengkap)', 'Secukupnya', NULL, 1500, 5
where exists (select 1 from public.recipes where slug = 'bubur-tinutuan-sorgum-manado')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'cookies-keping-cokelat-sorgum'), 'Tepung sorgum sangrai halus', '120g', NULL, 4000, 0
where exists (select 1 from public.recipes where slug = 'cookies-keping-cokelat-sorgum')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'cookies-keping-cokelat-sorgum'), 'Minyak kelapa / butter leleh', '50g', NULL, 3500, 1
where exists (select 1 from public.recipes where slug = 'cookies-keping-cokelat-sorgum')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'cookies-keping-cokelat-sorgum'), 'Gula kelapa / aren bubuk', '40g', NULL, 2000, 2
where exists (select 1 from public.recipes where slug = 'cookies-keping-cokelat-sorgum')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'cookies-keping-cokelat-sorgum'), '1 butir kuning telur ayam', '1 butir', NULL, 2000, 3
where exists (select 1 from public.recipes where slug = 'cookies-keping-cokelat-sorgum')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'cookies-keping-cokelat-sorgum'), 'Dark chocolate chips 70%', '30g', NULL, 2000, 4
where exists (select 1 from public.recipes where slug = 'cookies-keping-cokelat-sorgum')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'es-cendol-sorgum-nangka-gula-aren'), 'Tepung sorgum & tapioka (rasio 2:1)', '60g', NULL, 2500, 0
where exists (select 1 from public.recipes where slug = 'es-cendol-sorgum-nangka-gula-aren')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'es-cendol-sorgum-nangka-gula-aren'), 'Air perasan daun suji & pandan', '200ml', NULL, 1500, 1
where exists (select 1 from public.recipes where slug = 'es-cendol-sorgum-nangka-gula-aren')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'es-cendol-sorgum-nangka-gula-aren'), 'Santan kelapa segar matang', '150ml', NULL, 2000, 2
where exists (select 1 from public.recipes where slug = 'es-cendol-sorgum-nangka-gula-aren')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'es-cendol-sorgum-nangka-gula-aren'), 'Gula aren cair asli', '4 sdm', NULL, 1500, 3
where exists (select 1 from public.recipes where slug = 'es-cendol-sorgum-nangka-gula-aren')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'es-cendol-sorgum-nangka-gula-aren'), 'Es batu kristal', 'Secukupnya', NULL, 1000, 4
where exists (select 1 from public.recipes where slug = 'es-cendol-sorgum-nangka-gula-aren')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'bolu-kukus-pandan-sorgum-mekar'), 'Tepung sorgum premium ayak', '150g', NULL, 4500, 0
where exists (select 1 from public.recipes where slug = 'bolu-kukus-pandan-sorgum-mekar')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'bolu-kukus-pandan-sorgum-mekar'), 'Telur ayam negeri', '2 butir', NULL, 3500, 1
where exists (select 1 from public.recipes where slug = 'bolu-kukus-pandan-sorgum-mekar')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'bolu-kukus-pandan-sorgum-mekar'), 'Gula aren organik bubuk', '60g', NULL, 2000, 2
where exists (select 1 from public.recipes where slug = 'bolu-kukus-pandan-sorgum-mekar')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'bolu-kukus-pandan-sorgum-mekar'), 'Santan kental & air pandan', '60ml', NULL, 1500, 3
where exists (select 1 from public.recipes where slug = 'bolu-kukus-pandan-sorgum-mekar')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'bolu-kukus-pandan-sorgum-mekar'), 'Baking powder', '1/2 sdt', NULL, 500, 4
where exists (select 1 from public.recipes where slug = 'bolu-kukus-pandan-sorgum-mekar')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'sup-krim-jagung-sorgum-hangat'), 'Biji sorgum rebus empuk', '100g', NULL, 3000, 0
where exists (select 1 from public.recipes where slug = 'sup-krim-jagung-sorgum-hangat')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'sup-krim-jagung-sorgum-hangat'), 'Jagung manis pipil segar', '1 buah', NULL, 2500, 1
where exists (select 1 from public.recipes where slug = 'sup-krim-jagung-sorgum-hangat')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'sup-krim-jagung-sorgum-hangat'), 'Wortel potong dadu kecil', '1/2 buah', NULL, 1000, 2
where exists (select 1 from public.recipes where slug = 'sup-krim-jagung-sorgum-hangat')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'sup-krim-jagung-sorgum-hangat'), 'Susu cair UHT / santan encer', '150ml', NULL, 2000, 3
where exists (select 1 from public.recipes where slug = 'sup-krim-jagung-sorgum-hangat')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'sup-krim-jagung-sorgum-hangat'), 'Bawang bombay & mentega', '1 sdm', NULL, 1500, 4
where exists (select 1 from public.recipes where slug = 'sup-krim-jagung-sorgum-hangat')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

insert into public.recipe_ingredients (recipe_id, name, amount, notes, estimated_price, sort_order)
select (select id from public.recipes where slug = 'sup-krim-jagung-sorgum-hangat'), 'Pala bubuk, garam & merica', 'Secukupnya', NULL, 500, 5
where exists (select 1 from public.recipes where slug = 'sup-krim-jagung-sorgum-hangat')
on conflict (recipe_id, sort_order) do update set name=excluded.name, amount=excluded.amount, notes=excluded.notes, estimated_price=excluded.estimated_price;

-- ---------- RECIPE STEPS ----------
insert into public.recipe_steps (recipe_id, step_number, title, instruction, timer_minutes, tip)
select (select id from public.recipes where slug = 'nasi-goreng-sorgum-ceria-sd-edition'), 1, 'Persiapan Bahan', 'Pastikan nasi sorgum sudah dalam keadaan dingin agar teksturnya butiran tidak menggumpal saat ditumis.', 2, 'Masak sorgum dengan perbandingan 1:3 air semalam sebelumnya.'
where exists (select 1 from public.recipes where slug = 'nasi-goreng-sorgum-ceria-sd-edition')
on conflict (recipe_id, step_number) do update set title=excluded.title, instruction=excluded.instruction, timer_minutes=excluded.timer_minutes, tip=excluded.tip;

insert into public.recipe_steps (recipe_id, step_number, title, instruction, timer_minutes, tip)
select (select id from public.recipes where slug = 'nasi-goreng-sorgum-ceria-sd-edition'), 2, 'Tumis Bumbu & Telur', 'Panaskan 1 sdm minyak. Tumis irisan bawang merah dan putih hingga harum. Masukkan telur kocok, lalu orak-arik hingga matang.', 3, NULL
where exists (select 1 from public.recipes where slug = 'nasi-goreng-sorgum-ceria-sd-edition')
on conflict (recipe_id, step_number) do update set title=excluded.title, instruction=excluded.instruction, timer_minutes=excluded.timer_minutes, tip=excluded.tip;

insert into public.recipe_steps (recipe_id, step_number, title, instruction, timer_minutes, tip)
select (select id from public.recipes where slug = 'nasi-goreng-sorgum-ceria-sd-edition'), 3, 'Masukkan Sayur & Sorgum', 'Tambahkan potongan dadu wortel, aduk sebentar. Masukkan nasi sorgum dingin, kecap manis, garam, dan sedikit merica.', 4, NULL
where exists (select 1 from public.recipes where slug = 'nasi-goreng-sorgum-ceria-sd-edition')
on conflict (recipe_id, step_number) do update set title=excluded.title, instruction=excluded.instruction, timer_minutes=excluded.timer_minutes, tip=excluded.tip;

insert into public.recipe_steps (recipe_id, step_number, title, instruction, timer_minutes, tip)
select (select id from public.recipes where slug = 'nasi-goreng-sorgum-ceria-sd-edition'), 4, 'Aduk Merata & Angkat', 'Aduk dengan api sedang-tinggi selama 3-4 menit hingga bumbu meresap sempurna dan aroma sedap keluar. Angkat dan sajikan hangat di kotak bekal!', 3, 'Tambahkan irisan mentimun segar sebagai garnish.'
where exists (select 1 from public.recipes where slug = 'nasi-goreng-sorgum-ceria-sd-edition')
on conflict (recipe_id, step_number) do update set title=excluded.title, instruction=excluded.instruction, timer_minutes=excluded.timer_minutes, tip=excluded.tip;

insert into public.recipe_steps (recipe_id, step_number, title, instruction, timer_minutes, tip)
select (select id from public.recipes where slug = 'pancakes-sorghum-gluten-free'), 1, 'Campur Bahan Kering', 'Ayak tepung sorgum bersama baking powder dan garam di mangkuk.', 2, NULL
where exists (select 1 from public.recipes where slug = 'pancakes-sorghum-gluten-free')
on conflict (recipe_id, step_number) do update set title=excluded.title, instruction=excluded.instruction, timer_minutes=excluded.timer_minutes, tip=excluded.tip;

insert into public.recipe_steps (recipe_id, step_number, title, instruction, timer_minutes, tip)
select (select id from public.recipes where slug = 'pancakes-sorghum-gluten-free'), 2, 'Aduk Adonan', 'Kocok telur dan susu/santan cair, lalu satukan dengan tepung hingga tekstur kental pas.', 3, NULL
where exists (select 1 from public.recipes where slug = 'pancakes-sorghum-gluten-free')
on conflict (recipe_id, step_number) do update set title=excluded.title, instruction=excluded.instruction, timer_minutes=excluded.timer_minutes, tip=excluded.tip;

insert into public.recipe_steps (recipe_id, step_number, title, instruction, timer_minutes, tip)
select (select id from public.recipes where slug = 'pancakes-sorghum-gluten-free'), 3, 'Panggang di Wajan', 'Tuang 1 sendok sayur adonan ke teflon antilengket dengan api kecil. Balik saat muncul gelembung.', 5, NULL
where exists (select 1 from public.recipes where slug = 'pancakes-sorghum-gluten-free')
on conflict (recipe_id, step_number) do update set title=excluded.title, instruction=excluded.instruction, timer_minutes=excluded.timer_minutes, tip=excluded.tip;

insert into public.recipe_steps (recipe_id, step_number, title, instruction, timer_minutes, tip)
select (select id from public.recipes where slug = 'roti-tawar-biji-sorgum-artisanal'), 1, 'Aktifkan Ragi', 'Larutkan ragi dalam air hangat dengan sedikit gula kelapa selama 7 menit hingga berbusa.', 7, NULL
where exists (select 1 from public.recipes where slug = 'roti-tawar-biji-sorgum-artisanal')
on conflict (recipe_id, step_number) do update set title=excluded.title, instruction=excluded.instruction, timer_minutes=excluded.timer_minutes, tip=excluded.tip;

insert into public.recipe_steps (recipe_id, step_number, title, instruction, timer_minutes, tip)
select (select id from public.recipes where slug = 'roti-tawar-biji-sorgum-artisanal'), 2, 'Uleni Lembut', 'Campur tepung dan bahan basah, uleni hingga kalis lembap lalu diamkan 45 menit.', 45, NULL
where exists (select 1 from public.recipes where slug = 'roti-tawar-biji-sorgum-artisanal')
on conflict (recipe_id, step_number) do update set title=excluded.title, instruction=excluded.instruction, timer_minutes=excluded.timer_minutes, tip=excluded.tip;

insert into public.recipe_steps (recipe_id, step_number, title, instruction, timer_minutes, tip)
select (select id from public.recipes where slug = 'roti-tawar-biji-sorgum-artisanal'), 3, 'Panggang Oven', 'Panggang pada suhu 180°C selama 35-40 menit hingga permukaan kecokelatan beraroma gurih kacang.', 40, NULL
where exists (select 1 from public.recipes where slug = 'roti-tawar-biji-sorgum-artisanal')
on conflict (recipe_id, step_number) do update set title=excluded.title, instruction=excluded.instruction, timer_minutes=excluded.timer_minutes, tip=excluded.tip;

insert into public.recipe_steps (recipe_id, step_number, title, instruction, timer_minutes, tip)
select (select id from public.recipes where slug = 'sorghum-power-bowl'), 1, 'Rebus Biji Sorgum', 'Rebus biji sorgum yang telah direndam selama 20 menit hingga empuk dan kenyal mekar.', 20, NULL
where exists (select 1 from public.recipes where slug = 'sorghum-power-bowl')
on conflict (recipe_id, step_number) do update set title=excluded.title, instruction=excluded.instruction, timer_minutes=excluded.timer_minutes, tip=excluded.tip;

insert into public.recipe_steps (recipe_id, step_number, title, instruction, timer_minutes, tip)
select (select id from public.recipes where slug = 'sorghum-power-bowl'), 2, 'Tata Mangkok Sehat', 'Susun biji sorgum di sisi mangkok, lengkapi dengan sayuran segar dan tempe panggang.', 3, NULL
where exists (select 1 from public.recipes where slug = 'sorghum-power-bowl')
on conflict (recipe_id, step_number) do update set title=excluded.title, instruction=excluded.instruction, timer_minutes=excluded.timer_minutes, tip=excluded.tip;

insert into public.recipe_steps (recipe_id, step_number, title, instruction, timer_minutes, tip)
select (select id from public.recipes where slug = 'sorghum-power-bowl'), 3, 'Siram Saus & Nikmati', 'Kucurkan dressing wijen gurih dan nikmati sensasi kenyal crunchy sorgum.', 1, NULL
where exists (select 1 from public.recipes where slug = 'sorghum-power-bowl')
on conflict (recipe_id, step_number) do update set title=excluded.title, instruction=excluded.instruction, timer_minutes=excluded.timer_minutes, tip=excluded.tip;

insert into public.recipe_steps (recipe_id, step_number, title, instruction, timer_minutes, tip)
select (select id from public.recipes where slug = 'risotto-jamur-liar-sorgum-creamy'), 1, 'Tumis Aromatik & Jamur', 'Panaskan minyak zaitun di wajan, tumis bawang bombay dan bawang putih cincang hingga harum layu, lalu masukkan irisan jamur hingga kecokelatan.', 4, NULL
where exists (select 1 from public.recipes where slug = 'risotto-jamur-liar-sorgum-creamy')
on conflict (recipe_id, step_number) do update set title=excluded.title, instruction=excluded.instruction, timer_minutes=excluded.timer_minutes, tip=excluded.tip;

insert into public.recipe_steps (recipe_id, step_number, title, instruction, timer_minutes, tip)
select (select id from public.recipes where slug = 'risotto-jamur-liar-sorgum-creamy'), 2, 'Masukkan Biji Sorgum', 'Masukkan biji sorgum yang telah ditiriskan. Aduk rata selama 2 menit agar terlumuri minyak dan aroma gurih.', 2, NULL
where exists (select 1 from public.recipes where slug = 'risotto-jamur-liar-sorgum-creamy')
on conflict (recipe_id, step_number) do update set title=excluded.title, instruction=excluded.instruction, timer_minutes=excluded.timer_minutes, tip=excluded.tip;

insert into public.recipe_steps (recipe_id, step_number, title, instruction, timer_minutes, tip)
select (select id from public.recipes where slug = 'risotto-jamur-liar-sorgum-creamy'), 3, 'Tuang Kaldu Bertahap', 'Tuangkan kaldu sayur hangat secara bertahap sambil diaduk perlahan dengan api sedang hingga cairan meresap dan sorgum empuk al-dente.', 16, NULL
where exists (select 1 from public.recipes where slug = 'risotto-jamur-liar-sorgum-creamy')
on conflict (recipe_id, step_number) do update set title=excluded.title, instruction=excluded.instruction, timer_minutes=excluded.timer_minutes, tip=excluded.tip;

insert into public.recipe_steps (recipe_id, step_number, title, instruction, timer_minutes, tip)
select (select id from public.recipes where slug = 'risotto-jamur-liar-sorgum-creamy'), 4, 'Finishing Creamy', 'Matikan api, masukkan sedikit parmesan atau santan encer. Aduk rata dan taburkan parsley cincang segar sebelum disajikan hangat.', 3, NULL
where exists (select 1 from public.recipes where slug = 'risotto-jamur-liar-sorgum-creamy')
on conflict (recipe_id, step_number) do update set title=excluded.title, instruction=excluded.instruction, timer_minutes=excluded.timer_minutes, tip=excluded.tip;

insert into public.recipe_steps (recipe_id, step_number, title, instruction, timer_minutes, tip)
select (select id from public.recipes where slug = 'bubur-tinutuan-sorgum-manado'), 1, 'Rebus Sorgum & Labu', 'Masak biji sorgum bersama air kaldu sayur, serai, dan labu kuning hingga labu melunak dan sorgum merekah membentuk bubur kental.', 12, NULL
where exists (select 1 from public.recipes where slug = 'bubur-tinutuan-sorgum-manado')
on conflict (recipe_id, step_number) do update set title=excluded.title, instruction=excluded.instruction, timer_minutes=excluded.timer_minutes, tip=excluded.tip;

insert into public.recipe_steps (recipe_id, step_number, title, instruction, timer_minutes, tip)
select (select id from public.recipes where slug = 'bubur-tinutuan-sorgum-manado'), 2, 'Tambahkan Jagung & Sayur', 'Masukkan jagung manis pipil dan bumbu garam secukupnya. Masak selama 3 menit.', 3, NULL
where exists (select 1 from public.recipes where slug = 'bubur-tinutuan-sorgum-manado')
on conflict (recipe_id, step_number) do update set title=excluded.title, instruction=excluded.instruction, timer_minutes=excluded.timer_minutes, tip=excluded.tip;

insert into public.recipe_steps (recipe_id, step_number, title, instruction, timer_minutes, tip)
select (select id from public.recipes where slug = 'bubur-tinutuan-sorgum-manado'), 3, 'Masukkan Sayuran Hijau & Kemangi', 'Tambahkan daun bayam/kangkung dan kemangi wangi sesaat sebelum api dimatikan agar tetap hijau segar bernutrisi.', 3, NULL
where exists (select 1 from public.recipes where slug = 'bubur-tinutuan-sorgum-manado')
on conflict (recipe_id, step_number) do update set title=excluded.title, instruction=excluded.instruction, timer_minutes=excluded.timer_minutes, tip=excluded.tip;

insert into public.recipe_steps (recipe_id, step_number, title, instruction, timer_minutes, tip)
select (select id from public.recipes where slug = 'bubur-tinutuan-sorgum-manado'), 4, 'Sajikan dengan Sambal Dabu-Dabu', 'Tuang ke mangkuk hangat, sajikan dengan tempe goreng renyah atau sambal dabu-dabu segar.', 2, NULL
where exists (select 1 from public.recipes where slug = 'bubur-tinutuan-sorgum-manado')
on conflict (recipe_id, step_number) do update set title=excluded.title, instruction=excluded.instruction, timer_minutes=excluded.timer_minutes, tip=excluded.tip;

insert into public.recipe_steps (recipe_id, step_number, title, instruction, timer_minutes, tip)
select (select id from public.recipes where slug = 'cookies-keping-cokelat-sorgum'), 1, 'Kocok Butter & Gula Kelapa', 'Campurkan mentega/minyak kelapa dengan gula aren hingga larut dan lembut creamy.', 4, NULL
where exists (select 1 from public.recipes where slug = 'cookies-keping-cokelat-sorgum')
on conflict (recipe_id, step_number) do update set title=excluded.title, instruction=excluded.instruction, timer_minutes=excluded.timer_minutes, tip=excluded.tip;

insert into public.recipe_steps (recipe_id, step_number, title, instruction, timer_minutes, tip)
select (select id from public.recipes where slug = 'cookies-keping-cokelat-sorgum'), 2, 'Campur Tepung Sorgum', 'Masukkan kuning telur, lalu tuang tepung sorgum bertahap. Aduk dengan spatula hingga adonan kalis tidak lengket.', 4, NULL
where exists (select 1 from public.recipes where slug = 'cookies-keping-cokelat-sorgum')
on conflict (recipe_id, step_number) do update set title=excluded.title, instruction=excluded.instruction, timer_minutes=excluded.timer_minutes, tip=excluded.tip;

insert into public.recipe_steps (recipe_id, step_number, title, instruction, timer_minutes, tip)
select (select id from public.recipes where slug = 'cookies-keping-cokelat-sorgum'), 3, 'Bentuk Bulatan & Chocochip', 'Bentuk bulatan pipih di loyang beroles minyak, beri taburan chocochip di atasnya.', 5, NULL
where exists (select 1 from public.recipes where slug = 'cookies-keping-cokelat-sorgum')
on conflict (recipe_id, step_number) do update set title=excluded.title, instruction=excluded.instruction, timer_minutes=excluded.timer_minutes, tip=excluded.tip;

insert into public.recipe_steps (recipe_id, step_number, title, instruction, timer_minutes, tip)
select (select id from public.recipes where slug = 'cookies-keping-cokelat-sorgum'), 4, 'Panggang Renyah', 'Panggang pada oven suhu 160°C selama 15 menit hingga renyah keemasan.', 15, NULL
where exists (select 1 from public.recipes where slug = 'cookies-keping-cokelat-sorgum')
on conflict (recipe_id, step_number) do update set title=excluded.title, instruction=excluded.instruction, timer_minutes=excluded.timer_minutes, tip=excluded.tip;

insert into public.recipe_steps (recipe_id, step_number, title, instruction, timer_minutes, tip)
select (select id from public.recipes where slug = 'es-cendol-sorgum-nangka-gula-aren'), 1, 'Masak Adonan Cendol', 'Campur tepung sorgum, tapioka, dan air pandan di panci. Masak dengan api kecil sambil diaduk terus hingga mengental meletup-letup mengilap.', 6, NULL
where exists (select 1 from public.recipes where slug = 'es-cendol-sorgum-nangka-gula-aren')
on conflict (recipe_id, step_number) do update set title=excluded.title, instruction=excluded.instruction, timer_minutes=excluded.timer_minutes, tip=excluded.tip;

insert into public.recipe_steps (recipe_id, step_number, title, instruction, timer_minutes, tip)
select (select id from public.recipes where slug = 'es-cendol-sorgum-nangka-gula-aren'), 2, 'Cetak Butiran Cendol', 'Tuang adonan panas ke saringan cendol di atas baskom berisi air es. Tekan perlahan hingga butiran cendol kenyal jatuh mengeras.', 5, NULL
where exists (select 1 from public.recipes where slug = 'es-cendol-sorgum-nangka-gula-aren')
on conflict (recipe_id, step_number) do update set title=excluded.title, instruction=excluded.instruction, timer_minutes=excluded.timer_minutes, tip=excluded.tip;

insert into public.recipe_steps (recipe_id, step_number, title, instruction, timer_minutes, tip)
select (select id from public.recipes where slug = 'es-cendol-sorgum-nangka-gula-aren'), 3, 'Susun di Gelas Segar', 'Tuang gula aren cair di dasar gelas, tambahkan cendol sorgum, es batu, dan siram santan gurih di atasnya.', 2, NULL
where exists (select 1 from public.recipes where slug = 'es-cendol-sorgum-nangka-gula-aren')
on conflict (recipe_id, step_number) do update set title=excluded.title, instruction=excluded.instruction, timer_minutes=excluded.timer_minutes, tip=excluded.tip;

insert into public.recipe_steps (recipe_id, step_number, title, instruction, timer_minutes, tip)
select (select id from public.recipes where slug = 'bolu-kukus-pandan-sorgum-mekar'), 1, 'Kocok Telur & Gula Aren', 'Mixer telur ayam dan gula aren bubuk dengan kecepatan tinggi hingga mengembang putih berjejak kental.', 6, NULL
where exists (select 1 from public.recipes where slug = 'bolu-kukus-pandan-sorgum-mekar')
on conflict (recipe_id, step_number) do update set title=excluded.title, instruction=excluded.instruction, timer_minutes=excluded.timer_minutes, tip=excluded.tip;

insert into public.recipe_steps (recipe_id, step_number, title, instruction, timer_minutes, tip)
select (select id from public.recipes where slug = 'bolu-kukus-pandan-sorgum-mekar'), 2, 'Masukkan Tepung & Santan', 'Turunkan kecepatan, masukkan tepung sorgum dan santan pandan secara bergantian hingga tercampur rata lembut.', 3, NULL
where exists (select 1 from public.recipes where slug = 'bolu-kukus-pandan-sorgum-mekar')
on conflict (recipe_id, step_number) do update set title=excluded.title, instruction=excluded.instruction, timer_minutes=excluded.timer_minutes, tip=excluded.tip;

insert into public.recipe_steps (recipe_id, step_number, title, instruction, timer_minutes, tip)
select (select id from public.recipes where slug = 'bolu-kukus-pandan-sorgum-mekar'), 3, 'Kukus Api Besar', 'Tuang ke cetakan bolu kukus beralas kertas roti. Kukus di panci kukusan yang sudah panas mendidih selama 12-15 menit tanpa membuka tutup.', 15, NULL
where exists (select 1 from public.recipes where slug = 'bolu-kukus-pandan-sorgum-mekar')
on conflict (recipe_id, step_number) do update set title=excluded.title, instruction=excluded.instruction, timer_minutes=excluded.timer_minutes, tip=excluded.tip;

insert into public.recipe_steps (recipe_id, step_number, title, instruction, timer_minutes, tip)
select (select id from public.recipes where slug = 'sup-krim-jagung-sorgum-hangat'), 1, 'Tumis Bawang Bombay', 'Tumis bawang bombay cincang dengan sedikit mentega hingga harum manis transparan.', 3, NULL
where exists (select 1 from public.recipes where slug = 'sup-krim-jagung-sorgum-hangat')
on conflict (recipe_id, step_number) do update set title=excluded.title, instruction=excluded.instruction, timer_minutes=excluded.timer_minutes, tip=excluded.tip;

insert into public.recipe_steps (recipe_id, step_number, title, instruction, timer_minutes, tip)
select (select id from public.recipes where slug = 'sup-krim-jagung-sorgum-hangat'), 2, 'Blender Sebagian Jagung', 'Blender 1/2 porsi jagung dengan sedikit susu cair untuk memberi kekentalan alami pada sup tanpa tepung maizena.', 2, NULL
where exists (select 1 from public.recipes where slug = 'sup-krim-jagung-sorgum-hangat')
on conflict (recipe_id, step_number) do update set title=excluded.title, instruction=excluded.instruction, timer_minutes=excluded.timer_minutes, tip=excluded.tip;

insert into public.recipe_steps (recipe_id, step_number, title, instruction, timer_minutes, tip)
select (select id from public.recipes where slug = 'sup-krim-jagung-sorgum-hangat'), 3, 'Rebus Bahan Bersama', 'Campurkan pure jagung, sisa jagung pipil, wortel dadu, dan biji sorgum rebus ke panci. Masak hingga sayuran matang.', 8, NULL
where exists (select 1 from public.recipes where slug = 'sup-krim-jagung-sorgum-hangat')
on conflict (recipe_id, step_number) do update set title=excluded.title, instruction=excluded.instruction, timer_minutes=excluded.timer_minutes, tip=excluded.tip;

insert into public.recipe_steps (recipe_id, step_number, title, instruction, timer_minutes, tip)
select (select id from public.recipes where slug = 'sup-krim-jagung-sorgum-hangat'), 4, 'Bumbui & Sajikan', 'Bumbui dengan pala bubuk, garam, dan merica. Aduk rata dan sajikan hangat di mangkuk sup.', 2, NULL
where exists (select 1 from public.recipes where slug = 'sup-krim-jagung-sorgum-hangat')
on conflict (recipe_id, step_number) do update set title=excluded.title, instruction=excluded.instruction, timer_minutes=excluded.timer_minutes, tip=excluded.tip;

-- ---------- RECIPE TARGETS (inferred from target_age_label) ----------
insert into public.recipe_targets (recipe_id, target) select (select id from public.recipes where slug = 'nasi-goreng-sorgum-ceria-sd-edition'), 'anak_sd' where exists (select 1 from public.recipes where slug = 'nasi-goreng-sorgum-ceria-sd-edition') on conflict do nothing;
insert into public.recipe_targets (recipe_id, target) select (select id from public.recipes where slug = 'nasi-goreng-sorgum-ceria-sd-edition'), 'anak_sekolah' where exists (select 1 from public.recipes where slug = 'nasi-goreng-sorgum-ceria-sd-edition') on conflict do nothing;
insert into public.recipe_targets (recipe_id, target) select (select id from public.recipes where slug = 'pancakes-sorghum-gluten-free'), 'balita' where exists (select 1 from public.recipes where slug = 'pancakes-sorghum-gluten-free') on conflict do nothing;
insert into public.recipe_targets (recipe_id, target) select (select id from public.recipes where slug = 'pancakes-sorghum-gluten-free'), 'anak_sd' where exists (select 1 from public.recipes where slug = 'pancakes-sorghum-gluten-free') on conflict do nothing;
insert into public.recipe_targets (recipe_id, target) select (select id from public.recipes where slug = 'pancakes-sorghum-gluten-free'), 'anak_sekolah' where exists (select 1 from public.recipes where slug = 'pancakes-sorghum-gluten-free') on conflict do nothing;
insert into public.recipe_targets (recipe_id, target) select (select id from public.recipes where slug = 'roti-tawar-biji-sorgum-artisanal'), 'remaja_dewasa' where exists (select 1 from public.recipes where slug = 'roti-tawar-biji-sorgum-artisanal') on conflict do nothing;
insert into public.recipe_targets (recipe_id, target) select (select id from public.recipes where slug = 'roti-tawar-biji-sorgum-artisanal'), 'dewasa_lansia' where exists (select 1 from public.recipes where slug = 'roti-tawar-biji-sorgum-artisanal') on conflict do nothing;
insert into public.recipe_targets (recipe_id, target) select (select id from public.recipes where slug = 'sorghum-power-bowl'), 'remaja_dewasa' where exists (select 1 from public.recipes where slug = 'sorghum-power-bowl') on conflict do nothing;
insert into public.recipe_targets (recipe_id, target) select (select id from public.recipes where slug = 'sorghum-power-bowl'), 'dewasa_lansia' where exists (select 1 from public.recipes where slug = 'sorghum-power-bowl') on conflict do nothing;
insert into public.recipe_targets (recipe_id, target) select (select id from public.recipes where slug = 'sorghum-power-bowl'), 'lansia' where exists (select 1 from public.recipes where slug = 'sorghum-power-bowl') on conflict do nothing;
insert into public.recipe_targets (recipe_id, target) select (select id from public.recipes where slug = 'risotto-jamur-liar-sorgum-creamy'), 'remaja_dewasa' where exists (select 1 from public.recipes where slug = 'risotto-jamur-liar-sorgum-creamy') on conflict do nothing;
insert into public.recipe_targets (recipe_id, target) select (select id from public.recipes where slug = 'risotto-jamur-liar-sorgum-creamy'), 'dewasa_lansia' where exists (select 1 from public.recipes where slug = 'risotto-jamur-liar-sorgum-creamy') on conflict do nothing;
insert into public.recipe_targets (recipe_id, target) select (select id from public.recipes where slug = 'risotto-jamur-liar-sorgum-creamy'), 'lansia' where exists (select 1 from public.recipes where slug = 'risotto-jamur-liar-sorgum-creamy') on conflict do nothing;
insert into public.recipe_targets (recipe_id, target) select (select id from public.recipes where slug = 'bubur-tinutuan-sorgum-manado'), 'anak_sd' where exists (select 1 from public.recipes where slug = 'bubur-tinutuan-sorgum-manado') on conflict do nothing;
insert into public.recipe_targets (recipe_id, target) select (select id from public.recipes where slug = 'bubur-tinutuan-sorgum-manado'), 'siswa_smp' where exists (select 1 from public.recipes where slug = 'bubur-tinutuan-sorgum-manado') on conflict do nothing;
insert into public.recipe_targets (recipe_id, target) select (select id from public.recipes where slug = 'bubur-tinutuan-sorgum-manado'), 'siswa_sma' where exists (select 1 from public.recipes where slug = 'bubur-tinutuan-sorgum-manado') on conflict do nothing;
insert into public.recipe_targets (recipe_id, target) select (select id from public.recipes where slug = 'bubur-tinutuan-sorgum-manado'), 'remaja_dewasa' where exists (select 1 from public.recipes where slug = 'bubur-tinutuan-sorgum-manado') on conflict do nothing;
insert into public.recipe_targets (recipe_id, target) select (select id from public.recipes where slug = 'bubur-tinutuan-sorgum-manado'), 'lansia' where exists (select 1 from public.recipes where slug = 'bubur-tinutuan-sorgum-manado') on conflict do nothing;
insert into public.recipe_targets (recipe_id, target) select (select id from public.recipes where slug = 'bubur-tinutuan-sorgum-manado'), 'balita' where exists (select 1 from public.recipes where slug = 'bubur-tinutuan-sorgum-manado') on conflict do nothing;
insert into public.recipe_targets (recipe_id, target) select (select id from public.recipes where slug = 'cookies-keping-cokelat-sorgum'), 'anak_sd' where exists (select 1 from public.recipes where slug = 'cookies-keping-cokelat-sorgum') on conflict do nothing;
insert into public.recipe_targets (recipe_id, target) select (select id from public.recipes where slug = 'cookies-keping-cokelat-sorgum'), 'anak_sekolah' where exists (select 1 from public.recipes where slug = 'cookies-keping-cokelat-sorgum') on conflict do nothing;
insert into public.recipe_targets (recipe_id, target) select (select id from public.recipes where slug = 'cookies-keping-cokelat-sorgum'), 'remaja_dewasa' where exists (select 1 from public.recipes where slug = 'cookies-keping-cokelat-sorgum') on conflict do nothing;
insert into public.recipe_targets (recipe_id, target) select (select id from public.recipes where slug = 'cookies-keping-cokelat-sorgum'), 'dewasa_lansia' where exists (select 1 from public.recipes where slug = 'cookies-keping-cokelat-sorgum') on conflict do nothing;
insert into public.recipe_targets (recipe_id, target) select (select id from public.recipes where slug = 'es-cendol-sorgum-nangka-gula-aren'), 'anak_sd' where exists (select 1 from public.recipes where slug = 'es-cendol-sorgum-nangka-gula-aren') on conflict do nothing;
insert into public.recipe_targets (recipe_id, target) select (select id from public.recipes where slug = 'es-cendol-sorgum-nangka-gula-aren'), 'siswa_smp' where exists (select 1 from public.recipes where slug = 'es-cendol-sorgum-nangka-gula-aren') on conflict do nothing;
insert into public.recipe_targets (recipe_id, target) select (select id from public.recipes where slug = 'es-cendol-sorgum-nangka-gula-aren'), 'siswa_sma' where exists (select 1 from public.recipes where slug = 'es-cendol-sorgum-nangka-gula-aren') on conflict do nothing;
insert into public.recipe_targets (recipe_id, target) select (select id from public.recipes where slug = 'es-cendol-sorgum-nangka-gula-aren'), 'remaja_dewasa' where exists (select 1 from public.recipes where slug = 'es-cendol-sorgum-nangka-gula-aren') on conflict do nothing;
insert into public.recipe_targets (recipe_id, target) select (select id from public.recipes where slug = 'es-cendol-sorgum-nangka-gula-aren'), 'lansia' where exists (select 1 from public.recipes where slug = 'es-cendol-sorgum-nangka-gula-aren') on conflict do nothing;
insert into public.recipe_targets (recipe_id, target) select (select id from public.recipes where slug = 'es-cendol-sorgum-nangka-gula-aren'), 'balita' where exists (select 1 from public.recipes where slug = 'es-cendol-sorgum-nangka-gula-aren') on conflict do nothing;
insert into public.recipe_targets (recipe_id, target) select (select id from public.recipes where slug = 'bolu-kukus-pandan-sorgum-mekar'), 'anak_sd' where exists (select 1 from public.recipes where slug = 'bolu-kukus-pandan-sorgum-mekar') on conflict do nothing;
insert into public.recipe_targets (recipe_id, target) select (select id from public.recipes where slug = 'bolu-kukus-pandan-sorgum-mekar'), 'siswa_smp' where exists (select 1 from public.recipes where slug = 'bolu-kukus-pandan-sorgum-mekar') on conflict do nothing;
insert into public.recipe_targets (recipe_id, target) select (select id from public.recipes where slug = 'bolu-kukus-pandan-sorgum-mekar'), 'siswa_sma' where exists (select 1 from public.recipes where slug = 'bolu-kukus-pandan-sorgum-mekar') on conflict do nothing;
insert into public.recipe_targets (recipe_id, target) select (select id from public.recipes where slug = 'bolu-kukus-pandan-sorgum-mekar'), 'remaja_dewasa' where exists (select 1 from public.recipes where slug = 'bolu-kukus-pandan-sorgum-mekar') on conflict do nothing;
insert into public.recipe_targets (recipe_id, target) select (select id from public.recipes where slug = 'bolu-kukus-pandan-sorgum-mekar'), 'lansia' where exists (select 1 from public.recipes where slug = 'bolu-kukus-pandan-sorgum-mekar') on conflict do nothing;
insert into public.recipe_targets (recipe_id, target) select (select id from public.recipes where slug = 'bolu-kukus-pandan-sorgum-mekar'), 'balita' where exists (select 1 from public.recipes where slug = 'bolu-kukus-pandan-sorgum-mekar') on conflict do nothing;
insert into public.recipe_targets (recipe_id, target) select (select id from public.recipes where slug = 'sup-krim-jagung-sorgum-hangat'), 'balita' where exists (select 1 from public.recipes where slug = 'sup-krim-jagung-sorgum-hangat') on conflict do nothing;
insert into public.recipe_targets (recipe_id, target) select (select id from public.recipes where slug = 'sup-krim-jagung-sorgum-hangat'), 'anak_sd' where exists (select 1 from public.recipes where slug = 'sup-krim-jagung-sorgum-hangat') on conflict do nothing;
insert into public.recipe_targets (recipe_id, target) select (select id from public.recipes where slug = 'sup-krim-jagung-sorgum-hangat'), 'anak_sekolah' where exists (select 1 from public.recipes where slug = 'sup-krim-jagung-sorgum-hangat') on conflict do nothing;
insert into public.recipe_targets (recipe_id, target) select (select id from public.recipes where slug = 'sup-krim-jagung-sorgum-hangat'), 'lansia' where exists (select 1 from public.recipes where slug = 'sup-krim-jagung-sorgum-hangat') on conflict do nothing;

-- ---------- INGREDIENT MASTER (from mock DEFAULT_INGREDIENTS) ----------