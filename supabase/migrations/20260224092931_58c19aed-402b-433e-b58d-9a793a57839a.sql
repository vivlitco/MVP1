
-- Add new columns to jars table
ALTER TABLE public.jars 
ADD COLUMN is_collaborative boolean NOT NULL DEFAULT false,
ADD COLUMN unlock_date timestamp with time zone DEFAULT NULL,
ADD COLUMN delivery_scheduled_for timestamp with time zone DEFAULT NULL;

-- Create jar_contributors table
CREATE TABLE public.jar_contributors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  jar_id uuid NOT NULL REFERENCES public.jars(id) ON DELETE CASCADE,
  contributor_name text,
  contributor_email text,
  status text NOT NULL DEFAULT 'invited',
  invite_token text NOT NULL DEFAULT encode(extensions.gen_random_bytes(16), 'hex'),
  user_id uuid DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.jar_contributors ENABLE ROW LEVEL SECURITY;

-- Policies for jar_contributors
CREATE POLICY "Jar owners can manage contributors"
ON public.jar_contributors FOR ALL
USING (is_jar_owner_or_creator(jar_id, auth.uid()))
WITH CHECK (is_jar_owner_or_creator(jar_id, auth.uid()));

CREATE POLICY "Anyone can view contributors by invite token"
ON public.jar_contributors FOR SELECT
USING (true);

CREATE POLICY "Contributors can update their own status"
ON public.jar_contributors FOR UPDATE
USING (auth.uid() = user_id OR user_id IS NULL);

-- Security definer function to check if user is a contributor
CREATE OR REPLACE FUNCTION public.is_jar_contributor(p_jar_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.jar_contributors
    WHERE jar_id = p_jar_id AND user_id = p_user_id AND status = 'joined'
  )
$$;

-- Function to check contributor by invite token
CREATE OR REPLACE FUNCTION public.get_jar_id_by_contributor_token(p_token text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT jar_id FROM public.jar_contributors
  WHERE invite_token = p_token
  LIMIT 1
$$;

-- Update jar_notes INSERT policy to allow contributors
DROP POLICY IF EXISTS "Users can create notes in their jars" ON public.jar_notes;
CREATE POLICY "Users can create notes in their jars"
ON public.jar_notes FOR INSERT
WITH CHECK (
  is_jar_owner_or_creator(jar_id, auth.uid())
  OR is_jar_contributor(jar_id, auth.uid())
  OR ((auth.uid() IS NULL) AND (EXISTS (
    SELECT 1 FROM jars WHERE jars.id = jar_notes.jar_id AND jars.ghost_session_id IS NOT NULL
  )))
);

-- Allow anonymous contributor note inserts (for ghost contributors via token)
-- We'll handle this via an edge function for security

-- Index for fast token lookups
CREATE INDEX idx_jar_contributors_invite_token ON public.jar_contributors(invite_token);
CREATE INDEX idx_jar_contributors_jar_id ON public.jar_contributors(jar_id);
