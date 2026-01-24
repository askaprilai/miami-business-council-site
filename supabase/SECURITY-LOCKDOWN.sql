-- ============================================================================
-- SECURITY LOCKDOWN - Run this ENTIRE script to fix critical database issues
-- ============================================================================
-- This fixes Issues #1, #2, and #5 from the security audit
-- Run in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- PART 1: Remove Anonymous Access (CRITICAL)
-- ============================================================================

-- Revoke all dangerous anonymous access
REVOKE ALL ON messages FROM anon;
REVOKE ALL ON members FROM anon;
REVOKE ALL ON member_connections FROM anon;
REVOKE ALL ON event_registrations FROM anon;
REVOKE ALL ON business_opportunities FROM anon;
REVOKE ALL ON events FROM anon;

-- Grant proper authenticated access only
GRANT SELECT ON members TO authenticated;
GRANT SELECT ON member_connections TO authenticated;
GRANT SELECT ON events TO authenticated;
GRANT ALL ON messages TO authenticated;
GRANT ALL ON business_opportunities TO authenticated;
GRANT ALL ON event_registrations TO authenticated;

-- Verify anonymous access removed
SELECT grantee, privilege_type, table_name
FROM information_schema.role_table_grants
WHERE grantee = 'anon'
AND table_schema = 'public';
-- Should return NO rows for sensitive tables

-- ============================================================================
-- PART 2: Fix Storage Policies (CRITICAL)
-- ============================================================================

-- Drop insecure storage policies
DROP POLICY IF EXISTS "Anyone can view profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update their photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete their photos" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder" ON storage.objects;

-- Create secure authenticated-only policies
CREATE POLICY "Authenticated users can view photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can upload own photos only"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own photos only"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (bucket_id = 'profile-photos');

CREATE POLICY "Users can delete own photos only"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================================
-- PART 3: Add Admin Role Column (For server-side authorization)
-- ============================================================================

-- Add is_admin column if doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'members' AND column_name = 'is_admin'
    ) THEN
        ALTER TABLE members ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Set current admins
UPDATE members SET is_admin = TRUE
WHERE email IN ('info@miamibusinesscouncil.com', 'sabral@me.com');

-- Create RLS policy for admin-only operations
DROP POLICY IF EXISTS "Only admins can delete members" ON members;
CREATE POLICY "Only admins can delete members"
ON members FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM members m
    WHERE m.auth_user_id = auth.uid()
    AND m.is_admin = TRUE
  )
);

-- Create admin-only update policy for sensitive fields
DROP POLICY IF EXISTS "Only admins can change admin status" ON members;
CREATE POLICY "Only admins can change admin status"
ON members FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM members m
    WHERE m.auth_user_id = auth.uid()
    AND m.is_admin = TRUE
  )
)
WITH CHECK (
  -- Only admins can modify is_admin field
  (is_admin IS NOT DISTINCT FROM (
    SELECT is_admin FROM members WHERE id = members.id
  ))
  OR
  EXISTS (
    SELECT 1 FROM members m
    WHERE m.auth_user_id = auth.uid()
    AND m.is_admin = TRUE
  )
);

-- ============================================================================
-- PART 4: Add Rate Limiting Table (Future use)
-- ============================================================================

-- Create rate limiting table to track login attempts
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  success BOOLEAN DEFAULT FALSE
);

-- Add index for quick lookups
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email, attempted_at DESC);

-- Create cleanup function to remove old attempts (older than 1 hour)
CREATE OR REPLACE FUNCTION cleanup_old_login_attempts()
RETURNS void AS $$
BEGIN
  DELETE FROM login_attempts
  WHERE attempted_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 5: Verify All Changes
-- ============================================================================

-- Check anonymous access removed
SELECT
  'ANONYMOUS ACCESS CHECK' as check_name,
  COUNT(*) as problematic_grants,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ PASS - No anonymous access to sensitive tables'
    ELSE '❌ FAIL - Anonymous still has access'
  END as status
FROM information_schema.role_table_grants
WHERE grantee = 'anon'
AND table_schema = 'public'
AND table_name IN ('messages', 'members', 'member_connections', 'business_opportunities');

-- Check admin column added
SELECT
  'ADMIN COLUMN CHECK' as check_name,
  COUNT(*) as admin_count,
  CASE
    WHEN COUNT(*) >= 2 THEN '✅ PASS - Admin users configured'
    ELSE '⚠️ WARNING - Less than 2 admins found'
  END as status
FROM members
WHERE is_admin = TRUE;

-- Check RLS enabled on all tables
SELECT
  'RLS ENABLED CHECK' as check_name,
  tablename,
  CASE
    WHEN rowsecurity THEN '✅ ENABLED'
    ELSE '❌ DISABLED'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('messages', 'members', 'member_connections', 'business_opportunities', 'events', 'event_registrations')
ORDER BY tablename;

-- List all active policies
SELECT
  'ACTIVE POLICIES' as check_name,
  tablename,
  policyname,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

SELECT '
🎉 SECURITY LOCKDOWN COMPLETE!

✅ Anonymous access revoked
✅ Storage policies secured
✅ Admin roles configured
✅ Rate limiting table created
✅ RLS policies verified

NEXT STEPS:
1. Review the verification results above
2. Update portal.html to use member.is_admin instead of hardcoded emails
3. Test login and messaging functionality
4. Remove console.log statements
5. Fix XSS vulnerabilities in innerHTML

CRITICAL: Test thoroughly before deploying to production!
' as completion_message;
