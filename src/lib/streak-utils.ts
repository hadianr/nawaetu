// Streak System Utilities
// Tracks consecutive days of completing at least one mission

import { addXP } from "./leveling";

export interface StreakData {
    currentStreak: number;   // Current consecutive days
    longestStreak: number;   // All-time best streak
    lastActiveDate: string;  // YYYY-MM-DD format
    milestones: number[];    // Reached milestones (7, 30, 100, etc.)
}

const STORAGE_KEY = "user_streak";

const DEFAULT_STREAK: StreakData = {
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: "",
    milestones: []
};

// Milestone definitions: days -> XP reward
export const STREAK_MILESTONES: { days: number; xp: number; label: string; icon: string }[] = [
    { days: 3, xp: 50, label: "3 Hari Konsisten", icon: "🔥" },
    { days: 7, xp: 100, label: "Seminggu Istiqomah", icon: "🔥" },
    { days: 14, xp: 200, label: "2 Minggu Strong", icon: "💪" },
    { days: 30, xp: 500, label: "Sebulan Juara", icon: "🏆" },
    { days: 60, xp: 750, label: "60 Hari Fighter", icon: "⚔️" },
    { days: 100, xp: 1000, label: "100 Hari Legend", icon: "⭐" },
];

function getTodayString(): string {
    return new Date().toISOString().split('T')[0];
}

function getYesterdayString(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
}

export function getStreak(): StreakData {
    if (typeof window === "undefined") return DEFAULT_STREAK;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_STREAK;

    try {
        return JSON.parse(saved);
    } catch {
        return DEFAULT_STREAK;
    }
}

export function saveStreak(data: StreakData): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Update streak when user completes a mission.
 * Call this when the first mission of the day is completed.
 * Returns any new milestone reached, or null.
 */
export function updateStreak(): { newMilestone: typeof STREAK_MILESTONES[0] | null; streak: StreakData } {
    const today = getTodayString();
    const yesterday = getYesterdayString();
    const current = getStreak();

    // Already updated today
    if (current.lastActiveDate === today) {
        return { newMilestone: null, streak: current };
    }

    let newStreak: number;

    if (current.lastActiveDate === yesterday) {
        // Consecutive day - increment streak
        newStreak = current.currentStreak + 1;
    } else if (current.lastActiveDate === "") {
        // First time ever
        newStreak = 1;
    } else {
        // Streak broken - reset to 1
        newStreak = 1;
    }

    const longestStreak = Math.max(newStreak, current.longestStreak);

    // Check for new milestones
    let newMilestone: typeof STREAK_MILESTONES[0] | null = null;
    const milestones = [...current.milestones];

    for (const milestone of STREAK_MILESTONES) {
        if (newStreak >= milestone.days && !milestones.includes(milestone.days)) {
            milestones.push(milestone.days);
            addXP(milestone.xp);
            window.dispatchEvent(new CustomEvent("xp_updated"));
            newMilestone = milestone;
        }
    }

    const updated: StreakData = {
        currentStreak: newStreak,
        longestStreak,
        lastActiveDate: today,
        milestones
    };

    saveStreak(updated);
    window.dispatchEvent(new CustomEvent("streak_updated"));

    return { newMilestone, streak: updated };
}

/**
 * Check if streak should be reset (for display purposes)
 * Returns the actual current streak considering today's status
 */
export function getDisplayStreak(): { streak: number; isActiveToday: boolean } {
    const today = getTodayString();
    const yesterday = getYesterdayString();
    const data = getStreak();

    const isActiveToday = data.lastActiveDate === today;

    // If last active was yesterday and not yet active today, streak is still valid
    if (data.lastActiveDate === yesterday || isActiveToday) {
        return { streak: data.currentStreak, isActiveToday };
    }

    // Streak is broken
    return { streak: 0, isActiveToday: false };
}
