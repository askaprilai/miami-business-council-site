-- Check current RLS policies on messages table
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'messages';

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Members can view sent messages" ON messages;
DROP POLICY IF EXISTS "Members can view received messages" ON messages;
DROP POLICY IF EXISTS "Members can insert messages" ON messages;
DROP POLICY IF EXISTS "Members can update received messages" ON messages;

-- Create new simplified RLS policies
-- Policy 1: Members can INSERT messages they send
CREATE POLICY "Members can send messages"
    ON messages
    FOR INSERT
    TO authenticated
    WITH CHECK (
        sender_id IN (
            SELECT id FROM members WHERE auth_user_id = auth.uid()
        )
    );

-- Policy 2: Members can SELECT messages they sent or received
CREATE POLICY "Members can view their messages"
    ON messages
    FOR SELECT
    TO authenticated
    USING (
        sender_id IN (SELECT id FROM members WHERE auth_user_id = auth.uid())
        OR
        recipient_id IN (SELECT id FROM members WHERE auth_user_id = auth.uid())
    );

-- Policy 3: Members can UPDATE (mark as read) messages they received
CREATE POLICY "Members can mark received messages as read"
    ON messages
    FOR UPDATE
    TO authenticated
    USING (
        recipient_id IN (SELECT id FROM members WHERE auth_user_id = auth.uid())
    )
    WITH CHECK (
        recipient_id IN (SELECT id FROM members WHERE auth_user_id = auth.uid())
    );

-- Verify RLS is enabled
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Test the policies (run as your user)
-- This should work:
-- INSERT INTO messages (sender_id, recipient_id, message_text)
-- SELECT
--     (SELECT id FROM members WHERE auth_user_id = auth.uid()),
--     (SELECT id FROM members WHERE email = 'info@miamibusinesscouncil.com'),
--     'Test message from RLS fix';
