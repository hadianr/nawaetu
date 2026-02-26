/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
            // navigator.serviceWorker.ready is the most reliable way to get the active registration
            // We use a short 2s timeout to bypass New Install/Update PWA caching bottlenecks
            const readyPromise = navigator.serviceWorker.ready;
            const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000));

            activeRegistration = await Promise.race([readyPromise, timeoutPromise]) as ServiceWorkerRegistration | null;

            if (activeRegistration) {
                console.log("[FCM] Reusing ready service worker:", activeRegistration.scope);
            }
        } catch (err) {
            console.warn("[FCM] Error waiting for service worker ready:", err);
        }

        // Fallback: Register lightweight FCM worker manually if PWA is choking or dev mode
        if (!activeRegistration) {
            console.log("[FCM] No ready SW found (or precaching takes too long). Registering lightweight /firebase-messaging-sw.js...");
            activeRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
            console.log("[FCM] Firebase Service Worker registered manually:", activeRegistration.scope);
        }

        if (!activeRegistration) {
            throw new Error("Gagal menginisiasi Service Worker.");
        }

        // Ensure the worker is active before getting token (required by iOS Safari)
        if (activeRegistration.installing || activeRegistration.waiting) {
            console.log("[FCM] Worker is installing/waiting, waiting for activation...");
            await new Promise<void>((resolve) => {
                const worker = activeRegistration!.installing || activeRegistration!.waiting;
                if (!worker) return resolve();

                worker.addEventListener('statechange', (e: any) => {
                    if (e.target.state === 'activated') resolve();
                });

                // Fallback timeout since it's only 2KB, it should activate instantly
                setTimeout(resolve, 5000);
            });
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
                    serviceWorkerRegistration: activeRegistration as ServiceWorkerRegistration,
                });
            } catch (err: any) {
                if (retries > 0) {
                    const isSafariPushError = err.message?.includes('getting push subscription required') ||
                        err.message?.includes('A call to PushManager.subscribe() failed');
                    // Give Safari extra time to spin up PushManager after SW activation
                    const waitTime = isSafariPushError ? 2500 : delay;

                    console.warn(`[FCM] getToken failed. Retrying in ${waitTime}ms. Retries left: ${retries}. Error:`, err.message);
                    await new Promise(res => setTimeout(res, waitTime));

                    // Double check if the registration mysteriously died
                    if (!activeRegistration || !activeRegistration.active) {
                        const regs = await navigator.serviceWorker.getRegistrations();
                        if (regs.length > 0) activeRegistration = regs.find(r => r.scope === window.location.origin + '/') || regs[0];
                    }

                    return getTokenWithRetry(retries - 1, delay * 2);
                }
                throw err;
            }
        };

        const tokenPromise = getTokenWithRetry();
        const token = await Promise.race([
            tokenPromise,
            new Promise<null>((_, reject) => setTimeout(() => reject(new Error('TOKEN_TIMEOUT')), 35000))
        ]).catch((e: any) => {
            if (e.message === 'TOKEN_TIMEOUT') {
                throw new Error("Sistem sedang mensinkronisasi pengunduhan awal. Mohon tunggu sekitar 30 detik, lalu coba aktifkan kembali.");
            }
            if (e.message.includes('getting push subscription required') || e.message.includes('A call to PushManager.subscribe() failed')) {
                throw new Error("Browser belum siap menghubungkan profil Anda ke server. Coba Refresh halaman dan aktifkan kembali.");
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
