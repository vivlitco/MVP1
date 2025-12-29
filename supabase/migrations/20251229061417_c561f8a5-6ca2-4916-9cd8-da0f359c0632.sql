-- Create a security definer function to check jar ownership without recursion
CREATE OR REPLACE FUNCTION public.is_jar_owner_or_creator(p_jar_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.jars WHERE id = p_jar_id AND user_id = p_user_id
  ) OR EXISTS (
    SELECT 1 FROM public.jar_owners WHERE jar_id = p_jar_id AND user_id = p_user_id
  )
$$;

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view jar ownership" ON public.jar_owners;
DROP POLICY IF EXISTS "Jar owners can add co-owners" ON public.jar_owners;

-- Recreate policies without recursion
CREATE POLICY "Users can view jar ownership"
ON public.jar_owners
FOR SELECT
USING (
  auth.uid() = user_id 
  OR EXISTS (SELECT 1 FROM public.jars WHERE jars.id = jar_owners.jar_id AND jars.user_id = auth.uid())
);

CREATE POLICY "Jar owners can add co-owners"
ON public.jar_owners
FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.jars WHERE jars.id = jar_owners.jar_id AND jars.user_id = auth.uid())
  OR public.is_jar_owner_or_creator(jar_id, auth.uid())
);