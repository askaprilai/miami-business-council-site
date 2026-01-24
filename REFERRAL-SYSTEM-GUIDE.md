# Referral & Invite System - Complete Guide

Complete guide for the Miami Business Council referral and invite rewards system.

---

## 🎯 Overview

The referral system allows members to:
- **Send personalized email invitations** to their contacts
- **Track invitations** and conversions in real-time
- **Earn points** for successful referrals (100 points per conversion)
- **Redeem rewards** like speaking opportunities, affiliate commissions, VIP access

---

## 📋 Setup Instructions

### Step 1: Run Database Migration

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/vsnvtujkkkbjpuuwxvyd
2. Navigate to **SQL Editor**
3. Copy the contents of `ADD-REFERRAL-SYSTEM.sql`
4. Paste and **Run** the SQL script
5. Verify the tables were created:
   - `member_referrals` - Tracks all invitations
   - `member_points` - Tracks member points and stats
   - `referral_code` column added to `members` table

### Step 2: Deploy Updated Portal

```bash
cd /Users/apriljsabral/Documents/miami-business-council-site
git add portal.html api/send-referral-invite.js ADD-REFERRAL-SYSTEM.sql REFERRAL-SYSTEM-GUIDE.md
git commit -m "Add functional referral and invite system with email sending"
git push origin main
```

### Step 3: Verify Deployment

After pushing to main, Vercel will automatically deploy:
1. Wait 1-2 minutes for deployment
2. Visit: https://miamibusinesscouncil.com/portal
3. Login as a member
4. Check that referral link is populated with your code
5. Test sending an invite

---

## 🎁 How It Works

### For Members

#### 1. **Get Your Referral Link**
- Login to portal → Settings section
- See "🎁 Invite & Earn Rewards" card
- Your unique referral code (e.g., `AS2025123`) is automatically generated
- Referral link format: `https://miamibusinesscouncil.com/join?ref=AS2025123`

#### 2. **Send Invitations**

**Option A: Send Personalized Email (Recommended)**
- Click "📧 Send Invite" button
- Fill in:
  - Invitee's email (required)
  - Invitee's name (optional, makes it more personal)
  - Personal message (optional, included in email)
- Click "Send Invitation"
- Email is sent immediately via Resend
- Invitation tracked in database

**Option B: Share via Other Channels**
- **LinkedIn**: Share on your LinkedIn feed
- **SMS**: Send via text message
- **Generic Share**: Use device share menu (mobile)
- **Copy Link**: Copy and paste anywhere

#### 3. **Track Your Stats**

Real-time stats shown in portal:
- **Total Invites Sent**: How many invitations you've sent
- **Successful Referrals**: How many joined and became members
- **Conversion Rate**: Percentage of invites that converted
- **Points Balance**: Total points earned

#### 4. **Earn Points**

**Points Structure:**
- **50 points**: Someone signs up via your link
- **100 points**: Referred member becomes a paid member (converted)
- **Bonus**: 25 points for every 5 successful referrals

Points are awarded automatically when referrals convert.

#### 5. **Redeem Rewards**

Use your points for:
- **🎤 Speaking Opportunity** (500 points) - Present at next MBC event
- **💰 Affiliate Commission** (300 points) - Earn 20% on referrals
- **🎟️ VIP Event Access** (750 points) - Exclusive networking events

---

## 📧 Invitation Email

When you send an invitation, your contact receives a beautifully designed email:

**From:** `[Your Name] via Miami Business Council <invites@miamibusinesscouncil.com>`
**Reply-To:** Your email address
**Subject:** `[Your Name] invited you to join Miami Business Council`

**Email includes:**
- Personalized greeting
- Your recommendation
- Your personal message (if provided)
- Benefits of joining MBC
- Clear call-to-action button
- Your referral link

