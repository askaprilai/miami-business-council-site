-- Clean up members table - keep only admin and April's main account
-- Run this in Supabase SQL Editor

-- Delete all members EXCEPT these two
DELETE FROM members WHERE email NOT IN (
  'info@miamibusinesscouncil.com',
  'sabral@me.com'
);

-- Verify remaining members (should show only 2)
SELECT
  id,
  first_name,
  last_name,
  email,
  company_name,
  is_active,
  created_at
FROM members
ORDER BY created_at DESC;
