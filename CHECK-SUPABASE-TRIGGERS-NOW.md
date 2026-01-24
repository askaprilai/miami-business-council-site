# 🚨 URGENT: Check for Database Triggers in Supabase

The auto-responses are coming from somewhere OUTSIDE the portal code.

## Run This in Supabase SQL Editor RIGHT NOW:

### 1. Check for triggers on messages table
```sql
SELECT
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'messages'
AND event_object_schema = 'public';
```

**If this returns ANY rows**, there's a trigger auto-inserting messages!

### 2. Check for ALL functions in your database
```sql
SELECT
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_definition ILIKE '%message%';
```

### 3. Check for Edge Functions
Go to **Supabase Dashboard** → **Edge Functions** (in the left sidebar)

Do you see ANY edge functions listed? Screenshot what you see.

### 4. Check for Webhooks
Go to **Supabase Dashboard** → **Database** → **Webhooks**

Do you see ANY webhooks? Screenshot what you see.

### 5. Check actual messages in database
```sql
SELECT
    id,
    sender_id,
    recipient_id,
    message_text,
    created_at,
    (SELECT email FROM members WHERE id = sender_id) as sender_email,
    (SELECT email FROM members WHERE id = recipient_id) as recipient_email
FROM messages
ORDER BY created_at DESC
LIMIT 20;
```

**Show me the results** - are these auto-responses actually being INSERTED into the database, or are they just appearing in the UI?

---

## What to Look For:

If query #1 returns ANY results, **copy the entire output** and send it to me. That's the trigger causing auto-responses.

If query #2 returns ANY functions with "message" or "response" in them, **send me the function names**.

The auto-responses MUST be coming from:
- A database trigger
- An edge function
- A webhook
- OR they're old messages that never got deleted

Run these queries NOW and send me the results!
