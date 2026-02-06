// public/firebase-messaging-sw.js
// Service Worker for Firebase Cloud Messaging
// Config is injected dynamically from the main app to avoid hardcoding secrets

importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

console.log('[SW] Firebase Messaging Service Worker loading...');

// Firebase config will be set via postMessage from the main app
let firebaseApp = null;
let messaging = null;

// Listen for config from main app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'FIREBASE_CONFIG') {
        console.log('[SW] Received Firebase config from main app');

        if (!firebaseApp) {
            firebaseApp = firebase.initializeApp(event.data.config);
            messaging = firebase.messaging();
            console.log('[SW] Firebase Messaging initialized');

            // Set up background message handler
            messaging.onBackgroundMessage((payload) => {
                console.log('[SW] 🔔 Received background message:', payload);

                const notificationTitle = payload.notification?.title || 'Nawaetu';
                const notificationOptions = {
                    body: payload.notification?.body || '',
                    icon: '/icon.png',
                    badge: '/icon.png',
                    data: payload.data,
                    tag: 'nawaetu-notification',
                    requireInteraction: false,
                };

                console.log('[SW] 📢 Showing notification:', notificationTitle);

                return self.registration.showNotification(notificationTitle, notificationOptions);
            });
        }
    }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked:', event.notification.tag);
    event.notification.close();

    // Open the app
    event.waitUntil(
        clients.openWindow('/')
    );
});

console.log('[SW] Service Worker ready (waiting for config)');
