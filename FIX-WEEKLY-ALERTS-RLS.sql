-- ==========================================
-- FIX RLS POLICY FOR WEEKLY ALERTS UPDATE
-- ==========================================
-- Members need permission to update their own weekly_alerts_enabled field
-- ==========================================

-- Check current policies on members table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'members';

-- Update the "Members can update own profile" policy to include weekly_alerts_enabled
-- First, drop the existing policy
DROP POLICY IF EXISTS "Members can update own profile" ON members;

-- Recreate with proper permissions
CREATE POLICY "Members can update own profile" ON members
    FOR UPDATE
    USING (auth.uid() = auth_user_id)
    WITH CHECK (auth.uid() = auth_user_id);

-- Verify the policy was created
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'members'
AND policyname = 'Members can update own profile';
