-- Check profile completion status
-- Replace 'your-email@example.com' with your actual email address

SELECT
    first_name,
    last_name,
    company_name,
    job_title,
    phone,
    linkedin_url,
    profile_photo_url,
    company_logo_url,
    industries,
    -- Check each requirement
    CASE 
        WHEN first_name IS NOT NULL AND trim(first_name) != '' AND first_name != 'To be completed' 
        THEN '✅ YES' 
        ELSE '❌ NO - ' || COALESCE(first_name, 'NULL') 
    END as has_first_name,
    CASE 
        WHEN last_name IS NOT NULL AND trim(last_name) != '' AND last_name != 'To be completed' 
        THEN '✅ YES' 
        ELSE '❌ NO - ' || COALESCE(last_name, 'NULL') 
    END as has_last_name,
    CASE 
        WHEN company_name IS NOT NULL AND trim(company_name) != '' AND company_name != 'To be completed' 
        THEN '✅ YES' 
        ELSE '❌ NO - ' || COALESCE(company_name, 'NULL') 
    END as has_company,
    CASE 
        WHEN job_title IS NOT NULL AND trim(job_title) != '' AND job_title != 'To be completed' 
        THEN '✅ YES' 
        ELSE '❌ NO - ' || COALESCE(job_title, 'NULL') 
    END as has_job_title,
    CASE 
        WHEN phone IS NOT NULL AND trim(phone) != '' AND phone != 'To be completed' 
        THEN '✅ YES' 
        ELSE '❌ NO - ' || COALESCE(phone, 'NULL') 
    END as has_phone,
    CASE 
        WHEN linkedin_url IS NOT NULL AND trim(linkedin_url) != '' AND linkedin_url != 'To be completed' 
        THEN '✅ YES' 
        ELSE '❌ NO - ' || COALESCE(linkedin_url, 'NULL') 
    END as has_linkedin,
    CASE 
        WHEN profile_photo_url IS NOT NULL AND trim(profile_photo_url) != '' 
        THEN '✅ YES' 
        ELSE '❌ NO' 
    END as has_photo,
    CASE 
        WHEN company_logo_url IS NOT NULL AND trim(company_logo_url) != '' 
        THEN '✅ YES' 
        ELSE '❌ NO' 
    END as has_logo,
    CASE 
        WHEN industries IS NOT NULL AND array_length(industries, 1) > 0 
        THEN '✅ YES - ' || array_to_string(industries, ', ')
        ELSE '❌ NO' 
    END as has_industries
FROM members
WHERE email = 'your-email@example.com';

-- Check for connections
SELECT
    COUNT(*) as total_connections,
    CASE WHEN COUNT(*) > 0 THEN '✅ Has connections' ELSE '❌ No connections' END as connection_status
FROM member_connections
WHERE (requester_id = (SELECT id FROM members WHERE email = 'your-email@example.com')
    OR recipient_id = (SELECT id FROM members WHERE email = 'your-email@example.com'))
    AND status = 'accepted';
