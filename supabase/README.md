# Supabase — aplicar schema

## Opción A: SQL Editor (rápida)

1. Abre [Supabase Dashboard](https://supabase.com/dashboard/project/itbgighyruytmobqeeoy/sql/new)
2. Copia todo el contenido de `supabase/migrations/001_initial_schema.sql`
3. Ejecuta **Run**

## Opción B: CLI

```bash
npx supabase login
npx supabase link --project-ref itbgighyruytmobqeeoy
npx supabase db push
```

## Después de migrar

1. **Authentication → URL Configuration**
   - **Local:** Site URL `http://localhost:3000`, Redirect URLs `http://localhost:3000/**`
   - **Producción (Vercel):** Site URL `https://inventariado-delta.vercel.app`, Redirect URLs:
     - `https://inventariado-delta.vercel.app/**`
     - `http://localhost:3000/**` (opcional, para desarrollo)

   El callback de confirmación de correo apunta a `/auth/callback` (p. ej.
   `https://inventariado-delta.vercel.app/auth/callback`).

2. Crea un usuario en **Authentication → Users**

3. Inicia sesión en la app → te llevará a **Crear tu tienda**

## Variables de entorno

```env
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_SUPABASE_URL=https://itbgighyruytmobqeeoy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon o publishable key del dashboard>
```

La **Publishable key** del dashboard es la misma que la **anon key** — no la pongas en `SUPABASE_URL`.

## Storage

Bucket **`product-images`** (público). Rutas por negocio:

```
{business_id}/categories/{category_id}.{ext}
{business_id}/products/{product_id}.{ext}
{business_id}/avatars/{user_id}.{ext}
{business_id}/logo.{ext}
```

La app usa `lib/storage/uploadPlatformImage()`:

- **Mock** (`NEXT_PUBLIC_USE_MOCK=true` o sin credenciales Supabase): guarda data URLs en localStorage.
- **Supabase**: sube al bucket y guarda la URL pública en `image_url` / `avatar_url`.

## Migraciones

Ejecutar en orden:

1. `001_initial_schema.sql`
2. `002_add_transfer_payment_method.sql`
3. `003_profiles.sql` — tabla `profiles` + avatar de usuario
4. `008_feedback.sql` — comentarios de usuarios + permisos de admin de feedback

### Dar acceso al panel de comentarios

En el **SQL Editor**, autoriza a una persona de dos formas (elige una):

```sql
-- Opción 1: por correo en allowlist
INSERT INTO public.feedback_admin_allowlist (email)
VALUES ('dueno@ejemplo.com')
ON CONFLICT (email) DO NOTHING;

-- Opción 2: flag en el perfil
UPDATE public.profiles
SET is_feedback_admin = true
WHERE lower(email) = lower('dueno@ejemplo.com');
```

Los usuarios **no pueden** auto-asignarse este permiso: un trigger en `profiles` bloquea cambios a `is_feedback_admin` desde la app. La lectura y actualización de comentarios se valida en **RLS** y en **server actions**, no en el cliente.

## Extensibilidad

- `businesses.settings` (JSONB) — flags futuros sin migración
- `UNIQUE(owner_id)` — un negocio por owner hoy; quitar constraint para multi-negocio
- `employees` — listo para multi-cajero con login propio más adelante
- `tax_rate` en negocio — hoy 18%; editable sin cambiar app
