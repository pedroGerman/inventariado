-- =============================================================================
-- Mi POS App — Schema completo con relaciones y RLS
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query → Run
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. EXTENSIONES
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- 2. TIPOS ENUM (CHECK constraints en columnas text)
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- 3. TABLAS
-- ---------------------------------------------------------------------------

-- Negocios (tenant principal)
CREATE TABLE public.businesses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  logo_url    TEXT,
  plan        TEXT NOT NULL DEFAULT 'free'
                CHECK (plan IN ('free', 'basic', 'pro', 'enterprise')),
  tax_rate    NUMERIC(5, 4) NOT NULL DEFAULT 0.18
                CHECK (tax_rate >= 0 AND tax_rate <= 1),
  currency    TEXT NOT NULL DEFAULT 'DOP',
  settings    JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT businesses_one_per_owner UNIQUE (owner_id)
);

CREATE INDEX idx_businesses_owner_id ON public.businesses(owner_id);

-- Contadores por negocio (números de orden/compra)
CREATE TABLE public.business_sequences (
  business_id       UUID PRIMARY KEY REFERENCES public.businesses(id) ON DELETE CASCADE,
  order_counter     INTEGER NOT NULL DEFAULT 0 CHECK (order_counter >= 0),
  purchase_counter  INTEGER NOT NULL DEFAULT 0 CHECK (purchase_counter >= 0)
);

-- Empleados (multi-usuario por negocio)
CREATE TABLE public.employees (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'employee'
                CHECK (role IN ('owner', 'cashier', 'employee')),
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, user_id)
);

CREATE INDEX idx_employees_business_id ON public.employees(business_id);
CREATE INDEX idx_employees_user_id ON public.employees(user_id);

-- Cajas registradoras
CREATE TABLE public.cash_registers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE RESTRICT,
  opened_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at   TIMESTAMPTZ,
  status      TEXT NOT NULL DEFAULT 'open'
                CHECK (status IN ('open', 'closed'))
);

CREATE INDEX idx_cash_registers_business_id ON public.cash_registers(business_id);
CREATE INDEX idx_cash_registers_status ON public.cash_registers(business_id, status);

-- Categorías
CREATE TABLE public.categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  image_url   TEXT,
  active      BOOLEAN NOT NULL DEFAULT true,
  show_in     TEXT[] NOT NULL DEFAULT ARRAY['ventas']::TEXT[]
                CHECK (
                  show_in <@ ARRAY['ventas', 'compras']::TEXT[]
                  AND cardinality(show_in) > 0
                ),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_categories_business_id ON public.categories(business_id);

-- Productos e insumos
CREATE TABLE public.products (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  category_id  UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name         TEXT NOT NULL,
  type         TEXT NOT NULL DEFAULT 'product'
                 CHECK (type IN ('product', 'supply')),
  sale_price   NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (sale_price >= 0),
  cost_price   NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (cost_price >= 0),
  stock        INTEGER NOT NULL DEFAULT 0,
  image_url    TEXT,
  active       BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_business_id ON public.products(business_id);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_type ON public.products(business_id, type);

-- Clientes
CREATE TABLE public.customers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  phone       TEXT,
  extra_info  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_customers_business_id ON public.customers(business_id);
CREATE INDEX idx_customers_name ON public.customers(business_id, name);

-- Proveedores
CREATE TABLE public.suppliers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  phone       TEXT,
  nit         TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_suppliers_business_id ON public.suppliers(business_id);

-- Órdenes de venta
CREATE TABLE public.orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  employee_id     UUID NOT NULL REFERENCES public.employees(id) ON DELETE RESTRICT,
  customer_id     UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  register_id     UUID REFERENCES public.cash_registers(id) ON DELETE SET NULL,
  order_number    TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'confirmed'
                    CHECK (status IN ('confirmed', 'pending', 'cancelled', 'returned')),
  payment_method  TEXT NOT NULL DEFAULT 'cash'
                    CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'other')),
  payment_type    TEXT NOT NULL DEFAULT 'pay_all'
                    CHECK (payment_type IN ('pay_all', 'deposit', 'pay_later', 'split')),
  subtotal        NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  tax             NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (tax >= 0),
  service         NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (service >= 0),
  discount        NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  total           NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  cash_received   NUMERIC(12, 2) CHECK (cash_received IS NULL OR cash_received >= 0),
  change_amount   NUMERIC(12, 2) CHECK (change_amount IS NULL OR change_amount >= 0),
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, order_number)
);

