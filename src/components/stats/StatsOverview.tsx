'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, Flame, Target, Info, Gift, Sparkles } from "@/components/ui/icons";
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { AppIcon } from "@/components/ui/AppIcon";
import { StageCard } from "@/components/progress/StageCard";
import { InsightKey } from "@/hooks/useStatsInsights";
import type { TranslationTree } from "@/context/LocaleContext";
import type { PlayerStats } from "@/lib/habits/leveling";

interface StatsOverviewProps {
    t: TranslationTree;
    playerStats: PlayerStats;
    streakData: { currentStreak: number; longestStreak: number };
    recentPrayerCount: number;
    /** Obligatory prayers due in those 14 days, with udzur days left out. */
    prayersDue: number;
    consistency: number;
    timeRange: string;
    totalHasanah: number;
    setActiveInsight: (val: InsightKey | null) => void;
    onStreakClick: () => void;
}

export function StatsOverview({
    t,
    playerStats,
    streakData,
    recentPrayerCount,
    prayersDue,
    consistency,
    timeRange,
    totalHasanah,
    setActiveInsight,
    onStreakClick
}: StatsOverviewProps) {
    return (
        <div className="space-y-4 max-w-2xl mx-auto px-6">
            <StageCard t={t} stats={playerStats} className="mt-4" />

            <Link
                href="/rewards"
                className="flex items-center justify-center gap-2 rounded-2xl border border-[rgb(var(--color-primary))]/25 bg-[rgb(var(--color-primary))]/10 px-4 py-3 text-xs font-bold text-[rgb(var(--color-primary-strong))] transition-colors hover:bg-[rgb(var(--color-primary))]/20 shadow-[var(--shadow-card)]"
            >
                <Gift className="h-4 w-4" />
                {t.rewards.cta}
            </Link>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    {
                        id: 'streak' as const,
                        icon: <Flame className="w-4 h-4 text-[rgb(var(--color-accent-strong))]" />,
                        label: t.stats.quick.currentStreak,
                        // A lapsed streak reads as an invitation, not a big zero.
                        value: streakData.currentStreak > 0 ? `${streakData.currentStreak}` : t.stats.journey.streakRestart,
                        sub: t.stats.quick.longestStreak.replace('{{days}}', streakData.longestStreak.toString()),
                        gradient: "",
                    },
                    {
                        id: 'prayers' as const,
                        icon: <AppIcon name="mosque" size="sm" tone="primary" label={t.stats.quick.weeklyPrayers} />,
                        label: t.stats.quick.weeklyPrayers,
                        value: `${recentPrayerCount}`,
                        sub: t.stats.quick.outOfDue.replace('{{due}}', prayersDue.toString()),
                        gradient: "from-[rgb(var(--color-primary))]/10",
                    },
                    {
                        id: 'hasanah' as const,
                        icon: <Sparkles className="w-4 h-4 text-[rgb(var(--color-warning))]" />,
                        label: `Hasanah ${t.stats.chart.filters[timeRange === 'today' ? 'today' : timeRange === '7d' ? 'last7d' : timeRange === '30d' ? 'last30d' : timeRange === '90d' ? 'last90d' : 'last1y']}`,
                        value: totalHasanah.toLocaleString(),
                        sub: timeRange === 'today' ? t.stats.chart.subtitle : `${timeRange.toUpperCase()} ${t.stats.quick.lastDays}`,
                        gradient: "",
                    },
                    {
                        id: 'consistency' as const,
                        icon: <Target className="w-4 h-4 text-[rgb(var(--color-primary-strong))]" />,
                        label: t.stats.quick.consistency,
                        value: `${consistency}%`,
                        sub: t.stats.quick.last30Days,
                        gradient: "",
                    },
                ].map((stat, i) => (
                    <button
                        key={i}
                        onClick={() => stat.id === 'streak' ? onStreakClick() : setActiveInsight(stat.id)}
                        className={cn(
                            "text-left relative overflow-hidden rounded-2xl border border-[rgb(var(--color-border))] bg-gradient-to-br to-transparent p-4 active:scale-[0.98] transition-all group shadow-[var(--shadow-card)]",
                            stat.gradient
                        )}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            {stat.icon}
                            <span className="text-xs text-[rgb(var(--color-text-muted))] group-hover:text-[rgb(var(--color-text))] transition-colors leading-tight break-words min-w-0">{stat.label}</span>
                            <Info className="hidden sm:block w-2.5 h-2.5 ml-auto shrink-0 opacity-0 group-hover:opacity-40 transition-opacity" />
                        </div>
                        <div className="text-xl md:text-2xl font-bold text-[rgb(var(--color-text-strong))]">{stat.value}</div>
                        <div className="text-xs text-[rgb(var(--color-text-muted))] mt-0.5">{stat.sub}</div>
                    </button>
                ))}
            </div>
        </div>
    );
}

export function StatsHeader({ t }: { t: TranslationTree }) {
    return (
        <div className="sticky top-0 z-10 bg-[rgb(var(--color-surface))]/95 border-b border-[rgb(var(--color-border))]">
            <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-full text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-surface-subtle))] hover:text-[rgb(var(--color-text-strong))]">
                    <Link href="/" aria-label={String(t.quranBack)}><ChevronLeft className="h-6 w-6" aria-hidden="true" /></Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold">{t.stats.header.title}</h1>
                    <p className="text-xs text-[rgb(var(--color-text-muted))]">{t.stats.header.subtitle}</p>
                </div>
            </div>
        </div>
    );
}
