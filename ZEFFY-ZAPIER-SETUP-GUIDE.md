# Zeffy to Portal Integration Setup Guide

## Overview

This guide will help you connect your Zeffy membership form to the Miami Business Council member portal using Zapier. When someone pays for membership in Zeffy, they'll automatically get an account created in the portal and receive a magic link to log in.

---

## Prerequisites

✅ Zeffy account with membership form set up
✅ Zapier account (Free plan works fine)
✅ Zeffy form collecting these fields:
- First Name
- Last Name
- Email
- Phone (optional)
- Company Name (optional)
- Job Title (optional)
- Membership Type (Individual/Nonprofit/Business)
- Billing Frequency (Monthly/Annual)

---

## Step 1: Get Your Webhook URL

Your webhook endpoint is:
```
https://miamibusinesscouncil.com/api/zeffy-webhook
```

This is already deployed and ready to receive data from Zapier.

---

## Step 2: Create a Zapier Account

1. Go to https://zapier.com/sign-up
2. Sign up with your MBC email
3. Choose the **Free plan** (100 tasks/month)
4. Apply for nonprofit discount later if you need more tasks

---

## Step 3: Create Your Zap

### 3.1 Set Up the Trigger (Zeffy)

1. In Zapier, click **"Create Zap"**
2. **Trigger App**: Search for "Zeffy"
3. **Trigger Event**: Select **"New Donation"** or **"New Form Submission"**
   - Use "New Donation" if your form processes payments
   - Use "New Form Submission" if it's a form with payment
4. Click **Continue**
5. **Connect Zeffy Account**:
   - Click "Sign in to Zeffy"
   - Authorize Zapier to access your Zeffy account
6. Click **Continue**
7. **Test Trigger**:
   - Zapier will pull in a recent submission from Zeffy
   - Review the data to make sure it looks correct
   - Click **Continue**

---

### 3.2 Map Zeffy Fields (Important!)

Look at the test data Zapier pulled from Zeffy. You'll see field names like:
- `First Name`
- `Last Name`
- `Email Address`
- `Membership Type`
- `Billing Frequency`
- etc.

**Write down the exact field names** - you'll need them in the next step.

---

### 3.3 Set Up the Action (Webhook)

1. Click **"+"** to add an action
2. **Action App**: Search for "Webhooks by Zapier"
3. **Action Event**: Select **"POST"**
4. Click **Continue**
5. **Set up action**:

**URL:**
```
https://miamibusinesscouncil.com/api/zeffy-webhook
```

**Payload Type:** Select **"json"**

**Data:** Map the Zeffy fields to the webhook format. Click "+ Add New Field" for each:

| Key | Value (from Zeffy trigger) |
|-----|----------------------------|
| `firstName` | First Name |
| `lastName` | Last Name |
| `email` | Email Address |
| `phone` | Phone Number |
| `company` | Company Name |
| `jobTitle` | Job Title |
| `membershipType` | Membership Type |
| `billingFrequency` | Billing Frequency |
| `amount` | Amount |
| `zeffyTransactionId` | Transaction ID |
| `industry` | Industry (if you collect this) |
| `employeeCount` | Employee Count (if you collect this) |
| `incorporated` | Incorporated Status (if you collect this) |
| `interests` | Interests (if you collect this) |

**Important Notes:**
- For `membershipType`: Make sure the Zeffy field returns one of: `individual`, `nonprofit`, or `business`
- For `billingFrequency`: Make sure it returns either `monthly` or `annual`
- If your Zeffy fields are named differently, use the exact names you saw in Step 3.2

**Headers:** Leave blank (not needed)

**Wrap Request In Array:** Leave **OFF**

**Unflatten:** Leave **OFF**

**Basic Auth:** Leave blank

6. Click **Continue**

---

### 3.4 Test the Webhook

1. Click **"Test action"**
2. Zapier will send the test data to your webhook
3. You should see a success response like:
```json
{
  "success": true,
  "message": "Member created successfully from Zeffy payment",
  "member_id": "...",
  "email": "test@example.com"
}
```

4. If you get an error, check:
   - The field mapping is correct
   - The membershipType is one of: individual, nonprofit, business
   - The billingFrequency is either: monthly, annual
   - The email address is valid

---

### 3.5 Turn On Your Zap

1. Give your Zap a name: **"Zeffy to MBC Portal"**
2. Click **"Publish"** or **"Turn on Zap"**
3. Your integration is now live!

---

## Step 4: Test with a Real Payment

### 4.1 Make a Test Payment in Zeffy

1. Use Zeffy's test mode if available
2. Or make a real $1 payment to yourself
3. Fill out the form completely

### 4.2 Verify It Worked

Check that the following happened automatically:

✅ **Zapier Zap History:**
- Go to Zapier Dashboard → Zap History
- Should show successful run

✅ **Member Created in Portal:**
- Log into Supabase
- Check the `members` table
- New member should be there

✅ **Welcome Email Sent:**
- Check the test email inbox
- Should receive welcome email with magic link

✅ **Magic Link Works:**
- Click the magic link in email
- Should log into portal successfully

---

## Step 5: Monitor Your Integration

### Zapier Task Usage