CREATE INDEX idx_orders_business_id ON public.orders(business_id);
CREATE INDEX idx_orders_date ON public.orders(business_id, date DESC);
CREATE INDEX idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX idx_orders_status ON public.orders(business_id, status);

-- Items de orden
CREATE TABLE public.order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES public.products(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  unit_price  NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
  total_price NUMERIC(12, 2) NOT NULL CHECK (total_price >= 0)
);

CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);

-- Compras
CREATE TABLE public.purchases (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  employee_id     UUID NOT NULL REFERENCES public.employees(id) ON DELETE RESTRICT,
  supplier_id     UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  register_id     UUID REFERENCES public.cash_registers(id) ON DELETE SET NULL,
  purchase_number TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'confirmed'
                    CHECK (status IN ('confirmed', 'pending', 'cancelled')),
  payment_method  TEXT NOT NULL DEFAULT 'cash',
  payment_type    TEXT NOT NULL DEFAULT 'pay_all'
                    CHECK (payment_type IN ('pay_all', 'deposit', 'pay_later')),
  subtotal        NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  tax             NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (tax >= 0),
  discount        NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  total           NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, purchase_number)
);

CREATE INDEX idx_purchases_business_id ON public.purchases(business_id);
CREATE INDEX idx_purchases_date ON public.purchases(business_id, date DESC);

-- Items de compra
CREATE TABLE public.purchase_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES public.products(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  unit_price  NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
  total_price NUMERIC(12, 2) NOT NULL CHECK (total_price >= 0)
);

CREATE INDEX idx_purchase_items_purchase_id ON public.purchase_items(purchase_id);

-- Deudas (fiado / por cobrar)
CREATE TABLE public.debts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  total       NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
  paid        NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (paid >= 0),
  remaining   NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (remaining >= 0),
  status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'partial', 'paid')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (order_id)
);

CREATE INDEX idx_debts_business_id ON public.debts(business_id);
CREATE INDEX idx_debts_customer_id ON public.debts(customer_id);
CREATE INDEX idx_debts_status ON public.debts(business_id, status);

-- Pagos de deudas
CREATE TABLE public.payments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  debt_id    UUID NOT NULL REFERENCES public.debts(id) ON DELETE RESTRICT,
  amount     NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  method     TEXT NOT NULL DEFAULT 'cash',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_debt_id ON public.payments(debt_id);

-- ---------------------------------------------------------------------------
-- 4. FUNCIONES AUXILIARES PARA RLS
-- ---------------------------------------------------------------------------

-- ¿El usuario autenticado es miembro activo del negocio?
CREATE OR REPLACE FUNCTION public.is_business_member(p_business_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.employees e
    WHERE e.business_id = p_business_id
      AND e.user_id = auth.uid()
      AND e.active = true
  );
$$;

-- ¿El usuario autenticado es owner del negocio?
CREATE OR REPLACE FUNCTION public.is_business_owner(p_business_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.employees e
    WHERE e.business_id = p_business_id
      AND e.user_id = auth.uid()
      AND e.role = 'owner'
      AND e.active = true
  );
$$;

-- IDs de negocios del usuario autenticado
CREATE OR REPLACE FUNCTION public.my_business_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT e.business_id
  FROM public.employees e
  WHERE e.user_id = auth.uid()
    AND e.active = true;
$$;

