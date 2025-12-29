-- Drop the existing insert policy
DROP POLICY IF EXISTS "Users can create their own jars" ON public.jars;

-- Create a new policy that allows both authenticated users AND ghost users
CREATE POLICY "Users can create their own jars"
ON public.jars
FOR INSERT
WITH CHECK (
  (auth.uid() = user_id) OR 
  (auth.uid() IS NULL AND ghost_session_id IS NOT NULL)
);

-- Also update policies for ghost users to view/update their jars
DROP POLICY IF EXISTS "Users can view their own jars" ON public.jars;
CREATE POLICY "Users can view their own jars"
ON public.jars
FOR SELECT
USING (
  (auth.uid() = user_id) OR 
  (auth.uid() IS NULL AND ghost_session_id IS NOT NULL)
);

DROP POLICY IF EXISTS "Users can update their own jars" ON public.jars;
CREATE POLICY "Users can update their own jars"
ON public.jars
FOR UPDATE
USING (
  (auth.uid() = user_id) OR 
  (auth.uid() IS NULL AND ghost_session_id IS NOT NULL)
);

DROP POLICY IF EXISTS "Users can delete their own jars" ON public.jars;
CREATE POLICY "Users can delete their own jars"
ON public.jars
FOR DELETE
USING (
  (auth.uid() = user_id) OR 
  (auth.uid() IS NULL AND ghost_session_id IS NOT NULL)
);

-- Update jar_notes policies for ghost users
DROP POLICY IF EXISTS "Users can create notes in their jars" ON public.jar_notes;
CREATE POLICY "Users can create notes in their jars"
ON public.jar_notes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM jars 
    WHERE jars.id = jar_notes.jar_id 
    AND (jars.user_id = auth.uid() OR (auth.uid() IS NULL AND jars.ghost_session_id IS NOT NULL))
  )
);