# Supabase Auth Migration Setup Guide
## Miami Business Council - Magic Link Authentication

This guide walks you through setting up passwordless magic link authentication for the Miami Business Council member portal.

---

## 📋 Overview

You're migrating from hardcoded passwords to Supabase Auth with magic links. This means:
- ✅ No more passwords to remember
- ✅ No more localStorage corruption issues
- ✅ Secure, industry-standard authentication
- ✅ Members log in by clicking a link in their email

---

## 🚀 Step-by-Step Setup

### Step 1: Configure Supabase Dashboard (15 minutes)

#### A. Enable Email Authentication

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard/project/vsnvtujkkkbjpuuwxvyd
2. **Navigate to**: Authentication → Providers (left sidebar)
3. **Find "Email" provider** in the list
4. **Click on it** to expand settings
5. **Configure these settings**:
   - ✅ **Enable Email provider**: Toggle to ON
   - ✅ **Enable email link sign-in**: Toggle to ON (this enables magic links!)
   - ⚠️ **Confirm email**: Toggle to OFF (for faster onboarding - you can enable later)
   - Leave other settings as default
6. **Click "Save"**

#### B. Configure URL Settings

1. **Navigate to**: Authentication → URL Configuration
2. **Set these URLs**:
   - **Site URL**: `https://miamibusinesscouncil.com`
   - **Redirect URLs**: Add these (one per line):
     - `https://miamibusinesscouncil.com/member-portal`
     - `http://localhost:3000/member-portal` (for local testing)
3. **Click "Save"**

#### C. Review Email Template (Optional)

1. **Navigate to**: Authentication → Email Templates
2. **Select**: "Magic Link" template
3. **Review the template** - Supabase's default is good, but you can customize:
   - Add Miami Business Council branding
   - Customize the message
   - Add your logo
4. **Click "Save"** if you make changes

**Note**: The custom welcome emails in your code will override this template, so this is just for fallback.

---

### Step 2: Run Database Migration (5 minutes)

#### A. Open SQL Editor

1. **Go to**: SQL Editor (left sidebar in Supabase Dashboard)
2. **Click**: "New query"

#### B. Run Migration SQL

1. **Copy the contents** of `supabase-auth-migration.sql`
2. **Paste** into the SQL editor
3. **Click "Run"** or press Cmd+Enter (Mac) / Ctrl+Enter (Windows)
4. **Verify success**: You should see a success message with these notices:
   ```
   ✅ Supabase Auth migration completed successfully!
   📧 Next steps:
   1. Enable Email Auth provider in Supabase Dashboard → Authentication → Providers
   2. Enable magic link sign-in in Email provider settings
   3. Run the member migration script to link existing members
   4. Update frontend code to use Supabase Auth
   ```

#### C. Verify Tables Updated

1. **Go to**: Table Editor → members
2. **Check**: You should see a new column `auth_user_id` (it will be empty for now)

---

### Step 3: Set Environment Variables (5 minutes)

Your Supabase keys are already in the code, but for security best practices:

#### For Vercel Deployment:

1. **Go to**: Vercel Dashboard → Your Project → Settings → Environment Variables
2. **Add these variables**:
   - `SUPABASE_URL`: `https://vsnvtujkkkbjpuuwxvyd.supabase.co`
   - `SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzbnZ0dWpra2tianB1dXd4dnlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MzUyNDYsImV4cCI6MjA3MTIxMTI0Nn0.GwWKrl_6zlIBvIaJs8NngoheF24nNzAfBO5_j_d1ogA`
   - `SUPABASE_SERVICE_KEY`: `[Your service role key from Supabase]`
   - `RESEND_API_KEY`: `[Your Resend API key for emails]`
   - `ADMIN_SECRET`: `[Create a secure random string for admin operations]`

**To get your Supabase Service Key**:
1. Go to: Project Settings → API
2. Copy the `service_role` key (⚠️ Keep this secret!)

**To create ADMIN_SECRET**:
```bash
# Run this in terminal to generate a secure random string:
openssl rand -base64 32
```

---

### Step 4: Migrate Existing Members (10 minutes)

This will create auth accounts for your 6 existing members and send them magic link invitations.

#### Option A: Via API Call (Recommended)

1. **First, deploy your updated code to Vercel**
2. **Use Postman, Insomnia, or curl** to call the migration API:

```bash
curl -X POST https://miamibusinesscouncil.com/api/migrate-members-to-auth \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  -d '{}'
```

3. **Check the response** - it should show:
   - ✅ Success: 6/6 members migrated
   - Each member's email and their auth user ID

#### Option B: Via Supabase Dashboard

If the API doesn't work, you can manually invite members:

1. **Go to**: Authentication → Users
2. **Click**: "Invite user"
3. **For each member**, enter:
   - Email: `lubna@thelubnanajjar.com`
   - Click "Send invite"
