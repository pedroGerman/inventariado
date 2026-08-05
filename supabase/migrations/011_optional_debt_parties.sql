-- Customer/supplier are optional on sales and purchases.
-- Collect/pay debts must still point at the right document, but may be anonymous.

ALTER TABLE public.debts DROP CONSTRAINT IF EXISTS debts_source_check;

ALTER TABLE public.debts ADD CONSTRAINT debts_source_check CHECK (
  (
    kind = 'collect'
    AND order_id IS NOT NULL
    AND purchase_id IS NULL
    AND supplier_id IS NULL
  )
  OR
  (
    kind = 'pay'
    AND purchase_id IS NOT NULL
    AND order_id IS NULL
    AND customer_id IS NULL
  )
);

-- Match orders/purchases: deleting a contact clears the link instead of blocking.
ALTER TABLE public.debts
  DROP CONSTRAINT IF EXISTS debts_customer_id_fkey;

ALTER TABLE public.debts
  ADD CONSTRAINT debts_customer_id_fkey
  FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;

ALTER TABLE public.debts
  DROP CONSTRAINT IF EXISTS debts_supplier_id_fkey;

ALTER TABLE public.debts
  ADD CONSTRAINT debts_supplier_id_fkey
  FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE SET NULL;
