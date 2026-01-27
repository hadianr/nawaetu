"use client";

import { useEffect, useRef } from "react";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";

export function useAdhanNotifications() {
    const { data } = usePrayerTimes();
    const lastNotifiedTime = useRef<string | null>(null);

    useEffect(() => {
        if (!data) return;

        const checkTime = () => {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, "0");
            const minutes = now.getMinutes().toString().padStart(2, "0");
            const currentTime = `${hours}:${minutes}`;

            // Prevent double notification in the same minute
            if (lastNotifiedTime.current === currentTime) return;

            // Map keys
            const prayerTimes: Record<string, string> = {
                Fajr: data.fajr,
                Dhuhr: data.dhuhr,
                Asr: data.asr,
                Maghrib: data.maghrib,
                Isha: data.isha,
            };

            // Check if current time matches any prayer time
            Object.entries(prayerTimes).forEach(([name, time]) => {
                if (time === currentTime) {
                    notifyAdhan(name);
                    lastNotifiedTime.current = currentTime;
                }
            });
        };

        // Check every 30 seconds to be safe
        const intervalId = setInterval(checkTime, 30000);
        return () => clearInterval(intervalId);
    }, [data]);
}

function notifyAdhan(prayerKey: string) {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    // Check preferences
    const savedPrefs = localStorage.getItem("adhan_preferences");
    if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        if (!prefs[prayerKey]) return; // Notification disabled for this prayer
    }

    const labels: Record<string, string> = {
        Fajr: "Subuh",
        Dhuhr: "Dzuhur",
        Asr: "Ashar",
        Maghrib: "Maghrib",
        Isha: "Isya",
    };

    const label = labels[prayerKey] || prayerKey;

    new Notification(`Waktunya Sholat ${label}`, {
        body: `Hai Sobat Nawaetu, saatnya menunaikan sholat ${label} untuk wilayah Anda.`,
        icon: "/icon.png", // Assuming PWA icon exists, or fallback
        badge: "/icon.png",
        dir: "ltr",
        tag: `adhan-${prayerKey}` // Prevent duplicates
    });
}
