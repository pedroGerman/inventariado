-- Add transfer as a payment method on orders
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_payment_method_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IN ('cash', 'transfer', 'credit_card', 'debit_card', 'other'));
