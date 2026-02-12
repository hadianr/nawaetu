// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

// CRITICAL: Hardcoding config so the SW can initialize itself even if the app is KILLED
const firebaseConfig = {
    apiKey: "AIzaSyCF_p9-d5lnGNfqarHnn3zgIOSALDYYF5g",
    authDomain: "nawaetu-fd026.firebaseapp.com",
    projectId: "nawaetu-fd026",
    storageBucket: "nawaetu-fd026.firebasestorage.app",
    messagingSenderId: "567398306395",
    appId: "1:567398306395:web:10809537542e640553a57e",
    measurementId: "G-XBSZFB4L8Q"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

console.log('[SW] Firebase Messaging initialized automatically');

// Set up background message handler IMMEDIATELY
// Set up background message handler IMMEDIATELY
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] 🔔 Received background message:', payload);
    // CRITICAL: PROHIBIT manual display here if payload has 'notification' key.
    // The browser/OS will automatically show the notification from the payload.
    // Calling showNotification here causes DUPLICATES.

    // Only handle data-only messages manually if needed (future proofing)
    if (!payload.notification && payload.data) {
        const title = payload.data.title || 'Nawaetu';
        const body = payload.data.body || '';
        return self.registration.showNotification(title, {
            body,
            icon: '/icon.png',
            tag: 'nawaetu-data-msg'
        });
    }
});

// CRITICAL: Raw Push Event Listener REMOVED to avoid duplicates
// The Firebase SDK (messaging.onBackgroundMessage) and the OS (APNS) should handle delivery.
// If "Kill App" delivery fails, it is an APNS Payload issue, not a Service Worker issue.

// Lifecycle listeners removed to prevent conflicts with PWA library (next-pwa)
// The PWA library already handles activation and reload logic gracefully.

// CRITICAL: Listen for SKIP_WAITING message from app
// This allows us to force activate new SW immediately without waiting for page close
self.addEventListener('message', (event) => {
    console.log('[SW] Message received:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('[SW] 🚀 SKIP_WAITING triggered! Force activating new SW...');
        self.skipWaiting().catch(err => {
            console.error('[SW] skipWaiting failed:', err);
        });
    }
});

// Handle notification click with robust window opening
self.addEventListener('notificationclick', function (event) {
    console.log('[SW] Notification clicked:', event.notification.tag);
    event.notification.close();

    // Standard PWA Window Open/Focus logic
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(function (clientList) {
                // Focus if already open
                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i];
                    if (client.url.includes('/') && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Open new if not
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
    );
});

// End of Service Worker
