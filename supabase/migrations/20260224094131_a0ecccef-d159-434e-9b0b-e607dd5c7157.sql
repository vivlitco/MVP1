
-- Create cards table
CREATE TABLE public.cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  ghost_session_id TEXT,
  share_token TEXT NOT NULL DEFAULT encode(extensions.gen_random_bytes(16), 'hex'::text) UNIQUE,
  cover_preset TEXT NOT NULL DEFAULT 'floral',
  cover_image_url TEXT,
  theme TEXT NOT NULL DEFAULT 'warm',
  message TEXT NOT NULL DEFAULT '',
  audio_url TEXT,
  sender_name TEXT,
  recipient_name TEXT,
  is_opened BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- Creators/ghosts can view their own cards
CREATE POLICY "Users can view their own cards"
  ON public.cards FOR SELECT
  USING (
    (auth.uid() = user_id) OR
    ((auth.uid() IS NULL) AND (ghost_session_id IS NOT NULL))
  );

-- Public access via share token
CREATE POLICY "Public access via share token"
  ON public.cards FOR SELECT
  USING (share_token IS NOT NULL);

-- Creators/ghosts can insert
CREATE POLICY "Users can create their own cards"
  ON public.cards FOR INSERT
  WITH CHECK (
    (auth.uid() = user_id) OR
    ((auth.uid() IS NULL) AND (ghost_session_id IS NOT NULL))
  );

-- Creators/ghosts can update
CREATE POLICY "Users can update their own cards"
  ON public.cards FOR UPDATE
  USING (
    (auth.uid() = user_id) OR
    ((auth.uid() IS NULL) AND (ghost_session_id IS NOT NULL))
  );

-- Creators/ghosts can delete
CREATE POLICY "Users can delete their own cards"
  ON public.cards FOR DELETE
  USING (
    (auth.uid() = user_id) OR
    ((auth.uid() IS NULL) AND (ghost_session_id IS NOT NULL))
  );

-- Update trigger for updated_at
CREATE TRIGGER update_cards_updated_at
  BEFORE UPDATE ON public.cards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update ghost conversion function to also transfer cards
CREATE OR REPLACE FUNCTION public.convert_ghost_account(p_session_id text, p_user_id uuid)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
BEGIN
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

  -- Update cards created by ghost to belong to real user
  UPDATE public.cards
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
$function$;

-- Index on share_token for fast lookups
CREATE INDEX idx_cards_share_token ON public.cards(share_token);
CREATE INDEX idx_cards_user_id ON public.cards(user_id);
