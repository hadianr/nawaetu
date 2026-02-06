"use client";

import { useEffect } from "react";
import { subscribeForegroundMessages } from "@/lib/notifications/fcm-init";

export default function FCMHandler() {
    useEffect(() => {
        console.log("🚀 FCMHandler mounting...");

        // Wait a bit for messaging to initialize
        const timer = setTimeout(() => {
            console.log("📡 Attempting to subscribe to FCM messages...");

            // Subscribe to foreground messages
            subscribeForegroundMessages((payload) => {
                console.log("🔔 FCM Message received in handler:", payload);

                // Show notification for foreground messages
                if (payload.notification) {
                    const { title, body } = payload.notification;

                    console.log("📢 Attempting to show notification:", { title, body });

                    // Check if we have permission
                    if (Notification.permission === "granted") {
                        try {
                            const notification = new Notification(title || "Nawaetu", {
                                body: body || "",
                                icon: "/icon.png",
                                badge: "/icon.png",
                                tag: "nawaetu-notification",
                                requireInteraction: false,
                            });

                            console.log("✅ Notification displayed successfully:", title);

                            // Auto-close after 5 seconds
                            setTimeout(() => notification.close(), 5000);
                        } catch (error) {
                            console.error("❌ Error showing notification:", error);
                        }
                    } else {
                        console.warn("⚠️ Notification permission not granted:", Notification.permission);
                    }
                } else {
                    console.warn("⚠️ Payload has no notification field:", payload);
                }
            });
        }, 1000); // Wait 1 second for messaging to initialize

        console.log("✅ FCM Handler initialized");

        return () => clearTimeout(timer);
    }, []);

    return null; // This component doesn't render anything
}
