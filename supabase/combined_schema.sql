-- ============================================================
-- VIVLIT COMPLETE DATABASE SCHEMA
-- Run this entire file in Supabase SQL Editor (one paste)
-- ============================================================

-- ============================================================
-- Migration 1: Enable pgcrypto extension
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- Migration 2: Profiles table
-- ============================================================
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Migration 3: Jars and jar_notes tables
-- ============================================================
CREATE TABLE public.jars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'My Jar of Notes',
  theme TEXT NOT NULL DEFAULT 'warm',
  recipient_name TEXT,
  recipient_email TEXT,
  share_token TEXT NOT NULL DEFAULT replace(gen_random_uuid()::text, '-', ''),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(share_token)
);

CREATE TABLE public.jar_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  jar_id UUID NOT NULL REFERENCES public.jars(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  note_order INTEGER NOT NULL DEFAULT 0,
  opened_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.jars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jar_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own jars" ON public.jars FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own jars" ON public.jars FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own jars" ON public.jars FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own jars" ON public.jars FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view shared jars by token" ON public.jars FOR SELECT USING (true);

CREATE POLICY "Users can view notes in their jars" ON public.jar_notes FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.jars WHERE id = jar_id AND user_id = auth.uid()));

CREATE POLICY "Anyone can view notes in shared jars" ON public.jar_notes FOR SELECT USING (true);

CREATE POLICY "Users can create notes in their jars" ON public.jar_notes FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.jars WHERE id = jar_id AND user_id = auth.uid()));

CREATE POLICY "Users can update notes in their jars" ON public.jar_notes FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.jars WHERE id = jar_id AND user_id = auth.uid()));

CREATE POLICY "Anyone can update opened_at on notes" ON public.jar_notes FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Users can delete notes in their jars" ON public.jar_notes FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.jars WHERE id = jar_id AND user_id = auth.uid()));

CREATE TRIGGER update_jars_updated_at
BEFORE UPDATE ON public.jars
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- Migration 4: Add open_mode to jars
-- ============================================================
ALTER TABLE public.jars
ADD COLUMN open_mode TEXT NOT NULL DEFAULT 'daily'
CHECK (open_mode IN ('daily', 'unlimited'));

-- ============================================================
-- Migration 5: Add media, password columns + storage bucket
-- ============================================================
ALTER TABLE public.jar_notes ADD COLUMN content_type text NOT NULL DEFAULT 'text';
ALTER TABLE public.jar_notes ADD COLUMN media_url text;
ALTER TABLE public.jars ADD COLUMN password_hash text;

INSERT INTO storage.buckets (id, name, public) VALUES ('jar-media', 'jar-media', true);

CREATE POLICY "Anyone can view jar media" ON storage.objects FOR SELECT USING (bucket_id = 'jar-media');

CREATE POLICY "Authenticated users can upload jar media" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'jar-media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own jar media" ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'jar-media' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================
-- Migration 6: Full schema - jar_owners, jar_user_state,
--              jar_shares, ghost_accounts, jar_charms,
--              jar_activity, ghost session support
-- ============================================================
ALTER TABLE public.jars ADD COLUMN IF NOT EXISTS is_password_protected boolean DEFAULT false;
UPDATE public.jars SET is_password_protected = (password_hash IS NOT NULL);

CREATE TABLE public.jar_owners (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  jar_id uuid NOT NULL REFERENCES public.jars(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'owner',
  added_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(jar_id, user_id)
);

ALTER TABLE public.jar_owners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view jar ownership" ON public.jar_owners
  FOR SELECT USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.jar_owners jo WHERE jo.jar_id = jar_owners.jar_id AND jo.user_id = auth.uid()
  ));

CREATE POLICY "Jar owners can add co-owners" ON public.jar_owners
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.jars WHERE jars.id = jar_id AND jars.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.jar_owners jo WHERE jo.jar_id = jar_owners.jar_id AND jo.user_id = auth.uid() AND jo.role = 'owner')
  );

CREATE POLICY "Jar owners can remove co-owners" ON public.jar_owners
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.jars WHERE jars.id = jar_id AND jars.user_id = auth.uid())
    OR auth.uid() = user_id
  );

