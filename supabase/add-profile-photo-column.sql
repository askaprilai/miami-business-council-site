-- Add profile_photo_url column to members table
-- Run this in Supabase SQL Editor

ALTER TABLE members
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

COMMENT ON COLUMN members.profile_photo_url IS 'URL to member profile photo stored in Supabase Storage';

-- Show updated table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'members'
ORDER BY ordinal_position;
