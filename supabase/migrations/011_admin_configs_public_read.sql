-- Flag admin (mis. images_enabled, main_feature_enabled) harus bisa dibaca
-- semua pengguna agar berlaku global. Tulis tetap hanya admin (policy 007).
create policy "admin_configs public read"
  on public.admin_configs for select to public using (true);
