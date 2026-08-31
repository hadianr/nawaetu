// public/firebase-messaging-sw.js

// ── Focus Mode State ──────────────────────────────────────────────────────────
// Page sends FOCUS_MODE_ENTER / FOCUS_MODE_EXIT via BroadcastChannel
// We use this to suppress Nawaetu's own notifications during active Tilawah.
let isFocusMode = false;
try {
    const focusChannel = new BroadcastChannel('nawaetu_focus');
    focusChannel.onmessage = (event) => {
        if (event.data?.type === 'FOCUS_MODE_ENTER') isFocusMode = true;
        if (event.data?.type === 'FOCUS_MODE_EXIT')  isFocusMode = false;
        console.log('[SW] Focus mode:', isFocusMode);
    };
} catch {
    // BroadcastChannel not supported in older browsers — fail silently
}
// ─────────────────────────────────────────────────────────────────────────────

try {
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
    messaging.onBackgroundMessage((payload) => {
        console.log('[SW] 🔔 Received background message:', payload);

        // ── Focus Mode Suppression ────────────────────────────────────────────
        // If user is in Tilawah focus mode, suppress Nawaetu's own notifications
        // so they can read without interruption.
        if (isFocusMode) {
            console.log('[SW] 🔕 Suppressed notification during Focus Mode (Tilawah active)');
            return;
        }
        // ─────────────────────────────────────────────────────────────────────

        const title = payload.notification?.title || payload.data?.title || 'Nawaetu';
        const body = payload.notification?.body || payload.data?.body || '';
        const targetUrl = payload.data?.url || '/';
        return self.registration.showNotification(title, {
            body,
            icon: '/icon-192x192.png?v=1.5.7',
            badge: '/icon-192x192.png?v=1.5.7',
            tag: payload.messageId || 'nawaetu-notification',
            data: { url: targetUrl },
            requireInteraction: true,
        }).then(() => {
            console.log('[SW] ✅ Notification displayed:', title);
        }).catch((error) => {
            console.error('[SW] ❌ Notification display failed:', error);
            throw error;
        });
    });

} catch (error) {
    console.error('[SW] Firebase Messaging initialization failed in service worker (possibly offline, unsupported, or blocked by extension).', error);
}

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

    const targetUrl = event.notification.data?.url || '/jadwal-sholat';

    // Standard PWA Window Open/Focus logic
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(function (clientList) {
                // Focus if already open on same path or focus any app window
                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i];
                    if ('focus' in client) {
                        if ('navigate' in client) {
                            client.navigate(targetUrl);
                        }
                        return client.focus();
                    }
                }
                // Open new if app is closed
                if (clients.openWindow) {
                    return clients.openWindow(targetUrl);
                }
            })
    );
});

// End of Service Worker
