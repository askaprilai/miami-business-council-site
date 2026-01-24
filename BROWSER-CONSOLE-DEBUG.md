# 🔍 Browser Console Debug Script

## Run This in Your Browser Console

Open the member portal, press **Cmd + Option + J** (Chrome/Brave) to open the console, then paste this:

```javascript
// Check which version of the portal is loaded
console.log('=== PORTAL VERSION CHECK ===');
console.log('Look for this message in console when page loaded:');
console.log('Expected: "🚀 Portal Version 2.0 Loaded - Real Stats, No Fake Messages"');
console.log('\n');

// Check if simulateResponse function exists (it shouldn't!)
console.log('=== CHECKING FOR AUTO-RESPONSE CODE ===');
console.log('simulateResponse function exists:', typeof window.simulateResponse !== 'undefined');
console.log('Expected: false (function should NOT exist)');
console.log('\n');

// Check current member
console.log('=== CURRENT MEMBER ===');
console.log('Current member:', currentMember);
console.log('\n');

// Check messages in database for current conversation
if (currentChatMember && currentMember) {
    console.log('=== LOADING MESSAGES FROM DATABASE ===');
    console.log('Chat partner:', currentChatMember);

    supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentMember.id},recipient_id.eq.${currentChatMember.id}),and(sender_id.eq.${currentChatMember.id},recipient_id.eq.${currentMember.id})`)
        .order('created_at', { ascending: true })
        .then(({ data, error }) => {
            if (error) {
                console.error('Database error:', error);
            } else {
                console.log(`Found ${data.length} messages in database:`);
                data.forEach((msg, i) => {
                    console.log(`\nMessage ${i + 1}:`);
                    console.log('  Sender ID:', msg.sender_id);
                    console.log('  Recipient ID:', msg.recipient_id);
                    console.log('  Text:', msg.message_text);
                    console.log('  Created:', msg.created_at);
                    console.log('  Is from me:', msg.sender_id === currentMember.id);
                });
            }
        });
} else {
    console.log('No active conversation - open a chat first, then run this script again');
}
```

## What to Look For

### 1. Version Check
**Good:** You see "🚀 Portal Version 2.0 Loaded" when page loads
**Bad:** You DON'T see that message → Browser cache is serving old code

### 2. Auto-Response Function Check
**Good:** `simulateResponse function exists: false`
**Bad:** `simulateResponse function exists: true` → Old code is loaded

### 3. Database Messages
Look at the messages list. For each "auto-response" you see:
- Check `Is from me: false` → This means SOMEONE ELSE sent it (it's real, not auto-generated)
- Check the `Created` timestamp → If it's from hours/days ago, it's an OLD message stuck in database

## The Solution

If messages are OLD messages in the database:

1. Go to Supabase SQL Editor
2. Run: `DELETE FROM messages;`
3. Clear browser cache (Cmd + Shift + Delete → All Time → Clear Data)
4. Reload portal
5. Send a NEW message
6. See if you get an auto-response this time

If you STILL get an auto-response after deleting all messages:
- Then there IS code somewhere generating responses (but I've searched everywhere and can't find it)
- OR there's a Supabase trigger/function auto-generating responses
