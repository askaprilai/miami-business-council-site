-- Check for all members and their details
SELECT
    id,
    email,
    first_name,
    last_name,
    company_name,
    is_active,
    created_at
FROM members
ORDER BY created_at DESC;

-- Check for duplicate emails
SELECT
    email,
    COUNT(*) as count
FROM members
GROUP BY email
HAVING COUNT(*) > 1;

-- Check for members with incomplete names
SELECT
    id,
    email,
    first_name,
    last_name,
    company_name,
    is_active
FROM members
WHERE
    first_name IS NULL
    OR last_name IS NULL
    OR first_name = ''
    OR last_name = ''
    OR first_name = 'A'
    OR last_name = 'J';
