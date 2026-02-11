"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, MapPin, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { registerServiceWorkerAndGetToken } from "@/lib/notifications/fcm-init";
import { DEFAULT_PRAYER_PREFERENCES, type PrayerPreferences } from "@/types/notifications";
import { useLocale } from "@/context/LocaleContext";
import { SETTINGS_TRANSLATIONS } from "@/data/settings-translations";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

export default function NotificationSettings() {
    const { locale } = useLocale();
    const t = SETTINGS_TRANSLATIONS[locale as keyof typeof SETTINGS_TRANSLATIONS];

    // State Management
    const [isEnabled, setIsEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);
    const [fcmToken, setFcmToken] = useState<string | null>(null);
    const [preferences, setPreferences] = useState<PrayerPreferences>(DEFAULT_PRAYER_PREFERENCES);
    const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>("default");

    useEffect(() => {
        if (typeof window !== "undefined" && "Notification" in window) {
            setPermissionStatus(window.Notification.permission);

            // Check if notifications are already enabled (Token exists)
            const token = localStorage.getItem("fcm_token");
            if (token) {
                setFcmToken(token);
                setIsEnabled(true);
                loadPreferences(token);
            }
        }
    }, []);

    async function tryGetTokenSilently() {
        try {
            const token = await registerServiceWorkerAndGetToken();
            if (token) {
                setFcmToken(token);
                loadPreferences(token);
            }
        } catch (e) { }
    }

    async function loadPreferences(token: string) {
        const saved = localStorage.getItem(STORAGE_KEYS.ADHAN_PREFERENCES);
        if (saved) {
            try {
                setPreferences(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse preferences:", e);
            }
        }
    }

    // Step 1: Explicit Permission Request
    async function requestPermission() {
        if (!("Notification" in window)) {
            alert("Browser tidak mendukung notifikasi");
            return;
        }

        try {
            const permission = await window.Notification.requestPermission();
            setPermissionStatus(permission);
            if (permission !== "granted") {
                alert(t.notificationDenied);
            }
        } catch (error) {
            console.error("Error requesting permission:", error);
        }
    }

    function getCurrentLocation() {
        const locationStr = localStorage.getItem(STORAGE_KEYS.USER_LOCATION);
        if (locationStr) {
            try {
                const loc = JSON.parse(locationStr);
                // The app uses name/lat/lng in usePrayerTimes, but city/latitude/longitude elsewhere.
                // We handle both for maximum compatibility.
                return {
                    lat: loc.lat ?? loc.latitude ?? -6.2088,
                    lng: loc.lng ?? loc.longitude ?? 106.8456,
                    city: loc.name || loc.city || loc.locality || "Unknown",
                };
            } catch (e) {
                console.error("Failed to parse location from storage", e);
            }
        }
        // Default Fallback to Jakarta
        return {
            lat: -6.2088,
            lng: 106.8456,
            city: "Jakarta (Default)",
        };
    }

    // Step 2: Toggle Notifications (Only when Permission is GRANTED)
    async function toggleNotifications() {
        if (isEnabled) {
            // Disable
            setIsEnabled(false);
            setFcmToken(null);
            localStorage.removeItem("fcm_token");
            localStorage.removeItem(STORAGE_KEYS.ADHAN_PREFERENCES);
        } else {
            // Enable (Optimistic UI)
            setIsEnabled(true);
            setIsLoading(true);
            setIsInitializing(true);

            try {
                // Determine if we need to wait a bit for permission propagation?
                // Typically not needed if permissionStatus is already 'granted'

                const token = await registerServiceWorkerAndGetToken();

                if (token) {
                    setFcmToken(token);
                    const userLocation = getCurrentLocation();
                    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

                    // Single API Call (Upsert + Preferences + Location)
                    await fetch("/api/notifications/subscribe", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            token,
                            prayerPreferences: preferences,
                            userLocation,
                            timezone
                        }),
                    });
                } else {
                    throw new Error("Gagal mendapatkan token notifikasi. Pastikan internet lancar.");
                }
            } catch (error: any) {
                console.error("Failed to enable notifications:", error);
                alert("Gagal mengaktifkan notifikasi: " + (error.message || "Unknown error"));
                setIsEnabled(false);
                setFcmToken(null);
            } finally {
                setIsLoading(false);
                setIsInitializing(false);
            }
        }
    }

    async function savePreferences(token: string, prefs: PrayerPreferences) {
        try {
            localStorage.setItem(STORAGE_KEYS.ADHAN_PREFERENCES, JSON.stringify(prefs));
            const userLocation = getCurrentLocation();
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

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

    // RENDER: PRE-PERMISSION STATE
    if (permissionStatus === "default") {
        return (
            <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl text-center space-y-4">
                <div className="w-16 h-16 bg-[rgb(var(--color-primary))]/20 rounded-full flex items-center justify-center mx-auto mb-2 animate-pulse">
                    <Bell className="w-8 h-8 text-[rgb(var(--color-primary))]" />
                </div>
                <h3 className="text-lg font-bold text-white">
                    {(t as any).notificationPermissionTitle || "Aktifkan Notifikasi Sholat"}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed max-w-xs mx-auto">
                    {(t as any).notificationPermissionDesc || "Untuk mendapatkan pengingat waktu sholat, mohon izinkan akses notifikasi."}
                </p>
                <div className="pt-2">
                    <button
                        onClick={requestPermission}
                        className="w-full py-3 px-4 bg-[rgb(var(--color-primary))] text-white font-semibold rounded-xl shadow-lg shadow-[rgb(var(--color-primary))]/20 hover:opacity-90 transition-all active:scale-[0.98]"
                    >
                        {(t as any).notificationPermissionButton || "Izinkan Notifikasi"}
                    </button>
                </div>
            </div>
        );
    }

    // RENDER: DENIED STATE
    if (permissionStatus === "denied") {
        return (
            <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-2xl p-4 shadow-2xl flex items-start gap-3">
                <BellOff className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                    <h3 className="font-semibold text-red-400 text-sm mb-1">
                        {locale === 'id' ? 'Akses Ditolak' : 'Permission Denied'}
                    </h3>
                    <p className="text-xs text-red-400/80 leading-relaxed">
                        {t.notificationDenied}
                    </p>
                </div>
            </div>
        );
    }

    // RENDER: SETTINGS STATE (GRANTED)
    return (
        <div className="space-y-4">
            {/* Main Toggle Card - Glassmorphism Style */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl p-4 shadow-2xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {isEnabled ? (
                            <div className="w-10 h-10 rounded-xl bg-[rgb(var(--color-primary))]/20 border border-[rgb(var(--color-primary))]/30 flex items-center justify-center">
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 text-[rgb(var(--color-primary))] animate-spin" />
                                ) : (
                                    <Bell className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                                )}
                            </div>
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 text-white/60 animate-spin" />
                                ) : (
                                    <BellOff className="w-5 h-5 text-white/40" />
                                )}
                            </div>
                        )}
                        <div>
                            <h3 className="font-semibold text-white">
                                {t.prayerNotifications}
                            </h3>
                            <p className="text-sm text-white/50">
                                {isLoading
                                    ? (locale === 'id' ? 'Mengaktifkan...' : 'Enabling...')
                                    : isEnabled
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
                        {isInitializing ? (
                            // Skeleton loading state
                            <>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between py-3 px-3 bg-white/5 rounded-xl border border-white/5 animate-pulse"
                                    >
                                        <div className="h-4 bg-white/10 rounded w-20"></div>
                                        <div className="h-6 bg-white/10 rounded-full w-11"></div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            // Actual prayer toggles
                            (Object.keys(preferences) as Array<keyof PrayerPreferences>).map(
                                (prayer) => {
                                    const label = prayerNames[prayer.toLowerCase() as keyof typeof prayerNames] || prayer;
                                    return (
                                        <div
                                            key={prayer}
                                            className="flex items-center justify-between py-3 px-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all duration-200"
                                        >
                                            <span className="text-white/80 capitalize font-medium">
                                                {label}
                                            </span>
                                            <Switch
                                                checked={preferences[prayer]}
                                                onCheckedChange={() => togglePrayer(prayer)}
                                            />
                                        </div>
                                    );
                                }
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
