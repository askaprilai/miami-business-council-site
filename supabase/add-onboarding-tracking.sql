-- Add columns to track member onboarding progress

ALTER TABLE members
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS first_connection_made BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS profile_views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_active TIMESTAMP DEFAULT NOW();

-- Add index for last_active for performance
CREATE INDEX IF NOT EXISTS idx_members_last_active ON members(last_active DESC);

COMMENT ON COLUMN members.onboarding_completed IS 'Whether member has completed onboarding checklist';
COMMENT ON COLUMN members.first_connection_made IS 'Whether member has made their first connection';
COMMENT ON COLUMN members.profile_views IS 'Total number of profile views';
COMMENT ON COLUMN members.last_active IS 'Last time member was active on portal';
