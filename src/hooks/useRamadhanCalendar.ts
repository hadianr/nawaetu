/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * Dynamic Hijri & Ramadan Calendar Hook
 */

import { useState, useCallback, useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { API_CONFIG } from "@/config/apis";
import { fetchWithTimeout } from "@/lib/utils/fetch";
import { AladhanCalendarResponse, AladhanDayData } from "@/types/aladhan";

const storage = getStorageService();

const HIJRI_MONTHS = [
    "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
    "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
    "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
];

export interface RamadhanDay {
    gregorianDate: string; // "19 Feb 2026"
    hijriDate: string;     // "1 Ramadan 1447H"
    hijriDay: number;      // 1
    hijriMonth: string;    // "Ramadan"
    timings: {
        Imsak: string;
        Subuh: string;
        Maghrib: string;
        Isya: string;
    };
    isToday: boolean;
}

export type CalendarViewMode = "current_month" | "ramadan";

export function useRamadhanCalendar() {
    const [calendarData, setCalendarData] = useState<RamadhanDay[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<CalendarViewMode>("current_month");
    const [activeHijriTitle, setActiveHijriTitle] = useState<string>("");

    // Clear data on adjustment change to force refetch
    useEffect(() => {
        const handleAdjustmentChange = () => {
            setCalendarData([]);
        };
        window.addEventListener('hijri_adjustment_changed', handleAdjustmentChange);
        return () => window.removeEventListener('hijri_adjustment_changed', handleAdjustmentChange);
    }, []);

    const fetchCalendar = useCallback(async (mode: CalendarViewMode = viewMode) => {
        setLoading(true);
        setError(null);

        try {
            // Get Location
            const cachedLocation = storage.getOptional<{ lat: number; lng: number }>(STORAGE_KEYS.USER_LOCATION);
            if (!cachedLocation || !cachedLocation.lat || !cachedLocation.lng) {
                setLoading(false);
                return;
            }
            const lat = cachedLocation.lat;
            const lng = cachedLocation.lng;

            // Get Settings
            const savedMethod = storage.getOptional<string>(STORAGE_KEYS.SETTINGS_CALCULATION_METHOD);
            const method = (typeof savedMethod === 'string' ? savedMethod : savedMethod) || "20";

            const savedAdjustment = storage.getOptional<string>(STORAGE_KEYS.SETTINGS_HIJRI_ADJUSTMENT);
            const parsedAdj = parseInt(String(savedAdjustment || "-1"), 10);
            const activeAdj = isNaN(parsedAdj) ? -1 : parsedAdj;

            // Dynamic Date Calculations based on current time
            const now = new Date();
            const currentGregorianYear = now.getFullYear();
            const currentGregorianMonth = now.getMonth() + 1; // 1-indexed

            let targetRequests: { year: number; month: number }[] = [];

            if (mode === "current_month") {
                // Fetch current Gregorian month and next month for full Hijri month coverage
                targetRequests = [
                    { year: currentGregorianYear, month: currentGregorianMonth },
                    {
                        year: currentGregorianMonth === 12 ? currentGregorianYear + 1 : currentGregorianYear,
                        month: currentGregorianMonth === 12 ? 1 : currentGregorianMonth + 1
                    }
                ];
            } else {
                // Ramadan mode: calculate upcoming or current Ramadan months
                // Ramadan typically falls around Feb/Mar in 2026, Jan/Feb in 2027, etc.
                const ramadanStartMonth = currentGregorianMonth > 4 ? currentGregorianMonth : 2;
                targetRequests = [
                    { year: currentGregorianYear, month: ramadanStartMonth },
                    { year: currentGregorianYear, month: ramadanStartMonth + 1 }
                ];
            }

            // Coordinate-based Maghrib correction
            const getMaghribCorrection = (userLat: number, userLng: number): number => {
                const R = 6371;
                const dLat = (userLat - (-6.9175)) * Math.PI / 180;
                const dLng = (userLng - 107.6191) * Math.PI / 180;
                const a = Math.sin(dLat / 2) ** 2
                    + Math.cos(-6.9175 * Math.PI / 180) * Math.cos(userLat * Math.PI / 180)
                    * Math.sin(dLng / 2) ** 2;
                const distKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                return distKm <= 25 ? 8 : 3;
            };

            const tuneParam = method === "20"
                ? `&tune=2,2,0,4,4,${getMaghribCorrection(lat, lng)},0,2,0`
                : "";

            const requests = targetRequests.map(req =>
                fetchWithTimeout(
                    `${API_CONFIG.ALADHAN.BASE_URL}/calendar/${req.year}/${req.month}?latitude=${lat}&longitude=${lng}&method=${method}&adjustment=${activeAdj}${tuneParam}`,
                    {},
                    { timeoutMs: 10000 }
                ).then(res => res.json() as Promise<AladhanCalendarResponse>)
            );

            const updates = await Promise.all(requests);

            const allDays: AladhanDayData[] = [];
            updates.forEach(update => {
                if (update.data && Array.isArray(update.data)) {
                    allDays.push(...update.data);
                }
            });

            // Format today's date for exact string match
            const todayStr = `${now.getDate().toString().padStart(2, "0")}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getFullYear()}`;

            const parsedDays: RamadhanDay[] = [];
            let detectedHijriMonth = "";

            allDays.forEach(dayDat => {
                const timings = dayDat.timings;
                const hijri = dayDat.date.hijri;
                const greg = dayDat.date.gregorian;

                // Client-side Adjustment Logic
                let hDay = parseInt(hijri.day, 10);
                let hMonthIndex = (hijri.month.number) - 1;
                let hYear = parseInt(hijri.year, 10);

                hDay += activeAdj;

                if (hDay < 1) {
                    hMonthIndex--;
                    if (hMonthIndex < 0) { hMonthIndex = 11; hYear--; }
                    hDay += 30;
                } else if (hDay > 30) {
                    hDay -= 30;
                    hMonthIndex++;
                    if (hMonthIndex > 11) { hMonthIndex = 0; hYear++; }
                }

                const hMonthName = HIJRI_MONTHS[hMonthIndex] || hijri.month.en;

                if (greg.date === todayStr && !detectedHijriMonth) {
                    detectedHijriMonth = `${hMonthName} ${hYear}H`;
                }

                const isRamadhanMonth = hMonthName.toLowerCase().includes("ramada") || hMonthName.toLowerCase().includes("ramadhan");

                // Filter condition
                if (mode === "ramadan" ? isRamadhanMonth : true) {
                    parsedDays.push({
                        gregorianDate: `${greg.day} ${greg.month.en} ${greg.year}`,
                        hijriDate: `${hDay} ${hMonthName} ${hYear}H`,
                        hijriDay: hDay,
                        hijriMonth: hMonthName,
                        timings: {
                            Imsak: timings.Imsak.split(" ")[0],
                            Subuh: timings.Fajr.split(" ")[0],
                            Maghrib: timings.Maghrib.split(" ")[0],
                            Isya: timings.Isha.split(" ")[0]
                        },
                        isToday: greg.date === todayStr
                    });
                }
            });

            // If current_month mode, limit to the current active Hijri month days
            let finalDays = parsedDays;
            if (mode === "current_month" && detectedHijriMonth) {
                const currentMonthName = detectedHijriMonth.split(" ")[0];
                finalDays = parsedDays.filter(d => d.hijriMonth === currentMonthName);
            }

            finalDays.sort((a, b) => a.hijriDay - b.hijriDay);

            setCalendarData(finalDays);
            setActiveHijriTitle(detectedHijriMonth || (finalDays[0]?.hijriDate ? finalDays[0].hijriDate.split(" ").slice(1).join(" ") : "Jadwal Hijriah"));

        } catch (err) {
            Sentry.captureException(err);
            setError(err instanceof Error ? err.message : "Gagal memuat jadwal");
        } finally {
            setLoading(false);
        }
    }, [viewMode]);

    return {
        calendarData,
        loading,
        error,
        fetchCalendar,
        viewMode,
        setViewMode,
        activeHijriTitle
    };
}