-- Empleado activo del usuario en un negocio
CREATE OR REPLACE FUNCTION public.my_employee_id(p_business_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT e.id
  FROM public.employees e
  WHERE e.business_id = p_business_id
    AND e.user_id = auth.uid()
    AND e.active = true
  LIMIT 1;
$$;

-- ---------------------------------------------------------------------------
-- 5. TRIGGERS
-- ---------------------------------------------------------------------------

-- Auto-crear registro de empleado owner al crear negocio
CREATE OR REPLACE FUNCTION public.handle_new_business()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.employees (business_id, user_id, name, role)
  VALUES (
    NEW.id,
    NEW.owner_id,
    COALESCE(
      (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = NEW.owner_id),
      'Propietario'
    ),
    'owner'
  );

  INSERT INTO public.business_sequences (business_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_business_created
  AFTER INSERT ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_business();

-- Recalcular remaining y status en debts
CREATE OR REPLACE FUNCTION public.sync_debt_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.remaining := GREATEST(NEW.total - NEW.paid, 0);

  IF NEW.paid >= NEW.total THEN
    NEW.status := 'paid';
  ELSIF NEW.paid > 0 THEN
    NEW.status := 'partial';
  ELSE
    NEW.status := 'pending';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER debts_sync_status
  BEFORE INSERT OR UPDATE OF total, paid ON public.debts
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_debt_status();

-- Al insertar un pago, actualizar debt.paid
CREATE OR REPLACE FUNCTION public.apply_payment_to_debt()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.debts
  SET paid = paid + NEW.amount
  WHERE id = NEW.debt_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_payment_inserted
  AFTER INSERT ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.apply_payment_to_debt();

-- Descontar stock al confirmar orden (UPDATE status → confirmed, después de insertar items)
CREATE OR REPLACE FUNCTION public.adjust_stock_on_order()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE'
     AND NEW.status = 'confirmed'
     AND OLD.status IS DISTINCT FROM 'confirmed' THEN
    UPDATE public.products p
    SET stock = p.stock - oi.quantity
    FROM public.order_items oi
    WHERE oi.order_id = NEW.id
      AND oi.product_id IS NOT NULL
      AND p.id = oi.product_id;
  END IF;

  IF TG_OP = 'UPDATE'
     AND OLD.status = 'confirmed'
     AND NEW.status IN ('cancelled', 'returned') THEN
    UPDATE public.products p
    SET stock = p.stock + oi.quantity
    FROM public.order_items oi
    WHERE oi.order_id = NEW.id
      AND oi.product_id IS NOT NULL
      AND p.id = oi.product_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER orders_adjust_stock
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.adjust_stock_on_order();

-- Aumentar stock al confirmar compra
CREATE OR REPLACE FUNCTION public.adjust_stock_on_purchase()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE'
     AND NEW.status = 'confirmed'
     AND OLD.status IS DISTINCT FROM 'confirmed' THEN
    UPDATE public.products p
    SET stock = p.stock + pi.quantity
    FROM public.purchase_items pi
    WHERE pi.purchase_id = NEW.id
      AND pi.product_id IS NOT NULL
      AND p.id = pi.product_id;
  END IF;

  IF TG_OP = 'UPDATE'
     AND OLD.status = 'confirmed'
     AND NEW.status = 'cancelled' THEN
    UPDATE public.products p
    SET stock = p.stock - pi.quantity
    FROM public.purchase_items pi
    WHERE pi.purchase_id = NEW.id
      AND pi.product_id IS NOT NULL
      AND p.id = pi.product_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER purchases_adjust_stock
  AFTER UPDATE OF status ON public.purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.adjust_stock_on_purchase();

-- RPC: crear negocio (onboarding)
CREATE OR REPLACE FUNCTION public.create_business(p_name TEXT, p_logo_url TEXT DEFAULT NULL)
RETURNS public.businesses
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_business public.businesses;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.businesses (name, owner_id, logo_url)
  VALUES (p_name, auth.uid(), p_logo_url)
  RETURNING * INTO v_business;

  RETURN v_business;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_business(TEXT, TEXT) TO authenticated;

-- Prefijo de 3 letras estable por negocio (ej. AIQ-167)
CREATE OR REPLACE FUNCTION public.business_code_prefix(p_business_id UUID)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT upper(substr(replace(p_business_id::TEXT, '-', ''), 1, 3));
$$;

CREATE OR REPLACE FUNCTION public.next_order_number(p_business_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_counter INTEGER;
BEGIN
  IF NOT public.is_business_member(p_business_id) THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;

  UPDATE public.business_sequences
  SET order_counter = order_counter + 1
  WHERE business_id = p_business_id
  RETURNING order_counter INTO v_counter;

  RETURN public.business_code_prefix(p_business_id) || '-' || v_counter;
END;
$$;

CREATE OR REPLACE FUNCTION public.next_purchase_number(p_business_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_counter INTEGER;
BEGIN
  IF NOT public.is_business_member(p_business_id) THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;

  UPDATE public.business_sequences
  SET purchase_counter = purchase_counter + 1
  WHERE business_id = p_business_id
  RETURNING purchase_counter INTO v_counter;

  RETURN 'C-' || public.business_code_prefix(p_business_id) || '-' || v_counter;
END;
$$;

GRANT EXECUTE ON FUNCTION public.next_order_number(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.next_purchase_number(UUID) TO authenticated;

-- Negocio del usuario autenticado (uno por owner hoy; extensible a varios vía employees)
CREATE OR REPLACE FUNCTION public.get_my_business()
RETURNS public.businesses
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.*
  FROM public.businesses b
  WHERE public.is_business_member(b.id)
  ORDER BY b.created_at ASC
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_business() TO authenticated;

-- ---------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS)
-- ---------------------------------------------------------------------------

ALTER TABLE public.businesses       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_registers   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments         ENABLE ROW LEVEL SECURITY;

-- ── businesses ──────────────────────────────────────────────────────────────
CREATE POLICY "businesses_select_member"
  ON public.businesses FOR SELECT
  TO authenticated
  USING (public.is_business_member(id));

CREATE POLICY "businesses_insert_owner"
  ON public.businesses FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "businesses_update_owner"
  ON public.businesses FOR UPDATE
  TO authenticated
  USING (public.is_business_owner(id))
  WITH CHECK (public.is_business_owner(id));

CREATE POLICY "businesses_delete_owner"
  ON public.businesses FOR DELETE
  TO authenticated
  USING (public.is_business_owner(id));

-- ── business_sequences ────────────────────────────────────────────────────────
CREATE POLICY "business_sequences_select_member"
  ON public.business_sequences FOR SELECT
  TO authenticated
  USING (public.is_business_member(business_id));

-- ── employees ─────────────────────────────────────────────────────────────────
CREATE POLICY "employees_select_member"
  ON public.employees FOR SELECT
  TO authenticated
  USING (public.is_business_member(business_id));

CREATE POLICY "employees_insert_owner"
  ON public.employees FOR INSERT
  TO authenticated
  WITH CHECK (public.is_business_owner(business_id));

CREATE POLICY "employees_update_owner"
  ON public.employees FOR UPDATE
  TO authenticated
  USING (public.is_business_owner(business_id))
  WITH CHECK (public.is_business_owner(business_id));

CREATE POLICY "employees_delete_owner"
  ON public.employees FOR DELETE
  TO authenticated
  USING (public.is_business_owner(business_id));

-- ── cash_registers ────────────────────────────────────────────────────────────
CREATE POLICY "cash_registers_all_member"
  ON public.cash_registers FOR ALL
  TO authenticated
  USING (public.is_business_member(business_id))
  WITH CHECK (public.is_business_member(business_id));

-- ── categories ────────────────────────────────────────────────────────────────
CREATE POLICY "categories_all_member"
  ON public.categories FOR ALL
  TO authenticated
  USING (public.is_business_member(business_id))
  WITH CHECK (public.is_business_member(business_id));

-- ── products ──────────────────────────────────────────────────────────────────
CREATE POLICY "products_all_member"
  ON public.products FOR ALL
  TO authenticated
  USING (public.is_business_member(business_id))
  WITH CHECK (public.is_business_member(business_id));

-- ── customers ─────────────────────────────────────────────────────────────────
CREATE POLICY "customers_all_member"
  ON public.customers FOR ALL
  TO authenticated
  USING (public.is_business_member(business_id))
  WITH CHECK (public.is_business_member(business_id));

-- ── suppliers ─────────────────────────────────────────────────────────────────
CREATE POLICY "suppliers_all_member"
  ON public.suppliers FOR ALL
  TO authenticated
  USING (public.is_business_member(business_id))
  WITH CHECK (public.is_business_member(business_id));

-- ── orders ────────────────────────────────────────────────────────────────────
CREATE POLICY "orders_all_member"
  ON public.orders FOR ALL
  TO authenticated
  USING (public.is_business_member(business_id))
  WITH CHECK (public.is_business_member(business_id));

-- ── order_items (acceso vía orden padre) ─────────────────────────────────────
CREATE POLICY "order_items_select"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND public.is_business_member(o.business_id)
    )
  );

CREATE POLICY "order_items_insert"
  ON public.order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND public.is_business_member(o.business_id)
    )
  );

