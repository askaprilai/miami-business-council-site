-- Add matching_profile column for storing smart matching preferences
-- Run this in Supabase SQL Editor

-- Add the matching_profile column as JSONB to store all matching preferences
ALTER TABLE members
ADD COLUMN IF NOT EXISTS matching_profile JSONB DEFAULT NULL;

-- Add helpful comment
COMMENT ON COLUMN members.matching_profile IS 'JSON object storing smart matching profile preferences (targetIndustry, targetSize, targetBudget, etc.)';

-- Create index for better query performance on JSONB field
CREATE INDEX IF NOT EXISTS idx_members_matching_profile ON members USING GIN (matching_profile);

-- Verify the column was added
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'members'
  AND column_name = 'matching_profile';

-- Test: Show any members who already have matching profile data (should be empty initially)
SELECT email, first_name, last_name, matching_profile
FROM members
WHERE matching_profile IS NOT NULL
LIMIT 5;