CREATE TABLE public.jar_user_state (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  jar_id uuid NOT NULL REFERENCES public.jars(id) ON DELETE CASCADE,
  user_id uuid,
  session_id text,
  last_opened_at timestamp with time zone,
  notes_opened_today integer DEFAULT 0,
  last_opened_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(jar_id, user_id),
  UNIQUE(jar_id, session_id)
);

ALTER TABLE public.jar_user_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view their own jar state" ON public.jar_user_state
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can create jar state" ON public.jar_user_state
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update their jar state" ON public.jar_user_state
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE TABLE public.jar_shares (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  jar_id uuid NOT NULL REFERENCES public.jars(id) ON DELETE CASCADE,
  shared_by_user_id uuid NOT NULL,
  shared_to_user_id uuid,
  shared_to_email text,
  permission text NOT NULL DEFAULT 'view',
  shared_at timestamp with time zone NOT NULL DEFAULT now(),
  accepted_at timestamp with time zone,
  UNIQUE(jar_id, shared_to_user_id)
);

ALTER TABLE public.jar_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view shares they're part of" ON public.jar_shares
  FOR SELECT USING (
    auth.uid() = shared_by_user_id OR auth.uid() = shared_to_user_id
    OR EXISTS (SELECT 1 FROM public.jars WHERE jars.id = jar_id AND jars.user_id = auth.uid())
  );

CREATE POLICY "Jar owners can create shares" ON public.jar_shares
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.jars WHERE jars.id = jar_id AND jars.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.jar_owners WHERE jar_owners.jar_id = jar_shares.jar_id AND jar_owners.user_id = auth.uid())
  );

CREATE POLICY "Jar owners can delete shares" ON public.jar_shares
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.jars WHERE jars.id = jar_id AND jars.user_id = auth.uid())
    OR auth.uid() = shared_by_user_id
  );

CREATE POLICY "Recipients can update their acceptance" ON public.jar_shares
  FOR UPDATE USING (auth.uid() = shared_to_user_id);

CREATE TABLE public.ghost_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL UNIQUE,
  converted_to_user_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  converted_at timestamp with time zone,
  jar_ids uuid[] DEFAULT '{}'
);

ALTER TABLE public.ghost_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ghost accounts" ON public.ghost_accounts FOR SELECT USING (true);
CREATE POLICY "Anyone can create ghost accounts" ON public.ghost_accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update ghost accounts" ON public.ghost_accounts FOR UPDATE USING (true);

CREATE TABLE public.jar_charms (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  jar_id uuid NOT NULL REFERENCES public.jars(id) ON DELETE CASCADE,
  charm_type text NOT NULL,
  position_x float NOT NULL DEFAULT 50,
  position_y float NOT NULL DEFAULT 50,
  scale float NOT NULL DEFAULT 1,
  rotation float NOT NULL DEFAULT 0,
  color text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.jar_charms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view charms" ON public.jar_charms FOR SELECT USING (true);

CREATE POLICY "Jar owners can manage charms" ON public.jar_charms FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.jars WHERE jars.id = jar_id AND jars.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.jar_owners WHERE jar_owners.jar_id = jar_charms.jar_id AND jar_owners.user_id = auth.uid())
);

CREATE POLICY "Jar owners can update charms" ON public.jar_charms FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.jars WHERE jars.id = jar_id AND jars.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.jar_owners WHERE jar_owners.jar_id = jar_charms.jar_id AND jar_owners.user_id = auth.uid())
);

CREATE POLICY "Jar owners can delete charms" ON public.jar_charms FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.jars WHERE jars.id = jar_id AND jars.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.jar_owners WHERE jar_owners.jar_id = jar_charms.jar_id AND jar_owners.user_id = auth.uid())
);

ALTER TABLE public.jar_notes ADD COLUMN IF NOT EXISTS note_theme text DEFAULT 'default';

CREATE TABLE public.jar_activity (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  jar_id uuid NOT NULL REFERENCES public.jars(id) ON DELETE CASCADE,
  user_id uuid,
  activity_type text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.jar_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their jar activity" ON public.jar_activity
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.jars WHERE jars.id = jar_id AND jars.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.jar_shares WHERE jar_shares.jar_id = jar_activity.jar_id AND jar_shares.shared_to_user_id = auth.uid())
  );

