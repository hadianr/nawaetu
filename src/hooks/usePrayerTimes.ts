import { useState, useEffect, useCallback } from "react";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { fetchWithTimeout } from "@/lib/utils/fetch";
import { API_CONFIG } from "@/config/apis";

const storage = getStorageService();

const LOCATION_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const isValidCoords = (lat: unknown, lng: unknown) =>
    typeof lat === 'number' && typeof lng === 'number' &&
    !isNaN(lat) && !isNaN(lng) &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180;

const isFreshLocation = (cachedLocation: any) => {
    if (!cachedLocation || typeof cachedLocation !== 'object') return false;
    const { lat, lng, timestamp } = cachedLocation as { lat?: number; lng?: number; timestamp?: number };
    if (!isValidCoords(lat, lng)) return false;
    if (typeof timestamp === 'number' && (Date.now() - timestamp > LOCATION_CACHE_TTL_MS)) return false;
    return true;
};

interface PrayerData {
    hijriDate: string;
    gregorianDate: string;
    prayerTimes: Record<string, string>;
    nextPrayer: string;
    nextPrayerTime: string;
    locationName: string;
    isDefaultLocation?: boolean;
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

    const processData = useCallback((result: any, locationName: string, isCached: boolean = false, isDefaultLocation: boolean = false) => {
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
            locationName,
            isDefaultLocation // Add flag to state
        });

