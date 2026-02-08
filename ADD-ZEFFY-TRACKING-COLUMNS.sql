-- Add columns to track Zeffy payments and billing frequency

-- Add billing_frequency column (annual or monthly)
ALTER TABLE members
ADD COLUMN IF NOT EXISTS billing_frequency TEXT DEFAULT 'annual' CHECK (billing_frequency IN ('annual', 'monthly'));

-- Add Zeffy tracking columns
ALTER TABLE members
ADD COLUMN IF NOT EXISTS zeffy_customer_id TEXT,
ADD COLUMN IF NOT EXISTS zeffy_transaction_id TEXT;

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_members_billing_frequency ON members(billing_frequency);
CREATE INDEX IF NOT EXISTS idx_members_zeffy_customer_id ON members(zeffy_customer_id);

-- Add helpful comments
COMMENT ON COLUMN members.billing_frequency IS 'Membership billing frequency: annual or monthly';
COMMENT ON COLUMN members.zeffy_customer_id IS 'Zeffy customer ID for recurring payments';
COMMENT ON COLUMN members.zeffy_transaction_id IS 'Zeffy transaction ID from initial payment';

-- Verify the changes
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'members'
  AND column_name IN ('billing_frequency', 'zeffy_customer_id', 'zeffy_transaction_id')
ORDER BY column_name;
