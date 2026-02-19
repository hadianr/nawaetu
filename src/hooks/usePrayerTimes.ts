import { useState, useEffect, useCallback } from "react";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { fetchWithTimeout } from "@/lib/utils/fetch";
import { API_CONFIG } from "@/config/apis";

const HIJRI_MONTHS = [
    "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
    "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
    "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
];

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
    hijriMonth?: string;
    hijriDay?: number;
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
        if (!hijri) return;

        // Normalization helper to remove macrons/dots (e.g. Ramaḍān -> Ramadan)
        const normalize = (str: string) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ḍ/g, 'd') : "";
        const monthEnNormal = normalize(hijri.month?.en || "");

        // Manual Client-Side Hijri Adjustment
        // Aladhan API adjustment param is unreliable, so we calculate it here.
        const savedAdjustment = storage.getOptional<string>(STORAGE_KEYS.SETTINGS_HIJRI_ADJUSTMENT as any);
        const activeAdj = parseInt((typeof savedAdjustment === 'string' ? savedAdjustment : savedAdjustment) || "-1", 10);

        let day = parseInt(hijri.day || "0", 10);
        let monthIndex = (hijri.month?.number || 1) - 1; // 0-based index
        let year = parseInt(hijri.year, 10);

        // Apply Adjustment
        day += activeAdj;

        // Handle Rollover (Simple logic assuming 30 days for prev/curr month to be safe for visual adjustment)
        if (day < 1) {
            monthIndex--;
            if (monthIndex < 0) {
                monthIndex = 11;
                year--;
            }
            day += 30;
        } else if (day > 30) {
            day -= 30;
            monthIndex++;
            if (monthIndex > 11) {
                monthIndex = 0;
                year++;
            }
        }

        const month = HIJRI_MONTHS[monthIndex] || monthEnNormal;

        const hijriString = `${day} ${month} ${hijri.year}H`;

        setData({
            hijriDate: hijriString,
            gregorianDate: dateInfo?.readable || "",
            prayerTimes: relevantPrayers,
            nextPrayer: next,
            nextPrayerTime: nextTime,
            locationName,
            isDefaultLocation,
            hijriMonth: month, // Use corrected month name
            hijriDay: day
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

            // Get current settings to validate cache
            const savedMethod = storage.getOptional<string>(STORAGE_KEYS.SETTINGS_CALCULATION_METHOD as any);
            const method = (typeof savedMethod === 'string' ? savedMethod : savedMethod) || "20";
            const savedAdjustment = storage.getOptional<string>(STORAGE_KEYS.SETTINGS_HIJRI_ADJUSTMENT as any);
            const adjustment = (typeof savedAdjustment === 'string' ? savedAdjustment : savedAdjustment) || "-1";

            const savedMethodCache = cachedData.method || "20";
            const savedAdjustmentCache = cachedData.adjustment || "0";

            if (date === today && savedData && savedMethodCache === method && savedAdjustmentCache === adjustment) {
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
                    // Try Nominatim first (more reliable and accurate)
                    const locResponse = await fetchWithTimeout(
                        `${API_CONFIG.LOCATION.NOMINATIM}?format=json&lat=${lat}&lon=${lng}&accept-language=id`,
                        {
                            headers: {
                                'User-Agent': 'Nawaetu/1.7.3 (Islamic Prayer Times App)'
                            }
                        },
                        { timeoutMs: 10000 }
                    );
                    const locData = await locResponse.json();
                    
                    // Parse address with priority: subdistrict > village > city > state
                    const addr = locData.address || {};
                    locationName = addr.subdistrict || addr.village || addr.municipality || 
                                   addr.city || addr.town || addr.state || 
                                   locData.display_name?.split(',')[0] || "Lokasi Terdeteksi";
                } catch (e) {
                    // Fallback to BigDataCloud if Nominatim fails
                    try {
                        const fallbackResponse = await fetchWithTimeout(
                            `${API_CONFIG.LOCATION.BIGDATA_CLOUD}?latitude=${lat}&longitude=${lng}&localityLanguage=id`,
                            {},
                            { timeoutMs: 8000 }
                        );
                        const fallbackData = await fallbackResponse.json();
                        locationName = fallbackData.locality || fallbackData.city || fallbackData.principalSubdivision || "Lokasi Terdeteksi";
                    } catch (fallbackErr) {
                        // Both APIs failed, use coordinates-based name
                        locationName = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                    }
                }
            }

            // Get calculation method from settings (default: 20 = Kemenag RI)
            const savedMethod = storage.getOptional<string>(STORAGE_KEYS.SETTINGS_CALCULATION_METHOD as any);
            const method = (typeof savedMethod === 'string' ? savedMethod : savedMethod) || "20";

            // Get Hijri adjustment from settings (default: -1)
            const savedAdjustment = storage.getOptional<string>(STORAGE_KEYS.SETTINGS_HIJRI_ADJUSTMENT as any);
            const adjustment = (typeof savedAdjustment === 'string' ? savedAdjustment : savedAdjustment) || "-1";

            // Check cache first
            const cachedData = storage.getOptional<any>(STORAGE_KEYS.PRAYER_DATA as any);
            if (cachedData && typeof cachedData === 'object') {
                const date = cachedData.date;
                const savedData = cachedData.data;
                const savedLocationName = cachedData.locationName;
                const savedMethodCache = cachedData.method || "20";
                const savedAdjustmentCache = cachedData.adjustment || "0";

                // Only use cache if date, method, and adjustment match
                if (date === today && savedData && savedMethodCache === method && savedAdjustmentCache === adjustment) {
                    processData(savedData, savedLocationName || locationName, true); // Use cached data immediately
                    if (!cachedLocationName) {
                        // If we have a perfectly matching cache, we can skip the heavy fetch
                        setLoading(false);
                        return;
                    }
                }
            }

            const response = await fetchWithTimeout(
                `${API_CONFIG.ALADHAN.BASE_URL}/timings/${today}?latitude=${lat}&longitude=${lng}&method=${method}&adjustment=${adjustment}`,
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
                isDefault,
                method,
                adjustment
            });

            // Also update user_location cache with name IF NOT DEFAULT
            if (!isDefault) {
                const userLocationData = {
                    lat,
                    lng,
                    name: locationName,
                    timestamp: Date.now()
                };
                storage.set(STORAGE_KEYS.USER_LOCATION as any, userLocationData);
            }

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

        setLoading(true);
        setError(null);

        // FORCE REFRESH: Clear ALL location caches to prevent stale data
        const existingUserLoc = storage.getOptional<any>(STORAGE_KEYS.USER_LOCATION as any);
        const existingPrayerData = storage.getOptional<any>(STORAGE_KEYS.PRAYER_DATA as any);
        
        if (existingUserLoc) {
            storage.remove(STORAGE_KEYS.USER_LOCATION as any);
        }
        
        if (existingPrayerData?.isDefault) {
            storage.remove(STORAGE_KEYS.PRAYER_DATA as any);
        }

        // Request fresh geolocation (no cache check when explicitly refreshing)
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                
                // Force fetch with fresh coordinates (not from cache)
                fetchPrayerTimes(latitude, longitude, undefined, false);
            },
            (err) => {
                // Check if we have any cached location to fall back to
                const cachedLocation = storage.getOptional<any>(STORAGE_KEYS.USER_LOCATION as any);
                if (isFreshLocation(cachedLocation)) {
                    fetchPrayerTimes(cachedLocation.lat, cachedLocation.lng, cachedLocation.name, false);
                    return;
                }

                // LAST RESORT: Fallback to Jakarta (Monas)
                fetchPrayerTimes(-6.175392, 106.827153, "Jakarta (Default)", true);
            },
            { timeout: 15000, maximumAge: 0, enableHighAccuracy: true }
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

            // Default to Jakarta (Monas) on initial load
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

        // Listen for Hijri adjustment changes
        const handleAdjustmentChange = () => {
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
        window.addEventListener('hijri_adjustment_changed', handleAdjustmentChange);

        return () => {
            window.removeEventListener('prayer_data_updated', handleUpdate);
            window.removeEventListener('calculation_method_changed', handleMethodChange);
            window.removeEventListener('hijri_adjustment_changed', handleAdjustmentChange);
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
