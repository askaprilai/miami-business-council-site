# URGENT: Fix Messaging System - Run These SQL Scripts

## Problem
- Messages failing with 401 error even with RLS disabled
- Users getting "Failed to send message"
- RLS policies not working correctly

## Solution - Run These in Supabase SQL Editor

### Step 1: Check Current Permissions
```sql
-- Check what permissions exist on messages table
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name='messages';
```

### Step 2: Grant Full Permissions to Authenticated Users
```sql
-- Grant all permissions on messages table
GRANT ALL ON messages TO authenticated;
GRANT ALL ON messages TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
```

### Step 3: Drop ALL Existing Policies
```sql
-- Drop every possible policy that might exist
DROP POLICY IF EXISTS "Members can send messages" ON messages;
DROP POLICY IF EXISTS "Members can view their messages" ON messages;
DROP POLICY IF EXISTS "Members can mark received messages as read" ON messages;
DROP POLICY IF EXISTS "Members can view sent messages" ON messages;
DROP POLICY IF EXISTS "Members can view received messages" ON messages;
DROP POLICY IF EXISTS "Members can insert messages" ON messages;
DROP POLICY IF EXISTS "Members can update received messages" ON messages;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON messages;
DROP POLICY IF EXISTS "Enable read access for all users" ON messages;
```

### Step 4: Create Simple, Working RLS Policies
```sql
-- Re-enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy 1: Let authenticated users insert messages where they are the sender
CREATE POLICY "authenticated_users_insert_messages"
ON messages
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM members
    WHERE members.id = messages.sender_id
    AND members.auth_user_id = auth.uid()
  )
);

-- Policy 2: Let users view messages they sent
CREATE POLICY "users_view_sent_messages"
ON messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM members
    WHERE members.id = messages.sender_id
    AND members.auth_user_id = auth.uid()
  )
);

-- Policy 3: Let users view messages they received
CREATE POLICY "users_view_received_messages"
ON messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM members
    WHERE members.id = messages.recipient_id
    AND members.auth_user_id = auth.uid()
  )
);

-- Policy 4: Let users mark their received messages as read
CREATE POLICY "users_update_received_messages"
ON messages
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM members
    WHERE members.id = messages.recipient_id
    AND members.auth_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM members
    WHERE members.id = messages.recipient_id
    AND members.auth_user_id = auth.uid()
  )
);
```

### Step 5: Test Insert (Replace with real IDs)
```sql
-- Test if insert works with your actual member IDs
-- First get your member ID:
SELECT id, email, auth_user_id FROM members WHERE email = 'sabral@me.com';

-- Then try inserting a test message (replace the UUIDs with real ones):
INSERT INTO messages (sender_id, recipient_id, message_text, is_read)
VALUES (
  'YOUR_MEMBER_ID_HERE',
  'RECIPIENT_MEMBER_ID_HERE',
  'Test message from SQL',
  false
);

-- If that works, the portal should work too
```

### Step 6: Verify Policies Are Active
```sql
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'messages';
```

## Expected Result
You should see 4 policies:
1. authenticated_users_insert_messages (INSERT)
2. users_view_sent_messages (SELECT)
3. users_view_received_messages (SELECT)
4. users_update_received_messages (UPDATE)

## If This Still Doesn't Work
The issue might be with the anon key permissions. Try disabling RLS temporarily:
```sql
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
```

Then test sending a message. If it works with RLS disabled, the policies need adjustment.
If it STILL fails with RLS disabled, there's a deeper permission issue with the Supabase project settings.

## Rate Limit Reset
To reset rate limiting on your account, wait 1 hour or go to:
Supabase Dashboard → Authentication → Rate Limits → Manually reset

---
Run these scripts in order and the messaging system should work when you wake up!
