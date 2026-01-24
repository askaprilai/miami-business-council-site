-- Link existing auth users to member records by email

-- First, check current state
SELECT
    m.id,
    m.email,
    m.auth_user_id,
    au.id as auth_id
FROM members m
LEFT JOIN auth.users au ON au.email = m.email
ORDER BY m.email;

-- Then run this to link them (UPDATE the auth_user_id)
UPDATE members m
SET auth_user_id = au.id
FROM auth.users au
WHERE m.email = au.email
AND m.auth_user_id IS NULL;

-- Verify the update
SELECT
    m.email,
    m.auth_user_id,
    au.id as auth_id,
    CASE
        WHEN m.auth_user_id = au.id THEN 'LINKED ✅'
        ELSE 'NOT LINKED ❌'
    END as status
FROM members m
LEFT JOIN auth.users au ON au.email = m.email
ORDER BY m.email;
