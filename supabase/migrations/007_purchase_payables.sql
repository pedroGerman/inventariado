-- Track cash paid on purchases (mirrors orders.cash_received)
ALTER TABLE public.purchases
  ADD COLUMN IF NOT EXISTS cash_paid NUMERIC(12, 2)
    CHECK (cash_paid IS NULL OR cash_paid >= 0),
  ADD COLUMN IF NOT EXISTS change NUMERIC(12, 2)
    CHECK (change IS NULL OR change >= 0);

-- Support payable debts (por pagar a proveedores)
ALTER TABLE public.debts
  ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'collect'
    CHECK (kind IN ('collect', 'pay')),
  ADD COLUMN IF NOT EXISTS purchase_id UUID REFERENCES public.purchases(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES public.suppliers(id) ON DELETE RESTRICT;

ALTER TABLE public.debts
  ALTER COLUMN order_id DROP NOT NULL,
  ALTER COLUMN customer_id DROP NOT NULL;

ALTER TABLE public.debts DROP CONSTRAINT IF EXISTS debts_order_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_debts_order_id_collect
  ON public.debts (order_id)
  WHERE kind = 'collect' AND order_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_debts_purchase_id_pay
  ON public.debts (purchase_id)
  WHERE kind = 'pay' AND purchase_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_debts_supplier_id ON public.debts(supplier_id);
CREATE INDEX IF NOT EXISTS idx_debts_purchase_id ON public.debts(purchase_id);

ALTER TABLE public.debts DROP CONSTRAINT IF EXISTS debts_source_check;

ALTER TABLE public.debts ADD CONSTRAINT debts_source_check CHECK (
  (
    kind = 'collect'
    AND order_id IS NOT NULL
    AND customer_id IS NOT NULL
    AND purchase_id IS NULL
    AND supplier_id IS NULL
  )
  OR
  (
    kind = 'pay'
    AND purchase_id IS NOT NULL
    AND supplier_id IS NOT NULL
    AND order_id IS NULL
    AND customer_id IS NULL
  )
);
