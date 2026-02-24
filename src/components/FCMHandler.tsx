"use client";

import { useEffect } from "react";
import { subscribeForegroundMessages } from "@/lib/notifications/fcm-init";

export default function FCMHandler() {
    useEffect(() => {

        // Wait a bit for messaging to initialize
        const timer = setTimeout(() => {

            // Subscribe to foreground messages
            subscribeForegroundMessages((payload) => {

                // Show notification for foreground messages
                if (payload.notification) {
                    const { title, body } = payload.notification;


                    if (typeof window !== "undefined" && "Notification" in window && window.Notification.permission === "granted") {
                        const notifTitle = title || "Nawaetu";
                        const options = {
                            body: body || "",
                            icon: "/icon.png",
                            badge: "/icon.png",
                            tag: "nawaetu-notification",
                            requireInteraction: false,
                        };

                        if (navigator.serviceWorker) {
                            navigator.serviceWorker.ready.then((registration) => {
                                registration.showNotification(notifTitle, options);
                                // Note: Auto-close is harder with service worker notifications
                                // It usually relies on the user or the notification action to close
                            }).catch(() => {
                                try {
                                    const notification = new window.Notification(notifTitle, options);
                                    setTimeout(() => notification.close(), 5000);
                                } catch (e) {
                                    console.error("Notification fallback failed", e);
                                }
                            });
                        } else {
                            try {
                                const notification = new window.Notification(notifTitle, options);
                                setTimeout(() => notification.close(), 5000);
                            } catch (error) {
                                console.error("Standard notification failed", error);
                            }
                        }
                    } else {
                    }
                } else {
                }
            });
        }, 1000); // Wait 1 second for messaging to initialize


        return () => clearTimeout(timer);
    }, []);

    return null; // This component doesn't render anything
}
