"use client";

/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * FastingStats — Summary card showing total fasting, pending qadha/fidyah,
 * and a CTA to expand the QadhaTracker.
 */

import { useTranslations } from "@/context/LocaleContext";
import type { TranslationTree } from "@/context/LocaleContext";
import type { FastingYearStats } from "@/data/fasting/types";
import { AppIcon } from "@/components/ui/AppIcon";
import type { AppIconName } from "@/lib/icon-names";

interface FastingStatsProps {
    stats: FastingYearStats;
    hijriYear: number;
    onViewDetail: () => void;
}

export default function FastingStats({ stats, hijriYear, onViewDetail }: FastingStatsProps) {
    const t = useTranslations() as TranslationTree;
    const totalObligations = stats.pendingQadha + stats.pendingFidyah;
    const yearLabel = (t.fastingStatsYear as string).replace("{year}", String(hijriYear));

    const statCards = [
        {
            value: stats.totalFasting,
            label: t.fastingStatsTotalFasting,
            color: "text-[rgb(var(--color-primary-light,var(--color-primary)))]",
            bg: "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/20",
            icon: "shield-check" as const,
        },
        {
            value: stats.totalLogged,
            label: t.fastingStatsLogged,
            color: "text-[rgb(var(--color-text))]",
            bg: "bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))]",
            icon: "scroll" as const,
        },
        {
            value: stats.pendingQadha,
            label: t.fastingStatsPendingQadha,
            color: stats.pendingQadha > 0 ? "text-[rgb(var(--color-warning))]" : "text-[rgb(var(--color-success))]",
            bg: stats.pendingQadha > 0 ? "bg-[rgb(var(--color-warning))]/10 border-[rgb(var(--color-warning))]/25" : "bg-[rgb(var(--color-success))]/10 border-[rgb(var(--color-success))]/25",
            icon: (stats.pendingQadha > 0 ? "calendar" : "shield-check") as AppIconName,
        },
        {
            value: stats.pendingFidyah,
            label: t.fastingStatsPendingFidyah,
            color: stats.pendingFidyah > 0 ? "text-[rgb(var(--color-accent))]" : "text-[rgb(var(--color-success))]",
            bg: stats.pendingFidyah > 0 ? "bg-[rgb(var(--color-accent))]/10 border-[rgb(var(--color-accent))]/25" : "bg-[rgb(var(--color-success))]/10 border-[rgb(var(--color-success))]/25",
            icon: (stats.pendingFidyah > 0 ? "star" : "shield-check") as AppIconName,
        },
    ];

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-semibold text-[rgb(var(--color-text-strong))] text-sm">{t.fastingStatsTitle}</h4>
                    <p className="text-xs text-[rgb(var(--color-text-muted))]">{yearLabel}</p>
                </div>
                {totalObligations === 0 && stats.totalLogged > 0 && (
                    <span className="text-xs text-[rgb(var(--color-success))] font-medium">{t.fastingStatsAllClear}</span>
                )}
            </div>

            {/* Stat grid */}
            <div className="grid grid-cols-2 gap-2">
                {statCards.map((card, i) => (
                    <div key={i} className={`rounded-xl border px-3 py-2.5 ${card.bg}`}>
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <AppIcon name={card.icon} size="sm" tone="primary" />
                            <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
                        </div>
                        <p className="text-[10px] text-[rgb(var(--color-text-muted))] leading-tight">{card.label}</p>
                    </div>
                ))}
            </div>

            {/* Progress bar: fasting/30 */}
            <div>
                <div className="flex justify-between text-[10px] text-[rgb(var(--color-text-muted))] mb-1">
                    <span>{stats.totalFasting} / 30</span>
                    <span>{Math.round((stats.totalFasting / 30) * 100)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-[rgb(var(--color-surface-subtle))] overflow-hidden">
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
