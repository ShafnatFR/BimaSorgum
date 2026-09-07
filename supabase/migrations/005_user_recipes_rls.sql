-- ============================================================
-- SorghumCare (BimaSorgum) — Migration 005
-- RLS untuk user-generated recipes (wizard/chat "generate" flow):
--   anon user boleh INSERT resep baru (created_by = auth.uid()),
--   UPDATE/DELETE hanya resep miliknya.
-- ============================================================

-- Insert: user only creates rows they own
create policy "recipes own insert"
  on public.recipes
  for insert
  to public
  with check (created_by = auth.uid());

-- Update: user can edit only their own generated recipes
create policy "recipes own update"
  on public.recipes
  for update
  to public
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

-- Delete: user can remove only their own generated recipes
create policy "recipes own delete"
  on public.recipes
  for delete
  to public
  using (created_by = auth.uid());

-- Children of user recipes must be manageable by the owning user too.
-- (recipe_ingredients / recipe_steps currently only public-read; the
--  upsertRecipe flow deletes + re-inserts children, so the anon user needs
--  INSERT/DELETE on children whose recipe they own.)
create policy "recipe_ingredients owner insert"
  on public.recipe_ingredients
  for insert
  to public
  with check (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_id and r.created_by = auth.uid()
    )
  );

create policy "recipe_ingredients owner delete"
  on public.recipe_ingredients
  for delete
  to public
  using (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_id and r.created_by = auth.uid()
    )
  );

create policy "recipe_steps owner insert"
  on public.recipe_steps
  for insert
  to public
  with check (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_id and r.created_by = auth.uid()
    )
  );

create policy "recipe_steps owner delete"
  on public.recipe_steps
  for delete
  to public
  using (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_id and r.created_by = auth.uid()
    )
  );