CREATE POLICY "Anyone can create activity" ON public.jar_activity FOR INSERT WITH CHECK (true);

ALTER TABLE public.jars ADD COLUMN IF NOT EXISTS ghost_session_id text;

CREATE OR REPLACE FUNCTION public.convert_ghost_account(p_session_id text, p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.jars SET user_id = p_user_id, ghost_session_id = NULL WHERE ghost_session_id = p_session_id;
  UPDATE public.ghost_accounts SET converted_to_user_id = p_user_id, converted_at = now() WHERE session_id = p_session_id;
  UPDATE public.jar_user_state SET user_id = p_user_id, session_id = NULL WHERE session_id = p_session_id;
END;
$$;

COMMENT ON COLUMN public.jars.theme IS 'Theme options: warm, lavender, mint, rose, ocean, sunset, forest, candy, midnight, golden';

CREATE INDEX IF NOT EXISTS idx_jar_owners_jar_id ON public.jar_owners(jar_id);
CREATE INDEX IF NOT EXISTS idx_jar_owners_user_id ON public.jar_owners(user_id);
CREATE INDEX IF NOT EXISTS idx_jar_user_state_jar_id ON public.jar_user_state(jar_id);
CREATE INDEX IF NOT EXISTS idx_jar_user_state_user_id ON public.jar_user_state(user_id);
CREATE INDEX IF NOT EXISTS idx_jar_shares_jar_id ON public.jar_shares(jar_id);
CREATE INDEX IF NOT EXISTS idx_jar_shares_shared_to_user_id ON public.jar_shares(shared_to_user_id);
CREATE INDEX IF NOT EXISTS idx_jar_charms_jar_id ON public.jar_charms(jar_id);
CREATE INDEX IF NOT EXISTS idx_jar_activity_jar_id ON public.jar_activity(jar_id);
CREATE INDEX IF NOT EXISTS idx_jar_activity_user_id ON public.jar_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_jars_ghost_session_id ON public.jars(ghost_session_id);
CREATE INDEX IF NOT EXISTS idx_ghost_accounts_session_id ON public.ghost_accounts(session_id);

-- ============================================================
-- Migration 7: Ghost user jar insert/update/delete policies
-- ============================================================
DROP POLICY IF EXISTS "Users can create their own jars" ON public.jars;
CREATE POLICY "Users can create their own jars" ON public.jars FOR INSERT
  WITH CHECK ((auth.uid() = user_id) OR (auth.uid() IS NULL AND ghost_session_id IS NOT NULL));

DROP POLICY IF EXISTS "Users can view their own jars" ON public.jars;
CREATE POLICY "Users can view their own jars" ON public.jars FOR SELECT
  USING ((auth.uid() = user_id) OR (auth.uid() IS NULL AND ghost_session_id IS NOT NULL));

DROP POLICY IF EXISTS "Users can update their own jars" ON public.jars;
CREATE POLICY "Users can update their own jars" ON public.jars FOR UPDATE
  USING ((auth.uid() = user_id) OR (auth.uid() IS NULL AND ghost_session_id IS NOT NULL));

DROP POLICY IF EXISTS "Users can delete their own jars" ON public.jars;
CREATE POLICY "Users can delete their own jars" ON public.jars FOR DELETE
  USING ((auth.uid() = user_id) OR (auth.uid() IS NULL AND ghost_session_id IS NOT NULL));

DROP POLICY IF EXISTS "Users can create notes in their jars" ON public.jar_notes;
CREATE POLICY "Users can create notes in their jars" ON public.jar_notes FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM jars
    WHERE jars.id = jar_notes.jar_id
    AND (jars.user_id = auth.uid() OR (auth.uid() IS NULL AND jars.ghost_session_id IS NOT NULL))
  ));

-- ============================================================
-- Migration 8: jar_shares email-based SELECT policy
-- ============================================================
DROP POLICY IF EXISTS "Users can view shares they're part of" ON public.jar_shares;

