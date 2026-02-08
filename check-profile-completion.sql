-- Check current user's profile completion status
-- This will show which fields are missing for the onboarding checklist

SELECT
    id,
    first_name,
    last_name,
    email,
    company_name,
    job_title,
    phone,
    linkedin_url,
    profile_photo_url,
    company_logo_url,
    industries,
    -- Check each requirement
    CASE WHEN first_name IS NOT NULL AND first_name != '' AND first_name != 'To be completed' THEN '✅' ELSE '❌' END as has_first_name,
    CASE WHEN last_name IS NOT NULL AND last_name != '' AND last_name != 'To be completed' THEN '✅' ELSE '❌' END as has_last_name,
    CASE WHEN company_name IS NOT NULL AND company_name != '' AND company_name != 'To be completed' THEN '✅' ELSE '❌' END as has_company,
    CASE WHEN job_title IS NOT NULL AND job_title != '' AND job_title != 'To be completed' THEN '✅' ELSE '❌' END as has_job_title,
    CASE WHEN phone IS NOT NULL AND phone != '' AND phone != 'To be completed' THEN '✅' ELSE '❌' END as has_phone,
    CASE WHEN linkedin_url IS NOT NULL AND linkedin_url != '' AND linkedin_url != 'To be completed' THEN '✅' ELSE '❌' END as has_linkedin,
    CASE WHEN profile_photo_url IS NOT NULL AND profile_photo_url != '' THEN '✅' ELSE '❌' END as has_photo,
    CASE WHEN company_logo_url IS NOT NULL AND company_logo_url != '' THEN '✅' ELSE '❌' END as has_logo,
    CASE WHEN industries IS NOT NULL AND array_length(industries, 1) > 0 THEN '✅' ELSE '❌' END as has_industries
FROM members
WHERE email = 'your-email@example.com' -- Replace with your email
LIMIT 1;

-- Also check for connections
SELECT
    COUNT(*) as total_connections,
    CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '❌' END as has_connection
FROM member_connections
WHERE (requester_id = (SELECT id FROM members WHERE email = 'your-email@example.com' LIMIT 1)
    OR recipient_id = (SELECT id FROM members WHERE email = 'your-email@example.com' LIMIT 1))
    AND status = 'accepted';
