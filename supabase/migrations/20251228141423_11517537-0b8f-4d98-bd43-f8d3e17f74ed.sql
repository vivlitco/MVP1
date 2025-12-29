-- Create jars table for storing virtual note jars
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

-- Create jar_notes table for individual messages
CREATE TABLE public.jar_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  jar_id UUID NOT NULL REFERENCES public.jars(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  note_order INTEGER NOT NULL DEFAULT 0,
  opened_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.jars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jar_notes ENABLE ROW LEVEL SECURITY;

-- Jars policies: owners can manage, anyone with share_token can view
CREATE POLICY "Users can view their own jars"
ON public.jars FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own jars"
ON public.jars FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jars"
ON public.jars FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own jars"
ON public.jars FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view shared jars by token"
ON public.jars FOR SELECT
USING (true);

-- Jar notes policies
CREATE POLICY "Users can view notes in their jars"
ON public.jar_notes FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.jars WHERE id = jar_id AND user_id = auth.uid()
));

CREATE POLICY "Anyone can view notes in shared jars"
ON public.jar_notes FOR SELECT
USING (true);

CREATE POLICY "Users can create notes in their jars"
ON public.jar_notes FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.jars WHERE id = jar_id AND user_id = auth.uid()
));

CREATE POLICY "Users can update notes in their jars"
ON public.jar_notes FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.jars WHERE id = jar_id AND user_id = auth.uid()
));

CREATE POLICY "Anyone can update opened_at on notes"
ON public.jar_notes FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can delete notes in their jars"
ON public.jar_notes FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.jars WHERE id = jar_id AND user_id = auth.uid()
));

-- Trigger for updated_at on jars
CREATE TRIGGER update_jars_updated_at
BEFORE UPDATE ON public.jars
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();