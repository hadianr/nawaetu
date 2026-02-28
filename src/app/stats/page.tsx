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

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    ChevronLeft, Flame, Trophy, BarChart3, Star,
    Zap, Target, BookOpen, Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPlayerStats, RankKey } from "@/lib/leveling";
import { getStreak } from "@/lib/streak-utils";
import { getDailyActivityHistory } from "@/lib/analytics-utils";
import { useMissions } from "@/hooks/useMissions";
import { useTranslations } from "@/context/LocaleContext";
import GlobalStatsWidget from "@/components/home/GlobalStatsWidget";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Info } from "lucide-react";

// Prayer config for the heatmap
const PRAYER_SUFFIXES = ["subuh", "dzuhur", "ashar", "maghrib", "isya"] as const;
const PRAYER_ICONS: Record<string, string> = {
    subuh: "🌙", dzuhur: "☀️", ashar: "🌤️", maghrib: "🌅", isya: "🌃",
};

// Compute the last N days as YYYY-MM-DD strings (today-last)
function getLastNDays(n: number): string[] {
    const days: string[] = [];
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split("T")[0]);
    }
    return days;
}

// Map short day label from date string
function shortDay(dateStr: string): string {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("id-ID", { weekday: "short" });
}

// Format date for tooltip
function formatDate(dateStr: string): string {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

// Level archetypes are now handled via the getRankKey in leveling.ts and translations in stats.ts

export default function StatsPage() {
    const t = useTranslations();
    const { completedMissions } = useMissions();
    const [mounted, setMounted] = useState(false);
    const [playerStats, setPlayerStats] = useState({
        xp: 0, level: 1, nextLevelXp: 100, progress: 0,
        rankKey: 'mubtadi' as RankKey
    });
    const [streakData, setStreakData] = useState({ currentStreak: 0, longestStreak: 0 });
    const [history, setHistory] = useState(getDailyActivityHistory());
    const [isRankModalOpen, setIsRankModalOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
        setPlayerStats(getPlayerStats());
        const s = getStreak();
        setStreakData({ currentStreak: s.currentStreak, longestStreak: s.longestStreak });
        setHistory(getDailyActivityHistory());

        const refresh = () => {
            setPlayerStats(getPlayerStats());
            setHistory(getDailyActivityHistory());
        };
        window.addEventListener("xp_updated", refresh);
        window.addEventListener("mission_storage_updated", refresh);
        window.addEventListener("activity_updated", refresh);
        return () => {
            window.removeEventListener("xp_updated", refresh);
            window.removeEventListener("mission_storage_updated", refresh);
            window.removeEventListener("activity_updated", refresh);
        };
    }, []);

    // ── Derived data ─────────────────────────────────────────────────────────

    const last7Days = getLastNDays(7);
    const last14Days = getLastNDays(14);
    const todayStr = new Date().toISOString().split("T")[0];

    // XP chart: last 14 days
    const xpByDate: Record<string, number> = {};
    history.forEach((d) => { xpByDate[d.date] = d.xpGained; });
    const chartDays = last14Days.map((date) => ({ date, xp: xpByDate[date] || 0 }));
    const maxXP = Math.max(...chartDays.map((d) => d.xp), 1);

    // Weekly XP
    const weeklyXP = last7Days.reduce((sum, d) => sum + (xpByDate[d] || 0), 0);

    // Prayer heatmap: build set of completed sholat IDs per day
    // e.g. { "2026-02-22": Set { "subuh", "dzuhur" } }
    const prayerMap: Record<string, Set<string>> = {};
    completedMissions.forEach((m) => {
        const dateStr = m.completedAt.split("T")[0];
        // Match both male and female: sholat_subuh_male / sholat_subuh_female
        const match = m.id.match(/^sholat_([a-z]+)_(?:male|female)$/);
        if (match) {
            if (!prayerMap[dateStr]) prayerMap[dateStr] = new Set();
            prayerMap[dateStr].add(match[1]);
        }
    });

    // Today's sholat count
    const todayPrayerCount = prayerMap[todayStr]?.size || 0;

    // 14-day sholat total (max 70 = 5×14)
    const recentPrayerCount = last14Days.reduce((sum, d) => sum + (prayerMap[d]?.size || 0), 0);

    // Consistency: % of last 30 days with any activity or prayer
    const last30Days = getLastNDays(30);
    const activeDays30 = last30Days.filter((d) => (xpByDate[d] || 0) > 0 || (prayerMap[d]?.size || 0) > 0).length;
    const consistency = Math.round((activeDays30 / 30) * 100);

    // Mission breakdown by category
    const categoryStats: Record<string, { count: number; label: string; icon: string; color: string }> = {
        prayer: { count: 0, label: t.stats.missions.categories.prayer, icon: "🕌", color: "rgb(var(--color-primary))" },
        worship: { count: 0, label: t.stats.missions.categories.worship, icon: "🤲", color: "#f59e0b" },
        quran: { count: 0, label: t.stats.missions.categories.quran, icon: "📖", color: "#3b82f6" },
        dhikr: { count: 0, label: t.stats.missions.categories.dhikr, icon: "📿", color: "#8b5cf6" },
        fasting: { count: 0, label: t.stats.missions.categories.fasting, icon: "🌙", color: "#06b6d4" },
    };
    completedMissions.forEach((m) => {
        // Only count today's completions for each category (avoid inflating historics)
        // Actually, let's count all-time completions
        const cat = m.id.startsWith("sholat_") ? "prayer"
            : m.id.includes("quran") || m.id.includes("tilawah") ? "quran"
                : m.id.includes("puasa") || m.id.includes("sahur") ? "fasting"
                    : m.id.includes("tasbih") || m.id.includes("dzikir") || m.id.includes("istighfar") || m.id.includes("shalawat") ? "dhikr"
                        : "worship";
        if (categoryStats[cat]) categoryStats[cat].count++;
    });
    const maxCatCount = Math.max(...Object.values(categoryStats).map((c) => c.count), 1);

    const currentRank = t.stats.ranks[playerStats.rankKey] || t.stats.ranks.mubtadi;
    const levelName = currentRank.title;

    if (!mounted) {
        return <div className="min-h-screen bg-[rgb(var(--color-background))]" />;
    }

    return (
        <div className="min-h-screen bg-[rgb(var(--color-background))] text-white pb-nav">
            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="sticky top-0 z-10 bg-gradient-to-b from-[rgb(var(--color-surface))] to-transparent backdrop-blur-xl border-b border-white/5">
                <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full text-white/70 hover:bg-white/10 hover:text-white">
                        <Link href="/"><ChevronLeft className="h-6 w-6" /></Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold">{t.stats.header.title}</h1>
                        <p className="text-xs text-white/60">{t.stats.header.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[rgb(var(--color-primary))]/20 border border-[rgb(var(--color-primary))]/30 rounded-full">
                        <Star className="w-3 h-3 text-[rgb(var(--color-primary-light))]" />
                        <span className="text-xs font-bold text-[rgb(var(--color-primary-light))]">Lv {playerStats.level}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">

                {/* ── Global Impact Stats ─────────────────────────────────── */}
                <GlobalStatsWidget />

                {/* ── Level & XP Card (Clickable) ─────────────────────────── */}
                <button
                    onClick={() => setIsRankModalOpen(true)}
                    className="w-full text-left relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[rgb(var(--color-primary))]/15 via-black/20 to-transparent p-5 active:scale-[0.98] transition-all group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[rgb(var(--color-primary))]/10 rounded-full blur-[60px] pointer-events-none" />
                    <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <p className="text-[10px] font-bold tracking-wider uppercase text-[rgb(var(--color-primary-light))] opacity-80">{t.stats.level.rankLabel}</p>
                                    <Info className="w-3 h-3 text-[rgb(var(--color-primary-light))] opacity-40 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <p className="text-2xl font-black text-white group-hover:text-[rgb(var(--color-primary-light))] transition-colors">{levelName}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black text-[rgb(var(--color-primary-light))]">{playerStats.xp.toLocaleString()}</p>
                                <p className="text-[10px] text-white/40">{t.stats.level.totalXp}</p>
                            </div>
                        </div>
                        {/* Progress bar */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] text-white/50">
                                <span className="font-medium">Level {playerStats.level}</span>
                                <span className="font-medium text-[rgb(var(--color-primary-light))]">
                                    {Math.round(playerStats.progress)}% {t.stats.level.toNextLevel} {playerStats.level + 1}
                                </span>
                            </div>
                            <div className="h-2.5 bg-white/10 rounded-full overflow-hidden border border-white/5 p-0.5">
                                <div
                                    className="h-full bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-primary-light))] rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(var(--color-primary),0.5)]"
                                    style={{ width: `${playerStats.progress}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-white/40 text-right font-medium">
                                {playerStats.nextLevelXp.toLocaleString()} {t.stats.level.xpNeeded}
                            </p>
                        </div>
                    </div>
                </button>

                {/* ── Rank Detail Modal (Compact for SE) ───────────────────── */}
                <Dialog open={isRankModalOpen} onOpenChange={setIsRankModalOpen}>
                    <DialogContent className="max-w-md bg-[rgb(var(--color-surface))] border-white/10 text-white p-5 sm:p-6 gap-4">
                        <DialogHeader className="text-left gap-1">
                            <div className="flex items-center gap-1.5 text-[rgb(var(--color-primary-light))]">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                <span className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-70">
                                    {t.stats.level.rankLabel}
                                </span>
                            </div>
                            <DialogTitle className="text-xl sm:text-2xl font-black leading-tight tracking-tight">
                                {currentRank.title}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                <h4 className="text-[9px] font-bold text-white/40 uppercase tracking-wider mb-1.5">Makna Spiritual</h4>
                                <p className="text-xs text-white/90 leading-relaxed font-medium">
                                    {currentRank.desc}
                                </p>
                            </div>

                            <div className="bg-black/40 rounded-xl p-4 border border-[rgb(var(--color-primary))]/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-5">
                                    <Moon className="w-12 h-12" />
                                </div>
                                <span className="absolute top-1 left-2 text-2xl text-[rgb(var(--color-primary-light))] opacity-20 font-serif leading-none">&quot;</span>
                                <p className="text-[13px] italic text-white/95 mb-2.5 leading-snug relative z-10 px-2">
                                    {currentRank.quote}
                                </p>
                                <p className="text-[9px] text-[rgb(var(--color-primary-light))] font-bold text-right tracking-tight uppercase opacity-80">
                                    — {currentRank.source}
                                </p>
                            </div>

                            <div className="flex items-start gap-3 p-3.5 bg-gradient-to-r from-[rgb(var(--color-primary))]/10 to-[rgb(var(--color-primary))]/5 rounded-xl border border-[rgb(var(--color-primary))]/10">
                                <div className="p-1.5 bg-[rgb(var(--color-primary))]/20 rounded-lg shrink-0">
                                    <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-[rgb(var(--color-primary-light))] uppercase mb-0.5 tracking-wider opacity-80">Target Spiritual Berikutnya</p>
                                    <p className="text-[11px] text-white font-semibold leading-normal">{currentRank.milestone}</p>
                                </div>
                            </div>

                            <Button
                                onClick={() => setIsRankModalOpen(false)}
                                className="w-full h-11 rounded-xl bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-light))] text-white font-bold text-sm transition-all shadow-lg active:scale-95"
                            >
                                Mengerti
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* ── Quick Stats Grid ─────────────────────────────────────── */}
                <div className="grid grid-cols-2 gap-3">
                    {[
                        {
                            icon: <Flame className="w-4 h-4 text-orange-400" />,
                            label: t.stats.quick.currentStreak,
                            value: `${streakData.currentStreak}`,
                            sub: t.stats.quick.longestStreak.replace('{{days}}', streakData.longestStreak.toString()),
                            gradient: "from-orange-500/10",
                        },
                        {
                            icon: <span className="text-base">🕌</span>,
                            label: t.stats.quick.weeklyPrayers,
                            value: `${recentPrayerCount}`,
                            sub: t.stats.quick.outOf35,
                            gradient: "from-[rgb(var(--color-primary))]/10",
                        },
                        {
                            icon: <Zap className="w-4 h-4 text-yellow-400" />,
                            label: t.stats.quick.weeklyXp,
                            value: weeklyXP.toLocaleString(),
                            sub: t.stats.quick.last7Days,
                            gradient: "from-yellow-500/10",
                        },
                        {
                            icon: <Target className="w-4 h-4 text-violet-400" />,
                            label: t.stats.quick.consistency,
                            value: `${consistency}%`,
                            sub: t.stats.quick.last30Days,
                            gradient: "from-violet-500/10",
                        },
                    ].map((stat, i) => (
                        <div key={i} className={cn(
                            "relative overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-br to-transparent p-4",
                            stat.gradient
                        )}>
                            <div className="flex items-center gap-2 mb-2">
                                {stat.icon}
                                <span className="text-[10px] text-white/50">{stat.label}</span>
                            </div>
                            <div className="text-2xl font-black text-white">{stat.value}</div>
                            <div className="text-[10px] text-white/40 mt-0.5">{stat.sub}</div>
                        </div>
                    ))}
                </div>

                {/* ── Prayer Consistency (7-day heatmap) ───────────────────── */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-base">🕌</span>
                        <h2 className="font-bold text-sm">{t.stats.heatmap.title}</h2>
                        <span className="ml-auto text-[10px] text-[rgb(var(--color-primary-light))] font-semibold bg-[rgb(var(--color-primary))]/10 px-2 py-0.5 rounded-full">
                            {todayPrayerCount}/5 {t.stats.heatmap.today}
                        </span>
                    </div>

                    {/* Grid: rows = prayers, cols = days */}
                    <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
                        <div className="min-w-[480px] pb-2">
                            {/* Day headers */}
                            <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: `50px repeat(14, 1fr)` }}>
                                <div /> {/* spacer */}
                                {last14Days.map((d) => (
                                    <div key={d} className={cn(
                                        "text-center text-[8px] font-semibold",
                                        d === todayStr ? "text-[rgb(var(--color-primary-light))]" : "text-white/30"
                                    )}>
                                        {shortDay(d)}
                                    </div>
                                ))}
                            </div>

                            {/* Prayer rows */}
                            {PRAYER_SUFFIXES.map((suffix) => (
                                <div key={suffix} className="grid gap-1 mb-1" style={{ gridTemplateColumns: `50px repeat(14, 1fr)` }}>
                                    <div className="flex items-center gap-1 pr-1 truncate">
                                        <span className="text-[10px]">{PRAYER_ICONS[suffix]}</span>
                                        <span className="text-[8px] text-white/40 capitalize leading-none">{suffix}</span>
                                    </div>
                                    {last14Days.map((d) => {
                                        const done = prayerMap[d]?.has(suffix);
                                        return (
                                            <div
                                                key={d}
                                                title={`${formatDate(d)}: ${done ? "✅ " + t.stats.heatmap.completed : "— " + t.stats.heatmap.missed}`}
                                                className={cn(
                                                    "h-8 rounded-lg transition-all border border-transparent",
                                                    done
                                                        ? "bg-[rgb(var(--color-primary))] shadow-[0_0_8px_rgba(var(--color-primary),0.3)]"
                                                        : d === todayStr
                                                            ? "bg-white/10 border-white/20 border-dashed"
                                                            : "bg-white/5 border-white/5"
                                                )}
                                            />
                                        );
                                    })}
                                </div>
                            ))}

                            {/* Legend */}
                            <div className="flex items-center gap-3 mt-3 justify-end">
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded bg-white/5" />
                                    <span className="text-[9px] text-white/30">{t.stats.heatmap.missed}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded bg-[rgb(var(--color-primary))]" />
                                    <span className="text-[9px] text-white/30">{t.stats.heatmap.completed}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── XP Bar Chart (14 days) ────────────────────────────────── */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                        <h2 className="font-bold text-sm">{t.stats.xpChart.title}</h2>
                    </div>

                    <div className="space-y-1.5">
                        {chartDays.map((day) => {
                            const pct = maxXP > 0 ? (day.xp / maxXP) * 100 : 0;
                            const isToday = day.date === todayStr;
                            const isBest = day.xp === maxXP && day.xp > 0;
                            return (
                                <div key={day.date} className="flex items-center gap-2">
                                    <span className={cn(
                                        "text-[9px] w-7 shrink-0",
                                        isToday ? "text-[rgb(var(--color-primary-light))] font-bold" : "text-white/40"
                                    )}>
                                        {shortDay(day.date)}
                                    </span>
                                    <div className="flex-1 h-5 bg-white/5 rounded-md overflow-hidden relative">
                                        <div
                                            className={cn(
                                                "h-full rounded-md transition-all duration-700",
                                                isBest
                                                    ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                                                    : isToday
                                                        ? "bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-primary-light))]"
                                                        : "bg-gradient-to-r from-[rgb(var(--color-primary))]/60 to-[rgb(var(--color-primary-light))]/40"
                                            )}
                                            style={{ width: `${pct}%` }}
                                        />
                                        {isBest && day.xp > 0 && (
                                            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[8px] text-amber-900 font-bold">
                                                🏆
                                            </span>
                                        )}
                                    </div>
                                    <span className={cn(
                                        "text-[9px] w-8 text-right font-mono shrink-0",
                                        isToday ? "text-white" : "text-white/40"
                                    )}>
                                        {day.xp > 0 ? day.xp : "—"}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Missions Breakdown ────────────────────────────────────── */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <h2 className="font-bold text-sm">{t.stats.missions.title}</h2>
                        <span className="ml-auto text-xs text-white/40">{completedMissions.length} {t.stats.missions.total}</span>
                    </div>

                    <div className="space-y-3">
                        {Object.entries(categoryStats).map(([key, cat]) => {
                            const pct = maxCatCount > 0 ? (cat.count / maxCatCount) * 100 : 0;
                            return (
                                <div key={key} className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm">{cat.icon}</span>
                                            <span className="text-xs text-white/70">{cat.label}</span>
                                        </div>
                                        <span className="text-xs font-bold text-white/80">{cat.count}×</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{
                                                width: `${pct}%`,
                                                background: cat.color,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Motivational Footer ───────────────────────────────────── */}
                <div className="rounded-2xl border border-[rgb(var(--color-primary))]/20 bg-gradient-to-br from-[rgb(var(--color-primary))]/10 to-transparent p-5 text-center">
                    <Moon className="w-6 h-6 text-[rgb(var(--color-primary-light))]/60 mx-auto mb-2" />
                    <p className="text-xs text-white/50 italic leading-relaxed">
                        {t.stats.quote.text}
                    </p>
                    <p className="text-[10px] text-white/30 mt-1">{t.stats.quote.source}</p>
                </div>

                {/* Quran & Dhikr extra info */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-blue-400/60 shrink-0" />
                        <div>
                            <p className="text-xs text-white/50">{t.stats.extra.quran}</p>
                            <p className="text-base font-black text-white">
                                {history.reduce((s, d) => s + (d.quranAyatRead || 0), 0)}
                            </p>
                            <p className="text-[9px] text-white/30">{t.stats.extra.ayatRead}</p>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 flex items-center gap-3">
                        <span className="text-2xl shrink-0">📿</span>
                        <div>
                            <p className="text-xs text-white/50">{t.stats.extra.dhikr}</p>
                            <p className="text-base font-black text-white">
                                {history.reduce((s, d) => s + (d.tasbihCount || 0), 0).toLocaleString()}
                            </p>
                            <p className="text-[9px] text-white/30">{t.stats.extra.totalTasbih}</p>
                        </div>
                    </div>
                </div>

            </div >
        </div >
    );
}
