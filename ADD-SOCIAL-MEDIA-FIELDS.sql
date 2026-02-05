-- Add social media fields to members table
-- Run this in your Supabase SQL editor

-- Add new social media columns
ALTER TABLE members
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Add helpful comments
COMMENT ON COLUMN members.instagram_url IS 'Instagram profile URL (e.g., https://instagram.com/username)';
COMMENT ON COLUMN members.facebook_url IS 'Facebook profile or page URL';
COMMENT ON COLUMN members.twitter_url IS 'Twitter/X profile URL (e.g., https://twitter.com/username)';
COMMENT ON COLUMN members.website_url IS 'Personal or company website URL';

-- Verify the changes
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'members'
  AND column_name IN ('linkedin_url', 'instagram_url', 'facebook_url', 'twitter_url', 'website_url')
ORDER BY column_name;
