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
        } catch (err) {
            console.error(err);
            // If offline and we have cache (even if old?), maybe we shouldn't show error? 
            // For now, let's just default to error if no cache was loaded.
            setError(err instanceof Error ? err.message : "Failed to load data");
        } finally {
            setLoading(false);
        }
    }, []);

    const processData = (result: any, locationName: string, isCached: boolean = false) => {
        const timings = result.data.timings;
        const dateInfo = result.data.date;

        const relevantPrayers = {
            Imsak: timings.Imsak,
            Fajr: timings.Fajr,
            Sunrise: timings.Sunrise, // Add Sunrise
            Dhuhr: timings.Dhuhr,
            Asr: timings.Asr,
            Maghrib: timings.Maghrib,
            Isha: timings.Isha,
        };

        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

        let next = "Imsak";
        let nextTime = timings["Imsak"]; // Default
        const prayerOrder = ["Imsak", "Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

        // Find next prayer today
        let found = false;
        for (const prayer of prayerOrder) {
            if (timings[prayer] > currentTime) {
                next = prayer;
                nextTime = timings[prayer];
                found = true;
                break;
            }
        }

        // If not found (all passed), it's Imsak/Fajr of tomorrow, but simpler to just show Imsak/Fajr of today as a placeholder or handle wrap-around in component. 
        // For simplicity, if we wrap around, we point to Fajr (or Imsak) but we might need logic for "tomorrow" date. 
        // Let's assume the API returns valid times for "tomorrow" via a new fetch or we rely on the component to handle the "tomorrow" logic if time < now.
        // Actually for now let's just default to the first prayer of the day if we passed everything.
        if (!found) {
            next = "Imsak";
            nextTime = timings["Imsak"];
        }

        setData({
            hijriDate: `${dateInfo.hijri.day} ${dateInfo.hijri.month.en} ${dateInfo.hijri.year}H`,
            gregorianDate: dateInfo.readable,
            prayerTimes: relevantPrayers,
            nextPrayer: next,
            nextPrayerTime: nextTime,
            locationName
        });

        if (isCached) setLoading(false);
    };

    const getLocationAndFetch = useCallback(() => {
        // Try to load cached location first to speed up
        const cachedLocation = localStorage.getItem("user_location");
        let hasUsedCache = false;

        if (cachedLocation) {
            const { lat, lng, name } = JSON.parse(cachedLocation);
            fetchPrayerTimes(lat, lng, name);
            hasUsedCache = true;
        }

        if (!navigator.geolocation) {
            if (!hasUsedCache) {
                setError("Geolocation is not supported by your browser");
                setLoading(false);
            }
            return;
        }

        // Always try to get fresh location to update cache
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                // Fetch with fresh location (will update cache inside fetchPrayerTimes)
                fetchPrayerTimes(latitude, longitude);
            },
            (err) => {
                // If we used cache, suppress the error
                if (!hasUsedCache) {
                    setError("Please enable location services to see prayer times.");
                    setLoading(false);
                } else {
                    console.warn("Location refresh failed, using cached location");
                }
            },
            { timeout: 10000, maximumAge: 60000 } // Use cached GPS if recently obtained
        );
    }, [fetchPrayerTimes]);

    useEffect(() => {
        // Attempt to load cached prayer data for today IMMEDIATELY before even checking location
        const today = new Date().toLocaleDateString("en-GB").split("/").join("-");
        const cachedData = localStorage.getItem("prayer_data");
        if (cachedData) {
            const { date, data: savedData, locationName } = JSON.parse(cachedData);
            if (date === today) {
                processData(savedData, locationName || "Lokasi Tersimpan", true);
            }
        }

        getLocationAndFetch();
    }, [getLocationAndFetch]);

    return { data, loading, error, refreshLocation: getLocationAndFetch };
}
