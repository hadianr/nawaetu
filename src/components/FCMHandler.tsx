"use client";

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
