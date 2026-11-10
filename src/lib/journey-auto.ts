import type { JourneyAuto } from "@/data/ramadhan-journey";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

const number = (key: string) => {
    const value = Number.parseInt(localStorage.getItem(key) ?? "0", 10);
    return Number.isFinite(value) ? value : 0;
};

/**
 * True when Quran or Tasbih already recorded enough today. Reads the same keys those screens write.
 * `today` is the local date; Tasbih stamps its day with the UTC date, so we compare with that one.
 */
export function isAutoHabitDone(auto: JourneyAuto | null, today: string, now = new Date()): boolean {
    if (!auto) return false;
    try {
        if (auto.source === "quran") return number(`nawaetu_quran_daily_total_${today}`) >= auto.minSeconds;
        const utcToday = now.toISOString().split("T")[0];
        return localStorage.getItem(STORAGE_KEYS.DHIKR_LAST_DATE) === utcToday && number(STORAGE_KEYS.DHIKR_DAILY_COUNT) >= auto.minCount;
    } catch {
        return false; // storage blocked: fall back to the manual button
    }
}
