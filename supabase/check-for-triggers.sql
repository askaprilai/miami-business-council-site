-- Check for ANY triggers or functions on the messages table
-- Run this in Supabase SQL Editor to see if there's a database trigger auto-inserting messages

-- 1. Check for triggers on messages table
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'messages';

-- 2. Check for all functions in the public schema
SELECT
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_definition ILIKE '%message%';

-- 3. List all triggers in database
SELECT * FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- 4. Check if there are any Edge Functions or webhooks
-- (These would be in Supabase dashboard, not SQL)
