-- Storage policies for profile-photos bucket
-- Run this in Supabase SQL Editor

-- Policy to allow authenticated users to upload photos
CREATE POLICY "Authenticated users can upload profile photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-photos');

-- Policy to allow anyone to view photos (public bucket)
CREATE POLICY "Anyone can view profile photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-photos');

-- Policy to allow authenticated users to update photos
CREATE POLICY "Authenticated users can update profile photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-photos')
WITH CHECK (bucket_id = 'profile-photos');

-- Policy to allow authenticated users to delete photos
CREATE POLICY "Authenticated users can delete profile photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'profile-photos');
