# Re-Invite Thomas McClure to Member Portal

After deleting Thomas McClure, follow these steps to re-invite him with a fresh account:

---

## Option 1: Via Supabase Dashboard (Recommended - 2 minutes)

1. **Go to Supabase Dashboard**
   - URL: https://supabase.com/dashboard
   - Navigate to your project: `vsnvtujkkkbjpuuwxvyd`

2. **Create Member Record**
   - Go to Table Editor → `members` table
   - Click "Insert" → "Insert row"
   - Fill in:
     - `email`: thomasmcclureeofficial@gmail.com
     - `first_name`: Thomas
     - `last_name`: McClure
     - `company_name`: (leave empty or add if you know)
     - `is_active`: true
     - `is_admin`: false
   - Click "Save"

3. **Send Magic Link Invitation**
   - Go to Authentication → Users
   - Click "Invite user"
   - Enter email: thomasmcclureeofficial@gmail.com
   - Click "Send invite"

4. **Thomas receives email with magic link**
   - He clicks the link
   - Gets redirected to member portal
   - Profile is auto-linked via trigger
   - He can complete his profile

---

## Option 2: Via Member Portal (3 minutes)

1. **Log in as Admin**
   - Go to: https://miamibusinesscouncil.com/member-login
   - Log in with: info@miamibusinesscouncil.com or sabral@me.com

2. **Go to Admin Panel**
   - Click "Admin Panel" in sidebar

3. **Invite New Member**
   - Click "Invite New Member" button
   - Fill in form:
     - Email: thomasmcclureeofficial@gmail.com
     - First Name: Thomas
     - Last Name: McClure
     - Company: (if known)
     - Membership Type: Select appropriate tier
   - Click "Send Invitation"

4. **Thomas receives invitation email**
   - Contains magic link to member portal
   - He clicks and gains immediate access
   - Can complete profile on first login

---

## Option 3: SQL Script (Fastest - 1 minute)

**Step 1: Create member record**

```sql
INSERT INTO members (
    email,
    first_name,
    last_name,
    company_name,
    is_active,
    is_admin
) VALUES (
    'thomasmcclureeofficial@gmail.com',
    'Thomas',
    'McClure',
    'To be completed',  -- He can update this in his profile
    true,
    false
) RETURNING id, email;
```

**Step 2: Send magic link via Supabase Auth**

You'll need to use Supabase Admin API to send the magic link. Create a temporary script:

```javascript
// Run this in browser console on member-login page

const { data, error } = await supabase.auth.admin.generateLink({
  type: 'magiclink',
  email: 'thomasmcclureeofficial@gmail.com',
  options: {
    redirectTo: 'https://miamibusinesscouncil.com/portal'
  }
});

console.log('Magic link:', data);
```

Then copy the magic link URL and send it to Thomas via email manually.

---

## Option 4: Let Thomas Request Access Himself (Easiest)

1. **Tell Thomas to go to:**
   https://miamibusinesscouncil.com/member-login

2. **Have him enter his email:**
   thomasmcclureeofficial@gmail.com

3. **He clicks "Send Magic Link to Email"**

4. **Portal will:**
   - Send him a magic link
   - He clicks it
   - Since his email exists in members table (from step 1 above), he gets access
   - He completes his profile

---

## Recommended Flow (Combines Options):

**What You Do:**
1. Run SQL script to create member record (Option 3, Step 1)
2. Verify record created in Supabase dashboard

**What Thomas Does:**
1. Go to member-login page
2. Enter his email
3. Request magic link
4. Click link in email
5. Complete profile

This way you don't have to manually send him anything - he self-serves!

---

## Verification Steps

After Thomas is re-invited:

1. **Check Members Table**
   ```sql
   SELECT id, email, first_name, last_name, company_name, is_active, created_at
   FROM members
   WHERE email = 'thomasmcclureeofficial@gmail.com';
   ```
   - Should return 1 row
   - `is_active` should be `true`

2. **Check Auth Users**
   ```sql
   SELECT id, email, email_confirmed_at, last_sign_in_at
   FROM auth.users
   WHERE email = 'thomasmcclureeofficial@gmail.com';
   ```
   - Should return 1 row after Thomas clicks magic link
   - `email_confirmed_at` should have timestamp

3. **Check Admin Panel**
   - Log in as admin
   - Go to Admin Panel → All Members
   - Thomas should appear in the list

4. **Check Member Portal (as Thomas)**
   - Have Thomas log in
   - He should see his profile
   - He can complete missing fields
   - He can connect with other members

---

## Troubleshooting

**Issue: "This email is not registered as a member"**
- Solution: Make sure member record exists in `members` table first
- Run Option 3, Step 1 SQL script

**Issue: Magic link doesn't work**
- Check spam folder
- Link expires in 1 hour
- Request a new magic link

**Issue: Thomas sees empty profile**
- Normal! He just needs to complete his profile
- Go to Profile tab
- Fill in company, phone, bio, etc.

**Issue: Thomas doesn't appear in admin panel**
- Check `is_active = true` in database
- Refresh admin panel
- Clear browser cache

---

## Summary

**Fastest method:** Run SQL to create member record, then have Thomas request his own magic link

**Most automated:** Use Supabase dashboard to create user and send invite

**Best user experience:** Admin panel "Invite New Member" button (coming soon if not already implemented)

---

**Time to re-invite:** 2-5 minutes
**Thomas's setup time:** 2 minutes (click link, complete profile)
**Total time:** < 10 minutes
