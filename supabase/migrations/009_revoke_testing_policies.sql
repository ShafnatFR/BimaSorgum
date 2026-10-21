-- Cabut policy testing sementara (009 + 010). Kembalikan ke RLS admin-only.
drop policy if exists "tmp testing allow all authenticated admin_configs" on public.admin_configs;
drop policy if exists "tmp testing allow all authenticated reports" on public.reports;
drop policy if exists "tmp testing allow all authenticated recipe_comments" on public.recipe_comments;
drop policy if exists "tmp testing allow all authenticated recipes" on public.recipes;
drop policy if exists "tmp testing open admin_configs" on public.admin_configs;
drop policy if exists "tmp testing open reports" on public.reports;
drop policy if exists "tmp testing open recipe_comments" on public.recipe_comments;
drop policy if exists "tmp testing open recipes" on public.recipes;
