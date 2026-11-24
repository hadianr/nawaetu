'use client';

import React from 'react';
import { useLocale } from '@/context/LocaleContext';
import type { TranslationTree } from '@/context/LocaleContext';
import { AppIcon } from '@/components/ui/AppIcon';

interface PrayerConsistencyProps {
    t: TranslationTree;
    todayPrayerCount: number;
    last14Days: string[];
    prayerMap: Record<string, Set<string>>;
    PRAYER_SUFFIXES: typeof import('@/hooks/useStatsInsights').PRAYER_SUFFIXES;
}

export function PrayerConsistency({
    t,
    todayPrayerCount,
    last14Days,
    prayerMap,
    PRAYER_SUFFIXES
}: PrayerConsistencyProps) {
    const { locale } = useLocale();
    const [viewDays, setViewDays] = React.useState(14);

    // Filter the days based on selection
    const displayedDays = last14Days.slice(0, viewDays);
    const totalCompleted = displayedDays.reduce((acc, date) => acc + (prayerMap[date]?.size || 0), 0);
    const maxPossible = displayedDays.length * 5;

    return (
        <div className="rounded-2xl border border-[rgb(var(--color-border))] bg-gradient-to-br from-[rgb(var(--color-surface-subtle))] to-transparent p-5 shadow-[var(--shadow-card)]">
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[rgb(var(--color-primary))]/10 border border-[rgb(var(--color-primary))]/20 flex items-center justify-center text-lg shadow-inner">
                            <AppIcon name="landmark" size="sm" tone="primary" label={t.stats.heatmap.title} />
                        </div>
                        <div>
                            <h2 className="font-bold text-sm text-[rgb(var(--color-text-strong))] tracking-tight leading-none mb-1">{t.stats.heatmap.title.split('(')[0].trim()}</h2>
                            <p className="text-xs text-[rgb(var(--color-text-muted))] font-bold tracking-tighter">
                                <span className="text-[rgb(var(--color-primary-strong))]">{totalCompleted}</span>/{maxPossible} {t.stats.heatmap.total}
                            </p>
                        </div>
                    </div>

                    <div className="flex bg-[rgb(var(--color-surface-subtle))] p-1 rounded-xl border border-[rgb(var(--color-border))]">
                        <button
                            type="button"
                            aria-pressed={viewDays === 7}
                            onClick={() => setViewDays(7)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${viewDays === 7 ? "bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))] shadow-[var(--shadow-card)]" : "text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text))]"}`}
                        >
                            {t.stats.heatmap.days7}
                        </button>
                        <button
                            type="button"
                            aria-pressed={viewDays === 14}
                            onClick={() => setViewDays(14)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${viewDays === 14 ? "bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))] shadow-[var(--shadow-card)]" : "text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text))]"}`}
                        >
                            {t.stats.heatmap.days14}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between px-1">
                    <span className="text-xs text-[rgb(var(--color-text-muted))] font-medium">{t.stats.heatmap.activityTrend}</span>
                    <span className="text-xs text-[rgb(var(--color-primary-strong))] font-bold bg-[rgb(var(--color-primary))]/15 border border-[rgb(var(--color-primary))]/20 px-2.5 py-1 rounded-lg">
                        {todayPrayerCount}/5 {t.stats.heatmap.today}
                    </span>
                </div>
            </div>

            <div className="flex gap-4">
                {/* Fixed Labels Column - Precisely Aligned to Dots */}
                <div className="flex flex-col pt-[53px] pb-4 flex-shrink-0">
                    {PRAYER_SUFFIXES.map((suffix) => (
                        <div key={suffix} className="h-6 flex items-center justify-center">
                            <span className="text-xs font-bold text-[rgb(var(--color-text-muted))] uppercase w-4 text-center">
                                {t.stats.insights.prayers.names[suffix]?.substring(0, 1) || suffix.substring(0, 1)}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Scrollable Data Area */}
                <div tabIndex={0} role="region" aria-label={t.stats.heatmap.title.split("(")[0].trim()} className="flex flex-1 justify-between gap-1.5 overflow-x-auto pb-4 scrollbar-hide">
                    {displayedDays.slice().reverse().map((dateStr) => {
                        const completedSet = prayerMap[dateStr] || new Set();
                        const d = new Date(dateStr);
                        const dayName = d.toLocaleDateString(locale === 'id' ? "id-ID" : "en-US", { weekday: 'short' });
                        const dateNum = d.getDate();
                        const monthName = d.toLocaleDateString(locale === 'id' ? "id-ID" : "en-US", { month: 'short' });

                        const now = new Date();
                        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                        const isToday = dateStr === todayStr;

                        return (
                            <div key={dateStr} className={`flex flex-col items-center flex-shrink-0 min-w-[36px] pt-2 pb-1 rounded-2xl transition-all ${isToday ? "bg-[rgb(var(--color-primary))]/10 border border-[rgb(var(--color-primary))]/20 ring-1 ring-[rgb(var(--color-primary))]/10" : "bg-[rgb(var(--color-surface-subtle))] border border-transparent"} shadow-[var(--shadow-card)]`}>
                                <div className="flex flex-col items-center mb-2">
                                    <span className={`text-xs font-bold uppercase tracking-wider ${isToday ? "text-[rgb(var(--color-primary-strong))]" : "text-[rgb(var(--color-text-muted))]"}`}>
                                        {dayName}
                                    </span>
                                    <span className={`text-xs font-bold mt-0.5 ${isToday ? "text-[rgb(var(--color-text-strong))]" : "text-[rgb(var(--color-text-muted))]"}`}>
                                        {dateNum}
                                    </span>
                                    <span className="text-xs font-bold text-[rgb(var(--color-text-muted))] uppercase">
                                        {monthName}
                                    </span>
                                </div>

                                <div className="flex flex-col">
                                    {PRAYER_SUFFIXES.map((suffix) => {
                                        const isDone = completedSet.has(suffix);
                                        return (
                                            <div key={suffix} className="h-6 flex items-center justify-center">
                                                <div
                                                    className={`w-4 h-4 rounded-full border transition-all duration-500 ${isDone
                                                        ? "bg-[rgb(var(--color-primary))] border-[rgb(var(--color-primary-light))]/30"
                                                        : "bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))]"
                                                        }`}
                                                    title={suffix}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-2 flex items-center justify-between text-xs border-t border-[rgb(var(--color-border))] pt-4">
                <div className="flex flex-wrap gap-x-3 gap-y-1.5 max-w-[75%]">
                    {PRAYER_SUFFIXES.map((s) => (
                        <div key={s} className="flex items-center gap-1.5 leading-none">
                            <span className="text-[rgb(var(--color-primary-strong))] font-bold text-xs">{t.stats.insights.prayers.names[s]?.substring(0, 1)}</span>
                            <span className="font-bold lowercase text-[rgb(var(--color-text-muted))]">{t.stats.insights.prayers.names[s]}</span>
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-2 bg-[rgb(var(--color-surface-subtle))] px-2.5 py-1.5 rounded-lg border border-[rgb(var(--color-border))]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--color-primary))]" />
                    <span className="font-bold tracking-tighter text-xs text-[rgb(var(--color-text))]">{t.stats.heatmap.completed}</span>
                </div>
            </div>
        </div>
    );
}
