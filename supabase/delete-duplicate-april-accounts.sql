-- Delete duplicate/incomplete April accounts
-- Keeping only sabral@me.com and info@miamibusinesscouncil.com

-- Delete april@retailu.ca (AJ Joy)
DELETE FROM members
WHERE email = 'april@retailu.ca';

-- Delete april@aprilsabral.com (A J)
DELETE FROM members
WHERE email = 'april@aprilsabral.com';

-- Verify remaining members (should only be 2)
SELECT
    id,
    email,
    first_name,
    last_name,
    company_name,
    is_active
FROM members
ORDER BY email;
