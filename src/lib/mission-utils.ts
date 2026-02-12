import { Mission } from "@/data/missions-data";
import { SETTINGS_TRANSLATIONS } from "@/data/settings-translations";

export interface ValidationResult {
    locked: boolean;
    isLate?: boolean;
    isEarly?: boolean;
    reason?: string;
}

/**
 * Validates if a mission can be completed based on time, day, or prayer windows.
 * Allows completion of "late" missions (past window) for Sholat, while keeping Dzikir simple.
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

        if (!prayerTimeStr) return { locked: true, reason: "Menunggu data waktu sholat..." };

        const [pHours, pMinutes] = prayerTimeStr.split(':').map(Number);
        const prayerDate = new Date(currentTime);
        prayerDate.setHours(pHours, pMinutes, 0, 0);

        // 1. Locked: Before prayer time
        if (currentTime < prayerDate) {
            return {
                locked: true,
                reason: `Belum masuk waktu ${prayerKey}`
            };
        }

        // 2. Early (Awal Waktu): Within 60 minutes of prayer time - ONLY for Sholat
        const diffMs = currentTime.getTime() - prayerDate.getTime();
        const diffMins = diffMs / (1000 * 60);
        const isEarly = mission.category === 'sholat' && diffMins <= 60;

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
                isLate: mission.category === 'sholat', // Only flag as 'Late' for Sholat
                isEarly: false,
                reason: `Sudah masuk ${latestArrivedPrayer}`
            };
        }

        return {
            locked: false,
            isEarly,
            reason: isEarly ? "Awal Waktu (+XP Bonus)" : `Sudah masuk waktu ${prayerKey}`
        };
    }

    // Specific hour window validation (e.g. Dzikir Pagi 04:00-10:00)
    if (mission.validationType === 'time' && mission.validationConfig?.timeWindow) {
        const nowHour = currentTime.getHours();
        const { start, end } = mission.validationConfig.timeWindow;

        if (nowHour < start) {
            return {
                locked: true,
                reason: `Tersedia jam ${start.toString().padStart(2, '0')}:00`
            };
        }

        if (nowHour >= end) {
            // Updated: User requested dynamic filtering("current time"), so we need to flag 'isLate' even for Dzikir/Sunnah
            // so we can sort them to the bottom.
            return {
                locked: false,
                isLate: true,
                reason: `Sudah lewat jendela waktu (${start}:00 - ${end}:00)`
            };
        }
    }

    // Day-based validation
    if (mission.validationType === 'day' && mission.validationConfig?.allowedDays) {
        const currentDay = currentTime.getDay();
        if (!mission.validationConfig.allowedDays.includes(currentDay)) {
            return { locked: true, reason: "Tidak tersedia hari ini" };
        }
    }

    return { locked: false };
}

/**
 * Filters missions based on User's Spiritual Archetype (Fokus Ibadah).
 * 
 * - Pemula: Focus on Wajib + Basic Quran. Hides generic Sunnah/Trackers to prevent overwhelm.
 * - Penggerak: Focus on Daily Routine (Wajib + Sunnah). Hides heavy Weekly/Trackers.
 * - Mujahid: Shows EVERYTHING.
 */
export function filterMissionsByArchetype(missions: Mission[], archetype: string | null): Mission[] {
    if (!archetype) return missions; // Default: Show all if no archetype selected (or maybe filter to 'Penggerak' as safe default? Let's keep all for now).

    return missions.filter(mission => {
        // 1. Mandatory missions (Wajib) are ALWAYS shown for everyone
        if (mission.hukum === 'wajib') return true;

        // 2. Special Case: Ramadhan Prep is high priority, show for everyone? 
        // Let's stick to the archetype rules for consistency, but maybe allow some 'sunnah' prep for Pemula?
        // Decision: Stick to rules properly.

        switch (archetype) {
            case 'pemula': // "Fokus Wajib"
                // Show Wajib (already covered) OR Simple Quran tasks
                // Hide other Sunnah (Dhuha, Dzikir, Puasa Sunnah)
                if (mission.category === 'quran' && mission.validationConfig?.requiredCount && mission.validationConfig.requiredCount <= 10) return true;
                return false;

            case 'penggerak': // "Wajib + Sunnah Ringan"
                // Show All Daily Missions (Wajib + Sunnah).
                // Hide Weekly (Puasa Senin Kamis) or Trackers (Qadha Puasa is Wajib so it shows, but generic trackers maybe hide?)
                // Actually, let's just show all 'daily' type.
                if (mission.type === 'daily') return true;
                return false;

            case 'mujahid': // "Extra Strong"
                // Show EVERYTHING
                return true;

            default:
                return true;
        }
    });
}

/**
 * Gets the localized label for a mission's hukum (wajib, sunnah, etc.)
 */
export function getHukumLabel(hukum: string, t: typeof SETTINGS_TRANSLATIONS.id) {
    const labels: Record<string, keyof typeof SETTINGS_TRANSLATIONS.id> = {
        'wajib': 'hukumWajib',
        'sunnah': 'hukumSunnah',
        'mubah': 'hukumMubah',
        'makruh': 'hukumMakruh',
        'harram': 'hukumHaram'
    };
    const key = labels[hukum];
    return t[key as keyof typeof SETTINGS_TRANSLATIONS.id] || hukum;
}
