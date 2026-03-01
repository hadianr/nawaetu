"use client";

/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * FastingStats — Summary card showing total fasting, pending qadha/fidyah,
 * and a CTA to expand the QadhaTracker.
 */

import { useTranslations } from "@/context/LocaleContext";
import type { FastingYearStats } from "@/data/fasting/types";

interface FastingStatsProps {
    stats: FastingYearStats;
    hijriYear: number;
    onViewDetail: () => void;
}

export default function FastingStats({ stats, hijriYear, onViewDetail }: FastingStatsProps) {
    const t = useTranslations() as any;
    const totalObligations = stats.pendingQadha + stats.pendingFidyah;
    const yearLabel = (t.fastingStatsYear as string).replace("{year}", String(hijriYear));

    const statCards = [
        {
            value: stats.totalFasting,
            label: t.fastingStatsTotalFasting,
            color: "text-[rgb(var(--color-primary-light,var(--color-primary)))]",
            bg: "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/20",
            icon: "✅",
        },
        {
            value: stats.totalLogged,
            label: t.fastingStatsLogged,
            color: "text-white/70",
            bg: "bg-white/5 border-white/10",
            icon: "📋",
        },
        {
            value: stats.pendingQadha,
            label: t.fastingStatsPendingQadha,
            color: stats.pendingQadha > 0 ? "text-amber-400" : "text-green-400",
            bg: stats.pendingQadha > 0 ? "bg-amber-500/10 border-amber-500/25" : "bg-green-500/10 border-green-500/25",
            icon: stats.pendingQadha > 0 ? "⏳" : "✓",
        },
        {
            value: stats.pendingFidyah,
            label: t.fastingStatsPendingFidyah,
            color: stats.pendingFidyah > 0 ? "text-orange-400" : "text-green-400",
            bg: stats.pendingFidyah > 0 ? "bg-orange-500/10 border-orange-500/25" : "bg-green-500/10 border-green-500/25",
            icon: stats.pendingFidyah > 0 ? "💰" : "✓",
        },
    ];

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-semibold text-white text-sm">{t.fastingStatsTitle}</h4>
                    <p className="text-xs text-white/40">{yearLabel}</p>
                </div>
                {totalObligations === 0 && stats.totalLogged > 0 && (
                    <span className="text-xs text-green-400 font-medium">{t.fastingStatsAllClear}</span>
                )}
            </div>

            {/* Stat grid */}
            <div className="grid grid-cols-2 gap-2">
                {statCards.map((card, i) => (
                    <div key={i} className={`rounded-xl border px-3 py-2.5 ${card.bg}`}>
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-base">{card.icon}</span>
                            <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
                        </div>
                        <p className="text-[10px] text-white/40 leading-tight">{card.label}</p>
                    </div>
                ))}
            </div>

            {/* Progress bar: fasting/30 */}
            <div>
                <div className="flex justify-between text-[10px] text-white/30 mb-1">
                    <span>{stats.totalFasting} / 30</span>
                    <span>{Math.round((stats.totalFasting / 30) * 100)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                            width: `${(stats.totalFasting / 30) * 100}%`,
                            background: "linear-gradient(90deg, rgb(var(--color-primary)), rgb(var(--color-primary-light, var(--color-primary))))",
                        }}
                    />
                </div>
            </div>

            {/* View detail CTA */}
            {totalObligations > 0 && (
                <button
                    onClick={onViewDetail}
                    className="w-full text-xs text-[rgb(var(--color-primary-light,var(--color-primary)))] hover:underline text-left py-1 transition-all"
                >
                    {t.fastingStatsViewDetail}
                </button>
            )}
        </div>
    );
}
