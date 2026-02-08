-- Fix RLS policies for member_needs table to allow reading collaboration posts

-- First, check if policies exist
SELECT
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'member_needs';

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Members can view all needs" ON member_needs;
DROP POLICY IF EXISTS "Members can read all needs" ON member_needs;
DROP POLICY IF EXISTS "Members can view needs" ON member_needs;

-- Create a simple policy that allows all authenticated users to read
CREATE POLICY "Allow authenticated users to read all collaboration posts"
ON member_needs
FOR SELECT
TO authenticated
USING (true);

-- Allow users to insert their own posts
CREATE POLICY "Allow users to create their own posts"
ON member_needs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = auth_user_id);

-- Allow users to update their own posts
CREATE POLICY "Allow users to update their own posts"
ON member_needs
FOR UPDATE
TO authenticated
USING (auth.uid() = auth_user_id);

-- Allow users to delete their own posts
CREATE POLICY "Allow users to delete their own posts"
ON member_needs
FOR DELETE
TO authenticated
USING (auth.uid() = auth_user_id);

-- Test query to verify it works
SELECT
    id,
    title,
    description,
    category,
    status,
    created_at,
    member_id
FROM member_needs
ORDER BY created_at DESC
LIMIT 5;
