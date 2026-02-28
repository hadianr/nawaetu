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

import { Mission } from "@/data/missions";
import { SETTINGS_TRANSLATIONS } from "@/data/translations";

export interface ValidationResult {
    locked: boolean;
    isLate?: boolean;
    isEarly?: boolean;
    reason?: string;
}

/**
 * Validates if a mission can be completed based on time, day, or prayer windows.
 * Allows completion of "late" missions (past window) for Prayer, while keeping Dhikr simple.
 */
export function checkMissionValidation(
    mission: Mission,
    prayerData: any,
    currentTime: Date = new Date()
): ValidationResult {
    if (!mission.validationType || mission.validationType === 'manual' || mission.validationType === 'auto') {
        return { locked: false };
    }

    // Prayer-based time validation
    if (mission.validationType === 'time' && mission.validationConfig?.afterPrayer && prayerData?.prayerTimes) {
        const prayerNames = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        const rawKey = mission.validationConfig.afterPrayer;
        const prayerKey = rawKey.charAt(0).toUpperCase() + rawKey.slice(1);

        const prayerTimeStr = prayerData.prayerTimes[prayerKey];

        if (!prayerTimeStr) return { locked: true, reason: "Waiting for prayer times..." };

        const [pHours, pMinutes] = prayerTimeStr.split(':').map(Number);
        const prayerDate = new Date(currentTime);
        prayerDate.setHours(pHours, pMinutes, 0, 0);

        // 1. Locked: Before prayer time
        if (currentTime < prayerDate) {
            return {
                locked: true,
                reason: `Not yet time for ${prayerKey}`
            };
        }

        // 2. Early (Awal Waktu): Within 60 minutes of prayer time - ONLY for Prayer
        const diffMs = currentTime.getTime() - prayerDate.getTime();
        const diffMins = diffMs / (1000 * 60);
        const isEarly = mission.category === 'prayer' && diffMins <= 60;

        // 3. Late (Terlewat): Find the LATEST prayer that has arrived
        let latestArrivedPrayer = "";
        const currentIndex = prayerNames.indexOf(prayerKey);

        if (currentIndex !== -1) {
            for (let i = currentIndex + 1; i < prayerNames.length; i++) {
                const nextKey = prayerNames[i];
                const nextStr = prayerData.prayerTimes[nextKey];
                if (nextStr) {
                    const [nH, nM] = nextStr.split(':').map(Number);
                    const nDate = new Date(currentTime);
                    nDate.setHours(nH, nM, 0, 0);
                    if (currentTime >= nDate) {
                        latestArrivedPrayer = nextKey;
                    } else {
                        break;
                    }
                }
            }
        }

        if (latestArrivedPrayer) {
            return {
                locked: false,
                isLate: mission.category === 'prayer', // Only flag as 'Late' for Prayer
                isEarly: false,
                reason: `${latestArrivedPrayer} has arrived`
            };
        }

        return {
            locked: false,
            isEarly,
            reason: isEarly ? "Early Time (+XP Bonus)" : `Time for ${prayerKey}`
        };
    }

    // Specific hour window validation (e.g. Morning Dhikr 04:00-10:00)
    if (mission.validationType === 'time' && mission.validationConfig?.timeWindow) {
        const nowHour = currentTime.getHours();
        const { start, end } = mission.validationConfig.timeWindow;

        if (nowHour < start) {
            return {
                locked: true,
                reason: `Available at ${start.toString().padStart(2, '0')}:00`
            };
        }

        if (nowHour >= end) {
            // Updated: User requested dynamic filtering("current time"), so we need to flag 'isLate' even for Dhikr/Sunnah
            // so we can sort them to the bottom.
            return {
                locked: false,
                isLate: true,
                reason: `Time window passed (${start}:00 - ${end}:00)`
            };
        }
    }

    // Day-based validation
    if (mission.validationType === 'day' && mission.validationConfig?.allowedDays) {
        const currentDay = currentTime.getDay();
        if (!mission.validationConfig.allowedDays.includes(currentDay)) {
            return { locked: true, reason: "Not available today" };
        }
    }

    return { locked: false };
}

/**
 * Filters missions based on User's Spiritual Archetype (Fokus Ibadah).
 * 
 * - Beginner: Focus on Obligatory + Basic Quran. Hides generic Sunnah/Trackers to prevent overwhelm.
 * - Striver: Focus on Daily Routine (Obligatory + Sunnah). Hides heavy Weekly/Trackers.
 * - Dedicated: Shows EVERYTHING.
 */
export function filterMissionsByArchetype(missions: Mission[], archetype: string | null): Mission[] {
    if (!archetype) return missions; // Default: Show all if no archetype selected

    return missions.filter(mission => {
        // 1. Mandatory missions (Obligatory) are ALWAYS shown for everyone
        if (mission.hukum === 'obligatory') return true;

        switch (archetype) {
            case 'beginner': // "Fokus Wajib"
                // Show Obligatory (already covered) OR Simple Quran tasks
                // Hide other Sunnah (Dhuha, Dhikr, Fasting Sunnah)
                if (mission.category === 'quran' && mission.validationConfig?.requiredCount && mission.validationConfig.requiredCount <= 10) return true;
                return false;

            case 'striver': // "Wajib + Sunnah Ringan"
                // Show All Daily Missions (Obligatory + Sunnah).
                // Hide Weekly (Puasa Senin Kamis) or Trackers (Qadha Puasa is Wajib so it shows, but generic trackers maybe hide?)
                // Actually, let's just show all 'daily' type.
                if (mission.type === 'daily') return true;
                return false;

            case 'dedicated': // "Extra Strong"
                // Show EVERYTHING
                return true;

            default:
                return true;
        }
    });
}

/**
 * Gets the localized label for a mission's hukum (obligatory, sunnah, etc.)
 */
export function getHukumLabel(hukum: string, t: any): string {
    const labels: Record<string, string> = {
        'obligatory': 'hukumWajib',
        'sunnah': 'hukumSunnah',
        'permissible': 'hukumMubah',
        'disliked': 'hukumMakruh',
        'forbidden': 'hukumHaram'
    };
    const key = labels[hukum];
    return (t[key] as string) || hukum;
}
