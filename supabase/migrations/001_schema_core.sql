-- ============================================================
-- SorghumCare (BimaSorgum) — Supabase Schema
-- Tema: AI Recipe Generator berbahan sorgum + target konsumen
-- (Balita, Anak Sekolah, Remaja/Dewasa, Lansia, dll)
--
-- Cara pakai:
--   1. Buat project Supabase baru (Singapore/ap-southeast-1)
--   2. Buka SQL Editor -> tempel file ini -> RUN (urut dari atas)
--   3. Simpan kunci anon/publishable + service_role ke Vercel env
--
-- Catatan penting (pelajaran dari proyek flo-web):
--   - Kunci auth: pakai PUBLISHABLE key (sb_publishable_...) utk
--     NEXT_PUBLIC_* / VITE_*, BUKAN legacy anon (eyJ...)
--   - Password DB: URL-encode karakter spesial (! # @ dst)
--   - Koneksi dari Vercel: pakai POOLER + sslmode=no-verify
-- ============================================================

-- ============================================================
-- 1. EXTENSIONS
-- ============================================================
create extension if not exists "pgcrypto";      -- gen_random_uuid()
create extension if not exists "moddatetime";   -- trigger updated_at otomatis

-- ============================================================
-- 2. ENUM (nilai tetap dari frontend types.ts)
-- ============================================================
do $$ begin
  create type public.target_consumer as enum (
    'balita', 'anak_sd', 'anak_sekolah', 'siswa_smp', 'siswa_sma',
    'remaja_dewasa', 'dewasa_lansia', 'lansia'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.dish_category as enum (
    'makanan_berat', 'camilan_sehat', 'minuman_nutrisi', 'dessert_rendah_gi'
  );
exception when duplicate_object then null; end $$;

-- ============================================================
-- 3. TABEL PROFIL / GLOBAL
-- ============================================================

-- Profil pengguna (1:1 dengan auth.users). Peran dasar utk masa depan.
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  full_name     text,
  avatar_url    text,
  role          text not null default 'user'
                check (role in ('user','admin','nutritionist')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Master bahan pangan (utk wizard pilihan bahan & estimasi harga)
create table if not exists public.ingredients (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  category      text not null default 'utama'
                check (category in ('utama','sayur','protein','bumbu','pelengkap')),
  icon_name     text,
  unit          text not null default 'porsi',
  default_price integer not null default 0,   -- estimasi Rupiah per unit
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- 4. TABEL RESEP (Jantung Aplikasi)
-- ============================================================

-- Master resep: resep "sistem" (di-ekspor dari frontend) maupun
-- resep "AI-generated" (dihasilkan dari wizard/chat lalu disimpan)
create table if not exists public.recipes (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,          -- utk URL /recipe/:slug
  title             text not null,
  subtitle          text,
  description       text,
  image_url         text,
  tags              text[] not null default '{}',
  target_age_label  text,                          -- mis. "Balita (1-5 thn)"
  dish_category     public.dish_category,
  prep_time_minutes integer,
  cook_time_minutes integer,
  servings          integer not null default 1,
  estimated_cost    integer,                       -- Rupiah per porsi
  difficulty        text,                          -- Mudah/Sedang/Sulit
  calories_estimate integer,
  fiber_grams       numeric(6,2),
  protein_grams     numeric(6,2),
  glycemic_index    text check (glycemic_index in ('Sangat Rendah','Rendah (Low GI)','Sedang')),
  nutrition_note    text,                          -- judul + deskripsi nutrisi unggulan
  is_system         boolean not null default false,-- true = resep bawaan aplikasi
  is_published      boolean not null default true,
  created_by        uuid references public.profiles (id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Bahan per resep (tabel anak resep, order dijaga dgn sort_order)
create table if not exists public.recipe_ingredients (
  id              uuid primary key default gen_random_uuid(),
  recipe_id       uuid not null references public.recipes (id) on delete cascade,
  ingredient_ref  uuid references public.ingredients (id) on delete set null,
  name            text not null,        -- denormalisasi utk resep AI (nama bebas)
  amount          text not null,        -- "50g", "1 butir", "150ml"
  notes           text,
  estimated_price integer,
  sort_order      integer not null default 0,
  unique (recipe_id, sort_order)
);

-- Langkah memasak (tabel anak resep, berurutan)
create table if not exists public.recipe_steps (
  id            uuid primary key default gen_random_uuid(),
  recipe_id     uuid not null references public.recipes (id) on delete cascade,
  step_number   integer not null,
  title         text not null,
  instruction   text not null,
  timer_minutes integer,
  tip           text,
  unique (recipe_id, step_number)
);

-- Peta target konsumen -> resep (many-to-many, dipakai filter wizard)
create table if not exists public.recipe_targets (
  recipe_id      uuid not null references public.recipes (id) on delete cascade,
  target         public.target_consumer not null,
  primary key (recipe_id, target)
);

-- ============================================================
-- 5. TABEL PENGGUNA (Interaksi)
-- ============================================================

-- Resep tersimpan / favorit pengguna
create table if not exists public.saved_recipes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  recipe_id   uuid not null references public.recipes (id) on delete cascade,
  is_favorite boolean not null default true,
  notes       text,
  created_at  timestamptz not null default now(),
  unique (user_id, recipe_id)
);

-- Riwayat percakapan AI (per sesi chat)
create table if not exists public.chat_sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  title       text not null default 'Percakapan baru',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Pesan dalam sesi chat (user/ai + lampiran resep)
create table if not exists public.chat_messages (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.chat_sessions (id) on delete cascade,
  sender      text not null check (sender in ('user','ai','system')),
  content     text,
  recipe_id   uuid references public.recipes (id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- 6. INDEX
-- ============================================================
create index if not exists idx_recipes_category   on public.recipes (dish_category);
create index if not exists idx_recipes_created    on public.recipes (created_at desc);
create index if not exists idx_recipes_system     on public.recipes (is_system);
create index if not exists idx_recipe_ingr_recipe on public.recipe_ingredients (recipe_id);
create index if not exists idx_recipe_steps_recipe on public.recipe_steps (recipe_id);
create index if not exists idx_saved_user        on public.saved_recipes (user_id);
create index if not exists idx_saved_recipe      on public.saved_recipes (recipe_id);
create index if not exists idx_chat_sess_user    on public.chat_sessions (user_id);
create index if not exists idx_chat_msg_session  on public.chat_messages (session_id);
create index if not exists idx_ingredients_slug  on public.ingredients (slug);
create index if not exists idx_profiles_role     on public.profiles (role);

-- ============================================================
-- 7. TRIGGER updated_at
-- ============================================================
drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function moddatetime (updated_at);

drop trigger if exists trg_recipes_updated on public.recipes;
create trigger trg_recipes_updated before update on public.recipes
  for each row execute function moddatetime (updated_at);

drop trigger if exists trg_chat_sessions_updated on public.chat_sessions;
create trigger trg_chat_sessions_updated before update on public.chat_sessions
  for each row execute function moddatetime (updated_at);

-- ============================================================
-- 8. ROW LEVEL SECURITY (RLS)
--    Filosofi: katalog publik bisa dibaca semua; data pribadi
--    hanya pemiliknya (user_id = auth.uid())
-- ============================================================

-- ---- Katalog publik: baca untuk semua; tulis hanya admin/system ----
alter table public.recipes enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.recipe_steps enable row level security;
alter table public.recipe_targets enable row level security;
alter table public.ingredients enable row level security;

create policy "recipes public read"
  on public.recipes for select using (is_published = true);
create policy "recipes ingredients public read"
  on public.recipe_ingredients for select using (true);
create policy "recipe steps public read"
  on public.recipe_steps for select using (true);
create policy "recipe targets public read"
  on public.recipe_targets for select using (true);
create policy "ingredients public read"
  on public.ingredients for select using (is_active = true);

-- ---- Data pengguna: hanya pemilik ----
alter table public.profiles enable row level security;
alter table public.saved_recipes enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;

create policy "profiles own select"
  on public.profiles for select using (auth.uid() = id);
create policy "profiles own insert"
  on public.profiles for insert with check (auth.uid() = id);
create policy "profiles own update"
  on public.profiles for update using (auth.uid() = id);

create policy "saved own all"
  on public.saved_recipes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "chat sessions own all"
  on public.chat_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "chat messages via own session"
  on public.chat_messages for all
  using (exists (
    select 1 from public.chat_sessions s
    where s.id = session_id and s.user_id = auth.uid()))
  with check (exists (
    select 1 from public.chat_sessions s
    where s.id = session_id and s.user_id = auth.uid()));

-- ============================================================
-- 9. HANDLE PROFIL BARU OTOMATIS (signup -> insert profiles)
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name',
             new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
