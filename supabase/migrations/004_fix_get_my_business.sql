-- Incluir owner aunque el trigger de employees no haya corrido aún
CREATE OR REPLACE FUNCTION public.get_my_business()
RETURNS public.businesses
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.*
  FROM public.businesses b
  WHERE b.owner_id = auth.uid()
     OR public.is_business_member(b.id)
  ORDER BY b.created_at ASC
  LIMIT 1;
$$;
