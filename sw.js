// Miami Business Council Member Portal - Service Worker
const CACHE_NAME = 'mbc-portal-v1.0';
const urlsToCache = [
  '/',
  '/member-portal.html',
  '/member-login.html',
  '/index.html',
  '/Images/MBC BLACK LOGO NONTRANSPARENT (1).png',
  'https://unpkg.com/@supabase/supabase-js@2',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('[SW] Cache install failed:', error);
      })
  );
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Strategy - Network First with Cache Fallback
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If we get a valid response, clone it and store in cache
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        // Network failed, try to get from cache
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response;
            }
            // If not in cache, return offline page or error
            if (event.request.destination === 'document') {
              return caches.match('/member-portal.html');
            }
            return new Response('Offline - Content not available', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Handle background sync for chat messages
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'chat-sync') {
    event.waitUntil(syncChatMessages());
  }
});

// Handle push notifications for new messages
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let notificationData = {
    title: 'Miami Business Council',
    body: 'You have a new message',
    icon: '/Images/MBC BLACK LOGO NONTRANSPARENT (1).png',
    badge: '/Images/MBC BLACK LOGO NONTRANSPARENT (1).png',
    tag: 'mbc-message',
    renotify: true,
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'View Message',
        icon: '/Images/MBC BLACK LOGO NONTRANSPARENT (1).png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    data: {
      url: '/member-portal.html#messages',
      timestamp: Date.now()
    }
  };

  // Parse push data if available
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = { ...notificationData, ...pushData };
    } catch (e) {
      console.error('[SW] Error parsing push data:', e);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification);
  
  event.notification.close();
  
  if (event.action === 'view' || !event.action) {
    const url = event.notification.data?.url || '/member-portal.html#messages';
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Check if app is already open
          for (const client of clientList) {
            if (client.url.includes('member-portal.html') && 'focus' in client) {
              return client.focus();
            }
          }
          // If not open, open new window
          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
    );
  }
});

// Sync chat messages when connection restored
async function syncChatMessages() {
  try {
    console.log('[SW] Syncing chat messages...');
    
    // Get pending messages from IndexedDB
    const pendingMessages = await getPendingMessages();
    
    if (pendingMessages.length > 0) {
      console.log(`[SW] Found ${pendingMessages.length} pending messages to sync`);
      
      // Send pending messages
      for (const message of pendingMessages) {
        try {
          await sendMessage(message);
          await removePendingMessage(message.id);
        } catch (error) {
          console.error('[SW] Failed to sync message:', error);
        }
      }
    }
    
    console.log('[SW] Chat sync completed');
  } catch (error) {
    console.error('[SW] Chat sync failed:', error);
    throw error;
  }
}

// Helper functions for message sync
async function getPendingMessages() {
  // Implementation would use IndexedDB
  return [];
}

async function sendMessage(message) {
  // Implementation would send to server
  return Promise.resolve();
}

async function removePendingMessage(messageId) {
  // Implementation would remove from IndexedDB
  return Promise.resolve();
}