CREATE POLICY "order_items_update"
  ON public.order_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND public.is_business_member(o.business_id)
    )
  );

CREATE POLICY "order_items_delete"
  ON public.order_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND public.is_business_member(o.business_id)
    )
  );

-- ── purchases ─────────────────────────────────────────────────────────────────
CREATE POLICY "purchases_all_member"
  ON public.purchases FOR ALL
  TO authenticated
  USING (public.is_business_member(business_id))
  WITH CHECK (public.is_business_member(business_id));

-- ── purchase_items (acceso vía compra padre) ─────────────────────────────────
CREATE POLICY "purchase_items_select"
  ON public.purchase_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.purchases p
      WHERE p.id = purchase_items.purchase_id
        AND public.is_business_member(p.business_id)
    )
  );

CREATE POLICY "purchase_items_insert"
  ON public.purchase_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.purchases p
      WHERE p.id = purchase_items.purchase_id
        AND public.is_business_member(p.business_id)
    )
  );

CREATE POLICY "purchase_items_update"
  ON public.purchase_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.purchases p
      WHERE p.id = purchase_items.purchase_id
        AND public.is_business_member(p.business_id)
    )
  );

CREATE POLICY "purchase_items_delete"
  ON public.purchase_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.purchases p
      WHERE p.id = purchase_items.purchase_id
        AND public.is_business_member(p.business_id)
    )
  );

