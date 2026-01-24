# Weekly Alerts Testing Guide

Quick reference for testing the weekly match alerts system.

## Manual Test via curl

```bash
curl -X POST https://miamibusinesscouncil.com/api/send-weekly-alerts \
  -H "Authorization: Bearer 48957360-81c2-403a-b760-7a22e81a81f0" \
  -H "Content-Type: application/json"
```

## Expected Response

### Success Response:
```json
{
  "success": true,
  "message": "Weekly alerts processing complete",
  "summary": {
    "sent": 3,
    "failed": 0,
    "skipped": 2,
    "totalMembers": 5
  },
  "details": [
    {
      "email": "member@example.com",
      "matchCount": 5,
      "status": "sent",
      "emailId": "re_abc123..."
    }
  ]
}
```

### Error Response (Unauthorized):
```json
{
  "error": "Unauthorized"
}
```

### Error Response (No members with alerts enabled):
```json
{
  "success": true,
  "message": "No members have weekly alerts enabled",
  "summary": {
    "sent": 0,
    "failed": 0,
    "skipped": 0,
    "totalMembers": 0
  }
}
```

---

## Database Verification Queries

### 1. Check who has alerts enabled:
```sql
SELECT email, first_name, last_name, weekly_alerts_enabled, is_active
FROM members
WHERE weekly_alerts_enabled = true
AND is_active = true
ORDER BY email;
```

### 2. View recent alert sends:
```sql
SELECT
    m.email,
    m.first_name,
    was.sent_at,
    was.match_count,
    was.status,
    was.error_message
FROM weekly_alert_sends was
JOIN members m ON was.member_id = m.id
ORDER BY was.sent_at DESC
LIMIT 20;
```

### 3. Get weekly statistics:
```sql
SELECT * FROM weekly_alert_stats
ORDER BY week DESC
LIMIT 10;
```

### 4. Check today's sends:
```sql
SELECT
    COUNT(*) as total_sent,
    COUNT(*) FILTER (WHERE status = 'sent') as successful,
    COUNT(*) FILTER (WHERE status = 'failed') as failed,
    COUNT(*) FILTER (WHERE status = 'skipped') as skipped,
    AVG(match_count) as avg_matches
FROM weekly_alert_sends
WHERE sent_at >= CURRENT_DATE;
```

### 5. View match quality distribution:
```sql
SELECT
    match_count,
    COUNT(*) as members,
    status
FROM weekly_alert_sends
WHERE sent_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY match_count, status
ORDER BY match_count DESC;
```

---

## Enable/Disable Alerts for Testing

### Enable alerts for yourself:
```sql
UPDATE members
SET weekly_alerts_enabled = true
WHERE email = 'your-email@example.com';
```

### Disable alerts:
```sql
UPDATE members
SET weekly_alerts_enabled = false
WHERE email = 'your-email@example.com';
```

### Enable for all active members:
```sql
UPDATE members
SET weekly_alerts_enabled = true
WHERE is_active = true;
```

---

## Verify Email Delivery

### Check Resend Dashboard:
1. Go to https://resend.com/emails
2. Filter by sender: `alerts@miamibusinesscouncil.com`
3. Verify status is "Delivered"
4. Check open/click rates (if enabled)

### Check your inbox:
- Subject: "🎯 [YourName], you have X new perfect matches"
- From: Miami Business Council <alerts@miamibusinesscouncil.com>
- Should contain 3-5 match cards with profile info

---

## Test Match Quality

### View potential matches for a member:
```sql
-- This query simulates the matching algorithm
WITH member_opps AS (
    SELECT
        member_id,
        ARRAY_AGG(category) FILTER (WHERE opportunity_type = 'looking_for') as looking_for,
        ARRAY_AGG(category) FILTER (WHERE opportunity_type = 'can_offer') as can_offer
    FROM business_opportunities
    GROUP BY member_id
)
SELECT
    m1.email as current_member,
    m2.email as potential_match,
    m2.first_name,
    m2.company_name,
    m2.industry,
    CASE
        WHEN m1.industry = m2.industry THEN 30
        ELSE 0
    END as industry_score
FROM members m1
CROSS JOIN members m2
LEFT JOIN member_opps mo1 ON m1.id = mo1.member_id
LEFT JOIN member_opps mo2 ON m2.id = mo2.member_id
WHERE m1.email = 'your-email@example.com'
AND m2.id != m1.id
AND m2.is_active = true
ORDER BY industry_score DESC
LIMIT 10;
```

