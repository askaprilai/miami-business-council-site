-- Clear ALL existing messages to start fresh with real messaging
-- Run this in Supabase SQL Editor to delete all fake/test messages

-- Delete all messages
DELETE FROM messages;

-- Verify deletion
SELECT COUNT(*) as total_messages FROM messages;

-- This should return 0

-- Now you can start fresh with real member-to-member messaging!