-- ── debts ─────────────────────────────────────────────────────────────────────
CREATE POLICY "debts_all_member"
  ON public.debts FOR ALL
  TO authenticated
  USING (public.is_business_member(business_id))
  WITH CHECK (public.is_business_member(business_id));

-- ── payments (acceso vía deuda → negocio) ─────────────────────────────────────
CREATE POLICY "payments_select"
  ON public.payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.debts d
      WHERE d.id = payments.debt_id
        AND public.is_business_member(d.business_id)
    )
  );

CREATE POLICY "payments_insert"
  ON public.payments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.debts d
      WHERE d.id = payments.debt_id
        AND public.is_business_member(d.business_id)
    )
  );

CREATE POLICY "payments_delete_owner"
  ON public.payments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.debts d
      WHERE d.id = payments.debt_id
        AND public.is_business_owner(d.business_id)
    )
  );

-- ---------------------------------------------------------------------------
-- 7. STORAGE — imágenes de productos ({business_id}/{filename})
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::TEXT[]
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "product_images_public_read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

CREATE POLICY "product_images_member_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images'
    AND public.is_business_member((storage.foldername(name))[1]::UUID)
  );

CREATE POLICY "product_images_member_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'product-images'
    AND public.is_business_member((storage.foldername(name))[1]::UUID)
  );

CREATE POLICY "product_images_member_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'product-images'
    AND public.is_business_member((storage.foldername(name))[1]::UUID)
  );

-- ---------------------------------------------------------------------------
-- 8. GRANTS
-- ---------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
