-- Complete schema for Collaboration Hub (member_needs table)

-- 1. Check table columns and types
SELECT
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'member_needs'
ORDER BY ordinal_position;

-- 2. Check constraints
SELECT
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'member_needs'::regclass;

-- 3. Check indexes
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'member_needs';

-- 4. Check RLS policies
SELECT
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'member_needs';

-- 5. Check if RLS is enabled
SELECT
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'member_needs';

-- 6. Sample data (first 3 rows)
SELECT *
FROM member_needs
ORDER BY created_at DESC
LIMIT 3;

-- 7. Count total posts
SELECT COUNT(*) as total_posts FROM member_needs;
