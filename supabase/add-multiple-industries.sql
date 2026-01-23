-- Add support for multiple industries
-- Keep the old 'industry' column for backwards compatibility
-- Add new 'industries' column as JSONB array

ALTER TABLE members
ADD COLUMN IF NOT EXISTS industries JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN members.industries IS 'Array of industries the member works with (e.g., ["Technology", "Healthcare", "Finance"])';

-- Migrate existing single industry to industries array
UPDATE members
SET industries = jsonb_build_array(industry)
WHERE industry IS NOT NULL
  AND industry != ''
  AND industries = '[]'::jsonb;

-- Verify the migration
SELECT
    email,
    industry as old_single_industry,
    industries as new_multiple_industries
FROM members
ORDER BY email;
