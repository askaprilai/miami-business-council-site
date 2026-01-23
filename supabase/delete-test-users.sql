-- Delete test users from members table
-- Run this in Supabase SQL Editor

-- Delete Tommy Martinez
DELETE FROM members WHERE email LIKE '%tommy%' OR first_name LIKE '%Tommy%' OR last_name LIKE '%Martinez%';

-- Delete Ilmoda Team Fan
DELETE FROM members WHERE first_name LIKE '%Ilmoda%' OR last_name LIKE '%Team Fan%';

-- Delete TeamApril
DELETE FROM members WHERE first_name LIKE '%TeamApril%' OR email LIKE '%teamapril%';

-- Delete Test User
DELETE FROM members WHERE first_name = 'Test' OR email LIKE '%test@%';

-- Show remaining members
SELECT id, first_name, last_name, email, company_name FROM members ORDER BY created_at DESC;
