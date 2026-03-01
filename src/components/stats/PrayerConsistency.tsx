'use client';

import React from 'react';

interface PrayerConsistencyProps {
    t: any;
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
    const [viewDays, setViewDays] = React.useState(14);

    // Filter the days based on selection
    const displayedDays = last14Days.slice(0, viewDays);
    const totalCompleted = displayedDays.reduce((acc, date) => acc + (prayerMap[date]?.size || 0), 0);
    const maxPossible = displayedDays.length * 5;

    return (
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent p-5 shadow-xl">
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[rgb(var(--color-primary))]/10 border border-[rgb(var(--color-primary))]/20 flex items-center justify-center text-lg shadow-inner">
                            🕌
                        </div>
                        <div>
                            <h2 className="font-black text-sm text-white tracking-tight leading-none mb-1">{t.stats.heatmap.title.split('(')[0].trim()}</h2>
                            <p className="text-[9px] text-white/40 font-bold uppercase tracking-tighter">
                                <span className="text-[rgb(var(--color-primary-light))]">{totalCompleted}</span>/{maxPossible} {t.stats.heatmap.total}
                            </p>
                        </div>
                    </div>

                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                        <button
                            onClick={() => setViewDays(7)}
                            className={`px-3 py-1 rounded-lg text-[9px] font-black transition-all ${viewDays === 7 ? "bg-[rgb(var(--color-primary))] text-white shadow-lg" : "text-white/40 hover:text-white/60"}`}
                        >
                            7H
                        </button>
                        <button
                            onClick={() => setViewDays(14)}
                            className={`px-3 py-1 rounded-lg text-[9px] font-black transition-all ${viewDays === 14 ? "bg-[rgb(var(--color-primary))] text-white shadow-lg" : "text-white/40 hover:text-white/60"}`}
                        >
                            14H
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] text-white/40 font-medium">Tren aktivitas</span>
                    <span className="text-[10px] text-[rgb(var(--color-primary-light))] font-black bg-[rgb(var(--color-primary))]/15 border border-[rgb(var(--color-primary))]/20 px-2.5 py-1 rounded-lg">
                        {todayPrayerCount}/5 {t.stats.heatmap.today}
                    </span>
                </div>
            </div>

            <div className="flex gap-4">
                {/* Fixed Labels Column - Precisely Aligned to Dots */}
                <div className="flex flex-col pt-[53px] pb-4 flex-shrink-0">
                    {PRAYER_SUFFIXES.map((suffix) => (
                        <div key={suffix} className="h-6 flex items-center justify-center">
                            <span className="text-[10px] font-black text-white/70 uppercase w-4 text-center">
                                {t.stats.insights.prayers.names[suffix]?.substring(0, 1) || suffix.substring(0, 1)}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Scrollable Data Area */}
                <div className="flex flex-1 justify-between gap-1.5 overflow-x-auto pb-4 scrollbar-none">
                    {displayedDays.slice().reverse().map((dateStr) => {
                        const completedSet = prayerMap[dateStr] || new Set();
                        const d = new Date(dateStr);
                        const dayName = d.toLocaleDateString(t.stats.header.title.includes("Statistik") ? "id-ID" : "en-US", { weekday: 'short' });
                        const dateNum = d.getDate();
                        const monthName = d.toLocaleDateString(t.stats.header.title.includes("Statistik") ? "id-ID" : "en-US", { month: 'short' });

                        const now = new Date();
                        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                        const isToday = dateStr === todayStr;

                        return (
                            <div key={dateStr} className={`flex flex-col items-center flex-shrink-0 min-w-[36px] pt-2 pb-1 rounded-2xl transition-all ${isToday ? "bg-[rgb(var(--color-primary))]/10 border border-[rgb(var(--color-primary))]/20 ring-1 ring-[rgb(var(--color-primary))]/10" : "bg-white/[0.02] border border-transparent"}`}>
                                <div className="flex flex-col items-center mb-2">
                                    <span className={`text-[8px] font-black uppercase tracking-widest ${isToday ? "text-[rgb(var(--color-primary-light))]" : "text-white/20"}`}>
                                        {dayName}
                                    </span>
                                    <span className={`text-[11px] font-black mt-0.5 ${isToday ? "text-white" : "text-white/60"}`}>
                                        {dateNum}
                                    </span>
                                    <span className="text-[7px] font-bold text-white/20 uppercase">
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
                                                        ? "bg-[rgb(var(--color-primary))] border-[rgb(var(--color-primary-light))]/30 shadow-[0_0_8px_rgba(var(--color-primary),0.4)]"
                                                        : "bg-white/5 border-white/10"
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

            <div className="mt-2 flex items-center justify-between text-[8px] border-t border-white/5 pt-4">
                <div className="flex flex-wrap gap-x-3 gap-y-1.5 max-w-[75%]">
                    {PRAYER_SUFFIXES.map((s) => (
                        <div key={s} className="flex items-center gap-1.5 leading-none">
                            <span className="text-[rgb(var(--color-primary-light))] font-black text-[9px]">{t.stats.insights.prayers.names[s]?.substring(0, 1)}</span>
                            <span className="font-bold lowercase text-white/70">{t.stats.insights.prayers.names[s]}</span>
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--color-primary))] shadow-[0_0_4px_rgba(var(--color-primary),0.8)]" />
                    <span className="font-black uppercase tracking-tighter text-[7px] text-white/80">{t.stats.heatmap.completed}</span>
                </div>
            </div>
        </div>
    );
}
