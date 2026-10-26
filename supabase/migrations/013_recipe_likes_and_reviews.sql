-- 013_recipe_likes_and_reviews.sql
-- Pisah konsep: Save = koleksi pribadi (saved_recipes, sudah ada),
-- Like = apresiasi publik agregat, Review = rating+ulasan publik.

-- 1. Like publik: satu baris per user per resep
create table if not exists public.recipe_likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, recipe_id)
);
create index if not exists idx_recipe_likes_recipe on public.recipe_likes(recipe_id);
create index if not exists idx_recipe_likes_user on public.recipe_likes(user_id);

-- 2. Review publik: satu rating per user per resep (boleh update)
create table if not exists public.recipe_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  review_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, recipe_id)
);
create index if not exists idx_recipe_reviews_recipe on public.recipe_reviews(recipe_id);

-- 3. Agregat publik (dibaca anon tanpa RLS per-baris)
create or replace view public.v_recipe_stats as
select
  r.id as recipe_id,
  (select count(*) from public.recipe_likes l where l.recipe_id = r.id) as likes,
  (select count(*) from public.recipe_reviews v where v.recipe_id = r.id) as reviews_count,
  (select round(avg(v.rating)::numeric, 1) from public.recipe_reviews v where v.recipe_id = r.id) as rating_avg
from public.recipes r;

-- 4. RLS: user kelola miliknya; baca agregat via view (security invoker = ikut RLS pembaca,
--    tapi count dari tabel lain tetap perlu policy baca publik agar view bisa dipakai anon)
alter table public.recipe_likes enable row level security;
alter table public.recipe_reviews enable row level security;

drop policy if exists "own likes all" on public.recipe_likes;
create policy "own likes all" on public.recipe_likes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "public read likes" on public.recipe_likes;
create policy "public read likes" on public.recipe_likes for select using (true);

drop policy if exists "own reviews all" on public.recipe_reviews;
create policy "own reviews all" on public.recipe_reviews
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "public read reviews" on public.recipe_reviews;
create policy "public read reviews" on public.recipe_reviews for select using (true);
