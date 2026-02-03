import { useState, useEffect, useCallback } from "react";

interface PrayerData {
    hijriDate: string;
    gregorianDate: string;
    prayerTimes: Record<string, string>;
    nextPrayer: string;
    nextPrayerTime: string;
    locationName: string;
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

    const processData = useCallback((result: any, locationName: string, isCached: boolean = false) => {
        const timings = result.data.timings;
        const dateInfo = result.data.date;

        const relevantPrayers = {
            Imsak: timings.Imsak,
            Fajr: timings.Fajr,
            Sunrise: timings.Sunrise,
            Dhuhr: timings.Dhuhr,
            Asr: timings.Asr,
            Maghrib: timings.Maghrib,
            Isha: timings.Isha,
        };

        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

        let next = "Imsak";
        let nextTime = timings["Imsak"];
        const prayerOrder = ["Imsak", "Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

        let found = false;
        for (const prayer of prayerOrder) {
            if (timings[prayer] > currentTime) {
                next = prayer;
                nextTime = timings[prayer];
                found = true;
                break;
            }
        }

        if (!found) {
            next = "Imsak";
            nextTime = timings["Imsak"];
        }

        const hijri = dateInfo?.hijri;
        const hijriString = hijri
            ? `${hijri.day} ${hijri.month?.en} ${hijri.year}H`
            : "";

        setData({
            hijriDate: hijriString,
            gregorianDate: dateInfo?.readable || "",
            prayerTimes: relevantPrayers,
            nextPrayer: next,
            nextPrayerTime: nextTime,
            locationName
        });

        if (isCached) setLoading(false);
    }, []);

    const syncFromCache = useCallback(() => {
        const today = new Date().toLocaleDateString("en-GB").split("/").join("-");
        const cachedData = localStorage.getItem("prayer_data");
        if (cachedData) {
            const { date, data: savedData, locationName } = JSON.parse(cachedData);
            if (date === today) {
                processData(savedData, locationName || "Lokasi Tersimpan", true);
            }
        }
    }, [processData]);

    const fetchPrayerTimes = useCallback(async (lat: number, lng: number, cachedLocationName?: string) => {
        try {
            setLoading(true);
            const today = new Date().toLocaleDateString("en-GB").split("/").join("-"); // DD-MM-YYYY

            // fetch location name if not cached
            let locationName = cachedLocationName || "Lokasi Anda";
            if (!cachedLocationName) {
                try {
                    const locResponse = await fetch(
                        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=id`
                    );
                    const locData = await locResponse.json();
                    locationName = locData.locality || locData.city || locData.principalSubdivision || "Lokasi Terdeteksi";
                } catch (e) {
                    console.error("Failed to fetch location name", e);
                }
            }

            // Check cache first
            const cachedData = localStorage.getItem("prayer_data");
            if (cachedData) {
                const { date, data: savedData, locationName: savedLocationName } = JSON.parse(cachedData);
                if (date === today) {
                    processData(savedData, savedLocationName || locationName, true); // Use cached data immediately
                }
            }

            // Get calculation method from settings (default: 20 = Kemenag RI)
            const savedMethod = localStorage.getItem("settings_calculation_method");
            const method = savedMethod || "20";

            const response = await fetch(
                `https://api.aladhan.com/v1/timings/${today}?latitude=${lat}&longitude=${lng}&method=${method}`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch prayer times");
            }

            const result = await response.json();

            // Cache the fresh result
            localStorage.setItem("prayer_data", JSON.stringify({
                date: today,
                data: result,
                locationName
            }));

            // Also update user_location cache with name
            localStorage.setItem("user_location", JSON.stringify({
                lat,
                lng,
                name: locationName,
                timestamp: Date.now()
            }));

            processData(result, locationName);
            setError(null);

            // Notify other instances
            window.dispatchEvent(new CustomEvent('prayer_data_updated'));
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Failed to load data");
        } finally {
            setLoading(false);
        }
    }, [processData]);

    const getLocationAndFetch = useCallback(() => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchPrayerTimes(latitude, longitude);
            },
            (err) => {
                const cachedLocation = localStorage.getItem("user_location");
                if (cachedLocation) {
                    console.warn("Location refresh failed, using cached location");
                } else {
                    setError("Please enable location services to see prayer times.");
                    setLoading(false);
                }
            },
            { timeout: 10000, maximumAge: 60000 }
        );
    }, [fetchPrayerTimes]);

    useEffect(() => {
        // 1. Initial Sync
        syncFromCache();

        // 2. Check if we have a saved location
        const cachedLocation = localStorage.getItem("user_location");
        if (cachedLocation) {
            const today = new Date().toLocaleDateString("en-GB").split("/").join("-");
            const cachedData = localStorage.getItem("prayer_data");
            const { lat, lng, name } = JSON.parse(cachedLocation);

            if (!cachedData || JSON.parse(cachedData).date !== today) {
                fetchPrayerTimes(lat, lng, name);
            }
        } else {
            setLoading(false);
        }

        // 3. Listen for global updates
        const handleUpdate = () => syncFromCache();
        window.addEventListener('prayer_data_updated', handleUpdate);
        return () => window.removeEventListener('prayer_data_updated', handleUpdate);
    }, [fetchPrayerTimes, syncFromCache]);

    // NEW: interval to update "nextPrayer" dynamically as time passes
    useEffect(() => {
        if (!data) return;

        const updateNextPrayer = () => {
            const now = new Date();
            const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
            const prayerOrder = ["Imsak", "Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
            const timings = data.prayerTimes;

            let next = "Imsak";
            let nextTime = timings["Imsak"];
            let found = false;

            for (const prayer of prayerOrder) {
                if (timings[prayer] > currentTime) {
                    next = prayer;
                    nextTime = timings[prayer];
                    found = true;
                    break;
                }
            }

            // If we passed Isha, wrapped around to Imsak (tomorrow)
            if (!found) {
                next = "Imsak";
                nextTime = timings["Imsak"];
            }

            // Only update if changed
            if (next !== data.nextPrayer) {
                setData(prev => prev ? ({
                    ...prev,
                    nextPrayer: next,
                    nextPrayerTime: nextTime
                }) : null);
            }
        };

        const timer = setInterval(updateNextPrayer, 1000 * 60); // Check every minute
        return () => clearInterval(timer);
    }, [data]);

    return { data, loading, error, refreshLocation: getLocationAndFetch };
}
