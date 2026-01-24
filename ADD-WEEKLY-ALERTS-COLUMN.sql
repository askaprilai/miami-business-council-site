-- ==========================================
-- ADD WEEKLY ALERTS COLUMN TO MEMBERS TABLE
-- ==========================================
-- This enables members to opt-in to weekly match alerts
-- Alerts will be sent every Sunday at 7pm EST
-- ==========================================

-- Add weekly_alerts_enabled column with default false
ALTER TABLE members
ADD COLUMN IF NOT EXISTS weekly_alerts_enabled BOOLEAN DEFAULT false;

-- Add index for efficient querying of members who have alerts enabled
CREATE INDEX IF NOT EXISTS idx_members_weekly_alerts
ON members(weekly_alerts_enabled)
WHERE weekly_alerts_enabled = true;

-- Verify column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'members'
AND column_name = 'weekly_alerts_enabled';

-- Show count of members with alerts enabled
SELECT
    COUNT(*) FILTER (WHERE weekly_alerts_enabled = true) as alerts_enabled,
    COUNT(*) FILTER (WHERE weekly_alerts_enabled = false) as alerts_disabled,
    COUNT(*) as total_members
FROM members;
