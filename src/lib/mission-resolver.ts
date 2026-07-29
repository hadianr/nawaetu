/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 */

import { Gender } from "@/data/missions/types";

/**
 * Utility for resolving prayer mission IDs based on gender and day of week
 */
const PRAYER_KEY_MAP: Record<string, string> = {
    subuh: "fajr",
    dzuhur: "dhuhr",
    ashar: "asr",
    maghrib: "maghrib",
    isya: "isha",
};

const LEGACY_PRAYER_ID_MAP: Record<string, string> = {
    fajr_prayer_male: "fajr_prayer",
    fajr_prayer_female: "fajr_prayer",
    sholat_subuh_male: "fajr_prayer",
    sholat_subuh_female: "fajr_prayer",
    dhuhr_prayer_male: "dhuhr_prayer",
    dhuhr_prayer_female: "dhuhr_prayer",
    sholat_dzuhur_male: "dhuhr_prayer",
    sholat_dzuhur_female: "dhuhr_prayer",
    asr_prayer_male: "asr_prayer",
    asr_prayer_female: "asr_prayer",
    sholat_ashar_male: "asr_prayer",
    sholat_ashar_female: "asr_prayer",
    maghrib_prayer_male: "maghrib_prayer",
    maghrib_prayer_female: "maghrib_prayer",
    sholat_maghrib_male: "maghrib_prayer",
    sholat_maghrib_female: "maghrib_prayer",
    isha_prayer_male: "isha_prayer",
    isha_prayer_female: "isha_prayer",
    sholat_isya_male: "isha_prayer",
    sholat_isya_female: "isha_prayer",
};

export function normalizeMissionId(id: string): string {
    return LEGACY_PRAYER_ID_MAP[id] || id;
}

export function getPrayerMissionId(suffix: string, gender: Gender, isFriday: boolean): string {
    const prayerKey = PRAYER_KEY_MAP[suffix] || suffix;

    if (prayerKey === "dhuhr" && gender === "male" && isFriday) {
        return "friday_prayer";
    }

    return `${prayerKey}_prayer`;
}
