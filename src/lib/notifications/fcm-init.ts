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
        // 1. SERVICE WORKER RESOLUTION STRATEGY
        //
        // iOS PWA Standalone Issue: When a new SW is deployed, it enters
        // 'waiting' state because the PWA window is always open, blocking
        // the old SW from releasing control. The SW never becomes 'active'
        // unless we explicitly send it SKIP_WAITING first.
        //
        // Strategy:
        //   Step A: Get the current registration (any state)
        //   Step B: Send SKIP_WAITING to unblock any 'waiting' SW
        //   Step C: Use navigator.serviceWorker.ready to get the truly
        //           active registration. This promise will only resolve
        //           when there's a confirmed active SW.
        // ============================================================

        // Step A: Get current registration to check for waiting SW
        let activeRegistration: ServiceWorkerRegistration;
        try {
            // Pre-emptive: unlock any waiting SW so .ready can resolve
            const existingReg = await navigator.serviceWorker.getRegistration('/');
            if (existingReg?.waiting) {
                console.log('[FCM] Sending SKIP_WAITING to unlock new SW...');
                existingReg.waiting.postMessage({ type: 'SKIP_WAITING' });
                existingReg.waiting.postMessage({ type: 'WINDOW_SKIP_WAITING' });
            }
        } catch (e) {
            // Non-fatal: just log and proceed
            console.warn('[FCM] Pre-SKIP_WAITING check failed (non-fatal):', e);
        }

        // Step C: Wait for an active registration via .ready (up to 15s)
        const READY_TIMEOUT_MS = 15000;
        const readyOrTimeout = await Promise.race([
            navigator.serviceWorker.ready,
            new Promise<null>((resolve) => setTimeout(() => resolve(null), READY_TIMEOUT_MS))
        ]);

        if (!readyOrTimeout) {
            // Still no active SW after 15s — trigger automatic reload
            console.error('[FCM] No active SW after timeout. Triggering reload...');
            window.location.reload();
            // Throw to prevent further execution (reload is async)
            throw new Error('Sistem notifikasi membutuhkan memuat ulang aplikasi. Sedang dilakukan...');
        }

        activeRegistration = readyOrTimeout;
        console.log('[FCM] Active SW ready (Scope: ' + activeRegistration.scope + ')');

        // 2. Send Firebase config to service worker (optional postMessage)
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
