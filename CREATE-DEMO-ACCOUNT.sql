-- ============================================================================
-- CREATE DEMO ACCOUNT FOR MIAMI BUSINESS COUNCIL PORTAL
-- ============================================================================
-- This creates a fully-featured demo account to showcase the platform
-- Use this account for demos, presentations, and walkthroughs
-- ============================================================================

-- Step 1: Create Demo Member Account
-- ============================================================================

-- First, check if demo account already exists and delete if needed
DELETE FROM members WHERE email = 'demo@miamibusinesscouncil.com';

-- Create the demo member with complete profile
INSERT INTO members (
    email,
    first_name,
    last_name,
    company_name,
    job_title,
    industry,
    bio,
    linkedin_url,
    phone,
    website,
    company_size,
    years_in_business,
    location,
    is_active,
    weekly_alerts_enabled,
    profile_views,
    onboarding_completed,
    first_connection_made
) VALUES (
    'demo@miamibusinesscouncil.com',
    'Alex',
    'Morgan',
    'Morgan Consulting Group',
    'Founder & CEO',
    'Professional Services',
    'Serial entrepreneur and business strategist with 15+ years helping Miami businesses scale. Specializing in growth strategy, operations optimization, and market expansion. Previously led 3 successful exits and now focused on helping other founders achieve their goals. Passionate about building the Miami business ecosystem.',
    'https://linkedin.com/in/demo',
    '(305) 555-0123',
    'https://morganconsulting.com',
    '11-50',
    '8',
    'Miami, FL',
    true,
    true,
    47, -- Good number of profile views
    true,
    true
);

-- Get the ID of the demo member we just created
DO $$
DECLARE
    demo_member_id UUID;
BEGIN
    SELECT id INTO demo_member_id FROM members WHERE email = 'demo@miamibusinesscouncil.com';

    -- Step 2: Add Business Opportunities (What They're Looking For)
    -- ============================================================================

    INSERT INTO business_opportunities (member_id, opportunity_type, category, description)
    VALUES
        (demo_member_id, 'looking_for', 'Marketing Services', 'Looking for digital marketing partners to refer clients to'),
        (demo_member_id, 'looking_for', 'Technology Services', 'Seeking tech partners for client implementation projects'),
        (demo_member_id, 'looking_for', 'Real Estate Developers', 'Interested in connecting with commercial real estate developers'),
        (demo_member_id, 'looking_for', 'Investment Opportunities', 'Open to strategic investment opportunities in Miami');

    -- Step 3: Add Business Opportunities (What They Can Offer)
    -- ============================================================================

    INSERT INTO business_opportunities (member_id, opportunity_type, category, description)
    VALUES
        (demo_member_id, 'can_offer', 'Business Strategy Consulting', 'Growth strategy, market analysis, competitive positioning'),
        (demo_member_id, 'can_offer', 'Operations Optimization', 'Process improvement, team scaling, operational efficiency'),
        (demo_member_id, 'can_offer', 'Executive Coaching', 'Leadership development, decision-making frameworks, accountability'),
        (demo_member_id, 'can_offer', 'Fundraising Advisory', 'Investor introductions, pitch deck development, fundraising strategy'),
        (demo_member_id, 'can_offer', 'Market Expansion Planning', 'Go-to-market strategy, Miami market entry, scaling playbooks');

END $$;

-- Step 4: Create Authentication Entry (for magic link login)
-- ============================================================================
-- Note: The user will use the magic link system to log in
-- No password needed - they'll request a magic link to demo@miamibusinesscouncil.com

-- Step 5: Verification Queries
-- ============================================================================

-- Check demo member was created successfully
SELECT
    first_name,
    last_name,
    email,
    company_name,
    job_title,
    industry,
    is_active,
    weekly_alerts_enabled,
    profile_views,
    onboarding_completed
FROM members
WHERE email = 'demo@miamibusinesscouncil.com';

-- Check business opportunities were created
SELECT
    m.first_name,
    m.last_name,
    bo.opportunity_type,
    bo.category,
    bo.description
FROM business_opportunities bo
JOIN members m ON bo.member_id = m.id
WHERE m.email = 'demo@miamibusinesscouncil.com'
ORDER BY bo.opportunity_type, bo.category;

-- ============================================================================
-- DEMO ACCOUNT LOGIN INSTRUCTIONS
-- ============================================================================

/*

TO LOG IN AS DEMO ACCOUNT:

1. Go to: https://miamibusinesscouncil.com/member-login

2. Enter email: demo@miamibusinesscouncil.com

3. Click "Send Magic Link"

4. Check the email inbox for demo@miamibusinesscouncil.com
   (You'll need access to this email to get the magic link)

5. Click the magic link in the email to log in

ALTERNATIVE: Use Supabase to generate a session token directly if needed


WHAT THE DEMO ACCOUNT SHOWCASES:

✅ Complete Profile (100% profile strength)
   - Full name, company, job title
   - Professional bio
   - LinkedIn profile
   - Contact information
   - Company details

✅ Business Opportunities
   - 4 things they're looking for
   - 5 services they can offer
   - Shows matching algorithm in action

✅ Profile Analytics
   - 47 profile views (looks active/popular)
   - Onboarding completed
   - First connection made
   - Weekly alerts enabled

✅ Smart Matches
   - Will show high-quality matches based on opportunities
   - Demonstrates color-coded match scores
   - Shows "why matched" reason badges

✅ Professional Presentation
   - Ready for screenshots
   - Realistic business profile
   - Miami-focused
   - Consulting/services industry (matches well with others)


DEMO TALKING POINTS:

1. "This is Alex Morgan, a business consultant in Miami..."
2. "Notice the 100% complete profile - this unlocks Smart Matches"
3. "Alex is looking for marketing and tech partners..."
4. "And can offer business strategy, operations, and executive coaching"
5. "With 47 profile views, Alex is actively engaged in the community"
6. "Smart Matches will show Alex the best connections based on mutual benefit"
7. "The platform automatically identifies ideal clients, service providers, and partnership opportunities"

*/

-- ============================================================================
-- OPTIONAL: Add Sample Connections (if you want to show existing connections)
-- ============================================================================

-- Uncomment and modify this section if you want to pre-populate connections
-- This requires other member IDs from your database

/*
-- Get another member's ID to create a sample connection
DO $$
DECLARE
    demo_member_id UUID;
    other_member_id UUID;
BEGIN
    SELECT id INTO demo_member_id FROM members WHERE email = 'demo@miamibusinesscouncil.com';
    SELECT id INTO other_member_id FROM members WHERE email = 'april@apriljsabral.com' LIMIT 1;

    -- Create accepted connection
    INSERT INTO member_connections (requester_id, recipient_id, status, message, created_at, updated_at)
    VALUES (
        demo_member_id,
        other_member_id,
        'accepted',
        'Great to connect! Looking forward to collaborating.',
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '5 days'
    );
END $$;
*/

-- ============================================================================
-- CLEANUP (if needed)
-- ============================================================================

-- To remove the demo account completely:
-- DELETE FROM members WHERE email = 'demo@miamibusinesscouncil.com';
-- (This will cascade delete all related records)
