-- Custom payment methods per business + allow free-text method keys on orders.

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_payment_method_check;

CREATE TABLE public.custom_payment_methods (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT custom_payment_methods_name_not_blank CHECK (length(trim(name)) > 0)
);

CREATE UNIQUE INDEX idx_custom_payment_methods_business_name
  ON public.custom_payment_methods (business_id, lower(name));

CREATE INDEX idx_custom_payment_methods_business_id
  ON public.custom_payment_methods (business_id);

ALTER TABLE public.custom_payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "custom_payment_methods_all_member"
  ON public.custom_payment_methods FOR ALL
  TO authenticated
  USING (public.is_business_member(business_id))
  WITH CHECK (public.is_business_member(business_id));

COMMENT ON TABLE public.custom_payment_methods IS
  'User-defined payment methods available in Caja, scoped per business';