4. **Repeat for**:
   - `info@miamibusinesscouncil.com`
   - `april@retailu.ca`
   - `sabral@me.com`
   - `atiba@themadyungroup.com`
   - `test@test.com`

5. **Link auth users to member records**:
   - Go to: SQL Editor
   - Run this for each member:
   ```sql
   UPDATE members
   SET auth_user_id = (SELECT id FROM auth.users WHERE email = 'lubna@thelubnanajjar.com')
   WHERE email = 'lubna@thelubnanajjar.com';
   ```

---

### Step 5: Test Magic Link Login (5 minutes)

#### A. Test with Your Own Email First

1. **Go to**: https://miamibusinesscouncil.com/member-login
2. **Enter your email**: (use one of the migrated members)
3. **Click**: "Send Magic Link to Email"
4. **Check your email** (including spam folder)
5. **Click the magic link** in the email
6. **Verify**: You're redirected to member-portal and logged in!

#### B. Test Portal Features

1. **Check**: Your name appears in the header
2. **Navigate**: Try different sections (Dashboard, Profile, Directory)
3. **Test logout**: Click logout button
4. **Test re-login**: Request another magic link

#### C. Common Issues & Solutions

**"Email not registered as member"**
- The member's email doesn't exist in the members table
- Solution: Run the migration script or manually invite them

**"Magic link expired"**
- Magic links expire after 1 hour
- Solution: Request a new magic link

**"Member profile not found"**
- The auth user exists but isn't linked to a member record
- Solution: Check the `auth_user_id` column in members table

---

### Step 6: Invite New Members (2 minutes)

Now you can easily invite new members!

1. **Go to**: Admin panel in member portal
2. **Or**: Open `admin-invite-members.html` directly
3. **Fill in**:
   - First Name
   - Last Name
   - Email
   - Company
   - Membership Type
   - Personal Note (optional)
4. **Click**: "Send Magic Link Invitation"
5. **Result**: Member receives email with magic link → Clicks link → Logged in!

---

## 🎉 You're Done!

Your member portal now uses secure, passwordless authentication!

### What Changed:

- ❌ **Before**: Hardcoded passwords in code, localStorage corruption, deployment needed to add members
- ✅ **After**: Secure magic links, no passwords, instant member invitations, scalable to 1000s of members

### Benefits:

- 🔒 **Secure**: Industry-standard OAuth 2.0 authentication
- 📧 **Passwordless**: Members never need to remember or reset passwords
- ⚡ **Fast**: Magic links work instantly, no email verification delays
- 📊 **Audit Trail**: Supabase logs all auth events
- 🔄 **Session Management**: Automatic token refresh, secure session storage
- 📱 **Device Friendly**: Works across all devices, browsers, and platforms

---

## 🆘 Troubleshooting

### Members can't log in

**Check:**
1. Email Auth is enabled in Supabase Dashboard
2. Magic link toggle is ON
3. Redirect URLs are configured correctly
4. Member email exists in members table
5. `auth_user_id` is linked in members table

### Magic links aren't sending

**Check:**
1. SMTP settings in Supabase (should work with default)
2. Check email spam folder
3. Verify email address is correct
4. Check Supabase Auth logs: Authentication → Logs

### "Member profile not found" error

**Solution:**
```sql
-- Check if member exists
SELECT * FROM members WHERE email = 'member@example.com';

-- Check if auth user exists
SELECT * FROM auth.users WHERE email = 'member@example.com';

-- Link them if both exist
UPDATE members
SET auth_user_id = (SELECT id FROM auth.users WHERE email = 'member@example.com')
WHERE email = 'member@example.com';
```

### Session expires too quickly

**Adjust session duration:**
1. Go to: Authentication → Settings
2. Update: JWT expiry (default 1 hour)
3. Update: Refresh token expiry (default 7 days)

---

## 📞 Need Help?

- **Supabase Docs**: https://supabase.com/docs/guides/auth/auth-magic-link
- **Supabase Discord**: https://discord.supabase.com
- **Email**: info@miamibusinesscouncil.com

---

## 📝 Files Modified

- ✅ `member-login.html` - Magic link login UI
- ✅ `member-portal.html` - Supabase session management
- ✅ `admin-invite-members.html` - Magic link invitations
- ✅ `api/send-member-invitation.js` - New invitation endpoint
- ✅ `api/migrate-members-to-auth.js` - Migration script
- ✅ `supabase-auth-migration.sql` - Database changes

---

## 🔐 Security Notes

- ✅ Anon key is safe in frontend (public by design)
- ⚠️ Service key must stay server-side only
- ✅ RLS policies secure all database access
- ✅ Magic links expire after 1 hour
- ✅ HTTPS required for production
- ✅ Rate limiting built into Supabase Auth
