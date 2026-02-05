-- Set admin access for authorized users
-- Run this in Supabase SQL Editor

-- First, add is_admin column if it doesn't exist
ALTER TABLE members
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Set admin access for April, Atiba (Treasurer), and info account
UPDATE members
SET is_admin = true
WHERE email IN (
    'info@miamibusinesscouncil.com',
    'april@apriljsabral.com',
    'atiba@themadyungroup.com'
);

-- Verify admin users
SELECT email, first_name, last_name, is_admin
FROM members
WHERE is_admin = true;
