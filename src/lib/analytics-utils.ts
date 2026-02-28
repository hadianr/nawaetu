"use client";

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

import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

const storage = getStorageService();

export interface DailyActivity {
    date: string; // YYYY-MM-DD format
    xpGained: number;
    missionsCompleted: number;
    prayersCompleted: number;
    quranAyatRead: number;
    tasbihCount: number;
}

export interface WeeklyStats {
    totalXP: number;
    totalMissions: number;
    totalPrayers: number;
    averageDaily: number;
    streak: number;
}

export interface MonthlyStats {
    totalXP: number;
    totalMissions: number;
    totalPrayers: number;
    averageDaily: number;
    bestDay: { date: string; xp: number };
    consistency: number; // percentage of active days
}

/**
 * Record daily activity
 */
export function recordDailyActivity(activity: Partial<DailyActivity>, dateStr?: string) {
    if (typeof window === "undefined") return;

    const date = dateStr || new Date().toISOString().split("T")[0];
    const history = getDailyActivityHistory();

    // Find or create entry for the specified date
    const existingIndex = history.findIndex((a) => a.date === date);

    if (existingIndex >= 0) {
        // Update existing
        history[existingIndex] = {
            ...history[existingIndex],
            ...activity,
            date: date,
        };
    } else {
        // Create new
        history.push({
            date: date,
            xpGained: activity.xpGained || 0,
            missionsCompleted: activity.missionsCompleted || 0,
            prayersCompleted: activity.prayersCompleted || 0,
            quranAyatRead: activity.quranAyatRead || 0,
            tasbihCount: activity.tasbihCount || 0,
        });
    }

    // Keep only last 90 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);
    const cutoff = cutoffDate.toISOString().split("T")[0];

    const filtered = history
        .filter((a) => a.date >= cutoff)
        .sort((a, b) => a.date.localeCompare(b.date));

    storage.set(STORAGE_KEYS.DAILY_ACTIVITY_HISTORY as any, JSON.stringify(filtered));
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("activity_updated", { detail: filtered }));
    }
}

/**
 * Increment a specific activity metric
 */
export function incrementDailyActivity(key: keyof Omit<DailyActivity, 'date'>, amount: number = 1, dateStr?: string) {
    if (typeof window === "undefined") return;

    const history = getDailyActivityHistory();
    const date = dateStr || new Date().toISOString().split("T")[0];
    const existing = history.find(a => a.date === date);

    const currentVal = existing ? (existing[key] as number || 0) : 0;
    recordDailyActivity({ [key]: currentVal + amount }, date);
}

/**
 * Get today's activity entry
 */
export function getTodayActivity(): DailyActivity {
    const today = new Date().toISOString().split("T")[0];
    const history = getDailyActivityHistory();
    return history.find(a => a.date === today) || {
        date: today,
        xpGained: 0,
        missionsCompleted: 0,
        prayersCompleted: 0,
        quranAyatRead: 0,
        tasbihCount: 0
    };
}

/**
 * Get all daily activity history
 */
export function getDailyActivityHistory(): DailyActivity[] {
    if (typeof window === "undefined") return [];

    const stored = storage.getOptional<string>(STORAGE_KEYS.DAILY_ACTIVITY_HISTORY as any);
    if (!stored) return [];

    try {
        return JSON.parse(stored);
    } catch {
        return [];
    }
}

/**
 * Get last N days of activity
 */
export function getRecentActivity(days: number = 7): DailyActivity[] {
    const history = getDailyActivityHistory();
    return history.slice(-days);
}

/**
 * Get weekly stats (last 7 days)
 */
export function getWeeklyStats(): WeeklyStats {
    if (typeof window === "undefined") {
        return {
            totalXP: 0,
            totalMissions: 0,
            totalPrayers: 0,
            averageDaily: 0,
            streak: 0,
        };
    }

    const recent = getRecentActivity(7);

    const totalXP = recent.reduce((sum, a) => sum + a.xpGained, 0);
    const totalMissions = recent.reduce((sum, a) => sum + a.missionsCompleted, 0);
    const totalPrayers = recent.reduce((sum, a) => sum + a.prayersCompleted, 0);

    // Calculate streak
    let streak = 0;
    const today = new Date().toISOString().split("T")[0];
    const checkDate = new Date();

    for (let i = 0; i < 30; i++) {
        const dateStr = checkDate.toISOString().split("T")[0];
        const activity = recent.find((a) => a.date === dateStr);

        if (activity && activity.xpGained > 0) {
            streak++;
        } else if (dateStr !== today) {
            break;
        }

        checkDate.setDate(checkDate.getDate() - 1);
    }

    return {
        totalXP,
        totalMissions,
        totalPrayers,
        averageDaily: totalXP / 7,
        streak,
    };
}

/**
 * Get monthly stats (last 30 days)
 */
export function getMonthlyStats(): MonthlyStats {
    if (typeof window === "undefined") {
        return {
            totalXP: 0,
            totalMissions: 0,
            totalPrayers: 0,
            averageDaily: 0,
            bestDay: { date: "", xp: 0 },
            consistency: 0,
        };
    }

    const recent = getRecentActivity(30);

    const totalXP = recent.reduce((sum, a) => sum + a.xpGained, 0);
    const totalMissions = recent.reduce((sum, a) => sum + a.missionsCompleted, 0);
    const totalPrayers = recent.reduce((sum, a) => sum + a.prayersCompleted, 0);

    // Find best day
    const bestDay = recent.reduce(
        (best, a) => (a.xpGained > best.xp ? { date: a.date, xp: a.xpGained } : best),
        { date: "", xp: 0 }
    );

    // Calculate consistency (% of days with activity)
    const activeDays = recent.filter((a) => a.xpGained > 0).length;
    const consistency = (activeDays / 30) * 100;

    return {
        totalXP,
        totalMissions,
        totalPrayers,
        averageDaily: totalXP / 30,
        bestDay,
        consistency,
    };
}

/**
 * Generate mock data for testing (last 30 days)
 */
export function generateMockData() {
    if (typeof window === "undefined") return;

    const mockData: DailyActivity[] = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];

        // Random but realistic data
        const xpGained = Math.floor(Math.random() * 300) + 50;
        const missionsCompleted = Math.floor(Math.random() * 8) + 1;
        const prayersCompleted = Math.floor(Math.random() * 5);
        const quranAyatRead = Math.floor(Math.random() * 20);
        const tasbihCount = Math.floor(Math.random() * 100);

        mockData.push({
            date: dateStr,
            xpGained,
            missionsCompleted,
            prayersCompleted,
            quranAyatRead,
            tasbihCount,
        });
    }

    storage.set(STORAGE_KEYS.DAILY_ACTIVITY_HISTORY as any, JSON.stringify(mockData));
}
