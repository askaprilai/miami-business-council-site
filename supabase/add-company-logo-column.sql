-- Add company_logo_url column to members table
-- Run this in Supabase SQL Editor

ALTER TABLE members
ADD COLUMN IF NOT EXISTS company_logo_url TEXT;

COMMENT ON COLUMN members.company_logo_url IS 'URL to company logo stored in Supabase Storage';

-- Show updated table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'members'
ORDER BY ordinal_position;
