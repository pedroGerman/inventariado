-- Feedback de usuarios + permisos de administrador de feedback (nivel plataforma)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_feedback_admin BOOLEAN NOT NULL DEFAULT false;

-- Evita que un usuario se auto-asigne como admin de feedback
CREATE OR REPLACE FUNCTION public.profiles_guard_feedback_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.is_feedback_admin IS DISTINCT FROM OLD.is_feedback_admin THEN
    NEW.is_feedback_admin := OLD.is_feedback_admin;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_guard_feedback_admin ON public.profiles;
CREATE TRIGGER profiles_guard_feedback_admin
  BEFORE UPDATE ON public.profiles
    FOR EACH ROW
  EXECUTE FUNCTION public.profiles_guard_feedback_admin();

-- Lista de correos autorizados (gestionar desde el SQL Editor de Supabase)
CREATE TABLE IF NOT EXISTS public.feedback_admin_allowlist (
  email       TEXT PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.feedback_admin_allowlist ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_feedback_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND (
        p.is_feedback_admin = true
        OR lower(p.email) IN (
          SELECT lower(email) FROM public.feedback_admin_allowlist
        )
      )
  );
$$;

CREATE TABLE IF NOT EXISTS public.user_feedback (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id   UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  sender_name   TEXT,
  sender_email  TEXT,
  message       TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'read', 'resolved')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at       TIMESTAMPTZ,
  resolved_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at
  ON public.user_feedback (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_feedback_status
  ON public.user_feedback (status);

ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_feedback_insert_own"
  ON public.user_feedback FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_feedback_select_own"
  ON public.user_feedback FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_feedback_select_admin"
  ON public.user_feedback FOR SELECT
  TO authenticated
  USING (public.is_feedback_admin_user());

CREATE POLICY "user_feedback_update_admin"
  ON public.user_feedback FOR UPDATE
  TO authenticated
  USING (public.is_feedback_admin_user())
  WITH CHECK (public.is_feedback_admin_user());
