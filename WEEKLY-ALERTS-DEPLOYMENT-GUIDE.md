# Weekly Match Alerts Deployment Guide

This guide will walk you through deploying the weekly match alerts email system for Miami Business Council.

## Overview

The weekly alerts system automatically sends curated match recommendations to members every Sunday at 7pm EST. Members receive 3-5 personalized matches based on their industry, services, and business goals.

## Prerequisites

- Vercel account with deployed Miami Business Council site
- Supabase project access (https://supabase.com/dashboard/project/vsnvtujkkkbjpuuwxvyd)
- Resend API key configured in Vercel environment variables
- Access to Vercel environment variable settings

---

## Step 1: Run Database Migration

Before deploying the API function, you need to create the tracking table in Supabase.

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/vsnvtujkkkbjpuuwxvyd
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of `ADD-WEEKLY-ALERT-TRACKING.sql` and paste into the editor
5. Click **Run** to execute the migration
6. Verify the table was created by going to **Table Editor** and finding `weekly_alert_sends`

**What this creates:**
- `weekly_alert_sends` table - Tracks all sent alerts with status and metadata
- `weekly_alert_stats` view - Provides analytics on alert sending performance
- Indexes for fast querying

---

## Step 2: Configure Environment Variables

Add the weekly alerts secret to your Vercel project:

### Generated Secret (COPY THIS):
```
WEEKLY_ALERTS_SECRET=48957360-81c2-403a-b760-7a22e81a81f0
```

### How to Add to Vercel:

1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Select your Miami Business Council project
3. Go to **Settings** → **Environment Variables**
4. Add the following variable:
   - **Name:** `WEEKLY_ALERTS_SECRET`
   - **Value:** `48957360-81c2-403a-b760-7a22e81a81f0`
   - **Environment:** Production, Preview, Development (select all)
5. Click **Save**

### Verify Existing Variables

Make sure these are already configured (they should be from previous setup):
- ✅ `RESEND_API_KEY` - For sending emails
- ✅ `SUPABASE_URL` - Database connection
- ✅ `SUPABASE_SERVICE_KEY` - Admin database access
- ✅ `SUPABASE_ANON_KEY` - Public database access

---

## Step 3: Deploy the API Function

The following files need to be deployed:

1. **`api/send-weekly-alerts.js`** (Main function) ✅ Already created
2. **`vercel.json`** (Updated timeout) ✅ Already updated

### Deploy to Production:

```bash
cd /Users/apriljsabral/Documents/miami-business-council-site

# Check git status
git status

# Add the new files
git add api/send-weekly-alerts.js
git add vercel.json
git add ADD-WEEKLY-ALERT-TRACKING.sql
git add WEEKLY-ALERTS-DEPLOYMENT-GUIDE.md

# Commit changes
git commit -m "Add weekly match alerts email system

- Add send-weekly-alerts.js API function with intelligent matching
- Increase Vercel function timeout to 30 seconds
- Add database migration for tracking table
- Generate secure secret for cron authentication

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# Push to deploy
git push origin main
```

Vercel will automatically detect the changes and deploy within 1-2 minutes.

---

## Step 4: Set Up Cron Job

The weekly alerts need to be triggered every Sunday at 7pm EST. We'll use cron-job.org (free service).

### Create Cron Job on cron-job.org:

1. Go to https://cron-job.org and create a free account (if you don't have one)
2. Log in and click **Create cronjob**
3. Configure the job:

   **Basic Settings:**
   - **Title:** `Miami Business Council - Weekly Match Alerts`
   - **URL:** `https://miamibusinesscouncil.com/api/send-weekly-alerts`

   **Schedule:**
   - **Pattern:** Custom
   - **Days of Week:** Sunday only (check only Sunday)
   - **Time:** 19:00 (7:00 PM)
   - **Timezone:** America/New_York (EST/EDT)

   **Request Settings:**
   - **Request method:** POST
   - **Request type:** JSON

   **Headers:** Click "Add Header" and add:
   - **Header name:** `Authorization`
   - **Header value:** `Bearer 48957360-81c2-403a-b760-7a22e81a81f0`

   **Notifications:**
   - Enable email notifications on failure (recommended)
   - Add your email address

4. Click **Create** to save the cron job
5. (Optional) Click **Run now** to test immediately

### Verify Cron Job:

After saving, you should see:
- Next scheduled run: Next Sunday at 7:00 PM EST
- Status: Active
- Execution history will appear after first run

---

## Step 5: Test the System

Before waiting for the first scheduled run, test the system manually.

### Option A: Test via cron-job.org

1. Go to your cron job on cron-job.org
2. Click **Run now** button
3. Wait 30-60 seconds for execution
4. Check **Execution History** for results
5. Status 200 = Success

### Option B: Test via curl

```bash
curl -X POST https://miamibusinesscouncil.com/api/send-weekly-alerts \
  -H "Authorization: Bearer 48957360-81c2-403a-b760-7a22e81a81f0" \
  -H "Content-Type: application/json"
```

**Expected Response:**
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

### Verify Email Delivery:

1. Check your own email if you have `weekly_alerts_enabled = true` set
2. Go to Resend Dashboard: https://resend.com/emails
3. You should see emails from `alerts@miamibusinesscouncil.com`
4. Check delivery status (should be "Delivered")

### Verify Database Tracking:

Go to Supabase SQL Editor and run:

```sql
-- Check recent alert sends
SELECT
    m.email,
    m.first_name,
    was.sent_at,
    was.match_count,
    was.status,
    was.resend_email_id
FROM weekly_alert_sends was
JOIN members m ON was.member_id = m.id
ORDER BY was.sent_at DESC
LIMIT 10;
```

You should see records for each member who received an alert.

---

## Step 6: Monitor First Production Run

After the first scheduled Sunday run at 7pm EST:

### Checklist:

- [ ] Check cron-job.org execution history (should show success)
- [ ] Check Resend dashboard for sent emails
- [ ] Verify `weekly_alert_sends` table has new entries
- [ ] Ask 1-2 members if they received their matches
- [ ] Check for any error logs in Vercel Functions dashboard

### View Logs:

**Vercel Logs:**
1. Go to Vercel Dashboard → Your Project
2. Click **Functions** tab
3. Find `send-weekly-alerts` function
4. Click to view execution logs

**Supabase Analytics:**
```sql
-- Weekly stats
SELECT * FROM weekly_alert_stats
ORDER BY week DESC
LIMIT 5;

-- Today's sends
SELECT COUNT(*) as total_sent, AVG(match_count) as avg_matches
FROM weekly_alert_sends
WHERE sent_at >= CURRENT_DATE;
```

---

## Troubleshooting

### Issue: No members receiving emails

**Check:**
1. Verify members have `weekly_alerts_enabled = true`:
   ```sql
   SELECT email, first_name, weekly_alerts_enabled
   FROM members
   WHERE is_active = true;
   ```
2. Update a member to enable alerts:
   ```sql
   UPDATE members
   SET weekly_alerts_enabled = true
   WHERE email = 'your-email@example.com';
   ```

### Issue: Cron job failing with 401 Unauthorized

**Fix:**
- Verify the `Authorization` header in cron-job.org matches the secret exactly
- Make sure it's formatted as: `Bearer 48957360-81c2-403a-b760-7a22e81a81f0`
- Check that `WEEKLY_ALERTS_SECRET` is set in Vercel environment variables

### Issue: Members have fewer than 3 matches

**Expected behavior:**
- Members with < 3 matches (score ≥ 60) are skipped
- Status will be logged as "skipped" in database
- This prevents sending low-quality match emails

**To improve match quality:**
- Ensure members have complete profiles (industry, bio, etc.)
- Make sure business opportunities are filled out
- Add more active members to the platform

### Issue: Function timeout errors

**Fix:**
- Verify `vercel.json` has `maxDuration: 30` for api functions
- Redeploy if needed: `git push origin main`
- If still timing out with 100+ members, may need to implement batching

### Issue: Resend API errors

**Check:**
1. Verify `RESEND_API_KEY` is set in Vercel
2. Check Resend dashboard for API quota limits
3. Verify sender domain `alerts@miamibusinesscouncil.com` is authorized

---

## Managing Member Alerts

### Enable alerts for a member:

```sql
UPDATE members
SET weekly_alerts_enabled = true
WHERE email = 'member@example.com';
```

### Disable alerts for a member:

```sql
UPDATE members
SET weekly_alerts_enabled = false
WHERE email = 'member@example.com';
```

### Check who has alerts enabled:

```sql
SELECT
    email,
    first_name,
    last_name,
    weekly_alerts_enabled,
    is_active
FROM members
WHERE weekly_alerts_enabled = true
ORDER BY email;
```

---

## Success Metrics

Track these metrics weekly:

### Week 1 Goals:
- ✅ 80%+ of opted-in members receive emails successfully
- ✅ Zero timeout errors
- ✅ Email delivery rate > 95%
- ✅ At least 1 member confirms receiving matches

### Ongoing Metrics:

```sql
-- Weekly summary
SELECT
    week,
    total_sent,
    ROUND(avg_matches, 1) as avg_matches,
    unique_members
FROM weekly_alert_stats
ORDER BY week DESC
LIMIT 10;

-- Success rate
SELECT
    COUNT(*) FILTER (WHERE status = 'sent') as successful,
    COUNT(*) FILTER (WHERE status = 'failed') as failed,
    COUNT(*) FILTER (WHERE status = 'skipped') as skipped,
    ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'sent') / COUNT(*), 1) as success_rate
FROM weekly_alert_sends
WHERE sent_at >= CURRENT_DATE - INTERVAL '7 days';
```

---

## Next Steps (Future Enhancements)

Once the system is running smoothly, consider:

1. **A/B test subject lines** - Track open rates
2. **Smart send time** - Send at member's most active time
3. **Match feedback** - Track which matches lead to connections
4. **Diversity boost** - Ensure variety in weekly matches
5. **Weekly wrap-up** - Include portal activity stats in footer

---

## Quick Reference

### Important URLs:
- **Production API:** https://miamibusinesscouncil.com/api/send-weekly-alerts
- **Supabase Dashboard:** https://supabase.com/dashboard/project/vsnvtujkkkbjpuuwxvyd
- **Resend Dashboard:** https://resend.com/emails
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Cron Job:** https://cron-job.org

### Important Files:
- `/api/send-weekly-alerts.js` - Main function
- `/ADD-WEEKLY-ALERT-TRACKING.sql` - Database migration
- `/vercel.json` - Timeout configuration

### Environment Variables:
- `WEEKLY_ALERTS_SECRET` = `48957360-81c2-403a-b760-7a22e81a81f0`
- `RESEND_API_KEY` = (already configured)
- `SUPABASE_URL` = (already configured)
- `SUPABASE_SERVICE_KEY` = (already configured)

---

## Support

If you encounter issues:
1. Check Vercel function logs
2. Check Supabase database logs
3. Check Resend email delivery logs
4. Review this guide's Troubleshooting section

For questions, contact the development team or review the implementation plan document.
