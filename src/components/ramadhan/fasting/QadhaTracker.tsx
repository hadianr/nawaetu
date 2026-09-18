"use client";

/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * QadhaTracker — collapsible list of pending qadha/fidyah obligations.
 * Grouped by hijri year, each item shows day, reason, consequence, and a
 * "Mark Done" button.
 */

import { useTranslations } from "@/context/LocaleContext";
import { AppIcon } from "@/components/ui/AppIcon";
import type { TranslationTree } from "@/context/LocaleContext";
import type { FastingDayLog } from "@/data/fasting/types";
import { toast } from "sonner";

interface PendingQadhaDayItem {
    hijriYear: number;
    hijriDay: number;
    log: FastingDayLog;
}

interface QadhaTrackerProps {
    pendingItems: PendingQadhaDayItem[];
    onMarkDone: (hijriYear: number, hijriDay: number) => void;
}

function getConsequenceBadge(consequence: string, t: TranslationTree): { label: string; color: string } {
    switch (consequence) {
        case "qadha": return { label: t.fastingQadhaConsequenceQadha, color: "bg-[rgb(var(--color-warning))]/20 text-[rgb(var(--color-warning))] border-[rgb(var(--color-warning))]/30" };
        case "fidyah": return { label: t.fastingQadhaConsequenceFidyah, color: "bg-[rgb(var(--color-accent))]/20 text-[rgb(var(--color-accent))] border-[rgb(var(--color-accent))]/30" };
        case "choice": return { label: t.fastingQadhaConsequenceChoice, color: "bg-[rgb(var(--color-primary))]/20 text-[rgb(var(--color-primary-light))] border-[rgb(var(--color-primary))]/30" };
        default: return { label: consequence, color: "bg-[rgb(var(--color-surface-subtle))] text-[rgb(var(--color-text-muted))] border-[rgb(var(--color-border))]" };
    }
}

export default function QadhaTracker({ pendingItems, onMarkDone }: QadhaTrackerProps) {
    const t = useTranslations() as TranslationTree;

    const handleMarkDone = (hijriYear: number, hijriDay: number) => {
        onMarkDone(hijriYear, hijriDay);
        toast.success(t.fastingQadhaMarkDoneToast, { icon: <AppIcon name="hands" size="sm" tone="primary" />, duration: 3000 });
    };

    if (pendingItems.length === 0) {
        return (
            <div className="text-center py-6">
                <AppIcon name="sparkles" size="lg" tone="success" className="mx-auto mb-2" />
                <p className="text-sm text-[rgb(var(--color-text-muted))]">{t.fastingQadhaEmpty}</p>
            </div>
        );
    }

    // Group by year
    const grouped = pendingItems.reduce<Record<number, PendingQadhaDayItem[]>>((acc, item) => {
        if (!acc[item.hijriYear]) acc[item.hijriYear] = [];
        acc[item.hijriYear].push(item);
        return acc;
    }, {});

    const pendingCount = pendingItems.length;
    const badgeLabel = (t.fastingQadhaPendingBadge as string).replace("{n}", String(pendingCount));

    return (
        <div className="space-y-3">
            {/* Header badge */}
            <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-[rgb(var(--color-text-muted))] uppercase tracking-wider">{t.fastingQadhaTitle}</p>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[rgb(var(--color-warning))]/20 text-[rgb(var(--color-warning))] border border-[rgb(var(--color-warning))]/30">
                    {badgeLabel}
                </span>
            </div>

            {/* Year groups */}
            {Object.entries(grouped)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([year, items]) => (
                    <div key={year} className="space-y-1.5">
                        <p className="text-[10px] font-semibold text-[rgb(var(--color-text-muted))] uppercase tracking-wider px-1">
                            {year}H
                        </p>
                        {items.map((item) => {
                            const badge = getConsequenceBadge(item.log.consequence, t);
                            const dayLabel = (t.fastingQadhaDay as string)
                                .replace("{day}", String(item.hijriDay))
                                .replace("{year}", String(item.hijriYear));

                            return (
                                <div
                                    key={`${item.hijriYear}-${item.hijriDay}`}
                                    className="flex items-center gap-2 rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] px-3 py-2.5"
                                >
                                    <AppIcon name="calendar" size="sm" tone="warning" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-[rgb(var(--color-text))] truncate">{dayLabel}</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${badge.color}`}>
                                                {badge.label}
                                            </span>
                                            {item.log.note && (
                                                <span className="text-[9px] text-[rgb(var(--color-text-muted))] truncate">{item.log.note}</span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleMarkDone(item.hijriYear, item.hijriDay)}
                                        className="shrink-0 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border border-[rgb(var(--color-success))]/40 bg-[rgb(var(--color-success))]/20 text-[rgb(var(--color-success))] hover:bg-[rgb(var(--color-success))]/30 transition-all active:scale-95"
                                    >
                                        {t.fastingQadhaMarkDone}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ))}

            {/* Disclaimer */}
            <p className="text-[9px] text-[rgb(var(--color-text-muted))] leading-relaxed pt-1 border-t border-[rgb(var(--color-border))]">
                {t.fastingFiqhDisclaimer}
            </p>
        </div>
    );
}
