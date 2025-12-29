-- ===================================
-- VIVLIT MVP DATABASE SCHEMA UPDATE
-- ===================================

-- 1. Add is_password_protected flag to jars for clearer toggling
ALTER TABLE public.jars ADD COLUMN IF NOT EXISTS is_password_protected boolean DEFAULT false;

-- Update existing jars: set is_password_protected based on password_hash
UPDATE public.jars SET is_password_protected = (password_hash IS NOT NULL);

-- 2. Create jar_owners table for multiple owners per jar
CREATE TABLE public.jar_owners (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  jar_id uuid NOT NULL REFERENCES public.jars(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'owner', -- 'owner' or 'editor'
  added_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(jar_id, user_id)
);

ALTER TABLE public.jar_owners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view jar ownership" ON public.jar_owners
  FOR SELECT USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.jar_owners jo WHERE jo.jar_id = jar_owners.jar_id AND jo.user_id = auth.uid()
  ));

CREATE POLICY "Jar owners can add co-owners" ON public.jar_owners
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.jars WHERE jars.id = jar_id AND jars.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.jar_owners jo WHERE jo.jar_id = jar_owners.jar_id AND jo.user_id = auth.uid() AND jo.role = 'owner'
  ));

CREATE POLICY "Jar owners can remove co-owners" ON public.jar_owners
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM public.jars WHERE jars.id = jar_id AND jars.user_id = auth.uid()
  ) OR auth.uid() = user_id);

-- 3. Create jar_user_state for per-user open tracking
CREATE TABLE public.jar_user_state (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  jar_id uuid NOT NULL REFERENCES public.jars(id) ON DELETE CASCADE,
  user_id uuid, -- NULL for anonymous users tracked by session
  session_id text, -- For anonymous users
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

-- 4. Create jar_shares for tracking who shared what
CREATE TABLE public.jar_shares (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  jar_id uuid NOT NULL REFERENCES public.jars(id) ON DELETE CASCADE,
  shared_by_user_id uuid NOT NULL,
  shared_to_user_id uuid, -- NULL if shared via link before recipient signed up
  shared_to_email text, -- Email if known
  permission text NOT NULL DEFAULT 'view', -- 'view' or 'edit'
  shared_at timestamp with time zone NOT NULL DEFAULT now(),
  accepted_at timestamp with time zone,
  UNIQUE(jar_id, shared_to_user_id)
);

ALTER TABLE public.jar_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view shares they're part of" ON public.jar_shares
  FOR SELECT USING (
    auth.uid() = shared_by_user_id OR 
    auth.uid() = shared_to_user_id OR
    EXISTS (SELECT 1 FROM public.jars WHERE jars.id = jar_id AND jars.user_id = auth.uid())
  );

CREATE POLICY "Jar owners can create shares" ON public.jar_shares
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.jars WHERE jars.id = jar_id AND jars.user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.jar_owners WHERE jar_owners.jar_id = jar_shares.jar_id AND jar_owners.user_id = auth.uid())
  );

CREATE POLICY "Jar owners can delete shares" ON public.jar_shares
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.jars WHERE jars.id = jar_id AND jars.user_id = auth.uid()) OR
    auth.uid() = shared_by_user_id
  );

CREATE POLICY "Recipients can update their acceptance" ON public.jar_shares
  FOR UPDATE USING (auth.uid() = shared_to_user_id);

-- 5. Create ghost_accounts for guest-to-user conversion
CREATE TABLE public.ghost_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL UNIQUE,
  converted_to_user_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  converted_at timestamp with time zone,
  jar_ids uuid[] DEFAULT '{}'
);

ALTER TABLE public.ghost_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ghost accounts" ON public.ghost_accounts
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create ghost accounts" ON public.ghost_accounts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update ghost accounts" ON public.ghost_accounts
  FOR UPDATE USING (true);

-- 6. Create jar_charms for decorative elements
CREATE TABLE public.jar_charms (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  jar_id uuid NOT NULL REFERENCES public.jars(id) ON DELETE CASCADE,
  charm_type text NOT NULL, -- 'heart', 'star', 'flower', 'sparkle', etc.
  position_x float NOT NULL DEFAULT 50, -- percentage 0-100
  position_y float NOT NULL DEFAULT 50, -- percentage 0-100
  scale float NOT NULL DEFAULT 1,
  rotation float NOT NULL DEFAULT 0, -- degrees
  color text, -- optional color override
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.jar_charms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view charms" ON public.jar_charms
  FOR SELECT USING (true);

CREATE POLICY "Jar owners can manage charms" ON public.jar_charms
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.jars WHERE jars.id = jar_id AND jars.user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.jar_owners WHERE jar_owners.jar_id = jar_charms.jar_id AND jar_owners.user_id = auth.uid())
  );

CREATE POLICY "Jar owners can update charms" ON public.jar_charms
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.jars WHERE jars.id = jar_id AND jars.user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.jar_owners WHERE jar_owners.jar_id = jar_charms.jar_id AND jar_owners.user_id = auth.uid())
  );

CREATE POLICY "Jar owners can delete charms" ON public.jar_charms
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.jars WHERE jars.id = jar_id AND jars.user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.jar_owners WHERE jar_owners.jar_id = jar_charms.jar_id AND jar_owners.user_id = auth.uid())
  );

-- 7. Add note_theme to jar_notes for per-note theming
ALTER TABLE public.jar_notes ADD COLUMN IF NOT EXISTS note_theme text DEFAULT 'default';

-- 8. Create jar_activity for timeline
CREATE TABLE public.jar_activity (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  jar_id uuid NOT NULL REFERENCES public.jars(id) ON DELETE CASCADE,
  user_id uuid,
  activity_type text NOT NULL, -- 'created', 'edited', 'shared', 'received', 'opened_note'
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.jar_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their jar activity" ON public.jar_activity
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.jars WHERE jars.id = jar_id AND jars.user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.jar_shares WHERE jar_shares.jar_id = jar_activity.jar_id AND jar_shares.shared_to_user_id = auth.uid())
  );

CREATE POLICY "Anyone can create activity" ON public.jar_activity
  FOR INSERT WITH CHECK (true);

-- 9. Allow jars to be created by ghost accounts (nullable user_id with session tracking)
ALTER TABLE public.jars ADD COLUMN IF NOT EXISTS ghost_session_id text;

-- 10. Create function to convert ghost account to real user
CREATE OR REPLACE FUNCTION public.convert_ghost_account(p_session_id text, p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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

-- 11. Add more themes by updating allowed values (just documentation, no constraint)
COMMENT ON COLUMN public.jars.theme IS 'Theme options: warm, lavender, mint, rose, ocean, sunset, forest, candy, midnight, golden';

-- Create indexes for performance
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