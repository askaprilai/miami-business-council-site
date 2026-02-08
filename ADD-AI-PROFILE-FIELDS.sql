-- Add profile fields needed for AI matching recommendations

-- Add columns to members table
ALTER TABLE members
ADD COLUMN IF NOT EXISTS expertise TEXT[],
ADD COLUMN IF NOT EXISTS services_offered TEXT[],
ADD COLUMN IF NOT EXISTS looking_for TEXT[],
ADD COLUMN IF NOT EXISTS business_description TEXT;

-- Add helpful comment
COMMENT ON COLUMN members.expertise IS 'Array of expertise areas (e.g., ["Marketing", "SEO", "Social Media"])';
COMMENT ON COLUMN members.services_offered IS 'Array of services the member can offer';
COMMENT ON COLUMN members.looking_for IS 'Array of what the member is looking for';
COMMENT ON COLUMN members.business_description IS 'Brief description of member business';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_members_expertise ON members USING GIN (expertise);
CREATE INDEX IF NOT EXISTS idx_members_services_offered ON members USING GIN (services_offered);
CREATE INDEX IF NOT EXISTS idx_members_looking_for ON members USING GIN (looking_for);

-- Verify the changes
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'members'
  AND column_name IN ('expertise', 'services_offered', 'looking_for', 'business_description', 'industry')
ORDER BY column_name;
