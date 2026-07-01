-- Permitir elegir moneda al crear el negocio (onboarding)
CREATE OR REPLACE FUNCTION public.create_business(
  p_name TEXT,
  p_logo_url TEXT DEFAULT NULL,
  p_currency TEXT DEFAULT 'DOP'
)
RETURNS public.businesses
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_business public.businesses;
  v_currency TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_currency := COALESCE(NULLIF(trim(p_currency), ''), 'DOP');

  INSERT INTO public.businesses (name, owner_id, logo_url, currency)
  VALUES (p_name, auth.uid(), p_logo_url, v_currency)
  RETURNING * INTO v_business;

  RETURN v_business;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_business(TEXT, TEXT, TEXT) TO authenticated;
