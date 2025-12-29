-- Allow recipients to see shares addressed to their email (used for account sharing by email)

DROP POLICY IF EXISTS "Users can view shares they're part of" ON public.jar_shares;

CREATE POLICY "Users can view shares they're part of"
ON public.jar_shares
FOR SELECT
USING (
  (auth.uid() = shared_by_user_id)
  OR (auth.uid() = shared_to_user_id)
  OR (
    shared_to_email IS NOT NULL
    AND auth.jwt() IS NOT NULL
    AND lower(shared_to_email) = lower(auth.jwt() ->> 'email')
  )
  OR (
    EXISTS (
      SELECT 1
      FROM public.jars
      WHERE jars.id = jar_shares.jar_id
        AND jars.user_id = auth.uid()
    )
  )
);
