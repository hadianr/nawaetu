import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let messaging: Messaging | undefined;

if (typeof window !== "undefined") {
    try {
        messaging = getMessaging(app);
    } catch (err) {
        console.error("Failed to initialize Firebase Messaging:", err);
    }
}

/**
 * Register service worker and get FCM token
 */
export async function registerServiceWorkerAndGetToken(): Promise<string | null> {
    if (typeof window === "undefined" || !messaging) {
        console.warn("Not in browser environment or messaging not initialized");
        return null;
    }

    try {
        // Check if notifications are supported
        if (!("Notification" in window)) {
            console.error("This browser does not support notifications");
            return null;
        }

        // Request notification permission
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            console.warn("Notification permission not granted");
            return null;
        }

        // Register service worker
        const registration = await navigator.serviceWorker.register(
            "/firebase-messaging-sw.js"
        );
        console.log("Service Worker registered:", registration);

        // Wait for service worker to be ready
        await navigator.serviceWorker.ready;

        // Get FCM token
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        if (!vapidKey) {
            console.error("VAPID key not found in environment variables");
            return null;
        }

        const token = await getToken(messaging, {
            vapidKey,
            serviceWorkerRegistration: registration,
        });

        if (token) {
            console.log("FCM Token obtained:", token);
            // Store token in localStorage for easy access
            localStorage.setItem("fcm_token", token);
            return token;
        } else {
            console.warn("No FCM token available");
            return null;
        }
    } catch (error) {
        console.error("Error in registerServiceWorkerAndGetToken:", error);
        return null;
    }
}


/**
 * Subscribe to foreground messages
 */
export function subscribeForegroundMessages(callback: (payload: any) => void) {
    if (typeof window === "undefined") {
        console.warn("Not in browser environment");
        return;
    }

    if (!messaging) {
        console.warn("⚠️ Messaging not initialized yet");
        return;
    }

    try {
        onMessage(messaging, (payload) => {
            console.log("🔔 Foreground message received:", payload);
            callback(payload);
        });
        console.log("✅ FCM onMessage listener registered");
    } catch (error) {
        console.error("❌ Error subscribing to foreground messages:", error);
    }
}

export { app, messaging };
