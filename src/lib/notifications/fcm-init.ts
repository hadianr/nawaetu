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

        // ============================================================
        // SERVICE WORKER RESOLUTION
        // ============================================================
        // Best practice for Next-PWA: Use the primary SW which imports firebase-messaging-sw.js.
        // If we use multiple scopes, iOS Safari frequently drops Firebase Push events.

        let activeRegistration: ServiceWorkerRegistration | null = null;

        try {
            // Wait for next-pwa to register its worker
            activeRegistration = await Promise.race([
                navigator.serviceWorker.ready,
                new Promise<ServiceWorkerRegistration>((_, reject) => setTimeout(() => reject(new Error('READY_TIMEOUT')), 15000))
            ]);
        } catch (e: any) {
            // Fallback manual registration if next-pwa completely failed (e.g. dev mode)
            console.warn('[FCM] Timeout waiting for PWA SW. Forcing fallback registration...');
            activeRegistration = await navigator.serviceWorker.register('/sw.js');
        }

        if (!activeRegistration) {
            throw new Error("Gagal menginisiasi Service Worker.");
        }

        console.log('[FCM] SW registered (Scope: ' + activeRegistration.scope + ')');

        // Send Firebase config to service worker
        if (activeRegistration.active) {
            activeRegistration.active.postMessage({
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
                    serviceWorkerRegistration: activeRegistration,
                });
            } catch (err: any) {
                if (retries > 0) {
                    await new Promise(res => setTimeout(res, delay));
                    return getTokenWithRetry(retries - 1, delay * 2);
                }
                throw err;
            }
        };

        const tokenPromise = getTokenWithRetry();
        const token = await Promise.race([
            tokenPromise,
            new Promise<null>((_, reject) => setTimeout(() => reject(new Error('TOKEN_TIMEOUT')), 20000))
        ]).catch((e: any) => {
            if (e.message === 'TOKEN_TIMEOUT') {
                throw new Error("Sistem sedang mensinkronisasi data latar belakang. Mohon tunggu sekitar 20 detik, lalu coba aktifkan kembali.");
            }
            if (e.message.includes('getting push subscription required') || e.message.includes('A call to PushManager.subscribe() failed')) {
                throw new Error("Browser sedang menyiapkan koneksi notifikasi. Coba Refresh halaman dan aktifkan kembali.");
            }
            throw e;
        });

        if (token) {
            localStorage.setItem("fcm_token", token);
            return token;
        } else {
            console.warn("[FCM] getToken returned null");
            return null;
        }
    } catch (error: any) {
        console.error("[FCM Setup Error Detail]", {
            message: error.message,
            code: error.code,
            stack: error.stack
        });

        if (error.message.includes("Registration failed") || error.message.includes("NetworkError")) {
            // Add breadcrumb for this specific failure
            Sentry.addBreadcrumb({
                category: 'fcm',
                message: `Initialization failed: ${error.message}`,
                level: 'error',
                data: { code: error.code }
            });
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
