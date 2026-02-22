"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    ChevronLeft, Flame, Trophy, BarChart3, Star,
    Zap, Target, BookOpen, Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPlayerStats } from "@/lib/leveling";
import { getStreak } from "@/lib/streak-utils";
import { getDailyActivityHistory } from "@/lib/analytics-utils";
import { useMissions } from "@/hooks/useMissions";
import { cn } from "@/lib/utils";

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

// Level archetype names
const LEVEL_NAMES: Record<number, string> = {
    1: "Mubtadi", 2: "Thalib", 3: "Salik", 4: "Mujahid", 5: "Pencari Rahmat",
    6: "Hamba Setia", 7: "Pemuda Masjid", 8: "Ahli Ibadah", 9: "Waliyyul Ummah", 10: "Pejuang Subuh",
};

export default function StatsPage() {
    const { completedMissions } = useMissions();
    const [mounted, setMounted] = useState(false);
    const [playerStats, setPlayerStats] = useState({ xp: 0, level: 1, nextLevelXp: 100, progress: 0 });
    const [streakData, setStreakData] = useState({ currentStreak: 0, longestStreak: 0 });
    const [history, setHistory] = useState(getDailyActivityHistory());

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

    // Weekly sholat total (max 35 = 5×7)
    const weeklyPrayerCount = last7Days.reduce((sum, d) => sum + (prayerMap[d]?.size || 0), 0);

    // Consistency: % of last 30 days with any activity or prayer
    const last30Days = getLastNDays(30);
    const activeDays30 = last30Days.filter((d) => (xpByDate[d] || 0) > 0 || (prayerMap[d]?.size || 0) > 0).length;
    const consistency = Math.round((activeDays30 / 30) * 100);

    // Mission breakdown by category
    const categoryStats: Record<string, { count: number; label: string; icon: string; color: string }> = {
        prayer: { count: 0, label: "Sholat", icon: "🕌", color: "rgb(var(--color-primary))" },
        worship: { count: 0, label: "Ibadah", icon: "🤲", color: "#f59e0b" },
        quran: { count: 0, label: "Al-Quran", icon: "📖", color: "#3b82f6" },
        dhikr: { count: 0, label: "Dzikir", icon: "📿", color: "#8b5cf6" },
        fasting: { count: 0, label: "Puasa", icon: "🌙", color: "#06b6d4" },
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

    const levelName = LEVEL_NAMES[playerStats.level] || `Level ${playerStats.level}`;

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
                        <h1 className="text-xl font-bold">Statistik Ibadah</h1>
                        <p className="text-xs text-white/60">Perjalanan spiritualmu</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[rgb(var(--color-primary))]/20 border border-[rgb(var(--color-primary))]/30 rounded-full">
                        <Star className="w-3 h-3 text-[rgb(var(--color-primary-light))]" />
                        <span className="text-xs font-bold text-[rgb(var(--color-primary-light))]">Lv {playerStats.level}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">

                {/* ── Level & XP Card ─────────────────────────────────────── */}
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[rgb(var(--color-primary))]/15 via-black/20 to-transparent p-5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[rgb(var(--color-primary))]/10 rounded-full blur-[60px] pointer-events-none" />
                    <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-xs text-white/50 mb-0.5">Peringkat Spiritual</p>
                                <p className="text-xl font-black text-white">{levelName}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black text-[rgb(var(--color-primary-light))]">{playerStats.xp.toLocaleString()}</p>
                                <p className="text-[10px] text-white/40">Total XP</p>
                            </div>
                        </div>
                        {/* Progress bar */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] text-white/50">
                                <span>Level {playerStats.level}</span>
                                <span>{Math.round(playerStats.progress)}% menuju Level {playerStats.level + 1}</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-primary-light))] rounded-full transition-all duration-700"
                                    style={{ width: `${playerStats.progress}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-white/40 text-right">{playerStats.nextLevelXp.toLocaleString()} XP dibutuhkan</p>
                        </div>
                    </div>
                </div>

                {/* ── Quick Stats Grid ─────────────────────────────────────── */}
                <div className="grid grid-cols-2 gap-3">
                    {[
                        {
                            icon: <Flame className="w-4 h-4 text-orange-400" />,
                            label: "Streak Saat Ini",
                            value: `${streakData.currentStreak}`,
                            sub: `Terpanjang: ${streakData.longestStreak} hari`,
                            gradient: "from-orange-500/10",
                        },
                        {
                            icon: <span className="text-base">🕌</span>,
                            label: "Sholat Minggu Ini",
                            value: `${weeklyPrayerCount}`,
                            sub: `dari 35 waktu sholat`,
                            gradient: "from-[rgb(var(--color-primary))]/10",
                        },
                        {
                            icon: <Zap className="w-4 h-4 text-yellow-400" />,
                            label: "XP Minggu Ini",
                            value: weeklyXP.toLocaleString(),
                            sub: "7 hari terakhir",
                            gradient: "from-yellow-500/10",
                        },
                        {
                            icon: <Target className="w-4 h-4 text-violet-400" />,
                            label: "Konsistensi",
                            value: `${consistency}%`,
                            sub: "30 hari terakhir",
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
                        <h2 className="font-bold text-sm">Konsistensi Sholat (7 Hari)</h2>
                        <span className="ml-auto text-xs text-[rgb(var(--color-primary-light))] font-semibold">
                            {todayPrayerCount}/5 hari ini
                        </span>
                    </div>

                    {/* Grid: rows = prayers, cols = days */}
                    <div className="overflow-x-auto">
                        <div className="min-w-[280px]">
                            {/* Day headers */}
                            <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: `40px repeat(7, 1fr)` }}>
                                <div /> {/* spacer */}
                                {last7Days.map((d) => (
                                    <div key={d} className={cn(
                                        "text-center text-[9px] font-semibold",
                                        d === todayStr ? "text-[rgb(var(--color-primary-light))]" : "text-white/30"
                                    )}>
                                        {shortDay(d)}
                                    </div>
                                ))}
                            </div>

                            {/* Prayer rows */}
                            {PRAYER_SUFFIXES.map((suffix) => (
                                <div key={suffix} className="grid gap-1 mb-1" style={{ gridTemplateColumns: `40px repeat(7, 1fr)` }}>
                                    <div className="flex items-center gap-1 pr-1">
                                        <span className="text-xs">{PRAYER_ICONS[suffix]}</span>
                                        <span className="text-[9px] text-white/40 capitalize">{suffix.charAt(0).toUpperCase() + suffix.slice(1)}</span>
                                    </div>
                                    {last7Days.map((d) => {
                                        const done = prayerMap[d]?.has(suffix);
                                        return (
                                            <div
                                                key={d}
                                                title={`${formatDate(d)}: ${done ? "✅" : "—"}`}
                                                className={cn(
                                                    "h-7 rounded-lg transition-all",
                                                    done
                                                        ? "bg-[rgb(var(--color-primary))] shadow-[0_0_8px_rgba(var(--color-primary),0.3)]"
                                                        : d === todayStr
                                                            ? "bg-white/10 border border-white/20 border-dashed"
                                                            : "bg-white/5"
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
                                    <span className="text-[9px] text-white/30">Terlewat</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded bg-[rgb(var(--color-primary))]" />
                                    <span className="text-[9px] text-white/30">Terlaksana</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── XP Bar Chart (14 days) ────────────────────────────────── */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                        <h2 className="font-bold text-sm">XP Harian (14 Hari)</h2>
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
                        <h2 className="font-bold text-sm">Ibadah Terlaksana</h2>
                        <span className="ml-auto text-xs text-white/40">{completedMissions.length} total</span>
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
                        "Sesungguhnya Allah tidak menyia-nyiakan pahala orang yang berbuat kebaikan."
                    </p>
                    <p className="text-[10px] text-white/30 mt-1">— QS. At-Taubah: 120</p>
                </div>

                {/* Quran & Dhikr extra info */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-blue-400/60 shrink-0" />
                        <div>
                            <p className="text-xs text-white/50">Al-Quran</p>
                            <p className="text-base font-black text-white">
                                {history.reduce((s, d) => s + (d.quranAyatRead || 0), 0)}
                            </p>
                            <p className="text-[9px] text-white/30">Ayat dibaca</p>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 flex items-center gap-3">
                        <span className="text-2xl shrink-0">📿</span>
                        <div>
                            <p className="text-xs text-white/50">Dzikir</p>
                            <p className="text-base font-black text-white">
                                {history.reduce((s, d) => s + (d.tasbihCount || 0), 0).toLocaleString()}
                            </p>
                            <p className="text-[9px] text-white/30">Total tasbih</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
