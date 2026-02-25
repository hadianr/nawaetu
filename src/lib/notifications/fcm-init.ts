import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";
import * as Sentry from "@sentry/nextjs";

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

/**
 * Lazy initialize messaging - only when user explicitly enables notifications
 * This prevents premature permission requests on mobile browsers
 */
function getMessagingInstance(): Messaging | undefined {
    if (typeof window === "undefined") {
        return undefined;
    }

    // Return existing instance if already initialized
    if (messaging) {
        return messaging;
    }

    // Initialize messaging only when needed
    try {
        messaging = getMessaging(app);
        return messaging;
    } catch (err) {
        console.error("[FCM] Failed to initialize messaging:", err);
        throw err;
    }
}

/**
 * Register service worker and get FCM token
 */
/**
 * Register service worker and get FCM token with robust retry logic
 */
export async function registerServiceWorkerAndGetToken(): Promise<string | null> {
    if (typeof window === "undefined") {
        return null;
    }

    // Initialize messaging only when user explicitly enables notifications
    const messagingInstance = getMessagingInstance();
    if (!messagingInstance) {
        return null;
    }

    try {
        // Check if notifications are supported
        if (!("Notification" in window)) {
            throw new Error("Peramban Anda tidak mendukung notifikasi.");
        }

        // Request notification permission
        const permission = await window.Notification.requestPermission();
        if (permission !== "granted") {
            throw new Error(`Izin notifikasi ditolak (${permission}).`);
        }

        // 1. Try to reuse the existing service worker registration (Best Practice for PWAs)
        // This avoids overlapping registrations that trigger page reloads.
        let serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

        try {
            // navigator.serviceWorker.ready is the most reliable way to get the active registration
            // We use a timeout as a fallback for development mode where PWA might be disabled
            const readyPromise = navigator.serviceWorker.ready;
            const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000));

            serviceWorkerRegistration = await Promise.race([readyPromise, timeoutPromise]);

            if (serviceWorkerRegistration) {
            }
        } catch (err) {
        }

        // 2. Fallback: Register manually if no ready worker found (e.g., first visit or Dev mode)
        if (!serviceWorkerRegistration) {
            serviceWorkerRegistration = await navigator.serviceWorker.register(
                "/firebase-messaging-sw.js"
            );
        }

        // 3. Ensure the worker is active before sending messages
        if (serviceWorkerRegistration.installing) {
            await new Promise<void>((resolve) => {
                serviceWorkerRegistration!.installing?.addEventListener('statechange', (e: any) => {
                    if (e.target.state === 'activated') resolve();
                });
                setTimeout(resolve, 2000); // Safety fallback
            });
        }

        // 4. Send Firebase config to service worker
        if (serviceWorkerRegistration.active) {
            serviceWorkerRegistration.active.postMessage({
                type: 'FIREBASE_CONFIG',
                config: firebaseConfig
            });
        }

        // Get FCM token with RETRY logic
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        if (!vapidKey) {
            throw new Error("VAPID key is missing from environment variables.");
        }

        const getTokenWithRetry = async (retries = 3, delay = 1000): Promise<string | null> => {
            try {
                // Note: We use the registration we found/created
                return await getToken(messagingInstance, {
                    vapidKey,
                    serviceWorkerRegistration: serviceWorkerRegistration!,
                });
            } catch (err: any) {
                if (retries > 0) {
                    await new Promise(res => setTimeout(res, delay));
                    return getTokenWithRetry(retries - 1, delay * 2);
                }
                throw err;
            }
        };

        const token = await getTokenWithRetry();

        if (token) {
            localStorage.setItem("fcm_token", token);
            return token;
        } else {
            return null;
        }
    } catch (error: any) {
        console.error("[FCM Setup Error]", error);

        if (error.message.includes("Registration failed")) {
            alert("Gagal registrasi Service Worker: " + error.message);
        } else {
            // Generic error
            console.error("FCM Initialization Error: " + error.message);
        }

        Sentry.captureException(error, {
            extra: {
                context: "fcm-init.registerServiceWorkerAndGetToken",
                hasServiceWorker: 'serviceWorker' in navigator,
                userAgent: navigator.userAgent
            }
        });

        // Throw the actual error so the UI can display it
        throw error;
    }
}


/**
 * Subscribe to foreground messages
 * Only works if messaging is already initialized (user has enabled notifications)
 */
export function subscribeForegroundMessages(callback: (payload: any) => void) {
    if (typeof window === "undefined") {
        return;
    }

    // Only subscribe if messaging is already initialized
    // Don't trigger initialization here to avoid permission requests
    if (!messaging) {
        return;
    }

    try {
        onMessage(messaging, (payload) => {
            callback(payload);
        });
    } catch (error) {
    }
}

export { app, messaging, onMessage };
