import { Mission } from "@/data/missions-data";

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
