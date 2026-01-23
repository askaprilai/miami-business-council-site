-- Delete specific users before onboarding real members
-- Run this in Supabase SQL Editor

-- Delete Tommy Martinez
DELETE FROM members WHERE 
  first_name ILIKE '%Tommy%' OR 
  last_name ILIKE '%Martinez%' OR
  email ILIKE '%tommy%' OR
  email ILIKE '%martinez%';

-- Delete Fan Team
DELETE FROM members WHERE 
  first_name ILIKE '%Fan%' OR 
  first_name ILIKE '%Team%' OR
  last_name ILIKE '%Fan%' OR
  last_name ILIKE '%Team%' OR
  company_name ILIKE '%Fan Team%';

-- Delete Ilmoda team
DELETE FROM members WHERE 
  first_name ILIKE '%Ilmoda%' OR 
  company_name ILIKE '%Ilmoda%';

-- Delete Test user
DELETE FROM members WHERE 
  first_name ILIKE '%Test%' OR 
  last_name ILIKE '%User%' OR
  email ILIKE '%test%' OR
  company_name ILIKE '%Test%';

-- Delete Lubna Najjar (will be re-added fresh)
DELETE FROM members WHERE 
  first_name ILIKE '%Lubna%' OR 
  last_name ILIKE '%Najjar%' OR
  email ILIKE '%lubna%';

-- Show remaining members after cleanup
SELECT id, first_name, last_name, email, company_name, created_at 
FROM members 
ORDER BY created_at DESC;
