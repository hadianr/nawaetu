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
import * as Sentry from "@sentry/browser";

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
        const serviceWorkerUrl = process.env.NODE_ENV === "development"
            ? "/firebase-messaging-sw.js"
            : "/sw.js";

        if (process.env.NODE_ENV !== "development") {
            try {
                const readyPromise = navigator.serviceWorker.ready;
                const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000));
                activeRegistration = (await Promise.race([readyPromise, timeoutPromise])) as ServiceWorkerRegistration | null;
            } catch (err) {
                console.warn("[FCM] Error waiting for service worker ready:", err);
            }
        }

        if (!activeRegistration) {
            activeRegistration = await navigator.serviceWorker.register(serviceWorkerUrl);
        }

        if (!activeRegistration) {
            throw new Error("Gagal menginisiasi Service Worker.");
        }

        // Wait for active service worker if installing or waiting
        if (!activeRegistration.active && (activeRegistration.installing || activeRegistration.waiting)) {
            const worker = activeRegistration.installing || activeRegistration.waiting;
            if (worker && worker.state !== 'activated') {
                await new Promise<void>((resolve) => {
                    const onStateChange = (e: any) => {
                        if (e.target.state === 'activated') {
                            worker.removeEventListener('statechange', onStateChange);
                            resolve();
                        }
                    };
                    worker.addEventListener('statechange', onStateChange);
                    setTimeout(resolve, 3000);
                });
            }
        }

        if (activeRegistration.active) {
            activeRegistration.active.postMessage({
                type: 'FIREBASE_CONFIG',
                config: firebaseConfig
            });
        }

        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        if (!vapidKey) {
            throw new Error("VAPID key is missing from environment variables.");
        }

        const getTokenWithRetry = async (retries = 2, delay = 1500): Promise<string | null> => {
            try {
                if (!activeRegistration?.active) {
                    const readyReg = await navigator.serviceWorker.ready.catch(() => null);
                    if (readyReg?.active) activeRegistration = readyReg;
                }

                if (!activeRegistration?.active) {
                    throw new Error("Subscription failed - no active Service Worker");
                }

                return await getToken(messagingInstance, {
                    vapidKey,
                    serviceWorkerRegistration: activeRegistration,
                });
            } catch (err: any) {
                if (retries > 0) {
                    console.warn(`[FCM] getToken failed (${err.message}). Retrying in ${delay}ms...`);
                    await new Promise((res) => setTimeout(res, delay));
                    return getTokenWithRetry(retries - 1, delay * 2);
                }
                throw err;
            }
        };

        const token = await getTokenWithRetry().catch((e: any) => {
            if (
                e.message === 'TOKEN_TIMEOUT' ||
                e.message?.includes('getting push subscription required') ||
                e.message?.includes('A call to PushManager.subscribe() failed') ||
                e.message?.includes('no active Service Worker') ||
                e.message?.includes('Subscription failed')
            ) {
                return null;
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
        const isKnownEnvironmentIssue = error.message?.includes("Sistem sedang mensinkronisasi") ||
            error.message?.includes("Browser belum siap") ||
            error.message?.includes("Izin notifikasi ditolak") ||
            error.message?.includes("Peramban Anda tidak mendukung") ||
            error.message?.includes("Registration failed - push service error") ||
            error.message?.includes("no active Service Worker") ||
            error.message?.includes("Subscription failed") ||
            error.name === "AbortError";

        if (isKnownEnvironmentIssue) {
            Sentry.addBreadcrumb({
                category: 'fcm',
                message: error.message || "FCM initialization skipped (known environment limitation)",
                level: 'warning',
            });
            return null;
        }

        console.error("[FCM Setup Error Detail]: " + (error.message || "Unknown error"), error);

        if (error.message?.includes("Registration failed") || error.message?.includes("NetworkError")) {
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
