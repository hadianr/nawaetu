import { useState, useEffect, useCallback } from "react";

interface PrayerData {
    hijriDate: string;
    gregorianDate: string;
    prayerTimes: Record<string, string>;
    nextPrayer: string;
}

interface UsePrayerTimesResult {
    data: PrayerData | null;
    loading: boolean;
    error: string | null;
    refreshLocation: () => void;
}

export function usePrayerTimes(): UsePrayerTimesResult {
    const [data, setData] = useState<PrayerData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPrayerTimes = useCallback(async (lat: number, lng: number) => {
        try {
            setLoading(true);
            const date = new Date().toLocaleDateString("en-GB").split("/").reverse().join("-"); // YYYY-MM-DD
            // Method 20: Kemenag RI (Indonesian Ministry of Religious Affairs) - commonly used in Indonesia
            // Can be made configurable
            const response = await fetch(
                `https://api.aladhan.com/v1/timings/${date}?latitude=${lat}&longitude=${lng}&method=20`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch prayer times");
            }

            const result = await response.json();
            const timings = result.data.timings;
            const dateInfo = result.data.date;

            // Filter and format timings
            const relevantPrayers = {
                Imsak: timings.Imsak,
                Fajr: timings.Fajr,
                Dhuhr: timings.Dhuhr,
                Asr: timings.Asr,
                Maghrib: timings.Maghrib,
                Isha: timings.Isha,
            };

            // Determine next prayer
            const now = new Date();
            const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

            let next = "Imsak"; // Default wrap around
            const prayerOrder = ["Imsak", "Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

            for (const prayer of prayerOrder) {
                if (timings[prayer] > currentTime) {
                    next = prayer;
                    break;
                }
            }

            setData({
                hijriDate: `${dateInfo.hijri.day} ${dateInfo.hijri.month.en} ${dateInfo.hijri.year}H`,
                gregorianDate: dateInfo.readable,
                prayerTimes: relevantPrayers,
                nextPrayer: next,
            });
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load data");
        } finally {
            setLoading(false);
        }
    }, []);

    const getLocationAndFetch = useCallback(() => {
        setLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                fetchPrayerTimes(position.coords.latitude, position.coords.longitude);
            },
            (err) => {
                setError("Please enable location services to see prayer times.");
                setLoading(false);
            }
        );
    }, [fetchPrayerTimes]);

    useEffect(() => {
        getLocationAndFetch();
    }, [getLocationAndFetch]);

    return { data, loading, error, refreshLocation: getLocationAndFetch };
}
