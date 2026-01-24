# 🚨 CRITICAL SECURITY FIXES - DO BEFORE LAUNCH

## Overview
The audit found **6 CRITICAL security issues** that MUST be fixed before production launch. This document provides step-by-step fixes for each.

---

## CRITICAL ISSUE #1: Remove Anonymous Database Access

**Problem:** Anyone can read/write/delete messages without logging in

**Fix:** Run this in Supabase SQL Editor RIGHT NOW:

```sql
-- Remove dangerous anonymous access
REVOKE ALL ON messages FROM anon;
REVOKE ALL ON members FROM anon;
REVOKE ALL ON member_connections FROM anon;
REVOKE ALL ON event_registrations FROM anon;
REVOKE ALL ON business_opportunities FROM anon;

-- Keep only SELECT for authenticated users on public data
GRANT SELECT ON members TO authenticated;
GRANT SELECT ON member_connections TO authenticated;
GRANT SELECT ON events TO authenticated;
GRANT ALL ON messages TO authenticated;
GRANT ALL ON business_opportunities TO authenticated;
GRANT ALL ON event_registrations TO authenticated;
```

**Verify:** Try accessing portal without logging in - should fail.

---

## CRITICAL ISSUE #2: Fix Storage Policies

**Problem:** Anyone can delete other users' photos

**Fix:** Run this in Supabase SQL Editor:

```sql
-- Drop insecure policies
DROP POLICY IF EXISTS "Anyone can view profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update their photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete their photos" ON storage.objects;

-- Create secure policies
CREATE POLICY "Authenticated users can view photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can upload own photos only"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own photos only"
ON storage.objects FOR UPDATE
TO authenticated
USING (auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'profile-photos');

CREATE POLICY "Users can delete own photos only"
ON storage.objects FOR DELETE
TO authenticated
USING (auth.uid()::text = (storage.foldername(name))[1]);
```

---

## CRITICAL ISSUE #3: Move Supabase Keys to Environment Variables

**Problem:** Credentials hardcoded in HTML files

**Fix:**

### Step 1: Create Environment Variables in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://vsnvtujkkkbjpuuwxvyd.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Step 2: Create a config file

Create `/api/config.js`:
```javascript
export const config = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
};
```

### Step 3: Update portal.html and member-login.html

Replace:
```javascript
var SUPABASE_URL = 'https://vsnvtujkkkbjpuuwxvyd.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGci...';
```

With:
```javascript
// Fetch from server-side config
const { SUPABASE_URL, SUPABASE_ANON_KEY } = await fetch('/api/config').then(r => r.json());
```

**Note:** This requires converting to a framework. For static HTML:
- Accept that anon keys are public (they're designed to be)
- Focus on RLS policies (above) to protect data
- Rotate keys regularly via Supabase dashboard

---

## CRITICAL ISSUE #4: Fix XSS Vulnerabilities

**Problem:** User data rendered with `innerHTML` without sanitization

**Fix:** Search and replace in portal.html:

### Find all innerHTML with user data:
```javascript
// BAD - XSS vulnerable
element.innerHTML = `<h3>${member.name}</h3>`;

// GOOD - Use textContent
const h3 = document.createElement('h3');
h3.textContent = member.name;
element.appendChild(h3);

// OR use escapeHtml function (already exists at line 8478)
element.innerHTML = `<h3>${escapeHtml(member.name)}</h3>`;
```

### Priority innerHTML to fix (64 total):
1. Line 8314: Member names in onclick attributes
2. Line 5733: Profile data rendering
3. Line 6584: Avatar URLs
4. All member card rendering

**Quick fix:** Use the existing `escapeHtml()` function everywhere.

---

## CRITICAL ISSUE #5: Add Server-Side Admin Authorization

**Problem:** Admin functions only protected client-side

**Fix:**

### Step 1: Add admin role to database
```sql
-- Add admin column to members table
ALTER TABLE members ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Set current admins
UPDATE members SET is_admin = TRUE
WHERE email IN ('info@miamibusinesscouncil.com', 'sabral@me.com');
```

### Step 2: Create RLS policies for admin operations
```sql
-- Only admins can delete members
CREATE POLICY "Only admins can delete members"
ON members FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM members
    WHERE id = (SELECT id FROM members WHERE auth_user_id = auth.uid())
    AND is_admin = TRUE
  )
);
```

### Step 3: Update portal.html
```javascript
// Replace hardcoded admin check (line 5077)
const isAdmin = member.is_admin; // From database, not hardcoded email
```

---

## CRITICAL ISSUE #6: Remove Console.log Statements

**Problem:** 172 console.log statements exposing sensitive data

**Fix:**

### Option A: Remove all (recommended for production)
```bash
# Search and replace in portal.html
sed -i '' 's/console\.log/\/\/ console.log/g' portal.html
sed -i '' 's/console\.error/\/\/ console.error/g' portal.html
```

### Option B: Gate behind environment check
```javascript
const DEBUG = false; // Set to false for production

if (DEBUG) console.log('Debug info');
```

### Option C: Use proper logging service
```javascript
// Install Sentry or similar
if (error) {
  Sentry.captureException(error);
}
```

**Quick fix for now:** Comment out all console.log lines.

---

## VERIFICATION CHECKLIST

After fixing all 6 critical issues, verify:

- [ ] Cannot access messages without logging in
- [ ] Cannot delete other users' photos
- [ ] No credentials visible in page source
- [ ] User names with `<script>` tags don't execute
- [ ] Non-admin users cannot access admin panel
- [ ] Console is clean (no sensitive logs)

---

## DEPLOYMENT TIMELINE

**DO NOT DEPLOY TO PRODUCTION UNTIL:**
1. All 6 critical fixes applied ✅
2. Verification checklist complete ✅
3. Tested with real user accounts ✅

**Estimated time to fix:** 2-3 hours

**Priority order:**
1. Database access (CRITICAL - 5 min)
2. Storage policies (CRITICAL - 10 min)
3. Console.log removal (HIGH - 30 min)
4. Admin authorization (HIGH - 45 min)
5. XSS fixes (HIGH - 1 hour)
6. Environment variables (MEDIUM - can do later)

---

Once these are fixed, the remaining 22 issues can be addressed over time without blocking launch.
