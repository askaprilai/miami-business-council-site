-- ============================================================================
-- REFERRAL & INVITE SYSTEM DATABASE SCHEMA
-- ============================================================================
-- Tracks member referrals, invitations sent, and conversion rewards
-- ============================================================================

-- Table: member_referrals
-- Stores all invitation activity and conversion tracking
CREATE TABLE IF NOT EXISTS member_referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID REFERENCES members(id) ON DELETE CASCADE,
    referral_code TEXT NOT NULL,
    invitee_email TEXT NOT NULL,
    invitee_name TEXT,
    invitation_sent_at TIMESTAMP DEFAULT NOW(),
    invitation_method TEXT CHECK (invitation_method IN ('email', 'linkedin', 'sms', 'direct_link')),
    status TEXT DEFAULT 'invited' CHECK (status IN ('invited', 'signed_up', 'converted')),
    converted_member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    converted_at TIMESTAMP,
    points_awarded INT DEFAULT 0,
    resend_email_id TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_referrals_referrer
ON member_referrals(referrer_id);

CREATE INDEX IF NOT EXISTS idx_referrals_code
ON member_referrals(referral_code);

CREATE INDEX IF NOT EXISTS idx_referrals_email
ON member_referrals(invitee_email);

CREATE INDEX IF NOT EXISTS idx_referrals_status
ON member_referrals(status);

-- Table: member_points
-- Tracks total referral points per member
CREATE TABLE IF NOT EXISTS member_points (
    member_id UUID PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
    total_points INT DEFAULT 0,
    invites_sent INT DEFAULT 0,
    successful_referrals INT DEFAULT 0,
    last_invite_sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add referral_code column to members table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'members' AND column_name = 'referral_code'
    ) THEN
        ALTER TABLE members ADD COLUMN referral_code TEXT UNIQUE;
    END IF;
END $$;

-- Generate unique referral codes for existing members
WITH numbered_members AS (
    SELECT
        id,
        UPPER(LEFT(first_name, 1) || LEFT(last_name, 1)) || EXTRACT(YEAR FROM NOW())::TEXT || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 3, '0') as new_code
    FROM members
    WHERE referral_code IS NULL
)
UPDATE members
SET referral_code = numbered_members.new_code
FROM numbered_members
WHERE members.id = numbered_members.id;

-- Initialize member_points for existing members
INSERT INTO member_points (member_id, total_points, invites_sent, successful_referrals)
SELECT id, 0, 0, 0 FROM members
WHERE id NOT IN (SELECT member_id FROM member_points)
ON CONFLICT (member_id) DO NOTHING;

-- Function: Auto-update member_points when referral converts
CREATE OR REPLACE FUNCTION update_member_points_on_conversion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'converted' AND OLD.status != 'converted' THEN
        -- Award points (100 for successful referral)
        UPDATE member_referrals
        SET points_awarded = 100
        WHERE id = NEW.id;

        -- Update member_points table
        UPDATE member_points
        SET
            total_points = total_points + 100,
            successful_referrals = successful_referrals + 1,
            updated_at = NOW()
        WHERE member_id = NEW.referrer_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update points on conversion
DROP TRIGGER IF EXISTS trigger_update_points_on_conversion ON member_referrals;
CREATE TRIGGER trigger_update_points_on_conversion
    AFTER UPDATE ON member_referrals
    FOR EACH ROW
    EXECUTE FUNCTION update_member_points_on_conversion();

-- Function: Increment invite count when invitation sent
CREATE OR REPLACE FUNCTION increment_invite_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE member_points
    SET
        invites_sent = invites_sent + 1,
        last_invite_sent_at = NOW(),
        updated_at = NOW()
    WHERE member_id = NEW.referrer_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Increment invite count on new referral
DROP TRIGGER IF EXISTS trigger_increment_invite_count ON member_referrals;
CREATE TRIGGER trigger_increment_invite_count
    AFTER INSERT ON member_referrals
    FOR EACH ROW
    EXECUTE FUNCTION increment_invite_count();

-- View: Referral leaderboard
CREATE OR REPLACE VIEW referral_leaderboard AS
SELECT
    m.id,
    m.first_name,
    m.last_name,
    m.email,
    m.company_name,
    mp.total_points,
    mp.invites_sent,
    mp.successful_referrals,
    ROUND((mp.successful_referrals::DECIMAL / NULLIF(mp.invites_sent, 0)) * 100, 1) as conversion_rate
FROM member_points mp
JOIN members m ON mp.member_id = m.id
WHERE mp.invites_sent > 0
ORDER BY mp.total_points DESC, mp.successful_referrals DESC;

-- View: Member referral stats
CREATE OR REPLACE VIEW member_referral_stats AS
SELECT
    m.id as member_id,
    m.first_name,
    m.last_name,
    m.email,
    m.referral_code,
    mp.total_points,
    mp.invites_sent,
    mp.successful_referrals,
    COUNT(mr.id) FILTER (WHERE mr.status = 'invited') as pending_invites,
    COUNT(mr.id) FILTER (WHERE mr.status = 'signed_up') as sign_ups,
    COUNT(mr.id) FILTER (WHERE mr.status = 'converted') as conversions,
    mp.last_invite_sent_at
FROM members m
LEFT JOIN member_points mp ON m.id = mp.member_id
LEFT JOIN member_referrals mr ON m.id = mr.referrer_id
GROUP BY m.id, m.first_name, m.last_name, m.email, m.referral_code,
         mp.total_points, mp.invites_sent, mp.successful_referrals, mp.last_invite_sent_at;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check referral codes were generated
SELECT email, first_name, last_name, referral_code
FROM members
ORDER BY created_at
LIMIT 10;

-- Check member_points initialized
SELECT
    m.email,
    mp.total_points,
    mp.invites_sent,
    mp.successful_referrals
FROM member_points mp
JOIN members m ON mp.member_id = m.id
LIMIT 10;

-- ============================================================================
-- POINTS SYSTEM
-- ============================================================================
--
-- REWARDS STRUCTURE:
-- - 50 points: Someone accepts your invitation and signs up
-- - 100 points: Referred member becomes a paid member (converted)
-- - 25 points: Bonus for every 5 successful referrals
--
-- FUTURE: Points can be redeemed for:
-- - Premium membership months
-- - Event tickets
-- - Featured profile placement
-- - Priority matching
-- ============================================================================