Check your Zapier dashboard to see task usage:
- Free plan: 100 tasks/month
- 1 new member = 1 task
- You'll get notified when approaching limit

### Zap History

Review the Zap history regularly:
- See all successful runs
- Check for any errors
- Debug issues if members aren't being created

---

## Troubleshooting

### Member Not Created

**Check Zapier Zap History:**
1. Go to Zapier → Dashboard → Zap History
2. Look for red X (error) icons
3. Click to see error details

**Common Issues:**

❌ **"Invalid membership type"**
- Check your Zeffy form field for Membership Type
- Make sure it returns: individual, nonprofit, or business (lowercase)
- Update the Zap mapping if needed

❌ **"Invalid billing frequency"**
- Check your Zeffy form field for Billing Frequency
- Make sure it returns: monthly or annual (lowercase)
- Update the Zap mapping if needed

❌ **"Missing required fields"**
- Ensure firstName, lastName, and email are mapped
- Check that these fields are required in your Zeffy form

❌ **"Email send failed"**
- This doesn't stop member creation
- Member will still be created, just no email sent
- They can use "Request Magic Link" on portal login page

### Webhook Errors

If you see errors in Zapier about the webhook:

1. **Check webhook URL is correct:**
   ```
   https://miamibusinesscouncil.com/api/zeffy-webhook
   ```

2. **Check JSON payload is valid:**
   - Go to Zap History → Click failed run
   - View the "Data Out" section
   - Make sure field names match the webhook expectations

3. **Check Vercel deployment:**
   - Go to https://vercel.com
   - Check that the webhook endpoint is deployed
   - Review function logs for errors

---

## Field Mapping Reference

### Required Fields (must have)

| Webhook Field | Zeffy Field Example | Description |
|--------------|---------------------|-------------|
| `firstName` | First Name | Member's first name |
| `lastName` | Last Name | Member's last name |
| `email` | Email Address | Member's email (must be valid) |

### Important Fields (recommended)

| Webhook Field | Zeffy Field Example | Description |
|--------------|---------------------|-------------|
| `membershipType` | Membership Type | Must be: individual, nonprofit, or business |
| `billingFrequency` | Billing Frequency | Must be: monthly or annual |
| `amount` | Amount | Payment amount |
| `phone` | Phone Number | Member's phone number |
| `company` | Company Name | Business/organization name |

### Optional Fields

| Webhook Field | Zeffy Field Example | Description |
|--------------|---------------------|-------------|
| `jobTitle` | Job Title | Member's role |
| `industry` | Industry | Business industry |
| `employeeCount` | Employee Count | Company size |
| `incorporated` | Incorporated | Yes/No/Nonprofit |
| `interests` | Interests | Why they're joining |
| `zeffyTransactionId` | Transaction ID | Zeffy payment ID |
| `zeffyCustomerId` | Customer ID | Zeffy customer ID |

---

## Apply for Zapier Nonprofit Discount

Once your Zap is working and you need more than 100 tasks/month:

1. Go to https://zapier.com/non-profits
2. Fill out the nonprofit application form
3. Upload your 501(c)(3) documentation
4. Get approved for 15% discount
5. Upgrade to Professional plan: $16.99/month (with discount)

This gives you 750 tasks/month (750 new members).

---

## Cost Breakdown

### Free Forever Option (recommended to start)
- **Zapier Free:** $0 (100 members/month)
- **Zeffy:** $0 (100% free for nonprofits)
- **Total:** $0/month

### If You Exceed 100 Members/Month
- **Zapier Professional (nonprofit discount):** $16.99/month (750 members/month)
- **Zeffy:** $0 (still free)
- **Total:** $16.99/month

### vs. Stripe Costs (what you're saving)
- **Stripe fees:** ~$313/month for 30 members
- **Annual savings with Zeffy:** ~$3,756/year

---

## What Happens When Someone Pays

Here's the complete flow:

1. **Member fills out Zeffy form** → Selects membership type and billing frequency
2. **Member pays via Zeffy** → Payment processed (100% free, no fees)
3. **Zeffy triggers Zapier** → "New Donation" event fires
4. **Zapier sends data to webhook** → POST request to your portal API
5. **Webhook creates member:**
   - Creates Supabase auth user
   - Creates member record in database
   - Generates magic link
   - Sends welcome email
6. **Member receives email** → With magic link to portal
7. **Member clicks link** → Automatically logged into portal
8. **Member can access:**
   - Member directory
   - Collaboration Hub
   - Event registration
   - Profile management

All happens automatically in under 60 seconds!

---

## Support

**Issues with Zeffy:**
- Contact Zeffy support: support@zeffy.com

**Issues with Zapier:**
- Zapier Help Center: https://help.zapier.com
- Zapier Community: https://community.zapier.com

**Issues with Portal/Webhook:**
- Check Vercel function logs
- Review Supabase database
- Contact developer

---

## Next Steps

1. ✅ Complete Zapier setup following this guide
2. ✅ Test with a real payment
3. ✅ Monitor for 1 week to ensure it's working
4. ✅ Update your website to link to Zeffy form instead of Stripe
5. ✅ Apply for Zapier nonprofit discount if needed

You're all set! Your members will now be automatically added to the portal when they pay through Zeffy, completely fee-free.
