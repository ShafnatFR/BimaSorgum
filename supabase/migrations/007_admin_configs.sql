-- ============================================================
-- SorghumCare (BimaSorgum) — Migration 007
-- Tabel konfigurasi admin (key-value store) untuk menyimpan
-- payload/pengaturan yang dapat diubah oleh admin.
-- Contoh key: 'main_feature_enabled', 'images_enabled',
-- 'max_budget_per_portion', 'ai_model', dll.
-- ============================================================

-- Tabel konfigurasi admin (key-value store)
create table if not exists public.admin_configs (
  id            uuid primary key default gen_random_uuid(),
  config_key    text unique not null,
  config_value  jsonb not null default '{}',
  description   text,
  updated_by    uuid references public.profiles (id) on delete set null,
  updated_at    timestamptz not null default now()
);

-- Index untuk pencarian cepat berdasarkan key
create index if not exists idx_admin_configs_key
  on public.admin_configs (config_key);

-- Trigger updated_at otomatis (moddatetime)
drop trigger if exists trg_admin_configs_updated on public.admin_configs;
create trigger trg_admin_configs_updated before update on public.admin_configs
  for each row execute function moddatetime (updated_at);

-- Aktifkan RLS
alter table public.admin_configs enable row level security;

-- Policy: hanya admin yang boleh mengelola (ALL operations)
create policy "admins manage admin_configs"
  on public.admin_configs for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
