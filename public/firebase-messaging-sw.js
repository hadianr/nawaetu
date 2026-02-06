// public/firebase-messaging-sw.js
// Updated to v10.14.1 - latest stable compat version (Feb 2026)
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

console.log('[SW] Firebase Messaging Service Worker loading...');

// These values are hardcoded in the SW because process.env is not available here.
// Note: These must match your .env.local values.
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

console.log('[SW] Firebase Messaging initialized');

// Handle background messages (when tab is not focused or closed)
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

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked:', event.notification.tag);
    event.notification.close();

    // Open the app
    event.waitUntil(
        clients.openWindow('/')
    );
});

console.log('[SW] Service Worker ready');
