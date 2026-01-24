-- ==========================================
-- DELETE THOMAS MCCLURE COMPLETELY
-- ==========================================
-- Email: thomasmcclureeofficial@gmail.com
-- This will remove ALL data associated with Thomas
-- ==========================================

DO $$
DECLARE
    thomas_id UUID;
    thomas_auth_id UUID;
BEGIN
    -- Get Thomas's member ID and auth ID
    SELECT id, auth_user_id INTO thomas_id, thomas_auth_id
    FROM members
    WHERE email = 'thomasmcclureeofficial@gmail.com';

    IF thomas_id IS NOT NULL THEN
        RAISE NOTICE 'Found Thomas McClure with ID: %', thomas_id;

        -- Delete all related data first (foreign key constraints)

        -- 1. Delete messages (sent and received)
        DELETE FROM messages
        WHERE sender_id = thomas_id OR recipient_id = thomas_id;
        RAISE NOTICE 'Deleted messages';

        -- 2. Delete connections (requested and received)
        DELETE FROM member_connections
        WHERE requester_id = thomas_id OR recipient_id = thomas_id;
        RAISE NOTICE 'Deleted connections';

        -- 3. Delete event registrations
        DELETE FROM event_registrations
        WHERE member_id = thomas_id;
        RAISE NOTICE 'Deleted event registrations';

        -- 4. Delete business opportunities
        DELETE FROM business_opportunities
        WHERE member_id = thomas_id;
        RAISE NOTICE 'Deleted business opportunities';

        -- 5. Delete profile views (if table exists)
        DELETE FROM profile_views
        WHERE viewer_id = thomas_id OR viewed_member_id = thomas_id;
        RAISE NOTICE 'Deleted profile views';

        -- 6. Delete from members table
        DELETE FROM members WHERE id = thomas_id;
        RAISE NOTICE 'Deleted member record';

        -- 7. Delete auth user (if exists)
        IF thomas_auth_id IS NOT NULL THEN
            DELETE FROM auth.users WHERE id = thomas_auth_id;
            RAISE NOTICE 'Deleted auth user with ID: %', thomas_auth_id;
        END IF;

        RAISE NOTICE '✅ Thomas McClure deleted completely!';
    ELSE
        RAISE NOTICE '❌ Thomas McClure not found in database';
    END IF;
END $$;

-- Verify deletion
SELECT
    CASE
        WHEN COUNT(*) = 0 THEN '✅ Thomas McClure successfully deleted'
        ELSE '❌ Thomas McClure still exists!'
    END AS status
FROM members
WHERE email = 'thomasmcclureeofficial@gmail.com';
