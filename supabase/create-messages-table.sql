-- Create messages table for real member-to-member messaging
-- This replaces the localStorage-based fake messaging system

-- Drop existing table if it exists (only if this is a fresh setup)
DROP TABLE IF EXISTS messages;

-- Create messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    is_read BOOLEAN DEFAULT FALSE
);

-- Add indexes for performance
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_conversation ON messages(sender_id, recipient_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Add RLS (Row Level Security) policies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Members can see messages they sent
CREATE POLICY "Members can view sent messages"
    ON messages FOR SELECT
    USING (auth.uid() = (SELECT auth_user_id FROM members WHERE id = sender_id));

-- Members can see messages they received
CREATE POLICY "Members can view received messages"
    ON messages FOR SELECT
    USING (auth.uid() = (SELECT auth_user_id FROM members WHERE id = recipient_id));

-- Members can send messages
CREATE POLICY "Members can insert messages"
    ON messages FOR INSERT
    WITH CHECK (auth.uid() = (SELECT auth_user_id FROM members WHERE id = sender_id));

-- Members can mark their received messages as read
CREATE POLICY "Members can update received messages"
    ON messages FOR UPDATE
    USING (auth.uid() = (SELECT auth_user_id FROM members WHERE id = recipient_id))
    WITH CHECK (auth.uid() = (SELECT auth_user_id FROM members WHERE id = recipient_id));

-- Add comments for documentation
COMMENT ON TABLE messages IS 'Stores real-time member-to-member messages';
COMMENT ON COLUMN messages.sender_id IS 'Member who sent the message';
COMMENT ON COLUMN messages.recipient_id IS 'Member who receives the message';
COMMENT ON COLUMN messages.message_text IS 'The message content';
COMMENT ON COLUMN messages.read_at IS 'When the message was read by recipient';
COMMENT ON COLUMN messages.is_read IS 'Whether recipient has read the message';

-- Verify table creation
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'messages'
ORDER BY ordinal_position;
