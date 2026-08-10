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

import { useEffect, useState } from "react";
import { onMessage } from "firebase/messaging";
import { registerServiceWorkerAndGetToken, messaging } from "@/lib/notifications/fcm-init";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

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
                            const loc = JSON.parse(storage);
                            if (loc.lat && loc.lng) {
                                userLocation = {
                                    lat: loc.lat,
                                    lng: loc.lng,
                                    name: loc.name || loc.city || null,
                                    city: loc.city || loc.name || null,
                                    country: loc.country || null,
                                    countryCode: loc.countryCode || null,
                                };
                            }
                        } catch (e) { }
                    }

                    // Get saved prayer preferences from localStorage
                    let prayerPreferences = null;
                    const savedPrefs = localStorage.getItem(STORAGE_KEYS.ADHAN_PREFERENCES as string);
                    if (savedPrefs) {
                        try {
                            prayerPreferences = JSON.parse(savedPrefs);
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
                            userLocation,
                            prayerPreferences,
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
