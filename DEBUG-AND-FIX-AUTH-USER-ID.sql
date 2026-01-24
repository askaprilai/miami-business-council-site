-- ==========================================
-- DEBUG AND FIX AUTH_USER_ID LINKING
-- ==========================================

-- Step 1: Check if auth_user_id exists and is linked
SELECT
    id,
    email,
    first_name,
    last_name,
    auth_user_id,
    CASE
        WHEN auth_user_id IS NULL THEN '❌ NOT LINKED'
        ELSE '✅ LINKED'
    END as status
FROM members
ORDER BY email;

-- Step 2: Check auth users
SELECT
    id,
    email,
    created_at
FROM auth.users
ORDER BY email;

-- Step 3: Link existing auth users to members
-- This will match auth.users to members by email and update auth_user_id

UPDATE members m
SET auth_user_id = au.id
FROM auth.users au
WHERE m.email = au.email
AND m.auth_user_id IS NULL;

-- Step 4: Verify linking worked
SELECT
    m.email,
    m.auth_user_id,
    au.id as auth_id,
    CASE
        WHEN m.auth_user_id = au.id THEN '✅ MATCH'
        WHEN m.auth_user_id IS NULL THEN '❌ NULL'
        ELSE '⚠️ MISMATCH'
    END as link_status
FROM members m
LEFT JOIN auth.users au ON m.email = au.email
ORDER BY m.email;
