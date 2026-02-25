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
            // STEP A: Immediate check using getRegistrations() (very fast, no timeout needed)
            const registrations = await navigator.serviceWorker.getRegistrations();
            if (registrations && registrations.length > 0) {
                // Prefer the root scope worker (usually next-pwa sw.js)
                serviceWorkerRegistration = registrations.find(r => r.scope === window.location.origin + '/') || registrations[0];
                console.log("[FCM] Found immediate service worker registration (Scope: " + serviceWorkerRegistration.scope + ")");
            }

            // STEP B: If not found immediately, wait for .ready (up to 5s)
            if (!serviceWorkerRegistration) {
                const readyPromise = navigator.serviceWorker.ready;
                const timeoutWait = 5000;
                const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutWait));

                serviceWorkerRegistration = await Promise.race([readyPromise, timeoutPromise]);

                if (serviceWorkerRegistration) {
                    console.log("[FCM] Using delayed service worker registration (Scope: " + serviceWorkerRegistration.scope + ")");
                } else {
                    console.log("[FCM] navigator.serviceWorker.ready timed out after " + timeoutWait + "ms");
                }
            }
        } catch (err) {
            console.warn("[FCM] Ready check failed:", err);
            Sentry.addBreadcrumb({ category: 'fcm', message: 'Ready check failed', level: 'warning' });
        }

        // 2. Fallback: Register manually if no ready worker found
        if (!serviceWorkerRegistration) {
            const isDev = process.env.NODE_ENV === "development";
            console.log(`[FCM] Fallback registration check (isDev: ${isDev})`);

            try {
                // CRITICAL FIX: In Production, we MUST register the main next-pwa service worker (/sw.js)
                // If we register /firebase-messaging-sw.js directly in production, it will cause a scope 
                // conflict with next-pwa resulting in a NetworkError on iOS.
                const swUrl = isDev ? "/firebase-messaging-sw.js" : "/sw.js";
                console.log(`[FCM] Registering ${swUrl} manually...`);

                serviceWorkerRegistration = await navigator.serviceWorker.register(swUrl);
                console.log(`[FCM] Successfully registered fallback worker: ${swUrl}`);
            } catch (regErr: any) {
                console.error("[FCM] Manual registration failed:", regErr);
                Sentry.captureException(regErr, { extra: { context: `fcm-init.manual-register-fallback` } });
                throw regErr;
            }
        }

        // 3. Ensure the worker is active before sending messages
        if (!serviceWorkerRegistration) {
            console.warn("[FCM] Aborting initialization: No service worker registration found.");
            return null;
        }

        // CRITICAL FIX: Force wait for navigator.serviceWorker.ready before interacting
        // because Firebase absolutely requires an 'active' service worker to get a push subscription.
        if (!serviceWorkerRegistration.active) {
            console.log("[FCM] Worker not active, waiting for .ready promise...");
            try {
                const finalReadyReg = await Promise.race([
                    navigator.serviceWorker.ready,
                    new Promise<ServiceWorkerRegistration | null>(resolve => setTimeout(() => resolve(null), 8000))
                ]);
                if (finalReadyReg) {
                    serviceWorkerRegistration = finalReadyReg;
                }
            } catch (err) {
                console.error("[FCM] Error waiting for ready:", err);
            }
        }

        if (!serviceWorkerRegistration.active) {
            throw new Error("Pendaftaran Service Worker belum aktif (active=null). Notifikasi (FCM) membutuhkan Service Worker yang berjalan.");
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
