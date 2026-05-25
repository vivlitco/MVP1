
-- Fix infinite recursion: jar_shares SELECT policy references jars, and jars SELECT policy references jar_shares

-- 1. Fix jar_shares SELECT policy to use SECURITY DEFINER function instead of querying jars directly
DROP POLICY IF EXISTS "Users can view shares they're part of" ON public.jar_shares;
CREATE POLICY "Users can view shares they're part of"
ON public.jar_shares FOR SELECT
USING (
  auth.uid() = shared_by_user_id
  OR auth.uid() = shared_to_user_id
  OR (shared_to_email IS NOT NULL AND auth.jwt() IS NOT NULL AND lower(shared_to_email) = lower(auth.jwt() ->> 'email'))
  OR is_jar_owner_or_creator(jar_id, auth.uid())
);

-- 2. Fix jar_shares INSERT policy 
DROP POLICY IF EXISTS "Jar owners can create shares" ON public.jar_shares;
CREATE POLICY "Jar owners can create shares"
ON public.jar_shares FOR INSERT
WITH CHECK (is_jar_owner_or_creator(jar_id, auth.uid()));

-- 3. Fix jar_shares DELETE policy
DROP POLICY IF EXISTS "Jar owners can delete shares" ON public.jar_shares;
CREATE POLICY "Jar owners can delete shares"
ON public.jar_shares FOR DELETE
USING (is_jar_owner_or_creator(jar_id, auth.uid()) OR auth.uid() = shared_by_user_id);

-- 4. Create a SECURITY DEFINER function to check jar_shares without triggering RLS
CREATE OR REPLACE FUNCTION public.is_jar_shared_to_user(p_jar_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.jar_shares 
    WHERE jar_id = p_jar_id AND shared_to_user_id = p_user_id
  )
$$;

-- 5. Fix jars "Users can view jars they have access to" to use SECURITY DEFINER functions
DROP POLICY IF EXISTS "Users can view jars they have access to" ON public.jars;
CREATE POLICY "Users can view jars they have access to"
ON public.jars FOR SELECT
USING (
  auth.uid() = user_id
  OR is_jar_owner_or_creator(id, auth.uid())
  OR is_jar_shared_to_user(id, auth.uid())
  OR (auth.uid() IS NULL AND ghost_session_id IS NOT NULL)
);

-- 6. Also fix jar_notes policies that may have similar recursion
DROP POLICY IF EXISTS "Users can view notes in accessible jars" ON public.jar_notes;
CREATE POLICY "Users can view notes in accessible jars"
ON public.jar_notes FOR SELECT
USING (
  is_jar_owner_or_creator(jar_id, auth.uid())
  OR is_jar_shared_to_user(jar_id, auth.uid())
  OR EXISTS (SELECT 1 FROM public.jars j WHERE j.id = jar_notes.jar_id AND j.share_token IS NOT NULL)
);

DROP POLICY IF EXISTS "Users can update opened_at on accessible notes" ON public.jar_notes;
CREATE POLICY "Users can update opened_at on accessible notes"
ON public.jar_notes FOR UPDATE
USING (
  is_jar_owner_or_creator(jar_id, auth.uid())
  OR is_jar_shared_to_user(jar_id, auth.uid())
  OR EXISTS (SELECT 1 FROM public.jars j WHERE j.id = jar_notes.jar_id AND j.share_token IS NOT NULL)
);

-- 7. Fix jar_activity SELECT policy 
DROP POLICY IF EXISTS "Users can view their jar activity" ON public.jar_activity;
CREATE POLICY "Users can view their jar activity"
ON public.jar_activity FOR SELECT
USING (
  auth.uid() = user_id
  OR is_jar_owner_or_creator(jar_id, auth.uid())
  OR is_jar_shared_to_user(jar_id, auth.uid())
);

-- 8. Fix jar_charms INSERT/UPDATE/DELETE policies
DROP POLICY IF EXISTS "Jar owners can manage charms" ON public.jar_charms;
CREATE POLICY "Jar owners can manage charms"
ON public.jar_charms FOR INSERT
WITH CHECK (is_jar_owner_or_creator(jar_id, auth.uid()));

DROP POLICY IF EXISTS "Jar owners can update charms" ON public.jar_charms;
CREATE POLICY "Jar owners can update charms"
ON public.jar_charms FOR UPDATE
USING (is_jar_owner_or_creator(jar_id, auth.uid()));

DROP POLICY IF EXISTS "Jar owners can delete charms" ON public.jar_charms;
CREATE POLICY "Jar owners can delete charms"
ON public.jar_charms FOR DELETE
USING (is_jar_owner_or_creator(jar_id, auth.uid()));

-- 9. Fix jar_notes policies that reference jars directly
DROP POLICY IF EXISTS "Users can view notes in their jars" ON public.jar_notes;
CREATE POLICY "Users can view notes in their jars"
ON public.jar_notes FOR SELECT
USING (is_jar_owner_or_creator(jar_id, auth.uid()));

DROP POLICY IF EXISTS "Users can update notes in their jars" ON public.jar_notes;
CREATE POLICY "Users can update notes in their jars"
ON public.jar_notes FOR UPDATE
USING (is_jar_owner_or_creator(jar_id, auth.uid()));

DROP POLICY IF EXISTS "Users can delete notes in their jars" ON public.jar_notes;
CREATE POLICY "Users can delete notes in their jars"
ON public.jar_notes FOR DELETE
USING (is_jar_owner_or_creator(jar_id, auth.uid()));

DROP POLICY IF EXISTS "Users can create notes in their jars" ON public.jar_notes;
CREATE POLICY "Users can create notes in their jars"
ON public.jar_notes FOR INSERT
WITH CHECK (
  is_jar_owner_or_creator(jar_id, auth.uid())
  OR (auth.uid() IS NULL AND EXISTS (SELECT 1 FROM public.jars WHERE id = jar_notes.jar_id AND ghost_session_id IS NOT NULL))
);
