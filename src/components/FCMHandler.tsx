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


                    // Check if we have permission
                    if (typeof window !== "undefined" && "Notification" in window && window.Notification.permission === "granted") {
                        try {
                            const notification = new window.Notification(title || "Nawaetu", {
                                body: body || "",
                                icon: "/icon.png",
                                badge: "/icon.png",
                                tag: "nawaetu-notification",
                                requireInteraction: false,
                            });


                            // Auto-close after 5 seconds
                            setTimeout(() => notification.close(), 5000);
                        } catch (error) {
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
