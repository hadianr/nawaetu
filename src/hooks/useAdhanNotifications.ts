"use client";

import { useEffect, useRef } from "react";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { MUADZIN_OPTIONS } from "@/data/settings-data";

export function useAdhanNotifications() {
    const { data } = usePrayerTimes();
    const lastNotifiedTime = useRef<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (!data || !data.prayerTimes) return;

        const checkTime = () => {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, "0");
            const minutes = now.getMinutes().toString().padStart(2, "0");
            const currentTime = `${hours}:${minutes}`;

            // Prevent double notification in the same minute
            if (lastNotifiedTime.current === currentTime) return;

            // Map keys correctly from data.prayerTimes
            const prayerTimes: Record<string, string> = {
                Fajr: data.prayerTimes.Fajr,
                Dhuhr: data.prayerTimes.Dhuhr,
                Asr: data.prayerTimes.Asr,
                Maghrib: data.prayerTimes.Maghrib,
                Isha: data.prayerTimes.Isha,
            };

            // Check if current time matches any prayer time
            Object.entries(prayerTimes).forEach(([name, time]) => {
                if (time === currentTime) {
                    notifyAdhan(name);
                    playAdhanAudio(name);
                    lastNotifiedTime.current = currentTime;
                }
            });
        };

        // Check every 5 seconds for better precision
        const intervalId = setInterval(checkTime, 5000);
        return () => {
            clearInterval(intervalId);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [data]);

    const playAdhanAudio = (prayerKey: string) => {
        // Check preferences first (if disabled, don't play)
        const savedPrefs = localStorage.getItem("adhan_preferences");
        if (savedPrefs) {
            const prefs = JSON.parse(savedPrefs);
            if (!prefs[prayerKey]) return; // Notification disabled for this prayer
        }

        // Get selected Muadzin
        const muadzinId = localStorage.getItem("settings_muadzin") || "makkah";
        const selectedMuadzin = MUADZIN_OPTIONS.find(m => m.id === muadzinId);

        // If Muzammil (no audio) or not found, fallback to Makkah or silent
        if (!selectedMuadzin || !selectedMuadzin.audio_url) return;

        try {
            const newAudio = new Audio(selectedMuadzin.audio_url);
            audioRef.current = newAudio;
            newAudio.play().catch(e => console.error("Autoplay prevented or failed:", e));
        } catch (e) {
            console.error("Failed to play Adhan audio", e);
        }
    };

    const notifyAdhan = (prayerKey: string) => {
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

        try {
            new Notification(`Waktunya Sholat ${label}`, {
                body: `Hai Sobat Nawaetu, saatnya menunaikan sholat ${label} untuk wilayah Anda.`,
                icon: "/icon.png",
                badge: "/icon.png",
                tag: `adhan-${prayerKey}`,
                requireInteraction: true // Keep notification until clicked
            });
        } catch (e) {
            console.error("Notification failed", e);
        }
    }
}