        if (isCached) setLoading(false);
    }, []);

    const syncFromCache = useCallback(() => {
        const today = new Date().toLocaleDateString("en-GB").split("/").join("-");
        const cachedData = storage.getOptional<any>(STORAGE_KEYS.PRAYER_DATA as any);
        if (cachedData && typeof cachedData === 'object') {
            const date = cachedData.date;
            const savedData = cachedData.data;
            const locationName = cachedData.locationName;
            const isDefault = cachedData.isDefault;

            if (date === today && savedData) {
                processData(savedData, locationName || "Lokasi Tersimpan", true, !!isDefault);
            }
        }
    }, [processData]);

    const fetchPrayerTimes = useCallback(async (lat: number, lng: number, cachedLocationName?: string, isDefault: boolean = false) => {
        // fetch location name if not cached
        let locationName = cachedLocationName || "Lokasi Anda";

        try {
            setLoading(true);

            // Validate coordinates
            if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                throw new Error("Invalid coordinates");
            }

            const today = new Date().toLocaleDateString("en-GB").split("/").join("-"); // DD-MM-YYYY

            if (!cachedLocationName && !isDefault) {
                try {
                    const locResponse = await fetchWithTimeout(
                        `${API_CONFIG.LOCATION.BIGDATA_CLOUD}?latitude=${lat}&longitude=${lng}&localityLanguage=id`,
                        {},
                        { timeoutMs: 8000 }
                    );
                    const locData = await locResponse.json();
                    locationName = locData.locality || locData.city || locData.principalSubdivision || "Lokasi Terdeteksi";
                } catch (e) {
                }
            }

            // Check cache first
            const cachedData = storage.getOptional<any>(STORAGE_KEYS.PRAYER_DATA as any);
            if (cachedData && typeof cachedData === 'object') {
                const date = cachedData.date;
                const savedData = cachedData.data;
                const savedLocationName = cachedData.locationName;

                if (date === today && savedData) {
                    processData(savedData, savedLocationName || locationName, true); // Use cached data immediately
                    // If it was default, we should override the state to reflect that? 
                    // processData handles setData. We might need to pass isDefault to processData too?
                    // For now, let's just proceed. If it's cached, it's not default anymore usually.
                    // But if we just set specific Jakarta coords, it's fine.
                }
            }

            // Get calculation method from settings (default: 20 = Kemenag RI)
            const savedMethod = storage.getOptional<string>(STORAGE_KEYS.SETTINGS_CALCULATION_METHOD as any);
            const method = (typeof savedMethod === 'string' ? savedMethod : savedMethod) || "20";

            const response = await fetchWithTimeout(
                `${API_CONFIG.ALADHAN.BASE_URL}/timings/${today}?latitude=${lat}&longitude=${lng}&method=${method}`,
                {},
                { timeoutMs: 8000 }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch prayer times (Status: ${response.status})`);
            }

            const result = await response.json();

            // Validate response structure
            if (!result || !result.data || !result.data.timings) {
                throw new Error("Invalid prayer times data received");
            }

            // Cache the fresh result
            storage.set(STORAGE_KEYS.PRAYER_DATA as any, {
                date: today,
                data: result,
                locationName,
                isDefault
            });

            // Also update user_location cache with name IF NOT DEFAULT
            if (!isDefault) {
                storage.set(STORAGE_KEYS.USER_LOCATION as any, {
                    lat,
                    lng,
                    name: locationName,
                    timestamp: Date.now()
                });
            }

            // Pass isDefault to processData or handle it here. 
            // processData handles raw API response, we need to inject the flag.

            // Wait, processData uses `setData`. We should update processData signature OR just update state here.
            // processData is reused. Let's update processData signature.
            processData(result, locationName, false, isDefault);

            setError(null);

            // Notify other instances
            window.dispatchEvent(new CustomEvent('prayer_data_updated'));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load prayer data";
            setError(errorMessage);

            // Try to use cached data if available
            const cachedData = storage.getOptional<any>(STORAGE_KEYS.PRAYER_DATA as any);
            if (cachedData && typeof cachedData === 'object' && cachedData.data) {
                processData(cachedData.data, cachedData.locationName || locationName, true);
            }
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
                const cachedLocation = storage.getOptional<any>(STORAGE_KEYS.USER_LOCATION as any);
                if (isFreshLocation(cachedLocation)) {
                    fetchPrayerTimes(cachedLocation.lat, cachedLocation.lng, cachedLocation.name);
                    return;
                }

                if (cachedLocation) {
                    storage.remove(STORAGE_KEYS.USER_LOCATION as any);
                }
                setError("Please enable location services to see prayer times.");
                setLoading(false);
            },
            { timeout: 10000, maximumAge: 60000 }
        );
    }, [fetchPrayerTimes]);

    useEffect(() => {
        // 1. Initial Sync
        syncFromCache();

        // 2. Check if we have a saved location
        const cachedLocation = storage.getOptional<any>(STORAGE_KEYS.USER_LOCATION as any);
        if (isFreshLocation(cachedLocation)) {
            const today = new Date().toLocaleDateString("en-GB").split("/").join("-");
            const cachedData = storage.getOptional<any>(STORAGE_KEYS.PRAYER_DATA as any);

            if (!cachedData || cachedData.date !== today) {
                fetchPrayerTimes(cachedLocation.lat, cachedLocation.lng, cachedLocation.name);
            } else {
                setLoading(false); // Data is fresh, no need to fetch
            }
        } else {
            if (cachedLocation) {
                storage.remove(STORAGE_KEYS.USER_LOCATION as any);
            }

            // FIX: Do not auto-request location on load (PageSpeed Best Practice)
            // Default to Jakarta (Monas)
            fetchPrayerTimes(-6.175392, 106.827153, "Jakarta (Default)", true);
        }

        // 3. Listen for global updates
        const handleUpdate = () => syncFromCache();

        // Listen for calculation method changes
        const handleMethodChange = () => {
            const cachedLocation = storage.getOptional<any>(STORAGE_KEYS.USER_LOCATION as any);
            if (isFreshLocation(cachedLocation)) {
                fetchPrayerTimes(cachedLocation.lat, cachedLocation.lng, cachedLocation.name);
                return;
            }

            if (cachedLocation) {
                storage.remove(STORAGE_KEYS.USER_LOCATION as any);
            }
        };

        window.addEventListener('prayer_data_updated', handleUpdate);
        window.addEventListener('calculation_method_changed', handleMethodChange);

        return () => {
            window.removeEventListener('prayer_data_updated', handleUpdate);
            window.removeEventListener('calculation_method_changed', handleMethodChange);
        };
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
