"use client";

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

const STORAGE_KEY = "daily_activity_history";

/**
 * Record today's activity
 */
export function recordDailyActivity(activity: Partial<DailyActivity>) {
    if (typeof window === "undefined") return;

    const today = new Date().toISOString().split("T")[0];
    const history = getDailyActivityHistory();

    // Find or create today's entry
    const existingIndex = history.findIndex((a) => a.date === today);

    if (existingIndex >= 0) {
        // Update existing
        history[existingIndex] = {
            ...history[existingIndex],
            ...activity,
            date: today,
        };
    } else {
        // Create new
        history.push({
            date: today,
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

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Get all daily activity history
 */
export function getDailyActivityHistory(): DailyActivity[] {
    if (typeof window === "undefined") return [];

    const stored = localStorage.getItem(STORAGE_KEY);
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
    const recent = getRecentActivity(7);

    const totalXP = recent.reduce((sum, a) => sum + a.xpGained, 0);
    const totalMissions = recent.reduce((sum, a) => sum + a.missionsCompleted, 0);
    const totalPrayers = recent.reduce((sum, a) => sum + a.prayersCompleted, 0);

    // Calculate streak
    let streak = 0;
    const today = new Date().toISOString().split("T")[0];
    let checkDate = new Date();

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

    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockData));
}
