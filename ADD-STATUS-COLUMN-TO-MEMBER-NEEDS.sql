-- Add status column to member_needs table for AI recommendations

-- Add status column (defaults to 'open' for new posts)
ALTER TABLE member_needs
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'closed'));

-- Update existing rows to have 'open' status
UPDATE member_needs
SET status = 'open'
WHERE status IS NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_member_needs_status ON member_needs(status);

-- Verify the change
SELECT
    id,
    title,
    status,
    created_at
FROM member_needs
ORDER BY created_at DESC
LIMIT 5;
