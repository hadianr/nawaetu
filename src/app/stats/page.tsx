'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations } from '@/context/LocaleContext';
import { usePlayerStats } from '@/lib/leveling';
import { getDailyActivityHistory } from '@/lib/analytics-utils';
import { getMissionRepository } from '@/core/repositories/mission.repository';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Star } from "lucide-react";
import Link from 'next/link';
import GlobalStatsWidget from '@/components/home/GlobalStatsWidget';
import { useStatsInsights, InsightKey, PRAYER_SUFFIXES, DailyActivity, CompletedMission } from '@/hooks/useStatsInsights';
import { InsightModal } from '@/components/stats/InsightModal';
import { StatsOverview, StatsHeader } from '@/components/stats/StatsOverview';
import { PrayerConsistency } from '@/components/stats/PrayerConsistency';
import { CategoryBreakdown } from '@/components/stats/CategoryBreakdown';
import { XPTrendChart } from '@/components/stats/XPTrendChart';

export default function StatsPage() {
    const t = useTranslations();
    const playerStats = usePlayerStats();
    const [history, setHistory] = useState<DailyActivity[]>([]);
    const [completedMissions, setCompletedMissions] = useState<CompletedMission[]>([]);
    const [activeInsight, setActiveInsight] = useState<InsightKey | null>(null);
    const [isRankModalOpen, setIsRankModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const activityHistory = getDailyActivityHistory() as unknown as DailyActivity[];
        setHistory(activityHistory);
        setCompletedMissions(getMissionRepository().getCompletedMissions());
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
        if (m.id.startsWith("sholat_")) {
            if (!prayerMap[dateStr]) prayerMap[dateStr] = new Set();
            const prayerType = m.id.split('_')[1];
            if (PRAYER_SUFFIXES.includes(prayerType as any)) {
                prayerMap[dateStr].add(prayerType);
            }
        }
    });

    const weeklyXP = history.slice(-7).reduce((acc, day) => acc + (day.xpGained || 0), 0);

    // Streaks are usually managed by a separate service, but we'll use a derived one for now
    // In actual app, we might want to get this from playerStats or a streak service
    const streakData = useMemo(() => ({
        currentStreak: history.length > 0 ? (history[history.length - 1]?.xpGained > 0 ? history.length : 0) : 0,
        longestStreak: history.length
    }), [history]);

    const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d' | '90d' | '1y'>('7d');

    // ── Data Calculations ───────────────────────────────────────────────────
    const recentPrayerCount = last14Days.reduce((acc, date) => acc + (prayerMap[date]?.size || 0), 0);
    const d = new Date();
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const todayPrayerCount = prayerMap[todayStr]?.size || 0;

    const activeDaysLast30 = history.slice(-30).filter(d => (d.xpGained || 0) > 0).length;
    const consistency = Math.round((activeDaysLast30 / Math.min(history.length || 1, 30)) * 100) || 0;

    const chartData = useMemo(() => {
        if (timeRange === 'today') {
            const hours = Array.from({ length: 24 }, (_, i) => i);
            const todayMissions = completedMissions.filter(m => m.completedAt.startsWith(todayStr));
            return hours.map(hour => {
                const xp = todayMissions
                    .filter(m => new Date(m.completedAt).getHours() === hour)
                    .reduce((sum, m) => sum + m.xpEarned, 0);
                return {
                    date: `${hour}:00`,
                    dateLabel: `${hour}:00`,
                    xp: xp
                };
            });
        }

        if (timeRange === '1y') {
            const last12Months = Array.from({ length: 12 }, (_, i) => {
                const date = new Date();
                date.setMonth(date.getMonth() - (11 - i));
                return date.toISOString().substring(0, 7);
            });

            return last12Months.map(monthStr => {
                const xp = history
                    .filter(h => h.date.startsWith(monthStr))
                    .reduce((sum, h) => sum + h.xpGained, 0);
                const [year, month] = monthStr.split('-');
                const dateLabel = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString(t.stats.header.title.includes("Statistik") ? "id-ID" : "en-US", { month: 'short' });
                return {
                    date: monthStr,
                    dateLabel,
                    xp: xp
                };
            });
        }

        const daysCount = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
        const rangeDays = Array.from({ length: daysCount }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (daysCount - 1 - i));
            return date.toISOString().split('T')[0];
        });

        return rangeDays.map(dateStr => {
            const h = history.find(entry => entry.date === dateStr);
            const d = new Date(dateStr);
            let dateLabel = d.toLocaleDateString(t.stats.header.title.includes("Statistik") ? "id-ID" : "en-US", { weekday: 'short' });
            if (timeRange !== '7d') {
                dateLabel = d.toLocaleDateString(t.stats.header.title.includes("Statistik") ? "id-ID" : "en-US", { day: 'numeric', month: 'short' });
            }
            return {
                date: dateStr,
                dateLabel,
                xp: h ? h.xpGained : 0
            };
        });
    }, [history, t, timeRange, todayStr, completedMissions]);

    const rangeStats = useMemo(() => {
        const totalXp = chartData.reduce((sum, d) => sum + d.xp, 0);
        return { totalXp };
    }, [chartData]);

    const chartConfig = {
        xp: { label: "XP", color: "rgb(var(--color-primary))" }
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
        avgDailyXp,
        playerRank,
        nextRank
    } = useStatsInsights({
        history,
        playerStats,
        weeklyXP,
        last14Days,
        prayerMap,
        completedMissions,
        t
    });

    if (!mounted) {
        return <div className="min-h-screen bg-[rgb(var(--color-background))]" />;
    }

    const filters = [
        { id: 'today', label: t.stats.chart.filters.today },
        { id: '7d', label: t.stats.chart.filters.last7d },
        { id: '30d', label: t.stats.chart.filters.last30d },
        { id: '90d', label: t.stats.chart.filters.last90d },
        { id: '1y', label: t.stats.chart.filters.last1y },
    ];

    return (
        <div className="min-h-screen bg-[rgb(var(--color-background))] text-white pb-nav">
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
                weeklyXP={weeklyXP}
                consistency={consistency}
                timeRange={timeRange}
                totalXp={rangeStats.totalXp}
                setIsRankModalOpen={setIsRankModalOpen}
                setActiveInsight={setActiveInsight}
            />

            <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">
                <XPTrendChart
                    t={t}
                    chartData={chartData}
                    chartConfig={chartConfig}
                    timeRange={timeRange}
                    setTimeRange={setTimeRange}
                />

                <PrayerConsistency
                    t={t}
                    todayPrayerCount={todayPrayerCount}
                    last14Days={last14Days}
                    prayerMap={prayerMap}
                    PRAYER_SUFFIXES={PRAYER_SUFFIXES}
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
                                        <p className="text-[10px] font-bold text-white/40 uppercase mb-1">{t.stats.level.currentXp}</p>
                                        <p className="text-sm font-black text-white">{playerStats.xp.toLocaleString()}</p>
                                    </div>
                                    <div className="p-3 bg-white/[0.03] border border-white/5 rounded-2xl">
                                        <p className="text-[10px] font-bold text-white/40 uppercase mb-1">{t.stats.level.nextLevelXp}</p>
                                        <p className="text-sm font-black text-white">{playerStats.nextLevelXp.toLocaleString()}</p>
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
                        weeklyXP,
                        avgDailyXp,
                        powerDayName: powerDayName || "",
                        consistency,
                        totalQuranAyat,
                        nextQuranMilestone,
                        history
                    }}
                />
            </div>
        </div>
    );
}

function QuickStatCard({ title, value, subtitle, icon, onClick }: { title: string, value: string, subtitle: string, icon: React.ReactNode, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="p-4 rounded-[24px] border border-white/5 bg-white/[0.02] flex flex-col items-start gap-2 text-left hover:bg-white/5 transition-all group"
        >
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{title}</p>
                <div className="flex items-baseline gap-1">
                    <h3 className="text-lg font-black text-white font-mono">{value}</h3>
                </div>
                <p className="text-[9px] text-white/30 truncate">{subtitle}</p>
            </div>
        </button>
    );
}

const ZapIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
);

const Target = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
    </svg>
);

const Flame = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.5 3.5 6.5 1 1.5 2 3 2 4.5a6 6 0 1 1-12 0c0-1.5.5-3 2-4.5.5 1 1 2 1 3.5Z" />
    </svg>
);
