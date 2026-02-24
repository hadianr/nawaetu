// src/types/notifications.ts

export interface PrayerPreferences {
    imsak: boolean;
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
}

export interface UserLocation {
    lat: number;
    lng: number;
    city: string;
}

export interface NotificationSettings {
    enabled: boolean;
    prayerPreferences: PrayerPreferences;
    location?: UserLocation;
    timezone?: string;
}

export const DEFAULT_PRAYER_PREFERENCES: PrayerPreferences = {
    imsak: true,
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
};

