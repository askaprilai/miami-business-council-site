-- ===================================================================
-- COMPLETE MESSAGING SYSTEM FIX - RUN THIS ENTIRE FILE AT ONCE
-- ===================================================================
-- This will fix all permission and RLS issues with the messaging system
-- Copy and paste this ENTIRE file into Supabase SQL Editor and click RUN
-- ===================================================================

-- Step 1: Grant all necessary permissions
GRANT ALL ON messages TO authenticated;
GRANT ALL ON messages TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Step 2: Drop ALL existing policies (clean slate)
DROP POLICY IF EXISTS "Members can send messages" ON messages;
DROP POLICY IF EXISTS "Members can view their messages" ON messages;
DROP POLICY IF EXISTS "Members can mark received messages as read" ON messages;
DROP POLICY IF EXISTS "Members can view sent messages" ON messages;
DROP POLICY IF EXISTS "Members can view received messages" ON messages;
DROP POLICY IF EXISTS "Members can insert messages" ON messages;
DROP POLICY IF EXISTS "Members can update received messages" ON messages;
DROP POLICY IF EXISTS "authenticated_users_insert_messages" ON messages;
DROP POLICY IF EXISTS "users_view_sent_messages" ON messages;
DROP POLICY IF EXISTS "users_view_received_messages" ON messages;
DROP POLICY IF EXISTS "users_update_received_messages" ON messages;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON messages;
DROP POLICY IF EXISTS "Enable read access for all users" ON messages;

-- Step 3: Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Step 4: Create simple, working policies
CREATE POLICY "authenticated_users_insert_messages"
ON messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id IN (
    SELECT id FROM members WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "users_view_sent_messages"
ON messages
FOR SELECT
TO authenticated
USING (
  sender_id IN (
    SELECT id FROM members WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "users_view_received_messages"
ON messages
FOR SELECT
TO authenticated
USING (
  recipient_id IN (
    SELECT id FROM members WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "users_update_received_messages"
ON messages
FOR UPDATE
TO authenticated
USING (
  recipient_id IN (
    SELECT id FROM members WHERE auth_user_id = auth.uid()
  )
)
WITH CHECK (
  recipient_id IN (
    SELECT id FROM members WHERE auth_user_id = auth.uid()
  )
);

-- Step 5: Verify policies were created
SELECT
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename = 'messages'
ORDER BY cmd;

-- Done! You should see 4 policies in the result
