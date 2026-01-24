-- Delete Thomas McClure and all related records

-- Step 1: Find Thomas's member ID
SELECT id, email, first_name, last_name FROM members WHERE email = 'thomasmcclureeofficial@gmail.com';

-- Step 2: Delete all messages sent by or received by Thomas
DELETE FROM messages WHERE sender_id IN (SELECT id FROM members WHERE email = 'thomasmcclureeofficial@gmail.com');
DELETE FROM messages WHERE recipient_id IN (SELECT id FROM members WHERE email = 'thomasmcclureeofficial@gmail.com');

-- Step 3: Delete all connection requests involving Thomas
DELETE FROM member_connections WHERE requester_id IN (SELECT id FROM members WHERE email = 'thomasmcclureeofficial@gmail.com');
DELETE FROM member_connections WHERE recipient_id IN (SELECT id FROM members WHERE email = 'thomasmcclureeofficial@gmail.com');

-- Step 4: Delete any event registrations
DELETE FROM event_registrations WHERE member_id IN (SELECT id FROM members WHERE email = 'thomasmcclureeofficial@gmail.com');

-- Step 5: Delete any business opportunities
DELETE FROM business_opportunities WHERE member_id IN (SELECT id FROM members WHERE email = 'thomasmcclureeofficial@gmail.com');

-- Step 6: Delete auth user if exists
DELETE FROM auth.users WHERE email = 'thomasmcclureeofficial@gmail.com';

-- Step 7: Finally delete the member record
DELETE FROM members WHERE email = 'thomasmcclureeofficial@gmail.com';

-- Verify deletion
SELECT email FROM members WHERE email = 'thomasmcclureeofficial@gmail.com';
-- Should return no rows
