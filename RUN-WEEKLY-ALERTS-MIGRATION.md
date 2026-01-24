# Run Weekly Alerts Database Migration

## Quick Steps (2 minutes)

### 1. Open Supabase SQL Editor
- Go to: https://supabase.com/dashboard
- Navigate to your project: `vsnvtujkkkbjpuuwxvyd`
- Click **SQL Editor** in the left sidebar
- Click **New query**

### 2. Copy and Run Migration
- Open the file: `ADD-WEEKLY-ALERTS-COLUMN.sql`
- Copy all the SQL code
- Paste into the SQL Editor
- Click **Run** button (or press Ctrl+Enter / Cmd+Enter)

### 3. Verify Success
You should see output like:

```
column_name              | data_type | column_default
-------------------------|-----------|----------------
weekly_alerts_enabled    | boolean   | false

alerts_enabled | alerts_disabled | total_members
---------------|-----------------|---------------
0              | 6               | 6
```

This confirms:
- ✅ Column was added successfully
- ✅ Default value is `false` (members must opt-in)
- ✅ All 6 existing members have alerts disabled by default

---

## What This Enables

Once this migration runs, the weekly alerts toggle in the portal will:

1. **Save member preferences** - When members toggle the switch, it saves to the database
2. **Load on visit** - When members visit Smart Matches, it loads their saved preference
3. **Enable future automation** - The backend can query members with `weekly_alerts_enabled = true` to send emails

---

## Testing the Toggle

After running the migration:

1. **Deploy the updated portal**
   ```bash
   git push
   ```

2. **Log into the portal** as any member

3. **Go to Smart Matches** section

4. **Toggle "Weekly Match Alerts"** on

5. **Refresh the page**

6. **Verify** the toggle is still ON (preference was saved)

7. **Check database** to confirm:
   ```sql
   SELECT email, weekly_alerts_enabled
   FROM members
   WHERE email = 'your-test-email@example.com';
   ```

---

## What Happens Next

After the toggle is working, we can build:

1. **Weekly email system** - Server-side cron job to run every Sunday 7pm
2. **Email template** - Beautiful email with 3-5 curated match previews
3. **Dashboard notifications** - Alert badge when new matches are available
4. **Match quality tracking** - Analytics on which matches lead to connections

---

## Rollback (if needed)

If something goes wrong:

```sql
-- Remove the column
ALTER TABLE members DROP COLUMN IF EXISTS weekly_alerts_enabled;

-- Remove the index
DROP INDEX IF EXISTS idx_members_weekly_alerts;
```

---

## Need Help?

**Supabase Dashboard:** https://supabase.com/dashboard
**Project ID:** vsnvtujkkkbjpuuwxvyd
**Table:** members
**Column to add:** weekly_alerts_enabled (BOOLEAN, default false)
