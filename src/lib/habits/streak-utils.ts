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
    return getStreakRepository().getStreak();
}

/**
 * @deprecated Use getStreakRepository().saveStreak() instead
 */
export function saveStreak(data: StreakData): void {
    getStreakRepository().saveStreak(data);
}

/**
 * Update streak when user completes a mission.
 * Call this when the first mission of the day is completed.
 * Returns any new milestone reached, or null.
 * @deprecated Use getStreakRepository().updateStreak() or useStreak hook instead
 */
export function updateStreak(): { newMilestone: StreakMilestone | null; streak: StreakData } {
    return getStreakRepository().updateStreak();
}

/**
 * Check if streak should be reset (for display purposes)
 * Returns the actual current streak considering today's status
 * @deprecated Use getStreakRepository().getDisplayStreak() or useStreak hook instead
 */
export function getDisplayStreak(): { streak: number; isActiveToday: boolean } {
    return getStreakRepository().getDisplayStreak();
}
