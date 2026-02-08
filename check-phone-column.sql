-- Check if phone column exists in members table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'members'
  AND column_name IN ('phone', 'phone_number')
ORDER BY column_name;
