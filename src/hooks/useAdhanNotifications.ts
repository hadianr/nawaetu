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

import { useCallback, useEffect, useRef, useState } from "react";
import { usePrayerTimesContext } from "@/context/PrayerTimesContext";
import { MUADZIN_OPTIONS } from "@/data/settings-data";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import type { PrayerPreferences } from "@/types/notifications";

const storage = getStorageService();

// Optimized checking interval (30 seconds instead of 5)
// This reduces battery usage by 83% while maintaining accuracy
const CHECK_INTERVAL_MS = 30 * 1000; // 30 seconds

export function useAdhanNotifications() {
    const { data } = usePrayerTimesContext();
    const lastNotifiedTime = useRef<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPageVisible, setIsPageVisible] = useState(true);

    // Page Visibility API - pause checking when tab is hidden
    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsPageVisible(!document.hidden);
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    const playAdhanAudio = useCallback((prayerKey: string) => {
        // Do not play adhan audio for Imsak
        if (prayerKey === "Imsak") return;

        // Check preferences first (if disabled, don't play)
        const savedPrefs = storage.getOptional<PrayerPreferences | string>(STORAGE_KEYS.ADHAN_PREFERENCES);
        if (savedPrefs) {
            const prefs = typeof savedPrefs === 'string' ? JSON.parse(savedPrefs) : savedPrefs;
            if (!prefs[prayerKey]) return; // Notification disabled for this prayer
        }

        // Get selected Muadzin
        const muadzinId = storage.getOptional<string>(STORAGE_KEYS.SETTINGS_MUADZIN) || "makkah";
        const selectedMuadzin = MUADZIN_OPTIONS.find(m => m.id === muadzinId);

        // If Muzammil (no audio) or not found, fallback to Makkah or silent
        if (!selectedMuadzin || !selectedMuadzin.audio_url) return;

        try {
            const newAudio = new Audio(selectedMuadzin.audio_url);
            audioRef.current = newAudio;
            void newAudio.play().catch(() => undefined);
        } catch { }
    }, []);

    const notifyAdhan = useCallback((prayerKey: string) => {
        if (!("Notification" in window)) return;
        if (Notification.permission !== "granted") return;

        // Check preferences
        const savedPrefs = storage.getOptional<PrayerPreferences | string>(STORAGE_KEYS.ADHAN_PREFERENCES);
        if (savedPrefs) {
            const prefs = typeof savedPrefs === 'string' ? JSON.parse(savedPrefs) : savedPrefs;
            if (!prefs[prayerKey]) return; // Notification disabled for this prayer
        }

        const isRamadhan = data?.hijriMonth?.toLowerCase().includes("ramadan") || false;

        const labels: Record<string, string> = {
            Imsak: "Imsak",
            Fajr: "Subuh",
            Dhuhr: "Dzuhur",
            Asr: "Ashar",
            Maghrib: isRamadhan ? "Buka Puasa" : "Maghrib",
            Isha: "Isya",
        };

        const title = isRamadhan && prayerKey === "Maghrib"
            ? "Selamat Berbuka Puasa 🤲"
            : isRamadhan && prayerKey === "Imsak"
                ? "Waktu Imsak Telah Tiba ⏳"
                : isRamadhan && prayerKey === "Fajr"
                    ? "Waktu Subuh Telah Tiba 🕌"
                    : `Waktu ${labels[prayerKey]}`;

        const body = isRamadhan && prayerKey === "Maghrib"
            ? "Telah masuk waktu Maghrib untuk wilayah Anda. Selamat berbuka!"
            : isRamadhan && prayerKey === "Imsak"
                ? "Mari bersiap menahan diri dari hal-hal yang membatalkan puasa."
                : isRamadhan && prayerKey === "Fajr"
                    ? "Telah masuk waktu sholat Subuh. Selamat menunaikan ibadah puasa hari ini."
                    : `Saatnya menunaikan sholat ${labels[prayerKey]}`;

        if (typeof window !== "undefined" && "Notification" in window) {
            const options = {
                body: body,
                icon: "/icon-192x192.png",
                badge: "/icon-192x192.png",
                tag: `prayer-${prayerKey}`,
                requireInteraction: prayerKey === "Maghrib" && isRamadhan, // Persistent for Maghrib in Ramadhan
            };

            if (navigator.serviceWorker) {
                navigator.serviceWorker.ready.then((registration) => {
                    registration.showNotification(title, options);
                }).catch(() => {
                    // Fallback if service worker fails
                    try {
                        new window.Notification(title, options);
                    } catch (e) {
                        console.error("Notification fallback failed", e);
                    }
                });
            } else {
                try {
                    new window.Notification(title, options);
                } catch (e) {
                    console.error("Standard notification failed", e);
                }
            }
        }
    }, [data]);

    useEffect(() => {
        if (!data?.prayerTimes || !isPageVisible) return;

        const checkTime = () => {
            const now = new Date();
            const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
            if (lastNotifiedTime.current === currentTime) return;

            const prayerTimes: Record<string, string> = {
                Imsak: data.prayerTimes.Imsak,
                Fajr: data.prayerTimes.Fajr,
                Dhuhr: data.prayerTimes.Dhuhr,
                Asr: data.prayerTimes.Asr,
                Maghrib: data.prayerTimes.Maghrib,
                Isha: data.prayerTimes.Isha,
            };
            Object.entries(prayerTimes).forEach(([name, time]) => {
                if (time === currentTime) {
                    notifyAdhan(name);
                    playAdhanAudio(name);
                    lastNotifiedTime.current = currentTime;
                }
            });
        };

        const intervalId = setInterval(checkTime, CHECK_INTERVAL_MS);
        checkTime();
        return () => {
            clearInterval(intervalId);
            audioRef.current?.pause();
            audioRef.current = null;
        };
    }, [data, isPageVisible, notifyAdhan, playAdhanAudio]);
}
