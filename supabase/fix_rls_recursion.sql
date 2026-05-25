-- ============================================================
-- FIX: Infinite recursion in RLS policies
--
-- Root cause: jars SELECT policy checks jar_owners,
--             jar_owners SELECT policy checks jars → circular.
--             Same issue with jars ↔ jar_shares.
--
-- Fix: Use SECURITY DEFINER helper functions for cross-table
--      checks. These bypass RLS on the tables they query,
--      breaking the circular dependency.
-- ============================================================

-- Step 1: Add helper function for jar_shares lookup (SECURITY DEFINER bypasses jar_shares RLS)
CREATE OR REPLACE FUNCTION public.user_has_jar_share(p_jar_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.jar_shares
    WHERE jar_id = p_jar_id
      AND shared_to_user_id = p_user_id
  )
$$;

-- Step 2: Drop ALL existing SELECT policies on jars (clean slate)
DROP POLICY IF EXISTS "Users can view their own jars" ON public.jars;
DROP POLICY IF EXISTS "Users can view jars they have access to" ON public.jars;
DROP POLICY IF EXISTS "Public access via share token in URL" ON public.jars;
DROP POLICY IF EXISTS "Anyone can view shared jars by token" ON public.jars;

-- Step 3: Single unified jars SELECT policy using SECURITY DEFINER helpers
--   is_jar_owner_or_creator() → SECURITY DEFINER, bypasses jar_owners RLS
--   user_has_jar_share()      → SECURITY DEFINER, bypasses jar_shares RLS
CREATE POLICY "Users can view jars they have access to" ON public.jars
  FOR SELECT USING (
    auth.uid() = user_id
    OR public.is_jar_owner_or_creator(id, auth.uid())
    OR public.user_has_jar_share(id, auth.uid())
    OR (auth.uid() IS NULL AND ghost_session_id IS NOT NULL)
    OR share_token IS NOT NULL
  );

-- Step 4: Drop ALL existing SELECT/UPDATE policies on jar_notes
DROP POLICY IF EXISTS "Users can view notes in their jars" ON public.jar_notes;
DROP POLICY IF EXISTS "Users can view notes in accessible jars" ON public.jar_notes;
DROP POLICY IF EXISTS "Anyone can view notes in shared jars" ON public.jar_notes;
DROP POLICY IF EXISTS "Users can update notes in their jars" ON public.jar_notes;
DROP POLICY IF EXISTS "Anyone can update opened_at on notes" ON public.jar_notes;
DROP POLICY IF EXISTS "Users can update opened_at on accessible notes" ON public.jar_notes;

-- Step 5: Recreate jar_notes SELECT using SECURITY DEFINER helpers
CREATE POLICY "Users can view notes in accessible jars" ON public.jar_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.jars j
      WHERE j.id = jar_notes.jar_id
        AND (
          j.user_id = auth.uid()
          OR public.is_jar_owner_or_creator(j.id, auth.uid())
          OR public.user_has_jar_share(j.id, auth.uid())
          OR j.share_token IS NOT NULL
        )
    )
  );

-- Step 6: Recreate jar_notes UPDATE using SECURITY DEFINER helpers
CREATE POLICY "Users can update opened_at on accessible notes" ON public.jar_notes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.jars j
      WHERE j.id = jar_notes.jar_id
        AND (
          j.user_id = auth.uid()
          OR public.is_jar_owner_or_creator(j.id, auth.uid())
          OR public.user_has_jar_share(j.id, auth.uid())
          OR j.share_token IS NOT NULL
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jars j
      WHERE j.id = jar_notes.jar_id
        AND (
          j.user_id = auth.uid()
          OR public.is_jar_owner_or_creator(j.id, auth.uid())
          OR public.user_has_jar_share(j.id, auth.uid())
          OR j.share_token IS NOT NULL
        )
    )
  );
