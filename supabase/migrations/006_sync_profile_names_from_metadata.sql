-- Corregir perfiles creados sin nombre en metadata (full_name quedó como prefijo del correo)
UPDATE public.profiles p
SET full_name = trim(u.raw_user_meta_data->>'name')
FROM auth.users u
WHERE p.user_id = u.id
  AND coalesce(trim(u.raw_user_meta_data->>'name'), '') <> ''
  AND p.full_name IS DISTINCT FROM trim(u.raw_user_meta_data->>'name');
