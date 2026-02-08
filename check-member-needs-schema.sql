-- Check the actual columns in member_needs table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'member_needs'
ORDER BY ordinal_position;
