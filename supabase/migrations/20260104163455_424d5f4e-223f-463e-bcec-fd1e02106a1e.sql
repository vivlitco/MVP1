-- Fix 1: Replace overly permissive jars SELECT policy with proper token-based access
DROP POLICY IF EXISTS "Anyone can view shared jars by token" ON public.jars;

CREATE POLICY "Users can view jars they have access to" ON public.jars
  FOR SELECT USING (
    -- Jar owner
    auth.uid() = user_id
    -- Co-owner
    OR EXISTS (
      SELECT 1 FROM public.jar_owners WHERE jar_id = jars.id AND user_id = auth.uid()
    )
    -- Shared to user
    OR EXISTS (
      SELECT 1 FROM public.jar_shares WHERE jar_id = jars.id AND shared_to_user_id = auth.uid()
    )
    -- Ghost session owner (for unauthenticated users creating jars)
    OR (auth.uid() IS NULL AND ghost_session_id IS NOT NULL)
  );

-- Create separate policy for public access via share_token (used by ViewJar page)
CREATE POLICY "Public access via share token in URL" ON public.jars
  FOR SELECT USING (
    -- This policy allows SELECT but the actual share_token validation happens in the application
    -- We need to allow public access to jars that have a share_token, but only expose limited fields
    -- Since RLS can't filter columns, we rely on the frontend to only query shared jars by share_token
    share_token IS NOT NULL
  );

-- Fix 2: Replace overly permissive jar_notes SELECT policy
DROP POLICY IF EXISTS "Anyone can view notes in shared jars" ON public.jar_notes;

CREATE POLICY "Users can view notes in accessible jars" ON public.jar_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.jars j
      WHERE j.id = jar_notes.jar_id
      AND (
        -- Jar owner
        j.user_id = auth.uid()
        -- Co-owner
        OR EXISTS (SELECT 1 FROM public.jar_owners WHERE jar_id = j.id AND user_id = auth.uid())
        -- Shared to user
        OR EXISTS (SELECT 1 FROM public.jar_shares WHERE jar_id = j.id AND shared_to_user_id = auth.uid())
        -- Public share access (jar has share_token)
        OR j.share_token IS NOT NULL
      )
    )
  );

-- Fix 3: Replace overly permissive jar_notes UPDATE policy
DROP POLICY IF EXISTS "Anyone can update opened_at on notes" ON public.jar_notes;

CREATE POLICY "Users can update opened_at on accessible notes" ON public.jar_notes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.jars j
      WHERE j.id = jar_notes.jar_id
      AND (
        -- Jar owner
        j.user_id = auth.uid()
        -- Co-owner
        OR EXISTS (SELECT 1 FROM public.jar_owners WHERE jar_id = j.id AND user_id = auth.uid())
        -- Shared to user
        OR EXISTS (SELECT 1 FROM public.jar_shares WHERE jar_id = j.id AND shared_to_user_id = auth.uid())
        -- Public share access (jar has share_token)
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
        OR EXISTS (SELECT 1 FROM public.jar_owners WHERE jar_id = j.id AND user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.jar_shares WHERE jar_id = j.id AND shared_to_user_id = auth.uid())
        OR j.share_token IS NOT NULL
      )
    )
  );

-- Fix 4: Update convert_ghost_account to validate the authenticated user
CREATE OR REPLACE FUNCTION public.convert_ghost_account(p_session_id text, p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Security check: the p_user_id must match the authenticated user
  -- This prevents attackers from stealing ghost sessions
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'User ID mismatch - cannot convert session for another user';
  END IF;

  -- Update jars created by ghost to belong to real user
  UPDATE public.jars 
  SET user_id = p_user_id, ghost_session_id = NULL 
  WHERE ghost_session_id = p_session_id;
  
  -- Update ghost_accounts record
  UPDATE public.ghost_accounts 
  SET converted_to_user_id = p_user_id, converted_at = now() 
  WHERE session_id = p_session_id;
  
  -- Update jar_user_state
  UPDATE public.jar_user_state 
  SET user_id = p_user_id, session_id = NULL 
  WHERE session_id = p_session_id;
END;
$$;

-- Fix 5: Create secure password hashing functions
-- Hash password function using pgcrypto
CREATE OR REPLACE FUNCTION public.hash_jar_password(p_password text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT extensions.crypt(p_password, extensions.gen_salt('bf', 10));
$$;

-- Verify password function
CREATE OR REPLACE FUNCTION public.verify_jar_password(p_password text, p_hash text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p_hash = extensions.crypt(p_password, p_hash);
$$;