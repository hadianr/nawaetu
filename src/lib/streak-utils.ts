// Streak System Utilities (Deprecated)
// Tracks consecutive days of completing at least one mission

import {
    getStreakRepository,
    STREAK_MILESTONES,
    StreakData,
    StreakMilestone
} from "@/core/repositories/streak.repository";

export { STREAK_MILESTONES };
export type { StreakData, StreakMilestone };

/**
 * @deprecated Use getStreakRepository().getStreak() or useStreak hook instead
 */
export function getStreak(): StreakData {
    console.warn("[DEPRECATED] getStreak: Use getStreakRepository() or useStreak hook instead");
    return getStreakRepository().getStreak();
}

/**
 * @deprecated Use getStreakRepository().saveStreak() instead
 */
export function saveStreak(data: StreakData): void {
    console.warn("[DEPRECATED] saveStreak: Use getStreakRepository() instead");
    getStreakRepository().saveStreak(data);
}

/**
 * Update streak when user completes a mission.
 * Call this when the first mission of the day is completed.
 * Returns any new milestone reached, or null.
 * @deprecated Use getStreakRepository().updateStreak() or useStreak hook instead
 */
export function updateStreak(): { newMilestone: StreakMilestone | null; streak: StreakData } {
    console.warn("[DEPRECATED] updateStreak: Use getStreakRepository() or useStreak hook instead");
    return getStreakRepository().updateStreak();
}

/**
 * Check if streak should be reset (for display purposes)
 * Returns the actual current streak considering today's status
 * @deprecated Use getStreakRepository().getDisplayStreak() or useStreak hook instead
 */
export function getDisplayStreak(): { streak: number; isActiveToday: boolean } {
    console.warn("[DEPRECATED] getDisplayStreak: Use getStreakRepository() or useStreak hook instead");
    return getStreakRepository().getDisplayStreak();
}
