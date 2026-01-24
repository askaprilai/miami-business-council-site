-- ==========================================
-- DEBUG: Find duplicate auth_user_ids and check RLS policies
-- ==========================================

-- Step 1: Check for duplicate auth_user_ids
SELECT
    auth_user_id,
    COUNT(*) as count,
    STRING_AGG(email, ', ') as emails
FROM members
WHERE auth_user_id IS NOT NULL
GROUP BY auth_user_id
HAVING COUNT(*) > 1;

-- Step 2: List ALL policies on members table
SELECT
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'members'
ORDER BY policyname;

-- Step 3: Drop ALL existing policies on members table
DROP POLICY IF EXISTS "Members can update own profile" ON members;
DROP POLICY IF EXISTS "Members can read own profile" ON members;
DROP POLICY IF EXISTS "Enable read access for all users" ON members;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON members;
DROP POLICY IF EXISTS "Enable update for users based on email" ON members;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON members;

-- Step 4: Create simple, clean policies
-- Allow members to read all active profiles
CREATE POLICY "Members can view active profiles" ON members
    FOR SELECT
    USING (is_active = true);

-- Allow members to update ONLY their own profile
CREATE POLICY "Members can update own profile" ON members
    FOR UPDATE
    USING (auth.uid() = auth_user_id)
    WITH CHECK (auth.uid() = auth_user_id);

-- Step 5: Verify new policies
SELECT
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'members'
ORDER BY policyname;
