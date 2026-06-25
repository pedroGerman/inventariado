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
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/**`

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

Bucket `product-images` (público). Sube archivos con ruta:

```
{business_id}/nombre-archivo.jpg
```

## Extensibilidad

- `businesses.settings` (JSONB) — flags futuros sin migración
- `UNIQUE(owner_id)` — un negocio por owner hoy; quitar constraint para multi-negocio
- `employees` — listo para multi-cajero con login propio más adelante
- `tax_rate` en negocio — hoy 18%; editable sin cambiar app
