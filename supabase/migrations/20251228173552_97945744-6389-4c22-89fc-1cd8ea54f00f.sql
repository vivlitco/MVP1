-- Add content_type to jar_notes for different content formats
ALTER TABLE public.jar_notes 
ADD COLUMN content_type text NOT NULL DEFAULT 'text';

-- Add media_url for images and voice recordings stored in storage
ALTER TABLE public.jar_notes 
ADD COLUMN media_url text;

-- Add password protection to jars (optional, hashed password)
ALTER TABLE public.jars 
ADD COLUMN password_hash text;

-- Create storage bucket for jar media (images, voice recordings)
INSERT INTO storage.buckets (id, name, public)
VALUES ('jar-media', 'jar-media', true);

-- Allow anyone to view jar media (since jars are shareable)
CREATE POLICY "Anyone can view jar media"
ON storage.objects FOR SELECT
USING (bucket_id = 'jar-media');

-- Allow authenticated users to upload their own media
CREATE POLICY "Authenticated users can upload jar media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'jar-media' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to delete their own media
CREATE POLICY "Users can delete their own jar media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'jar-media' AND (storage.foldername(name))[1] = auth.uid()::text);