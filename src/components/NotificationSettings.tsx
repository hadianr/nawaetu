"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, MapPin } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { registerServiceWorkerAndGetToken } from "@/lib/notifications/fcm-init";
import { DEFAULT_PRAYER_PREFERENCES, type PrayerPreferences } from "@/types/notifications";
import { useLocale } from "@/context/LocaleContext";
import { SETTINGS_TRANSLATIONS } from "@/data/settings-translations";

export default function NotificationSettings() {
    const { locale } = useLocale();
    const t = SETTINGS_TRANSLATIONS[locale as keyof typeof SETTINGS_TRANSLATIONS];
    const [isEnabled, setIsEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [fcmToken, setFcmToken] = useState<string | null>(null);
    const [preferences, setPreferences] = useState<PrayerPreferences>(DEFAULT_PRAYER_PREFERENCES);

    useEffect(() => {
        // Check if notifications are already enabled
        const token = localStorage.getItem("fcm_token");
        if (token) {
            setFcmToken(token);
            setIsEnabled(true);
            loadPreferences(token);
        }
    }, []);

    async function loadPreferences(token: string) {
        // Load saved preferences from localStorage
        const saved = localStorage.getItem("prayer_preferences");
        if (saved) {
            try {
                setPreferences(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse preferences:", e);
            }
        }
    }

    async function toggleNotifications() {
        if (isEnabled) {
            // Disable notifications
            setIsEnabled(false);
            setFcmToken(null);
            localStorage.removeItem("fcm_token");
            localStorage.removeItem("prayer_preferences");
        } else {
            // Enable notifications
            setIsLoading(true);
            try {
                const token = await registerServiceWorkerAndGetToken();
                if (token) {
                    setFcmToken(token);
                    setIsEnabled(true);

                    // Subscribe to backend
                    await fetch("/api/notifications/subscribe", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ token }),
                    });

                    // Save default preferences
                    await savePreferences(token, preferences);
                }
            } catch (error) {
                console.error("Failed to enable notifications:", error);
            } finally {
                setIsLoading(false);
            }
        }
    }

    async function savePreferences(token: string, prefs: PrayerPreferences) {
        try {
            // Save to localStorage
            localStorage.setItem("prayer_preferences", JSON.stringify(prefs));

            // Get user location if available
            const locationStr = localStorage.getItem("userLocation");
            let userLocation = null;
            if (locationStr) {
                try {
                    const loc = JSON.parse(locationStr);
                    userLocation = {
                        lat: loc.latitude,
                        lng: loc.longitude,
                        city: loc.city || "Unknown",
                    };
                } catch (e) {
                    console.error("Failed to parse location:", e);
                }
            }

            // Get timezone
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

            // Update backend
            await fetch("/api/notifications/preferences", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    prayerPreferences: prefs,
                    userLocation,
                    timezone,
                }),
            });
        } catch (error) {
            console.error("Failed to save preferences:", error);
        }
    }

    async function togglePrayer(prayer: keyof PrayerPreferences) {
        const newPrefs = { ...preferences, [prayer]: !preferences[prayer] };
        setPreferences(newPrefs);

        if (fcmToken) {
            await savePreferences(fcmToken, newPrefs);
        }
    }

    const prayerNames = {
        fajr: t.fajr,
        dhuhr: t.dhuhr,
        asr: t.asr,
        maghrib: t.maghrib,
        isha: t.isha,
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                    {isEnabled ? (
                        <Bell className="w-5 h-5 text-emerald-600" />
                    ) : (
                        <BellOff className="w-5 h-5 text-gray-400" />
                    )}
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            {t.prayerNotifications}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {isEnabled
                                ? t.notificationsEnabled
                                : t.notificationsDisabled}
                        </p>
                    </div>
                </div>
                <Switch
                    checked={isEnabled}
                    onCheckedChange={toggleNotifications}
                    disabled={isLoading}
                />
            </div>

            {isEnabled && (
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                        {t.selectPrayerTimes}
                    </h4>

                    {(Object.keys(preferences) as Array<keyof PrayerPreferences>).map(
                        (prayer) => (
                            <div
                                key={prayer}
                                className="flex items-center justify-between py-2"
                            >
                                <span className="text-gray-700 dark:text-gray-300 capitalize">
                                    {prayerNames[prayer]}
                                </span>
                                <Switch
                                    checked={preferences[prayer]}
                                    onCheckedChange={() => togglePrayer(prayer)}
                                />
                            </div>
                        )
                    )}

                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                                {t.notificationLocationNote}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
