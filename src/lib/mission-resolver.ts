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

export function getPrayerMissionId(suffix: string, gender: Gender, isFriday: boolean): string {
    const prayerKey = PRAYER_KEY_MAP[suffix] || suffix;

    if (prayerKey === "dhuhr" && gender === "male" && isFriday) {
        return "friday_prayer";
    }

    return gender === "female" ? `${prayerKey}_prayer_female` : `${prayerKey}_prayer_male`;
}
