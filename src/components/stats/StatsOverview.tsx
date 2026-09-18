'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import {
    ChevronLeft,
    Star,
    Flame,
    ZapIcon,
    Target,
    Info
} from "lucide-react";
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { AppIcon, resolveAppIconName } from "@/components/ui/AppIcon";
import { InsightKey } from "@/hooks/useStatsInsights";
import type { TranslationTree } from "@/context/LocaleContext";
import type { PlayerStats } from "@/lib/habits/leveling";

type RankDetails = TranslationTree["stats"]["ranks"][keyof TranslationTree["stats"]["ranks"]];
type NextRankDetails = RankDetails & { levelsRemaining: number };

interface StatsOverviewProps {
    t: TranslationTree;
    playerStats: PlayerStats;
    playerRank: RankDetails;
    nextRank: NextRankDetails | null;
    streakData: { currentStreak: number; longestStreak: number };
    recentPrayerCount: number;
    consistency: number;
    timeRange: string;
    totalHasanah: number;
    setIsRankModalOpen: (val: boolean) => void;
    setActiveInsight: (val: InsightKey | null) => void;
    onStreakClick: () => void;
}

export function StatsOverview({
    t,
    playerStats,
    playerRank,
    nextRank,
    streakData,
    recentPrayerCount,
    consistency,
    timeRange,
    totalHasanah,
    setIsRankModalOpen,
    setActiveInsight,
    onStreakClick
}: StatsOverviewProps) {
    return (
        <div className="space-y-4 max-w-2xl mx-auto px-6">
            {/* Level & XP Card - Compact Version */}
            <button
                onClick={() => setIsRankModalOpen(true)}
                className="w-full text-left relative overflow-hidden rounded-3xl border border-[rgb(var(--color-border))] bg-gradient-to-br from-[rgb(var(--color-primary))]/20 via-[rgb(var(--color-surface))] to-[rgb(var(--color-surface-subtle))] p-4 active:scale-[0.98] transition-all group mt-4 shadow-[var(--shadow-card)]"
            >
                <div className="absolute top-0 right-0 w-40 h-40 bg-[rgb(var(--color-primary))]/10 rounded-full blur-[60px] pointer-events-none" />
                <div className="relative z-10 flex items-center gap-4">
                    {/* Rank Badge - Smaller & Compact */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-2xl bg-[rgb(var(--color-surface-subtle))] border border-[rgb(var(--color-border))] flex items-center justify-center text-2xl sm:text-3xl shadow-[var(--shadow-card)] group-hover:scale-110 transition-transform duration-500">
                        <AppIcon name={resolveAppIconName(playerRank.icon)} size="md" tone="primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                                <h2 className="text-base sm:text-lg font-black text-[rgb(var(--color-text-strong))] group-hover:text-[rgb(var(--color-primary))] transition-colors truncate">
                                    {playerRank.title}
                                </h2>
                                <span className="text-[7px] sm:text-[8px] font-black tracking-widest uppercase text-[rgb(var(--color-primary-light))] bg-[rgb(var(--color-primary))]/20 px-1.5 py-0.5 rounded border border-[rgb(var(--color-primary))]/30 shrink-0">
                                    LV. {playerStats.level}
                                </span>
                            </div>
                            <div className="text-right shrink-0">
                                <span className="text-[rgb(var(--color-primary-light))] text-[10px] sm:text-xs font-black">{playerStats.hasanah}</span>
                                <span className="text-[rgb(var(--color-text-muted))] text-[9px] sm:text-[10px] ml-0.5">/ {playerStats.nextLevelHasanah}</span>
                            </div>
                        </div>

                        {/* Progress Bar - Slimmer */}
                        <div className="h-1 w-full bg-[rgb(var(--color-surface-subtle))] rounded-full overflow-hidden border border-[rgb(var(--color-border))] p-0 mb-2">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-primary-light))] shadow-[0_0_10px_rgba(var(--color-primary),0.5)] transition-all duration-1000"
                                style={{ width: `${playerStats.progress}%` }}
                            />
                        </div>

                        {/* Next Milestone - Inline & Clearer */}
                        {nextRank && (
                            <div className="flex items-center justify-between gap-2 text-[9px] sm:text-[10px] bg-[rgb(var(--color-surface-subtle))] rounded-xl px-2.5 py-1 sm:py-1.5 mt-1 border border-[rgb(var(--color-border))]">
                                <div className="flex items-center gap-1.5 truncate">
                                    <span className="text-[8px] sm:text-[9px] font-black uppercase text-[rgb(var(--color-text-muted))] tracking-tighter shrink-0 hidden xs:inline">
                                        {t.stats.level.nextRankGoal}
                                    </span>
                                    <div className="flex items-center gap-1 truncate">
                                        <AppIcon name={resolveAppIconName(nextRank.icon)} size="sm" tone="muted" />
                                        <span className="text-[rgb(var(--color-text))] font-bold truncate">{nextRank.title}</span>
                                    </div>
                                </div>
                                <div className="shrink-0 flex items-center gap-1.5">
                                    <div className="w-1 h-1 rounded-full bg-[rgb(var(--color-border))] hidden sm:block" />
                                    <div className="font-black text-[rgb(var(--color-primary-light))] uppercase tracking-tighter">
                                        {nextRank.levelsRemaining} {t.stats.level.levelsRemaining}
                                    </div>
                                </div>
                            </div>
                        )}

                        {nextRank && (
                            <p className="hidden sm:block text-[9px] text-[rgb(var(--color-text-muted))] mt-1.5 px-1 truncate italic">
                                &quot;{nextRank.milestone}&quot;
                            </p>
                        )}
                    </div>
                </div>
            </button>

            <Link
                href="/rewards"
                className="flex items-center justify-center gap-2 rounded-2xl border border-[rgb(var(--color-primary))]/25 bg-[rgb(var(--color-primary))]/10 px-4 py-3 text-xs font-bold text-[rgb(var(--color-primary-strong))] transition-colors hover:bg-[rgb(var(--color-primary))]/20"
            >
                <ZapIcon className="h-4 w-4" />
                {t.rewards.cta}
            </Link>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    {
                        id: 'streak' as const,
                        icon: <Flame className="w-4 h-4 text-[rgb(var(--color-accent))]" />,
                        label: t.stats.quick.currentStreak,
                        value: `${streakData.currentStreak}`,
                        sub: t.stats.quick.longestStreak.replace('{{days}}', streakData.longestStreak.toString()),
                        gradient: "from-orange-500/10",
                    },
                    {
                        id: 'prayers' as const,
                        icon: <AppIcon name="landmark" size="sm" tone="primary" label={t.stats.quick.weeklyPrayers} />,
                        label: t.stats.quick.weeklyPrayers,
                        value: `${recentPrayerCount}`,
                        sub: t.stats.quick.outOf35,
                        gradient: "from-[rgb(var(--color-primary))]/10",
                    },
                    {
                        id: 'hasanah' as const,
                        icon: <ZapIcon className="w-4 h-4 text-[rgb(var(--color-warning))]" />,
                        label: `Hasanah ${t.stats.chart.filters[timeRange === 'today' ? 'today' : timeRange === '7d' ? 'last7d' : timeRange === '30d' ? 'last30d' : timeRange === '90d' ? 'last90d' : 'last1y']}`,
                        value: totalHasanah.toLocaleString(),
                        sub: timeRange === 'today' ? t.stats.chart.subtitle : `${timeRange.toUpperCase()} ${t.stats.quick.lastDays}`,
                        gradient: "from-yellow-500/10",
                    },
                    {
                        id: 'consistency' as const,
                        icon: <Target className="w-4 h-4 text-violet-400" />,
                        label: t.stats.quick.consistency,
                        value: `${consistency}%`,
                        sub: t.stats.quick.last30Days,
                        gradient: "from-violet-500/10",
                    },
                ].map((stat, i) => (
                    <button
                        key={i}
                        onClick={() => stat.id === 'streak' ? onStreakClick() : setActiveInsight(stat.id)}
                        className={cn(
                            "text-left relative overflow-hidden rounded-2xl border border-[rgb(var(--color-border))] bg-gradient-to-br to-transparent p-4 active:scale-[0.98] transition-all group",
                            stat.gradient
                        )}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            {stat.icon}
                            <span className="text-[10px] text-[rgb(var(--color-text-muted))] group-hover:text-[rgb(var(--color-text))] transition-colors line-clamp-1">{stat.label}</span>
                            <Info className="w-2.5 h-2.5 ml-auto opacity-0 group-hover:opacity-40 transition-opacity" />
                        </div>
                        <div className="text-xl md:text-2xl font-black text-[rgb(var(--color-text-strong))]">{stat.value}</div>
                        <div className="text-[9px] text-[rgb(var(--color-text-muted))] mt-0.5">{stat.sub}</div>
                    </button>
                ))}
            </div>
        </div>
    );
}

export function StatsHeader({ t, playerStats }: { t: TranslationTree; playerStats: PlayerStats }) {
    return (
        <div className="sticky top-0 z-10 bg-gradient-to-b from-[rgb(var(--color-surface))] to-transparent backdrop-blur-xl border-b border-[rgb(var(--color-border))]">
            <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-full text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-surface-subtle))] hover:text-[rgb(var(--color-text-strong))]">
                    <Link href="/"><ChevronLeft className="h-6 w-6" /></Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold">{t.stats.header.title}</h1>
                    <p className="text-xs text-[rgb(var(--color-text-muted))]">{t.stats.header.subtitle}</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[rgb(var(--color-primary))]/20 border border-[rgb(var(--color-primary))]/30 rounded-full">
                    <Star className="w-3 h-3 text-[rgb(var(--color-primary-light))]" />
                    <span className="text-xs font-bold text-[rgb(var(--color-primary-light))]">Lv {playerStats.level}</span>
                </div>
            </div>
        </div>
    );
}
