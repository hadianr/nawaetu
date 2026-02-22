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
// Bump this version when the `tune` parameter changes to invalidate stale cached prayer data
// v4: Coordinate-based Maghrib correction (haversine distance, not text matching)
const TUNE_VERSION = "v2025-kemenag-4";

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
            const savedTuneVersion = cachedData.tuneVersion;

            if (date === today && savedData && savedMethodCache === method && savedAdjustmentCache === adjustment && savedTuneVersion === TUNE_VERSION) {
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
                // Fetch from our internal server proxy to bypass Safari ITP and CORS blocks
                try {
                    const proxyUrl = `/api/location/reverse?lat=${lat}&lng=${lng}`;
                    const proxyResponse = await fetchWithTimeout(proxyUrl, {}, { timeoutMs: 10000 });

                    if (proxyResponse.ok) {
                        const proxyData = await proxyResponse.json();
                        if (proxyData.success && proxyData.name) {
                            locationName = proxyData.name;
                        }
                    }
                } catch (e) {
                    console.warn(`[usePrayerTimes] Internal proxy fetch failed:`, e);
                }

                // If proxy completely fails (network offline or 502), fallback to raw coordinates
                if (locationName === "Lokasi Anda" || !locationName) {
                    locationName = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
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
                const savedTuneVersion = cachedData.tuneVersion;

                // Only use cache if date, method, adjustment, and tune version match
                if (date === today && savedData && savedMethodCache === method && savedAdjustmentCache === adjustment && savedTuneVersion === TUNE_VERSION) {
                    processData(savedData, savedLocationName || locationName, true); // Use cached data immediately
                    if (!cachedLocationName) {
                        // If we have a perfectly matching cache, we can skip the heavy fetch
                        setLoading(false);
                        return;
                    }
                }
            }

            // For Kemenag RI (method 20), apply ikhtiyath offsets calibrated against
            // official Kemenag API (myquran.com). Maghrib is CITY-SPECIFIC (coordinate-based):
            //   Bandung Raya (within 25km of city center): +8
            //   Other Indonesian cities: +3
            // Text-based city matching is unreliable (locationName may be a kecamatan/kelurahan).
            // All other prayers: Imsak+2, Fajr+2, Dhuhr+4, Asr+4, Isha+2
            // Global methods (ISNA, MWL, etc.): no tune applied
            const getMaghribCorrection = (userLat: number, userLng: number): number => {
                // Haversine distance in km
                const R = 6371;
                const dLat = (userLat - (-6.9175)) * Math.PI / 180;
                const dLng = (userLng - 107.6191) * Math.PI / 180;
                const a = Math.sin(dLat / 2) ** 2
                    + Math.cos(-6.9175 * Math.PI / 180) * Math.cos(userLat * Math.PI / 180)
                    * Math.sin(dLng / 2) ** 2;
                const distKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                // Bandung Raya: ~25km radius covers Kota Bandung, Cimahi, Kab. Bandung as well
                if (distKm <= 25) return 8;
                return 3; // Default for other Indonesian cities
            };

            const tuneParam = method === "20"
                ? `&tune=2,2,0,4,4,${getMaghribCorrection(lat, lng)},0,2,0`
                : "";


            const response = await fetchWithTimeout(
                `${API_CONFIG.ALADHAN.BASE_URL}/timings/${today}?latitude=${lat}&longitude=${lng}&method=${method}&adjustment=${adjustment}${tuneParam}`,
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
                adjustment,
                tuneVersion: TUNE_VERSION, // Track tune version for cache invalidation
            });

            if (!isDefault) {
                // IMPORTANT FIX: We MUST cache the location even if it's just coordinates.
                // If Nominatim/BigDataCloud fail on mobile, falling back to coordinates is fine,
                // but if we refuse to cache them, the app will reset to Jakarta on every refresh!
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
        const isCoordinates = (name: string) => /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/.test(name);

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
