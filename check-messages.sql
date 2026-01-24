-- Check ALL messages in database with timestamps
SELECT
    id,
    created_at,
    message_text,
    is_read,
    (SELECT email FROM members WHERE id = sender_id) as sender_email,
    (SELECT email FROM members WHERE id = recipient_id) as recipient_email
FROM messages
ORDER BY created_at DESC
LIMIT 50;

-- Count total messages
SELECT COUNT(*) as total_messages FROM messages;

-- Delete ALL old test messages (UNCOMMENT TO RUN)
-- DELETE FROM messages WHERE message_text LIKE '%I appreciate you thinking%';
-- DELETE FROM messages WHERE message_text LIKE '%Great to hear from you%';
-- DELETE FROM messages WHERE message_text LIKE '%interesting perspective%';
