import { useState, useEffect } from "react";
import { getDisplayStreak } from "./streak-utils";
import { getActivityRepository } from "@/core/repositories/activity.repository";
import { DateUtils } from "@/lib/utils/date";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

// ====================================================================
// DEPRECATED: This file is kept for backward compatibility
// NEW CODE SHOULD USE:
// - useActivity() hook from @/hooks/useActivity
// - ActivityRepository from @/core/repositories/activity.repository
// ====================================================================

const repository = getActivityRepository();
const storage = getStorageService();

// Re-export ActivityData type from repository
export type { ActivityData } from "@/core/repositories/activity.repository";

/**
 * @deprecated Use DateUtils.today() from @/lib/utils/date
 */
function getTodayString(): string {
    return DateUtils.today();
}

/**
 * @deprecated Use getActivityRepository().getActivity()
 */
export function getActivityData() {
    return repository.getActivity();
}

/**
 * @deprecated Internal function, use repository methods
 */
function saveActivityData(data: any): void {
    repository.saveActivity(data);
}

/**
 * @deprecated Use ActivityRepository.trackQuran() or useActivity hook
 * Track Quran reading. Called from VerseList when user reads verses.
 */
export function trackQuranRead(ayatCount: number): void {
    repository.trackQuran(ayatCount);
}

/**
 * @deprecated Use ActivityRepository.trackTasbih() or useActivity hook
 * Track Tasbih count. Called from TasbihCounter.
 */
export function trackTasbih(count: number): void {
    repository.trackTasbih(count);
}

/**
 * @deprecated Use ActivityRepository.logPrayer() or useActivity hook
 * Log a prayer as completed. 
 */
export function logPrayer(prayerName: string): void {
    repository.logPrayer(prayerName);
}

/**
 * @deprecated Use ActivityRepository.isPrayerLogged() or useActivity hook
 * Check if a prayer has been logged today.
 */
export function isPrayerLogged(prayerName: string): boolean {
    return repository.isPrayerLogged(prayerName);
}

/**
 * Get progress for a specific mission type.
 * @deprecated Use getMissionRepository().getProgress() or useMissions hook instead
 */
export function getMissionProgress(missionId: string): { current: number; required: number; isComplete: boolean } {
    console.warn("[DEPRECATED] getMissionProgress: Use getMissionRepository() or useMissions hook instead");
    const { getMissionRepository } = require("@/core/repositories/mission.repository");
    return getMissionRepository().getProgress(missionId);
}

/**
 * Check if current time is after a specific prayer time.
 * prayerTimes should come from usePrayerTimes hook.
 * @deprecated Use DateUtils from @/lib/utils/date for date comparisons
 */
export function isAfterPrayerTime(prayerName: string, prayerTimes: Record<string, string> | null): boolean {
    if (!prayerTimes) return false;

    const now = new Date();
    const timeStr = prayerTimes[prayerName];
    if (!timeStr) return false;

    const [hours, minutes] = timeStr.split(':').map(Number);
    const prayerTime = new Date();
    prayerTime.setHours(hours, minutes, 0, 0);

    return now >= prayerTime;
}

/**
 * Check if today is a specific day (0=Sunday, 1=Monday, etc.)
 * @deprecated Use DateUtils from @/lib/utils/date for date operations
 */
export function isTodayDay(allowedDays: number[]): boolean {
    const today = new Date().getDay();
    return allowedDays.includes(today);
}

// React Hooks for UI Components

/**
 * @deprecated Use useActivity hook from @/hooks/useActivity instead
 * This hook delegates to the new repository pattern for backward compatibility
 */
export function useUserActivity() {
    const [stats, setStats] = useState({
        streakDays: 0,
        todayAyat: 0,
        todayTasbih: 0,
        prayersLogged: [] as string[]
    });

    useEffect(() => {
        const load = () => {
            const streak = getDisplayStreak();
            const activity = getActivityData();
            setStats({
                streakDays: streak.streak,
                todayAyat: activity.quranAyat,
                todayTasbih: activity.tasbihCount,
                prayersLogged: activity.prayersLogged
            });
        };
        load();

        const handleUpdate = () => load();
        window.addEventListener("activity_updated", handleUpdate);
        window.addEventListener("streak_updated", handleUpdate);
        return () => {
            window.removeEventListener("activity_updated", handleUpdate);
            window.removeEventListener("streak_updated", handleUpdate);
        };
    }, []);

    return { stats };
}

/**
 * @deprecated Use useActivity or direct storage access via StorageService
 * This hook will be moved to a dedicated user profile module
 */
export function useUserProfile() {
    const [profile, setProfile] = useState({
        name: "Hamba Allah",
        title: "Hamba Allah"
    });

    useEffect(() => {
        const load = () => {
            // Safe check for window
            if (typeof window !== 'undefined') {
                const [name, title] = storage.getMany([
                    STORAGE_KEYS.USER_NAME,
                    STORAGE_KEYS.USER_TITLE
                ]).values();
                
                if (name || title) {
                    setProfile({
                        name: (name as string) || "Hamba Allah",
                        title: (title as string) || "Hamba Allah"
                    });
                }
            }
        };
        load();
    }, []);

    return { profile };
}
