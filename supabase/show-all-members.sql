-- First, let's see ALL members in the database
-- Run this to see exactly what we need to delete

SELECT 
  id, 
  first_name, 
  last_name, 
  email, 
  company_name,
  created_at
FROM members 
ORDER BY created_at DESC;
