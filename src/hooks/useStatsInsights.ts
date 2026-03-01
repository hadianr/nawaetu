'use client';

import { useMemo } from 'react';
import { RankKey } from "@/lib/leveling";

export const PRAYER_SUFFIXES = ["subuh", "dzuhur", "ashar", "maghrib", "isya"] as const;

export type InsightKey = 'streak' | 'prayers' | 'hasanah' | 'consistency' | 'quran' | 'dhikr';

export interface DailyActivity {
    date: string;
    hasanahGained: number;
    missionsCompleted: number;
    prayersCompleted: number;
    quranAyatRead: number;
    tasbihCount: number;
}

export interface CompletedMission {
    id: string;
    completedAt: string;
    hasanahEarned: number;
}

interface UseStatsInsightsProps {
    history: DailyActivity[];
    playerStats: any;
    weeklyHasanah: number;
    last14Days: string[];
    prayerMap: Record<string, Set<string>>;
    completedMissions: CompletedMission[];
    t: any;
}

export function useStatsInsights({
    history,
    playerStats,
    weeklyHasanah,
    last14Days,
    prayerMap,
    completedMissions,
    t
}: UseStatsInsightsProps) {
    const categoryStats = useMemo(() => {
        const stats: Record<string, { count: number; label: string; icon: string; color: string }> = {
            prayer: { count: 0, label: t.stats.missions.categories.prayer, icon: "🕌", color: "rgb(var(--color-primary))" },
            sunnah: { count: 0, label: t.stats.missions.categories.sunnah, icon: "✨", color: "#fbbf24" },
            worship: { count: 0, label: t.stats.missions.categories.worship, icon: "🤲", color: "#f59e0b" },
            quran: { count: 0, label: t.stats.missions.categories.quran, icon: "📖", color: "#3b82f6" },
            dhikr: { count: 0, label: t.stats.missions.categories.dhikr, icon: "📿", color: "#8b5cf6" },
            fasting: { count: 0, label: t.stats.missions.categories.fasting, icon: "🌙", color: "#06b6d4" },
        };

        completedMissions.forEach((m) => {
            const id = m.id.toLowerCase();
            let cat = "worship";

            if (id.startsWith("sholat_") && (id.endsWith("_male") || id.endsWith("_female") || id.includes("fardhu") || id.includes("wajib"))) {
                cat = "prayer";
            } else if (id.includes("sunnah") || id.includes("rawatib") || id.includes("dhuha") || id.includes("witir") || id.includes("tahajjud") || id.includes("qiyamul_lail")) {
                cat = "sunnah";
            } else if (id.includes("quran") || id.includes("tilawah") || id.includes("murottal") || id.includes("khatam") || id.includes("juz_") || id.includes("baca_alquran")) {
                cat = "quran";
            } else if (id.includes("puasa") || id.includes("sahur") || id.includes("bukapuasa")) {
                cat = "fasting";
            } else if (id.includes("tasbih") || id.includes("dzikir") || id.includes("zikir") || id.includes("istighfar") || id.includes("shalawat") || id.includes("wirid")) {
                cat = "dhikr";
            }

            if (stats[cat]) stats[cat].count++;
        });
        return stats;
    }, [completedMissions, t]);

    const maxCatCount = useMemo(() =>
        Math.max(...Object.values(categoryStats).map((c) => c.count), 1)
        , [categoryStats]);

    const powerDayName = useMemo(() => {
        const dayXpSum: Record<number, number> = {};
        let hasData = false;
        history.slice(-14).forEach(d => {
            if (d.hasanahGained > 0) {
                const dayNum = new Date(d.date).getDay();
                dayXpSum[dayNum] = (dayXpSum[dayNum] || 0) + d.hasanahGained;
                hasData = true;
            }
        });
        if (!hasData) return null;
        const powerDayNum = Object.entries(dayXpSum).reduce((a, b) => b[1] > a[1] ? b : a, ["0", 0])[0];
        return new Date(2024, 0, parseInt(powerDayNum) + 7).toLocaleDateString(t.stats.header.title.includes("Statistik") ? "id-ID" : "en-US", { weekday: 'long' });
    }, [history, t]);

    const primaryPrayer = useMemo(() => {
        const prayerCounts: Record<string, number> = {};
        let hasData = false;
        PRAYER_SUFFIXES.forEach(s => {
            let count = 0;
            last14Days.forEach(d => { if (prayerMap[d]?.has(s)) count++; });
            if (count > 0) {
                prayerCounts[s] = count;
                hasData = true;
            }
        });
        if (!hasData) return null;
        const topPrayerId = Object.entries(prayerCounts).reduce((a, b) => b[1] > a[1] ? b : a, ["subuh", 0])[0];
        return t.stats.insights.prayers.names[topPrayerId] || topPrayerId;
    }, [last14Days, prayerMap, t]);

    const sunnahTotal = useMemo(() =>
        completedMissions.filter(m => {
            const id = m.id.toLowerCase();
            return id.includes("sunnah") || id.includes("rawatib") || id.includes("dhuha") || id.includes("witir") || id.includes("tahajjud");
        }).length
        , [completedMissions]);

    const totalQuranAyat = useMemo(() =>
        history.reduce((s, d) => s + (d.quranAyatRead || 0), 0)
        , [history]);

    const nextQuranMilestone = useMemo(() =>
        Math.max(100, Math.ceil((totalQuranAyat + 1) / 100) * 100)
        , [totalQuranAyat]);

    const avgDailyHasanah = useMemo(() => {
        const activeDays = history.slice(-7).filter(d => d.hasanahGained > 0).length;
        if (activeDays === 0) return 0;
        return Math.round(weeklyHasanah / activeDays);
    }, [weeklyHasanah, history]);

    const playerRank = useMemo(() =>
        t.stats.ranks[playerStats.rankKey] || t.stats.ranks.mubtadi
        , [playerStats.rankKey, t]);

    const nextRank = useMemo(() => {
        const currentLevel = playerStats.level;
        let nextLevel = 5;
        let nextRankKey: RankKey = 'seeker';

        if (currentLevel >= 60) return null;

        if (currentLevel >= 40) {
            nextLevel = 60;
            nextRankKey = 'muhsin';
        } else if (currentLevel >= 25) {
            nextLevel = 40;
            nextRankKey = 'mukhlis';
        } else if (currentLevel >= 15) {
            nextLevel = 25;
            nextRankKey = 'salik';
        } else if (currentLevel >= 10) {
            nextLevel = 15;
            nextRankKey = 'abid';
        } else if (currentLevel >= 5) {
            nextLevel = 10;
            nextRankKey = 'warrior';
        }

        const rankInfo = t.stats.ranks[nextRankKey];
        if (!rankInfo) return null;

        return {
            ...rankInfo,
            targetLevel: nextLevel,
            levelsRemaining: nextLevel - currentLevel
        };
    }, [playerStats.level, t]);

    return {
        categoryStats,
        maxCatCount,
        powerDayName,
        primaryPrayer,
        sunnahTotal,
        totalQuranAyat,
        nextQuranMilestone,
        avgDailyHasanah,
        playerRank,
        nextRank
    };
}
