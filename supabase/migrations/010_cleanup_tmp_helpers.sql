-- Final cleanup: pastikan tidak ada helper sementara yang tersisa di production.
drop function if exists public.tmp_create_admin(text, text, text);
drop function if exists public.tmp_auth_users_cols();
drop function if exists public.tmp_auth_notnull();
drop function if exists public.tmp_fix_admin();
drop function if exists public.tmp_debug_admin();
drop function if exists public.tmp_promote_signup();
drop function if exists public.tmp_confirm_signup();
drop view if exists public.tmp_auth_users_cols;
