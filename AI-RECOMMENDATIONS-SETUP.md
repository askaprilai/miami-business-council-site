# AI Recommendations Setup Guide

## Current Status

The AI-powered collaboration matching system is **configured but not fully functional**. Here's what needs to be done to activate it:

## Issues Found

1. **Missing 'status' column** in `member_needs` table
   - The Edge Function queries `.eq('status', 'open')` but this column doesn't exist

2. **Missing profile fields** in `members` table
   - The AI needs: `expertise`, `services_offered`, `looking_for`, `business_description`
   - Currently only `industry` exists

3. **Missing OpenAI API Key**
   - The Edge Function needs `OPENAI_API_KEY` environment variable in Supabase

---

## Fix Steps

### Step 1: Add Status Column to member_needs

Run this SQL in Supabase SQL Editor:

```sql
-- File: ADD-STATUS-COLUMN-TO-MEMBER-NEEDS.sql

ALTER TABLE member_needs
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'closed'));

UPDATE member_needs
SET status = 'open'
WHERE status IS NULL;

CREATE INDEX IF NOT EXISTS idx_member_needs_status ON member_needs(status);
```

### Step 2: Add Profile Fields to members

Run this SQL in Supabase SQL Editor:

```sql
-- File: ADD-AI-PROFILE-FIELDS.sql

ALTER TABLE members
ADD COLUMN IF NOT EXISTS expertise TEXT[],
ADD COLUMN IF NOT EXISTS services_offered TEXT[],
ADD COLUMN IF NOT EXISTS looking_for TEXT[],
ADD COLUMN IF NOT EXISTS business_description TEXT;

CREATE INDEX IF NOT EXISTS idx_members_expertise ON members USING GIN (expertise);
CREATE INDEX IF NOT EXISTS idx_members_services_offered ON members USING GIN (services_offered);
CREATE INDEX IF NOT EXISTS idx_members_looking_for ON members USING GIN (looking_for);
```

### Step 3: Add OpenAI API Key to Supabase

1. Go to Supabase Dashboard → Project Settings → Edge Functions
2. Add new secret:
   - Name: `OPENAI_API_KEY`
   - Value: `sk-proj-...` (your OpenAI API key)

Or via CLI:
```bash
supabase secrets set OPENAI_API_KEY=sk-proj-...
```

### Step 4: Deploy the Edge Function

If not already deployed:

```bash
cd supabase/functions
supabase functions deploy smart-match-collaborations
```

### Step 5: Test the AI Recommendations

1. Log into the member portal
2. Navigate to "Collaboration Hub"
3. Check browser console for:
   - `🤖 Loading AI recommendations...`
   - `🎯 AI recommendations loaded: ...`
4. If working, you should see "AI-Powered Matches for You" section appear

---

## How It Works

### When a member visits Collaboration Hub:

1. **Portal calls Edge Function**: `supabase.functions.invoke('smart-match-collaborations')`

2. **Edge Function fetches data**:
   - Gets current member's profile (industry, expertise, services, etc.)
   - Gets open collaboration posts (status='open', excluding member's own posts)

3. **Calls OpenAI GPT-4o-mini**:
   ```
   Prompt: "Match this member profile with these collaboration requests"
   Returns: Top 5 matches with scores (0-100) and reasons
   ```

4. **Displays results**:
   - Shows match score badge (90%+ = green, 75%+ = yellow, <75% = orange)
   - Shows why it's a good match
   - Allows member to respond to matches

---

## Cost Considerations

- **Model**: GPT-4o-mini (very cost-efficient)
- **Estimated cost**: ~$0.001 per AI match request
- **Caching**: Results cached for 5 minutes per member
- **Expected monthly cost**: $5-20 depending on usage

---

## Troubleshooting

### AI section not appearing
- Check browser console for errors
- Verify `OPENAI_API_KEY` is set in Supabase
- Ensure Edge Function is deployed

### "AI matching failed" error
- Check OpenAI API key is valid and has credits
- Check Supabase Edge Function logs

### No matches returned
- Verify there are open collaboration posts (status='open')
- Ensure member profile has filled out expertise/services fields
- Check that posts belong to other members (not the current user)

### Database query errors
- Ensure 'status' column exists in member_needs
- Ensure profile fields exist in members table
- Check RLS policies allow reading member_needs

---

## Member Profile Form Updates (Future)

Currently members can't edit these new fields in the portal. You'll need to:

1. Add form fields to the profile editing section in portal.html
2. Allow members to input:
   - Expertise (multi-select tags)
   - Services Offered (multi-select tags)
   - Looking For (multi-select tags)
   - Business Description (textarea)

---

## Verification Checklist

- [ ] Ran ADD-STATUS-COLUMN-TO-MEMBER-NEEDS.sql
- [ ] Ran ADD-AI-PROFILE-FIELDS.sql
- [ ] Added OPENAI_API_KEY to Supabase secrets
- [ ] Deployed smart-match-collaborations Edge Function
- [ ] Tested in portal - AI section appears
- [ ] Checked browser console - no errors
- [ ] Verified matches are relevant and make sense

---

## Quick Test

Run this to verify the Edge Function can be called:

```sql
-- Check that required columns exist
SELECT
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'member_needs' AND column_name = 'status'
UNION ALL
SELECT
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'members' AND column_name IN ('expertise', 'services_offered', 'looking_for', 'business_description');
```

Should return 5 rows if all columns exist.
