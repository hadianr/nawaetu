'use client';

import React from 'react';
import { InsightKey } from "@/hooks/useStatsInsights";

interface CategoryBreakdownProps {
    t: any;
    categoryStats: Record<string, { count: number; label: string; icon: string; color: string }>;
    maxCatCount: number;
    setActiveInsight: (val: InsightKey | null) => void;
}

export function CategoryBreakdown({
    t,
    categoryStats,
    maxCatCount,
    setActiveInsight
}: CategoryBreakdownProps) {
    // Filter out categories with 0 count to only show what's relevant
    const activeStats = Object.entries(categoryStats).filter(([_, cat]) => cat.count > 0);

    // If no stats yet, show a placeholder or nothing
    if (activeStats.length === 0) return null;

    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <h2 className="font-bold text-sm mb-5 flex items-center gap-2">
                <span className="text-base">🎯</span>
                {t.stats.missions.title}
            </h2>
            <div className="space-y-4">
                {activeStats.map(([key, cat]) => (
                    <button
                        key={key}
                        onClick={() => {
                            if (key === 'prayer' || key === 'sunnah') setActiveInsight('prayers');
                            if (key === 'quran') setActiveInsight('quran');
                            if (key === 'dhikr') setActiveInsight('dhikr');
                        }}
                        className="w-full text-left group"
                    >
                        <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                                <span className="text-sm grayscale group-hover:grayscale-0 transition-all">{cat.icon}</span>
                                <span className="text-[11px] font-bold text-white/70 group-hover:text-white transition-colors uppercase tracking-wider">{cat.label}</span>
                            </div>
                            <span className="text-xs font-black text-white">{cat.count}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-1000 shadow-sm"
                                style={{
                                    width: `${(cat.count / maxCatCount) * 100}%`,
                                    backgroundColor: cat.color
                                }}
                            />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
