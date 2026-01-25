# AI Smart Matching Setup Guide

This guide will walk you through setting up the AI-powered Smart Matching feature for the Collaboration Hub.

## Overview

The Smart Matching feature uses OpenAI GPT-4o-mini to analyze member profiles and recommend the most relevant collaboration requests. It provides:

- **🎯 Personalized Recommendations** - Top 3-5 requests matched to each member
- **💡 AI Explanations** - Why each request is a good match
- **📊 Match Scores** - 0-100% confidence ratings
- **⚡ Fast & Efficient** - Cached for 5 minutes to reduce costs

---

## Prerequisites

### 1. Get an OpenAI API Key

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Click **"Create new secret key"**
4. Copy the key (starts with `sk-...`)
5. **Important:** Keep this key secure!

### 2. Install Supabase CLI

```bash
npm install -g supabase
```

Verify installation:
```bash
supabase --version
```

---

## Setup Steps

### Step 1: Link to Supabase Project

```bash
cd /Users/apriljsabral/Documents/miami-business-council-site
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

**Where to find YOUR_PROJECT_REF:**
- Go to your Supabase dashboard
- URL will be: `https://app.supabase.com/project/YOUR_PROJECT_REF`
- Copy the project ref (usually looks like: `abcdefghijklmnop`)

### Step 2: Add OpenAI API Key to Supabase

**Option A: Via Supabase Dashboard (Recommended)**

1. Go to your Supabase project dashboard
2. Navigate to **Project Settings** → **Edge Functions**
3. Scroll to **Secrets**
4. Click **Add new secret**
5. Name: `OPENAI_API_KEY`
6. Value: Your OpenAI API key (paste the `sk-...` key)
7. Click **Save**

**Option B: Via CLI**

```bash
supabase secrets set OPENAI_API_KEY=sk-your-actual-key-here
```

### Step 3: Deploy the Edge Function

```bash
supabase functions deploy smart-match-collaborations
```

You should see:
```
Deploying function smart-match-collaborations...
Function smart-match-collaborations deployed successfully!
URL: https://YOUR_PROJECT_REF.supabase.co/functions/v1/smart-match-collaborations
```

### Step 4: Test the Function

```bash
# Get your anon key from Supabase dashboard (Settings > API)
curl -i --location --request POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/smart-match-collaborations' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json'
```

**Expected response:**
```json
{
  "matches": [
    {
      "id": "...",
      "title": "...",
      "matchScore": 95,
      "matchReason": "..."
    }
  ]
}
```

### Step 5: Deploy Frontend Changes

```bash
cd /Users/apriljsabral/Documents/miami-business-council-site
git add portal.html
git commit -m "Add AI Smart Matching to Collaboration Hub"
git push
```

---

## Verification

### Test in Portal

1. Open your member portal
2. Navigate to **Collaboration Hub**
3. You should see a **"🎯 Recommended For You"** section at the top
4. It will show:
   - Top 3 personalized recommendations
   - AI-generated match reasons
   - Match percentage scores
   - "I Can Help" buttons

### Check Browser Console

Open DevTools (F12) and look for:
```
🤖 Loading AI recommendations...
🎯 AI recommendations loaded: {...}
✅ Using cached AI recommendations
```

---

## Cost Management

### Estimated Costs

- **Model:** GPT-4o-mini ($0.15 per 1M input tokens, $0.60 per 1M output tokens)
- **Per Request:** ~$0.001 - $0.003 (very cheap!)
- **Caching:** 5-minute cache reduces API calls significantly

**Example monthly cost:**
- 100 active members
- Each visits Collaboration Hub 10 times/month
- Cache reduces 1000 potential calls to ~200 actual calls
- **Total:** ~$0.20 - $0.60/month

### Cost Optimization Tips

1. **Cache Duration:** Currently 5 minutes (adjust in portal.html if needed)
2. **Request Limit:** Analyzes top 20 requests (can reduce to 10)
3. **Recommendations:** Shows top 3 (can reduce to 2)
4. **Manual Refresh:** Users can click "🔄 Refresh" to force update

---

## Troubleshooting

### "Function not found" error

**Solution:** Ensure function is deployed
```bash
supabase functions list
# Should show: smart-match-collaborations
```

### "OpenAI API key not configured" error

**Solution:** Check secret is set
```bash
supabase secrets list
# Should show: OPENAI_API_KEY
```

### "AI recommendations not showing" in portal

**Possible causes:**
1. Member profile incomplete (needs expertise, services, etc.)
2. No open collaboration requests available
3. Edge function not deployed
4. Check browser console for errors

### "429 Rate Limit" from OpenAI

**Solution:** You've hit OpenAI rate limits
- Check your OpenAI dashboard usage
- Upgrade your OpenAI plan if needed
- Increase cache duration in code

---

## Advanced Configuration

### Adjust Match Algorithm

Edit `supabase/functions/smart-match-collaborations/index.ts`:

```typescript
// Line ~120 - Adjust number of matches returned
.limit(20) // Change from 20 to 10 for faster processing

// Line ~180 - Change AI model
model: 'gpt-4o-mini', // Can use 'gpt-4o' for better quality (more expensive)

// Line ~181 - Adjust temperature
temperature: 0.7, // Lower = more focused, Higher = more creative
```

Redeploy after changes:
```bash
supabase functions deploy smart-match-collaborations
```

### Adjust Cache Duration

Edit `portal.html` (around line 13950):

```javascript
const AI_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
// Change to 10 minutes:
const AI_CACHE_DURATION = 10 * 60 * 1000;
```

---

## Security Notes

✅ **DO:**
- Store OpenAI API key in Supabase secrets
- Use Edge Functions (server-side)
- Keep anon key public (it's safe with RLS)

❌ **DON'T:**
- Put OpenAI API key in portal.html
- Commit secrets to Git
- Share OpenAI API key publicly

---

## Support

If you encounter issues:

1. **Check Logs:**
   ```bash
   supabase functions logs smart-match-collaborations
   ```

2. **Test Edge Function Directly:**
   Use the curl command from Step 4

3. **Verify Member Profile:**
   Ensure your member profile has:
   - Industry
   - Expertise
   - Services Offered
   - Business Description

4. **GitHub Issues:**
   File an issue with error logs if problems persist

---

## What's Next?

Once Smart Matching is working, you can add more AI features:

- **Auto-Categorization:** AI suggests category when posting
- **Response Templates:** AI generates personalized messages
- **Member Recommendations:** Show who can help with each request

These can use the same Edge Function pattern!
