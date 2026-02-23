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
    hijriDate: string; // "1 Ramadan 1447H"
    hijriDay: number; // 1
    hijriMonth: string; // "Ramadan"
    timings: {
        Imsak: string;
        Subuh: string;
        Maghrib: string;
        Isya: string;
    };
    isToday: boolean;
}

export function useRamadhanCalendar() {
    const [calendarData, setCalendarData] = useState<RamadhanDay[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Clear data on adjustment change to force refetch
    useEffect(() => {
        const handleAdjustmentChange = () => {
            setCalendarData([]);
        };
        window.addEventListener('hijri_adjustment_changed', handleAdjustmentChange);
        return () => window.removeEventListener('hijri_adjustment_changed', handleAdjustmentChange);
    }, []);

    const fetchCalendar = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Get Location
            const cachedLocation = storage.getOptional<{ lat: number; lng: number }>(STORAGE_KEYS.USER_LOCATION);
            if (!cachedLocation || !cachedLocation.lat || !cachedLocation.lng) {
                // If no location, we can't fetch reliable calendar.
                // Fallback to Jakarta for now or throw error.
                // Let's fallback to Jakarta (Monas) to show something.
                // lat: -6.175392, lng: 106.827153
            }
            const lat = cachedLocation?.lat || -6.175392;
            const lng = cachedLocation?.lng || 106.827153;

            // Get Settings
            const savedMethod = storage.getOptional<string>(STORAGE_KEYS.SETTINGS_CALCULATION_METHOD);
            const method = (typeof savedMethod === 'string' ? savedMethod : savedMethod) || "20";

            const savedAdjustment = storage.getOptional<string>(STORAGE_KEYS.SETTINGS_HIJRI_ADJUSTMENT);
            const parsedAdj = parseInt(String(savedAdjustment || "-1"), 10);
            const activeAdj = isNaN(parsedAdj) ? -1 : parsedAdj;

            // Fetch Feb & March 2026 (Ramadhan 1447 spans Feb 18 - Mar 19)
            // Ideally we should calculate which Gregorian months correspond to current Hijri year's Ramadhan
            // But for this seasonal feature targeted at 2026, hardcoding Feb/Mar 2026 is acceptable.
            // Dynamically determining it requires complexity.
            const year = 2026;
            const monthsToFetch = [2, 3]; // Feb, March

            // Coordinate-based Maghrib correction (mirrors usePrayerTimes.ts logic)
            // Kemenag RI ikhtiyath for Maghrib varies by city:
            //   Bandung Raya (within 25km of center): +8
            //   Other Indonesian cities: +3
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

            // Apply same Kemenag RI tune as usePrayerTimes (method 20 only)
            // tune format: Imsak,Fajr,Sunrise,Dhuhr,Asr,Maghrib,Sunset,Isha,Midnight
            const tuneParam = method === "20"
                ? `&tune=2,2,0,4,4,${getMaghribCorrection(lat, lng)},0,2,0`
                : "";

            const requests = monthsToFetch.map(m =>
                fetchWithTimeout(
                    `${API_CONFIG.ALADHAN.BASE_URL}/calendar/${year}/${m}?latitude=${lat}&longitude=${lng}&method=${method}&adjustment=${activeAdj}${tuneParam}`,
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

            // Process and Filter
            const todayStr = new Date().toLocaleDateString("en-GB").split("/").join("-"); // 19-02-2026

            const ramadhanDays: RamadhanDay[] = [];

            allDays.forEach(dayDat => {
                const timings = dayDat.timings;
                const hijri = dayDat.date.hijri;
                const greg = dayDat.date.gregorian;

                // Client-side Adjustment Logic (Same as usePrayerTimes)
                let hDay = parseInt(hijri.day, 10);
                let hMonthIndex = (hijri.month.number) - 1;
                let hYear = parseInt(hijri.year, 10);

                hDay += activeAdj;

                if (hDay < 1) {
                    hMonthIndex--;
                    if (hMonthIndex < 0) { hMonthIndex = 11; hYear--; }
                    hDay += 30; // approx
                } else if (hDay > 30) {
                    hDay -= 30;
                    hMonthIndex++;
                    if (hMonthIndex > 11) { hMonthIndex = 0; hYear++; }
                }

                const hMonthName = HIJRI_MONTHS[hMonthIndex] || hijri.month.en;

                // Check if Ramadhan
                // Normalize string just in case: "Ramadan", "Ramadhan"
                if (hMonthName.toLowerCase().includes("ramada") || hMonthName.toLowerCase().includes("ramadhan")) {
                    ramadhanDays.push({
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
                        isToday: greg.date === todayStr // "19-02-2026"
                    });
                }
            });

            // Sort by hijri day
            ramadhanDays.sort((a, b) => a.hijriDay - b.hijriDay);

            setCalendarData(ramadhanDays);

        } catch (err) {
            Sentry.captureException(err);
            setError(err instanceof Error ? err.message : "Gagal memuat jadwal");
        } finally {
            setLoading(false);
        }
    }, []);

    return { calendarData, loading, error, fetchCalendar };
}
