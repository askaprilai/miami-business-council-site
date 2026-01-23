-- Add RLS policy to allow authenticated users to insert new members
-- Run this in Supabase SQL Editor

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Authenticated users can insert members" ON members;

-- Create policy to allow authenticated users to insert new members
CREATE POLICY "Authenticated users can insert members"
ON members
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Verify policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'members';
