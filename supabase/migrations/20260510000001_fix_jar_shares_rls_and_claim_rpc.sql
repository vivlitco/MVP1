-- Drop the broken UPDATE policy (shared_to_user_id IS NULL never matches auth.uid())
DROP POLICY IF EXISTS "Recipients can update their acceptance" ON public.jar_shares;

-- New UPDATE policy: allow claim by user_id OR by JWT email match
CREATE POLICY "Recipients can update their acceptance" ON public.jar_shares
  FOR UPDATE
  USING (
    auth.uid() = shared_to_user_id
    OR (
      shared_to_user_id IS NULL
      AND shared_to_email IS NOT NULL
      AND auth.jwt() IS NOT NULL
      AND lower(shared_to_email) = lower(auth.jwt() ->> 'email')
    )
  )
  WITH CHECK (
    auth.uid() = shared_to_user_id
    OR (
      shared_to_user_id IS NULL
      AND shared_to_email IS NOT NULL
      AND auth.jwt() IS NOT NULL
      AND lower(shared_to_email) = lower(auth.jwt() ->> 'email')
    )
  );

-- Index for email-based RLS lookups (supports both SELECT and UPDATE policies)
CREATE INDEX IF NOT EXISTS idx_jar_shares_shared_to_email_lower
  ON public.jar_shares (lower(shared_to_email));

-- Atomically claim all pending email shares for the calling user.
-- Replaces the N+1 client-side loop in Dashboard.fetchSharedJars.
-- SECURITY DEFINER allows the UPDATE to succeed even when shared_to_user_id IS NULL
-- (the new UPDATE RLS policy also permits this via email-match, but SECURITY DEFINER
-- additionally handles the UNIQUE(jar_id, shared_to_user_id) edge case gracefully).
CREATE OR REPLACE FUNCTION public.claim_shared_jars()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id    uuid;
  v_user_email text;
  v_claimed    integer;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  v_user_email := lower(auth.jwt() ->> 'email');
  IF v_user_email IS NULL OR v_user_email = '' THEN
    RAISE EXCEPTION 'User email not available in JWT';
  END IF;

  -- Claim all email-matched unclaimed shares.
  -- Skip any jar_id where the user already has a user_id-based share
  -- to avoid violating UNIQUE(jar_id, shared_to_user_id).
  UPDATE public.jar_shares
  SET
    shared_to_user_id = v_user_id,
    accepted_at       = COALESCE(accepted_at, now())
  WHERE
    shared_to_user_id IS NULL
    AND shared_to_email IS NOT NULL
    AND lower(shared_to_email) = v_user_email
    AND NOT EXISTS (
      SELECT 1 FROM public.jar_shares js2
      WHERE js2.jar_id = jar_shares.jar_id
        AND js2.shared_to_user_id = v_user_id
    );

  GET DIAGNOSTICS v_claimed = ROW_COUNT;
  RETURN v_claimed;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_shared_jars() TO authenticated;
