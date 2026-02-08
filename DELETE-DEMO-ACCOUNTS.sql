-- Delete all demo/test/fake member accounts

-- First, let's see what demo accounts exist
SELECT
    id,
    email,
    first_name,
    last_name,
    company_name,
    created_at
FROM members
WHERE
    email LIKE '%demo%'
    OR email LIKE '%test%'
    OR email LIKE '%fake%'
    OR email LIKE '%sample%'
    OR first_name LIKE '%Demo%'
    OR first_name LIKE '%Test%'
    OR last_name LIKE '%Demo%'
    OR last_name LIKE '%Test%'
    OR company_name LIKE '%Demo%'
    OR company_name LIKE '%Test%'
ORDER BY created_at DESC;

-- Uncomment the lines below to DELETE the demo accounts after reviewing them above
/*
DELETE FROM members
WHERE
    email LIKE '%demo%'
    OR email LIKE '%test%'
    OR email LIKE '%fake%'
    OR email LIKE '%sample%'
    OR first_name LIKE '%Demo%'
    OR first_name LIKE '%Test%'
    OR last_name LIKE '%Demo%'
    OR last_name LIKE '%Test%'
    OR company_name LIKE '%Demo%'
    OR company_name LIKE '%Test%';

-- Verify deletion
SELECT COUNT(*) as remaining_demo_accounts
FROM members
WHERE
    email LIKE '%demo%'
    OR email LIKE '%test%'
    OR email LIKE '%fake%'
    OR email LIKE '%sample%';
*/
