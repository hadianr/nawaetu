'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useLocale } from '@/context/LocaleContext';
import { usePlayerStats } from '@/lib/habits/leveling';
import { getDailyActivityHistory } from '@/lib/analytics/analytics-utils';
import { getMissionRepository } from '@/core/repositories/mission.repository';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import GlobalStatsWidget from '@/components/home/GlobalStatsWidget';
import { useStatsInsights, InsightKey, PRAYER_SUFFIXES, DailyActivity, CompletedMission } from '@/hooks/useStatsInsights';
import { InsightModal } from '@/components/stats/InsightModal';
import { StatsOverview, StatsHeader } from '@/components/stats/StatsOverview';
import { PrayerConsistency } from '@/components/stats/PrayerConsistency';
import { CategoryBreakdown } from '@/components/stats/CategoryBreakdown';
import { HasanahTrendChart } from '@/components/stats/HasanahTrendChart';
import { QuranStatsCard } from '@/components/stats/QuranStatsCard';
import { useStreak } from '@/hooks/useStreak';
import { DateUtils } from '@/lib/utils/date';
import StreakBadge from '@/components/StreakBadge';

export default function StatsPage() {
    const { t, locale } = useLocale();
    const playerStats = usePlayerStats();
    const { streak, display: streakDisplay } = useStreak();
    const [history, setHistory] = useState<DailyActivity[]>([]);
    const [completedMissions, setCompletedMissions] = useState<CompletedMission[]>([]);
    const [activeInsight, setActiveInsight] = useState<InsightKey | null>(null);
    const [isRankModalOpen, setIsRankModalOpen] = useState(false);
    const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [totalQuranReadSeconds, setTotalQuranReadSeconds] = useState(0);
    const [todayReadSeconds, setTodayReadSeconds] = useState(0);

    useEffect(() => {
        queueMicrotask(() => setMounted(true));
        const loadStats = () => {
            setHistory(getDailyActivityHistory() as unknown as DailyActivity[]);
            setCompletedMissions(getMissionRepository().getCompletedMissions());
        };
        loadStats();
        window.addEventListener('activity_updated', loadStats);
        window.addEventListener('mission_updated', loadStats);
        window.addEventListener('hasanah_updated', loadStats);

        // Fetch today's Quran reading time
        const dateString = (() => {
            const today = new Date();
            const offset = today.getTimezoneOffset();
            today.setMinutes(today.getMinutes() - offset);
            return today.toISOString().split('T')[0];
        })();
        const storedSeconds = parseInt(
            localStorage.getItem(`nawaetu_quran_daily_total_${dateString}`) || '0', 10
        );
        const todayVal = isNaN(storedSeconds) ? 0 : storedSeconds;
        queueMicrotask(() => {
            setTotalQuranReadSeconds(todayVal);
            setTodayReadSeconds(todayVal);
        });

        // Also try to fetch from server for up-to-date figure
        fetch('/api/quran/sync-time')
            .then(res => res.json())
            .then(data => {
                if (data.success && typeof data.totalTodaySeconds === 'number') {
                    const serverVal = data.totalTodaySeconds;
                    setTodayReadSeconds(prev => Math.max(prev, serverVal));
                    setTotalQuranReadSeconds(prev => Math.max(prev, serverVal));
                }
            })
            .catch(() => {});
        return () => {
            window.removeEventListener('activity_updated', loadStats);
            window.removeEventListener('mission_updated', loadStats);
            window.removeEventListener('hasanah_updated', loadStats);
        };
    }, []);

    // ── Data Processing ─────────────────────────────────────────────────────
    const last14Days = Array.from({ length: 14 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });

    const prayerMap: Record<string, Set<string>> = {};
    completedMissions.forEach(m => {
        const dateStr = m.completedAt.split('T')[0];
        if (m.id.startsWith("sholat_") || m.id.endsWith("_prayer") || m.id.endsWith("_prayer_male") || m.id.endsWith("_prayer_female")) {
            if (!prayerMap[dateStr]) prayerMap[dateStr] = new Set();
            const parts = m.id.split('_');
            const prayerType = parts[0] === 'sholat' ? parts[1] : parts[0];
            const normalizedType = prayerType === 'fajr' ? 'subuh' : prayerType === 'dhuhr' ? 'dzuhur' : prayerType === 'asr' ? 'ashar' : prayerType === 'isha' ? 'isya' : prayerType;
            if (PRAYER_SUFFIXES.includes(normalizedType as typeof PRAYER_SUFFIXES[number])) {
                prayerMap[dateStr].add(normalizedType);
            }
        }
    });

    const weeklyHasanah = history.slice(-7).reduce((acc, day) => acc + (day.hasanahGained || 0), 0);

    const streakData = useMemo(() => ({
        currentStreak: streakDisplay.streak,
        longestStreak: streak.longestStreak,
    }), [streak, streakDisplay]);

    const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d' | '90d' | '1y'>('7d');

    // ── Data Calculations ───────────────────────────────────────────────────
    const recentPrayerCount = last14Days.reduce((acc, date) => acc + (prayerMap[date]?.size || 0), 0);
    const d = new Date();
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const todayPrayerCount = prayerMap[todayStr]?.size || 0;

    const activeDaysLast30 = history.slice(-30).filter(d => (d.hasanahGained || 0) > 0).length;
    const consistency = Math.round((activeDaysLast30 / Math.min(history.length || 1, 30)) * 100) || 0;

    const chartData = useMemo(() => {
        const hasanahByDate = new Map<string, number>();
        history.forEach(activity => hasanahByDate.set(activity.date, activity.hasanahGained || 0));
        const missionHasanahByDate = new Map<string, number>();
        completedMissions.forEach(mission => {
            const date = DateUtils.toLocalDate(mission.completedAt);
            missionHasanahByDate.set(date, (missionHasanahByDate.get(date) || 0) + (mission.hasanahEarned || 0));
        });
        missionHasanahByDate.forEach((value, date) => {
            hasanahByDate.set(date, Math.max(hasanahByDate.get(date) || 0, value));
        });

        if (timeRange === 'today') {
            const hours = Array.from({ length: 24 }, (_, i) => i);
            const todayMissions = completedMissions.filter(m => DateUtils.toLocalDate(m.completedAt) === todayStr);
            return hours.map(hour => {
                const hasanah = todayMissions
                    .filter(m => new Date(m.completedAt).getHours() === hour)
                    .reduce((sum, m) => sum + m.hasanahEarned, 0);
                return {
                    date: `${hour}:00`,
                    dateLabel: `${hour}:00`,
                    hasanah: hasanah
                };
            });
        }

        if (timeRange === '1y') {
            const last12Months = Array.from({ length: 12 }, (_, i) => {
                const date = new Date();
                date.setMonth(date.getMonth() - (11 - i));
                return DateUtils.toLocalDate(date).substring(0, 7);
            });

            return last12Months.map(monthStr => {
                const hasanah = [...hasanahByDate.entries()]
                    .filter(([date]) => date.startsWith(monthStr))
                    .reduce((sum, [, value]) => sum + value, 0);
                const [year, month] = monthStr.split('-');
                const dateLabel = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString(locale === 'id' ? "id-ID" : "en-US", { month: 'short' });
                return {
                    date: monthStr,
                    dateLabel,
                    hasanah: hasanah
                };
            });
        }

        const daysCount = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
        const rangeDays = Array.from({ length: daysCount }, (_, i) => {
            return DateUtils.daysAgo(daysCount - 1 - i);
        });

        return rangeDays.map(dateStr => {
            const d = new Date(`${dateStr}T12:00:00`);
            let dateLabel = d.toLocaleDateString(locale === 'id' ? "id-ID" : "en-US", { weekday: 'short' });
            if (timeRange !== '7d') {
                dateLabel = d.toLocaleDateString(locale === 'id' ? "id-ID" : "en-US", { day: 'numeric', month: 'short' });
            }
            return {
                date: dateStr,
                dateLabel,
                hasanah: hasanahByDate.get(dateStr) || 0
            };
        });
    }, [history, locale, timeRange, todayStr, completedMissions]);

    const rangeStats = useMemo(() => {
        const totalHasanah = chartData.reduce((sum, d) => sum + d.hasanah, 0);
        return { totalHasanah };
    }, [chartData]);

    const chartConfig = {
        hasanah: { label: "Hasanah", color: "rgb(var(--color-primary))" }
    };

    // ── Insights Hook ────────────────────────────────────────────────────────
    const {
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
    } = useStatsInsights({
        history,
        playerStats,
        weeklyHasanah,
        last14Days,
        prayerMap,
        completedMissions,
        t
    });

    if (!mounted) {
        return <div className="min-h-screen bg-[rgb(var(--color-background))]" />;
    }

    return (
            <div className="stats-page min-h-screen bg-[rgb(var(--color-background))] text-white pb-nav">
                <StatsHeader t={t} playerStats={playerStats} />

                <div className="max-w-2xl mx-auto px-6 pt-5">
                    <GlobalStatsWidget />
                </div>

                <StatsOverview
                    t={t}
                    playerStats={playerStats}
                    playerRank={playerRank}
                    nextRank={nextRank}
                    streakData={streakData}
                    recentPrayerCount={recentPrayerCount}
                    consistency={consistency}
                    timeRange={timeRange}
                    totalHasanah={rangeStats.totalHasanah}
                    setIsRankModalOpen={setIsRankModalOpen}
                    setActiveInsight={setActiveInsight}
                    onStreakClick={() => setIsStreakModalOpen(true)}
                />

                <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">
                    <HasanahTrendChart
                        t={t}
                        chartData={chartData}
                        chartConfig={chartConfig}
                        timeRange={timeRange}
                        setTimeRange={setTimeRange}
                    />

                    <StreakBadge modalOnly open={isStreakModalOpen} onOpenChange={setIsStreakModalOpen} />

                    <PrayerConsistency
                        t={t}
                        todayPrayerCount={todayPrayerCount}
                        last14Days={last14Days}
                        prayerMap={prayerMap}
                        PRAYER_SUFFIXES={PRAYER_SUFFIXES}
                    />

                    <QuranStatsCard
                        totalQuranAyat={totalQuranAyat}
                        todayReadSeconds={todayReadSeconds}
                        totalQuranReadSeconds={totalQuranReadSeconds}
                    />

                    <CategoryBreakdown
                        t={t}
                        categoryStats={categoryStats}
                        maxCatCount={maxCatCount}
                        setActiveInsight={setActiveInsight}
                    />

                    {/* Rank Details Modal */}
                    <Dialog open={isRankModalOpen} onOpenChange={setIsRankModalOpen}>
                        <DialogContent showCloseButton={false} className="bg-[#0A0A0B]/95 border-white/5 backdrop-blur-2xl p-0 overflow-hidden max-w-[360px] rounded-[32px]">
                            <div className="relative p-6">
                                <DialogHeader className="mb-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-12 h-12 rounded-[20px] bg-white/5 border border-white/10 flex items-center justify-center text-2xl shadow-xl">
                                            {playerRank.icon}
                                        </div>
                                        <div>
                                            <DialogTitle className="text-xl font-black text-white">{playerRank.title}</DialogTitle>
                                            <DialogDescription className="text-xs text-white/50">{t.stats.level.rankLabel}</DialogDescription>
                                        </div>
                                    </div>
                                </DialogHeader>

                                <div className="space-y-4">
                                    <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                                        <p className="text-xs text-white/70 leading-relaxed italic">
                                            &quot;{playerRank.desc}&quot;
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-white/[0.03] border border-white/5 rounded-2xl">
                                            <p className="text-[10px] font-bold text-white/40 uppercase mb-1">{t.stats.level.currentHasanah}</p>
                                            <p className="text-sm font-black text-white">{playerStats.hasanah.toLocaleString()}</p>
                                        </div>
                                        <div className="p-3 bg-white/[0.03] border border-white/5 rounded-2xl">
                                            <p className="text-[10px] font-bold text-white/40 uppercase mb-1">{t.stats.level.nextLevelHasanah}</p>
                                            <p className="text-sm font-black text-white">{playerStats.nextLevelHasanah.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => setIsRankModalOpen(false)}
                                        className="w-full h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm border border-white/10 transition-all"
                                    >
                                        {t.stats.level.understand}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Detailed Insight Modal */}
                    <InsightModal
                        activeInsight={activeInsight}
                        setActiveInsight={setActiveInsight}
                        t={t}
                        data={{
                            streakData,
                            recentPrayerCount,
                            primaryPrayer: primaryPrayer || "",
                            sunnahTotal,
                            weeklyHasanah,
                            avgDailyHasanah,
                            powerDayName: powerDayName || "",
                            consistency,
                            totalQuranAyat,
                            nextQuranMilestone,
                            history,
                            totalQuranReadSeconds
                        }}
                    />
                </div>
            </div>
    );
}
