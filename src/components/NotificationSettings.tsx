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
            {/* Main Toggle Card - Glassmorphism Style */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl p-4 shadow-2xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {isEnabled ? (
                            <div className="w-10 h-10 rounded-xl bg-[rgb(var(--color-primary))]/20 border border-[rgb(var(--color-primary))]/30 flex items-center justify-center">
                                <Bell className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                            </div>
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                <BellOff className="w-5 h-5 text-white/40" />
                            </div>
                        )}
                        <div>
                            <h3 className="font-semibold text-white">
                                {t.prayerNotifications}
                            </h3>
                            <p className="text-sm text-white/50">
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
            </div>

            {/* Prayer Selection Card - Glassmorphism Style */}
            {isEnabled && (
                <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl p-4 shadow-2xl space-y-4">
                    <h4 className="font-semibold text-white text-sm">
                        {t.selectPrayerTimes}
                    </h4>

                    <div className="space-y-2">
                        {(Object.keys(preferences) as Array<keyof PrayerPreferences>).map(
                            (prayer) => (
                                <div
                                    key={prayer}
                                    className="flex items-center justify-between py-3 px-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all duration-200"
                                >
                                    <span className="text-white/80 capitalize font-medium">
                                        {prayerNames[prayer]}
                                    </span>
                                    <Switch
                                        checked={preferences[prayer]}
                                        onCheckedChange={() => togglePrayer(prayer)}
                                    />
                                </div>
                            )
                        )}
                    </div>

                    {/* Location Note - Glassmorphism Info Box */}
                    <div className="mt-4 p-3 bg-[rgb(var(--color-primary))]/10 backdrop-blur-sm rounded-xl border border-[rgb(var(--color-primary))]/20">
                        <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-[rgb(var(--color-primary))] mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-[rgb(var(--color-primary-light))]/90 leading-relaxed">
                                {t.notificationLocationNote}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
