-- Add phone_number column to members table
ALTER TABLE members ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Add comment
COMMENT ON COLUMN members.phone_number IS 'Member phone number (optional)';
