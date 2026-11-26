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

import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { DEFAULT_PRAYER_PREFERENCES, type PrayerPreferences } from "@/types/notifications";

/** True while a pause the user set has not run out yet. Shared by the device and the prayer-alert job. */
export function isPaused(pausedUntil: unknown, now: Date): boolean {
    return typeof pausedUntil === "string" && Date.parse(pausedUntil) > now.getTime();
}

/** The location the alerts are timed for. Without one the server cannot time them, so null. */
export function getAlertLocation() {
    const locationStr = localStorage.getItem(STORAGE_KEYS.USER_LOCATION);
    if (!locationStr) return null;
    try {
        const loc = JSON.parse(locationStr);
        return {
            lat: loc.lat ?? loc.latitude ?? -6.2088,
            lng: loc.lng ?? loc.longitude ?? 106.8456,
            name: loc.name || loc.city || loc.locality || "Unknown",
            // Pass city (kabupaten/kota level) and country for analytics
            city: loc.city || loc.name || "Unknown",
            country: loc.country || null,
            countryCode: loc.countryCode || null,
        };
    } catch {
        return null;
    }
}

export function readPrayerPreferences(): PrayerPreferences {
    const stored = getStorageService().getOptional<Partial<PrayerPreferences>>(STORAGE_KEYS.ADHAN_PREFERENCES);
    return { ...DEFAULT_PRAYER_PREFERENCES, ...(stored && typeof stored === "object" ? stored : {}) };
}

/** Stores the preferences on the device and, when alerts are on, on the push subscription. */
export async function savePrayerPreferences(token: string | null, prefs: PrayerPreferences): Promise<void> {
    try {
        getStorageService().set(STORAGE_KEYS.ADHAN_PREFERENCES, prefs);
    } catch {
        // Storage full: the subscription below still gets the change.
    }
    if (!token) return;
    try {
        await fetch("/api/notifications/preferences", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                token,
                prayerPreferences: prefs,
                userLocation: getAlertLocation(),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            }),
        });
    } catch {
        // Offline: the device copy is saved and the next change of preferences sends it.
    }
}

/** Pauses prayer alerts until a time, or resumes them with null. */
export function setPrayerAlertPause(pausedUntil: string | null): Promise<void> {
    let token: string | null = null;
    try {
        token = localStorage.getItem("fcm_token");
    } catch {
        // Storage blocked: nothing was ever subscribed on this device.
    }
    return savePrayerPreferences(token, { ...readPrayerPreferences(), pausedUntil });
}