CREATE POLICY "Users can view shares they're part of" ON public.jar_shares
  FOR SELECT USING (
    (auth.uid() = shared_by_user_id)
    OR (auth.uid() = shared_to_user_id)
    OR (
      shared_to_email IS NOT NULL
      AND auth.jwt() IS NOT NULL
      AND lower(shared_to_email) = lower(auth.jwt() ->> 'email')
    )
    OR EXISTS (SELECT 1 FROM public.jars WHERE jars.id = jar_shares.jar_id AND jars.user_id = auth.uid())
  );

-- ============================================================
-- Migration 9: Fix jar_owners recursion + helper function
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_jar_owner_or_creator(p_jar_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.jars WHERE id = p_jar_id AND user_id = p_user_id)
      OR EXISTS (SELECT 1 FROM public.jar_owners WHERE jar_id = p_jar_id AND user_id = p_user_id)
$$;

DROP POLICY IF EXISTS "Users can view jar ownership" ON public.jar_owners;
DROP POLICY IF EXISTS "Jar owners can add co-owners" ON public.jar_owners;

CREATE POLICY "Users can view jar ownership" ON public.jar_owners
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.jars WHERE jars.id = jar_owners.jar_id AND jars.user_id = auth.uid())
  );

CREATE POLICY "Jar owners can add co-owners" ON public.jar_owners
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.jars WHERE jars.id = jar_owners.jar_id AND jars.user_id = auth.uid())
    OR public.is_jar_owner_or_creator(jar_id, auth.uid())
  );

-- ============================================================
-- Migration 10: Tighten RLS + secure convert_ghost_account
--              + password hashing functions
-- ============================================================
DROP POLICY IF EXISTS "Anyone can view shared jars by token" ON public.jars;

CREATE POLICY "Users can view jars they have access to" ON public.jars
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.jar_owners WHERE jar_id = jars.id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.jar_shares WHERE jar_id = jars.id AND shared_to_user_id = auth.uid())
    OR (auth.uid() IS NULL AND ghost_session_id IS NOT NULL)
  );

CREATE POLICY "Public access via share token in URL" ON public.jars
  FOR SELECT USING (share_token IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can view notes in shared jars" ON public.jar_notes;

CREATE POLICY "Users can view notes in accessible jars" ON public.jar_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.jars j WHERE j.id = jar_notes.jar_id
      AND (
        j.user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.jar_owners WHERE jar_id = j.id AND user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.jar_shares WHERE jar_id = j.id AND shared_to_user_id = auth.uid())
        OR j.share_token IS NOT NULL
      )
    )
  );

DROP POLICY IF EXISTS "Anyone can update opened_at on notes" ON public.jar_notes;

CREATE POLICY "Users can update opened_at on accessible notes" ON public.jar_notes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.jars j WHERE j.id = jar_notes.jar_id
      AND (
        j.user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.jar_owners WHERE jar_id = j.id AND user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.jar_shares WHERE jar_id = j.id AND shared_to_user_id = auth.uid())
        OR j.share_token IS NOT NULL
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jars j WHERE j.id = jar_notes.jar_id
      AND (
        j.user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.jar_owners WHERE jar_id = j.id AND user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.jar_shares WHERE jar_id = j.id AND shared_to_user_id = auth.uid())
        OR j.share_token IS NOT NULL
      )
    )
  );

CREATE OR REPLACE FUNCTION public.convert_ghost_account(p_session_id text, p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'User ID mismatch - cannot convert session for another user';
  END IF;
  UPDATE public.jars SET user_id = p_user_id, ghost_session_id = NULL WHERE ghost_session_id = p_session_id;
  UPDATE public.ghost_accounts SET converted_to_user_id = p_user_id, converted_at = now() WHERE session_id = p_session_id;
  UPDATE public.jar_user_state SET user_id = p_user_id, session_id = NULL WHERE session_id = p_session_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.hash_jar_password(p_password text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT extensions.crypt(p_password, extensions.gen_salt('bf', 10));
$$;

CREATE OR REPLACE FUNCTION public.verify_jar_password(p_password text, p_hash text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p_hash = extensions.crypt(p_password, p_hash);
$$;