**Design:**
- MBC gold branding (#d4af37)
- Dark theme with glassmorphism
- Mobile responsive
- Professional layout

---

## 🗄️ Database Schema

### `member_referrals` table
Tracks all invitation activity:
```sql
- id (UUID, primary key)
- referrer_id (UUID) → member who sent invite
- referral_code (TEXT) → referral code used
- invitee_email (TEXT) → email of person invited
- invitee_name (TEXT) → name of invitee
- invitation_sent_at (TIMESTAMP) → when invite was sent
- invitation_method (TEXT) → email, linkedin, sms, direct_link
- status (TEXT) → invited, signed_up, converted
- converted_member_id (UUID) → member ID if they joined
- converted_at (TIMESTAMP) → when they converted
- points_awarded (INT) → points given for this referral
- resend_email_id (TEXT) → Resend email tracking ID
```

### `member_points` table
Tracks cumulative stats per member:
```sql
- member_id (UUID, primary key)
- total_points (INT) → total points balance
- invites_sent (INT) → total invitations sent
- successful_referrals (INT) → total successful conversions
- last_invite_sent_at (TIMESTAMP) → most recent invite
```

### `members.referral_code` column
Each member gets a unique referral code:
- Format: `[FirstInitial][LastInitial][Year][Number]`
- Example: `AS2025001` (April Sabral, 2025, #001)
- Auto-generated on account creation
- Unique constraint enforced

---

## 🔧 API Endpoint

### `POST /api/send-referral-invite`

**Request Body:**
```json
{
  "memberEmail": "april@retailu.ca",
  "inviteeEmail": "friend@example.com",
  "inviteeName": "John Smith",
  "invitationMethod": "email",
  "personalMessage": "I think you'd really benefit from this community!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Invitation sent successfully",
  "referral": {
    "id": "uuid",
    "inviteeEmail": "friend@example.com",
    "inviteeName": "John Smith",
    "sentAt": "2025-01-24T..."
  },
  "stats": {
    "total_points": 250,
    "invites_sent": 8,
    "successful_referrals": 2
  }
}
```

**Error Responses:**
- **400**: Missing fields, invalid email, already a member, or duplicate invite within 30 days
- **404**: Member not found
- **500**: Server error or email delivery failure

---

## 🔐 Security Features

1. **Duplicate Prevention**: Can't send same person an invite within 30 days
2. **Email Validation**: Validates email format before sending
3. **Member Verification**: Checks invitee isn't already a member
4. **Authenticated Requests**: Requires valid member session
5. **Rate Limiting**: Natural rate limit via 30-day duplicate check
6. **Email Tracking**: All invites tracked with Resend ID for audit

---

## 📊 Admin Queries

### View All Referrals
```sql
SELECT
    m.first_name || ' ' || m.last_name as referrer,
    mr.invitee_email,
    mr.status,
    mr.invitation_sent_at,
    mr.converted_at,
    mr.points_awarded
FROM member_referrals mr
JOIN members m ON mr.referrer_id = m.id
ORDER BY mr.invitation_sent_at DESC;
```

### Referral Leaderboard
```sql
SELECT * FROM referral_leaderboard
LIMIT 10;
```

### Member Referral Stats
```sql
SELECT * FROM member_referral_stats
WHERE email = 'april@retailu.ca';
```

### Mark Referral as Converted
```sql
-- When someone joins via referral link
UPDATE member_referrals
SET
    status = 'converted',
    converted_at = NOW(),
    converted_member_id = 'new-member-uuid'
WHERE invitee_email = 'friend@example.com'
AND status = 'signed_up';
-- Points awarded automatically via trigger
```

---

## 🧪 Testing Guide

### Test Sending an Invite

1. **Login to portal** as your account
2. Navigate to **Settings** section
3. Scroll to **🎁 Invite & Earn Rewards**
4. Click **"📧 Send Invite"** button
5. Fill in test invite:
   - Email: `test@example.com` (use your own test email)
   - Name: `Test User`
   - Personal Message: `This is a test invitation`
6. Click **"Send Invitation"**
7. Check for success message
8. Check your test email inbox

### Verify Database Tracking

```sql
-- Check invite was recorded
SELECT * FROM member_referrals
WHERE invitee_email = 'test@example.com'
ORDER BY invitation_sent_at DESC
LIMIT 1;

-- Check stats were updated
SELECT * FROM member_points
WHERE member_id = 'your-member-id';
```

### Verify Email Delivery

1. Go to Resend Dashboard: https://resend.com/emails
2. Filter by sender: `invites@miamibusinesscouncil.com`
3. Find your test email
4. Verify status is "Delivered"
5. Check email content

---

## 🎨 Customization

### Email Template

To customize the invitation email template:
1. Edit `/api/send-referral-invite.js`
2. Find the `generateInvitationEmail()` function
3. Modify HTML template as needed
4. Maintain MBC branding (gold #d4af37)
5. Test thoroughly before deploying

### Points Structure

To change points awarded:
1. Edit `ADD-REFERRAL-SYSTEM.sql`
2. Find `update_member_points_on_conversion()` function
3. Change point values:
   ```sql
   UPDATE member_referrals
   SET points_awarded = 100  -- Change this number
   WHERE id = NEW.id;
   ```
4. Re-run migration

### Rewards

To add/modify rewards:
1. Edit `portal.html`
2. Find rewards grid HTML (around line 4746)
3. Add new reward card:
   ```html
   <div class="reward-card locked">
       <div class="reward-icon">🎯</div>
       <div class="reward-details">
           <div class="reward-title">New Reward</div>
           <div class="reward-description">Description here</div>
           <div class="reward-cost">1000 points</div>
       </div>
       <button class="claim-reward-btn disabled">Need 1000 pts</button>
   </div>
   ```

---

## 🚀 Future Enhancements

Potential improvements for v2:

1. **Automated Conversion Tracking**
   - Webhook on new member signup
   - Auto-match email to referral record
   - Award points automatically

2. **Referral Analytics Dashboard**
   - Conversion funnel visualization
   - Best performing referrers
   - Time-to-conversion metrics

3. **Referral Campaigns**
   - Limited-time bonus points
   - Themed campaigns (e.g., "February Growth Month")
   - Team referral challenges

4. **Social Sharing Improvements**
   - Pre-designed social media graphics
   - Twitter/X integration
   - WhatsApp sharing

5. **Reward Redemption Workflow**
   - Automated reward fulfillment
   - Redemption history tracking
   - Notification when enough points earned

6. **Gamification**
   - Achievement badges
   - Referral milestones
   - Public leaderboard (opt-in)

---

## ❓ FAQ

### Q: Where does my referral code come from?
**A:** Auto-generated when your account is created. Format: FirstInitial + LastInitial + Year + Sequence Number (e.g., `AS2025001`)

### Q: Can I customize my referral code?
**A:** Currently no, but this could be added as a premium feature.

### Q: What if my referral link doesn't work?
**A:** Check that:
1. Database migration was run successfully
2. Your account has a `referral_code` in the database
3. You're logged into the portal

### Q: How long are invitations valid?
**A:** Indefinitely - referral links don't expire.

### Q: Can I send multiple invites to the same person?
**A:** Not within 30 days - this prevents spam. After 30 days, you can send again.

### Q: When do I get points?
**A:** Automatically when your referral becomes a paying member (status changes to "converted").

### Q: How do I claim rewards?
**A:** Click the "Claim" button on reward cards. Admin will be notified to fulfill the reward.

### Q: Can I see who I've referred?
**A:** Not currently in the portal, but admin can query the database to see this.

---

## 📞 Support

If you encounter issues:

1. **Check Database**: Verify migration ran successfully
2. **Check Logs**: View Vercel function logs for API errors
3. **Check Resend**: Verify email delivery status
4. **Test Email**: Ensure Resend API key is valid

**Resources:**
- Supabase Dashboard: https://supabase.com/dashboard/project/vsnvtujkkkbjpuuwxvyd
- Resend Dashboard: https://resend.com/emails
- Vercel Dashboard: https://vercel.com/dashboard

---

## ✅ Deployment Checklist

Before launching to members:

- [ ] Database migration completed successfully
- [ ] Portal code deployed and live
- [ ] API endpoint tested with real invite
- [ ] Email template reviewed and approved
- [ ] Resend sender verified: `invites@miamibusinesscouncil.com`
- [ ] Test invite sent and received
- [ ] Database tracking verified
- [ ] Points calculation tested
- [ ] Reward redemption workflow documented
- [ ] Member communication prepared

---

**Ready to launch!** 🎉

Members can now send real invitations and earn rewards for growing the Miami Business Council community.
