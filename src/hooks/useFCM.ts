"use client";

import { useEffect, useState } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "@/lib/notifications/fcm-init";

export function useFCM() {
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        if (!messaging) return;

        const requestPermissionAndGetToken = async () => {
            try {
                const permission = await Notification.requestPermission();
                if (permission === "granted") {
                    const currentToken = await getToken(messaging!, {
                        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
                    });
                    if (currentToken) {
                        setToken(currentToken);
                        console.log("FCM Token:", currentToken);

                        // Get current location from storage if available
                        const storage = typeof window !== 'undefined' ? localStorage.getItem("nawaetu_user_location") : null;
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
                    } else {
                        console.warn("No registration token available. Request permission to generate one.");
                    }
                }
            } catch (err) {
                console.error("An error occurred while retrieving token:", err);
            }
        };

        requestPermissionAndGetToken();

        // Listen for foreground messages
        const unsubscribe = onMessage(messaging, (payload) => {
            console.log("Foreground message received:", payload);
            // You can show a toast or a custom UI notification here
            if (payload.notification) {
                const { title, body } = payload.notification;
                // For foreground, we usually show a toast
                // but we can also use native notification if needed
                new Notification(title || "Nawaetu", { body });
            }
        });

        return () => unsubscribe();
    }, []);

    return { token };
}
