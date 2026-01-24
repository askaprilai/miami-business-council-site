# 🧪 Deployment Test Checklist

**Date:** 2026-01-24
**Deployment:** Quick Wins Improvements

---

## ✅ What We Just Deployed

1. **Message Input Validation** - Protection against spam and XSS
2. **Test Files Cleanup** - Removed 7 debug files
3. **Today's Insights** - Real data from database (no more fake numbers)
4. **Dashboard Stats** - Real counts for messages, events, connections
5. **Profile Photo** - Shows on dashboard avatar
6. **Onboarding Checklist** - Auto-hides at 100% completion

---

## 🔍 Testing Steps

### Test 1: Dashboard - Today's Insights (Real Data)

**Location:** Dashboard tab

**Steps:**
1. Log in to portal
2. Go to Dashboard tab
3. Scroll to "Today's Insights" section

**Expected Results:**
- ✅ Shows real number of potential matches (based on business opportunities overlap)
- ✅ Shows "You have X pending connection requests" if any exist
- ✅ Shows real upcoming event dates (not "in 6 days")
- ✅ If no data exists, section should be empty or show "No insights available"
- ❌ Should NOT show: "3 new potential matches", "2 members viewed your profile", "Next event in 6 days"

**Pass/Fail:** __________

---

### Test 2: Dashboard - Real Stats

**Location:** Dashboard tab - top stats cards

**Steps:**
1. Count your actual connections in the Connections tab
2. Count your actual messages in the Messages tab
3. Go back to Dashboard

**Expected Results:**
- ✅ Connections count matches actual number
- ✅ Messages count matches actual number (sent + received)
- ✅ Events count matches number of events you've registered for
- ✅ Profile photo appears in dashboard avatar (if uploaded)

**Pass/Fail:** __________

---

### Test 3: Message Validation - Empty Message

**Location:** Messages tab

**Steps:**
1. Go to Messages tab
2. Click on any conversation
3. Try to send an empty message (just spaces or nothing)
4. Click Send

**Expected Results:**
- ✅ Message should NOT be sent
- ✅ No error popup (just silently prevents)
- ✅ Input field remains empty

**Pass/Fail:** __________

---

### Test 4: Message Validation - Long Message

**Location:** Messages tab

**Steps:**
1. Copy this text 50 times into the message box:
   `This is a test message to verify the character limit works correctly. `
2. Click Send

**Expected Results:**
- ✅ Alert appears: "Message is too long. Please keep it under 2000 characters."
- ✅ Message is NOT sent
- ✅ Can still edit and send a shorter message after

**Pass/Fail:** __________

---

### Test 5: Message Validation - XSS Protection

**Location:** Messages tab

**Steps:**
1. Try to send this message:
   ```
   <script>alert('test')</script>
   ```
2. Click Send

**Expected Results:**
- ✅ Alert appears: "Message contains invalid content. Please remove any HTML or script tags."
- ✅ Message is NOT sent
- ✅ Input field is NOT cleared (can edit)

**Alternative test:**
Try sending: `<iframe src="http://evil.com"></iframe>`
- ✅ Should also be blocked with same error

**Pass/Fail:** __________

---

### Test 6: Normal Message Sending

**Location:** Messages tab

**Steps:**
1. Send a normal, friendly message like: "Hey! Just testing the new portal improvements 😊"
2. Click Send

**Expected Results:**
- ✅ Message appears immediately in the thread
- ✅ No error messages
- ✅ Input field clears
- ✅ Can send another message right away
- ✅ Message appears in recipient's inbox (test by logging in as them)

**Pass/Fail:** __________

---

### Test 7: Onboarding Checklist Auto-Hide

**Location:** Dashboard tab

**Steps:**
1. If your profile is already 100% complete:
   - ✅ Onboarding checklist should NOT be visible

2. If your profile is NOT complete:
   - Go to Profile tab
   - Fill in all missing fields (phone, LinkedIn, bio, photo, business opportunities)
   - Save changes
   - Go back to Dashboard
   - ✅ Checklist should disappear

**Expected Results:**
- ✅ Checklist visible if profile < 100%
- ✅ Checklist hidden if profile = 100%
- ✅ No "You're all set!" message (entire card disappears)

**Pass/Fail:** __________

---

### Test 8: Profile Photo on Dashboard

**Location:** Dashboard tab - top right avatar

**Steps:**
1. If you have a profile photo uploaded:
   - ✅ Photo should appear in circular avatar

2. If you DON'T have a profile photo:
   - ✅ Initials should appear (like "AS" for April Sabral)

**Expected Results:**
- ✅ Dashboard avatar shows photo or initials
- ✅ Sidebar avatar also shows photo or initials
- ✅ Both avatars match

**Pass/Fail:** __________

---

### Test 9: Connection Request (Correct Name)

**Location:** Member Directory

**Steps:**
1. Go to Member Directory tab
2. Click on a member you're NOT connected with (e.g., Alexis)
3. Click "Send Connection Request" in the profile modal
4. Confirm the request

**Expected Results:**
- ✅ Alert shows: "Connection request sent to [THEIR NAME]!" (e.g., "Alexis Smith")
- ✅ Should NOT show "April Sabral" or wrong name
- ✅ Request appears in recipient's Connections tab under "Pending"

**Pass/Fail:** __________

---

### Test 10: Test Files Removed

**Location:** GitHub repository or local folder

**Steps:**
1. Go to: https://github.com/askaprilai/miami-business-council-site
2. Check root directory

**Expected Results:**
- ❌ Should NOT see: test-email.html
- ❌ Should NOT see: test-deployment.html
- ❌ Should NOT see: test-profile-debug.html
- ❌ Should NOT see: FINAL-DEBUG.html
- ❌ Should NOT see: BLOG-DEBUG-ULTIMATE.html
- ✅ Should see: .gitignore with test file patterns

**Pass/Fail:** __________

---

## 🐛 Issues Found During Testing

**Issue 1:**
- **Description:**
- **Steps to Reproduce:**
- **Expected:**
- **Actual:**
- **Severity:** Critical / High / Medium / Low

**Issue 2:**
- **Description:**
- **Steps to Reproduce:**
- **Expected:**
- **Actual:**
- **Severity:** Critical / High / Medium / Low

---

## 📊 Overall Results

**Tests Passed:** ____ / 10
**Tests Failed:** ____ / 10
**Deployment Status:** ✅ PASS / ❌ FAIL / ⚠️ PARTIAL

**Notes:**


---

## 🎯 Next Steps

**If All Tests Pass:**
- ✅ Portal is production-ready
- ✅ Continue with Week 1 improvements from MORNING-ACTION-PLAN.md
- ✅ Monitor for user feedback

**If Tests Fail:**
- 🔧 Fix critical issues first
- 🧪 Re-test failed scenarios
- 🚀 Re-deploy fixes
- 🔄 Run this checklist again

---

## 🔗 Quick Links

- **Portal:** https://miamibusinesscouncil.com/portal
- **Login:** https://miamibusinesscouncil.com/member-login
- **Vercel Dashboard:** https://vercel.com
- **Supabase Dashboard:** https://supabase.com/dashboard
- **GitHub Repo:** https://github.com/askaprilai/miami-business-council-site

---

**Tester:** ________________
**Date Tested:** ________________
**Browser:** ________________
**Device:** ________________
