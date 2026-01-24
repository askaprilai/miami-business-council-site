-- ==========================================
-- FIX: Consolidate UPDATE policies into one
-- ==========================================

-- Drop the conflicting UPDATE policies
DROP POLICY IF EXISTS "Only admins can change admin status" ON members;
DROP POLICY IF EXISTS "allow_update_own_profile" ON members;

-- Create a single UPDATE policy that handles both cases:
-- 1. Members can update their own profile (but not is_admin field)
-- 2. Admins can update any field on any member
CREATE POLICY "members_update_policy" ON members
    FOR UPDATE
    USING (
        -- User can update their own record
        auth.uid() = auth_user_id
        OR
        -- OR user is an admin (check is_admin on their own record)
        EXISTS (
            SELECT 1 FROM members m
            WHERE m.auth_user_id = auth.uid()
            AND m.is_admin = true
        )
    )
    WITH CHECK (
        -- Same conditions for the check
        auth.uid() = auth_user_id
        OR
        EXISTS (
            SELECT 1 FROM members m
            WHERE m.auth_user_id = auth.uid()
            AND m.is_admin = true
        )
    );

-- Verify the policy was created
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'members'
ORDER BY cmd, policyname;