---

## Troubleshooting Commands

### Check function logs (Vercel):
```bash
# Install Vercel CLI if needed
npm i -g vercel

# Login
vercel login

# View logs
vercel logs https://miamibusinesscouncil.com/api/send-weekly-alerts
```

### Test without authentication (should fail):
```bash
curl -X POST https://miamibusinesscouncil.com/api/send-weekly-alerts \
  -H "Content-Type: application/json"

# Expected: {"error": "Unauthorized"}
```

### Test with wrong secret (should fail):
```bash
curl -X POST https://miamibusinesscouncil.com/api/send-weekly-alerts \
  -H "Authorization: Bearer wrong-secret" \
  -H "Content-Type: application/json"

# Expected: {"error": "Unauthorized"}
```

---

## Test Scenarios

### Scenario 1: Member with many matches
**Setup:**
```sql
-- Ensure member has filled profile
UPDATE members
SET
    industry = 'Real Estate',
    bio = 'Real estate investor looking for partnerships'
WHERE email = 'test@example.com';

-- Add business opportunities
INSERT INTO business_opportunities (member_id, opportunity_type, category)
SELECT id, 'looking_for', 'Marketing Services'
FROM members WHERE email = 'test@example.com';

INSERT INTO business_opportunities (member_id, opportunity_type, category)
SELECT id, 'can_offer', 'Real Estate Investment Opportunities'
FROM members WHERE email = 'test@example.com';
```

**Expected:** Should receive email with 3-5 matches

### Scenario 2: Member with few matches
**Setup:**
```sql
-- Create member with unique industry
UPDATE members
SET industry = 'Rare Industry'
WHERE email = 'test2@example.com';
```

**Expected:** Status = 'skipped', Reason = 'Insufficient matches (< 3)'

### Scenario 3: Inactive member
**Setup:**
```sql
UPDATE members
SET is_active = false
WHERE email = 'test3@example.com';
```

**Expected:** Member not included in processing at all

---

## Performance Testing

### Check function execution time:
Look for this in Vercel function logs:
- Should complete in < 30 seconds for up to 100 members
- Each email send takes ~200-300ms
- Database queries should be < 1 second total

### Estimate processing time:
```
Members with alerts: N
Expected time: (N × 0.3 seconds) + 2 seconds overhead
Example: 50 members = 15 seconds + 2s = 17 seconds ✅
```

---

## Quick Checklist Before First Production Run

- [ ] Database migration completed (`weekly_alert_sends` table exists)
- [ ] Environment variable `WEEKLY_ALERTS_SECRET` set in Vercel
- [ ] `vercel.json` has `maxDuration: 30`
- [ ] At least 1 member has `weekly_alerts_enabled = true`
- [ ] Test curl command returns success
- [ ] Email appears in inbox
- [ ] Database tracking record created
- [ ] Cron job configured on cron-job.org
- [ ] Cron job shows next run time

---

## Success Criteria

✅ **Immediate (after test run):**
- API returns 200 status
- No timeout errors
- Emails delivered to Resend successfully
- Database tracking rows created

✅ **Week 1 (after first scheduled run):**
- 80%+ of opted-in members receive emails
- Zero failed sends
- Email delivery rate > 95% (check Resend)
- At least 1 member confirms receiving matches

✅ **Ongoing:**
- Weekly sends complete without errors
- Match quality feedback is positive
- Members engage with matches (click-through to portal)

---

## Contact & Resources

- **Deployment Guide:** See `WEEKLY-ALERTS-DEPLOYMENT-GUIDE.md`
- **Supabase Dashboard:** https://supabase.com/dashboard/project/vsnvtujkkkbjpuuwxvyd
- **Resend Dashboard:** https://resend.com/emails
- **Vercel Dashboard:** https://vercel.com/dashboard

**Secret (keep secure):**
```
WEEKLY_ALERTS_SECRET=48957360-81c2-403a-b760-7a22e81a81f0
```
