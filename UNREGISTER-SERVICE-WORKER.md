# 🚨 CRITICAL: Unregister Service Worker NOW

## Did you run the unregister script yet?

The service worker is STILL serving the old cached portal with auto-responses.

---

## Run This Script in Browser Console

1. **Open member portal** in the browser you've been testing in
2. Press **Cmd + Option + J** (Chrome/Brave) to open DevTools Console
3. **Copy and paste this ENTIRE block** and press Enter:

```javascript
// STEP 1: Unregister ALL service workers
navigator.serviceWorker.getRegistrations().then(function(registrations) {
    console.log('Found ' + registrations.length + ' service worker(s)');

    for(let registration of registrations) {
        console.log('🗑️ Unregistering:', registration.scope);
        registration.unregister();
    }

    console.log('✅ All service workers unregistered!');
});

// STEP 2: Clear ALL caches
caches.keys().then(function(cacheNames) {
    console.log('Found ' + cacheNames.length + ' cache(s)');

    return Promise.all(
        cacheNames.map(function(cacheName) {
            console.log('🗑️ Deleting cache:', cacheName);
            return caches.delete(cacheName);
        })
    );
}).then(function() {
    console.log('✅ All caches cleared!');
});

// STEP 3: Instructions
setTimeout(() => {
    console.log('%c🔄 NOW DO THIS:', 'font-size: 20px; color: #d4af37; font-weight: bold;');
    console.log('1. Press Cmd+Shift+R to hard refresh');
    console.log('2. You should see "🚀 Portal Version 2.0 Loaded" in console');
    console.log('3. Test messaging again');
}, 1000);
```

4. **Wait for it to complete** (you'll see "✅ All caches cleared!")
5. **Press Cmd + Shift + R** to hard refresh the page
6. **Look for this message in console**: `🚀 Portal Version 2.0 Loaded - Real Stats, No Fake Messages`

---

## If You STILL See Auto-Responses After This...

Then run this in **Supabase SQL Editor** to check for database triggers:

```sql
-- Check if there's a database trigger auto-inserting responses
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'messages';
```

If that query returns ANY results, there's a database trigger auto-generating messages!

---

## After Unregistering:

1. Delete all messages in Supabase: `DELETE FROM messages;`
2. Refresh portal (should see Version 2.0 console message)
3. Send a test message
4. Tell me if you STILL get auto-responses
