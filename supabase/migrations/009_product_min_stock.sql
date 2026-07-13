-- Per-product threshold for "stock bajo" badge (default matches previous hardcoded 5).
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS min_stock INTEGER NOT NULL DEFAULT 5
  CHECK (min_stock >= 0);

COMMENT ON COLUMN public.products.min_stock IS
  'Minimum stock level that triggers the low-stock warning badge';
