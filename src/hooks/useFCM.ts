"use client";

import { useEffect, useState } from "react";
import { onMessage } from "firebase/messaging";
import { registerServiceWorkerAndGetToken, messaging } from "@/lib/notifications/fcm-init";

export function useFCM() {
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        // Only run on client
        if (typeof window === "undefined") return;

        const initFCM = async () => {
            try {
                // Use the centralized robust function
                const currentToken = await registerServiceWorkerAndGetToken();

                if (currentToken) {
                    setToken(currentToken);

                    // Get current location from storage if available
                    const userLocationKey = "user_location";
                    const storage = localStorage.getItem(userLocationKey);
                    let userLocation = null;
                    if (storage) {
                        try {
                            const parsed = JSON.parse(storage);
                            if (parsed.lat && parsed.lng) {
                                userLocation = { lat: parsed.lat, lng: parsed.lng };
                            }
                        } catch (e) { }
                    }

                    // Send token to backend with metadata
                    await fetch("/api/notifications/subscribe", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            token: currentToken,
                            deviceType: "web",
                            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                            userLocation: userLocation
                        }),
                    });
                }
            } catch (err) {
            }
        };

        // Check if permission is already granted or if we should request it
        // We only auto-init if we already have permission to avoid annoying prompts
        if (typeof window !== "undefined" && "Notification" in window && window.Notification.permission === "granted") {
            initFCM();
        }

        // Listen for foreground messages
        if (messaging) {
            const unsubscribe = onMessage(messaging, (payload) => {
                if (payload.notification && typeof window !== "undefined" && "Notification" in window) {
                    const { title, body } = payload.notification;
                    const options = { body };
                    const notifTitle = title || "Nawaetu";

                    if (navigator.serviceWorker) {
                        navigator.serviceWorker.ready.then((registration) => {
                            registration.showNotification(notifTitle, options);
                        }).catch(() => {
                            try {
                                new window.Notification(notifTitle, options);
                            } catch (e) {
                                console.error("Notification fallback failed", e);
                            }
                        });
                    } else {
                        try {
                            new window.Notification(notifTitle, options);
                        } catch (e) {
                            console.error("Standard notification failed", e);
                        }
                    }
                }
            });
            return () => unsubscribe();
        }
    }, []);

    return { token };
}
