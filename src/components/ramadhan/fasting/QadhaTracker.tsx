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
import type { FastingDayLog } from "@/data/fasting/types";
import { FASTING_STATUS_META } from "@/data/fasting/fiqh-rules";
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

function getConsequenceBadge(consequence: string, t: any): { label: string; color: string } {
    switch (consequence) {
        case "qadha": return { label: t.fastingQadhaConsequenceQadha, color: "bg-amber-500/20 text-amber-300 border-amber-500/30" };
        case "fidyah": return { label: t.fastingQadhaConsequenceFidyah, color: "bg-orange-500/20 text-orange-300 border-orange-500/30" };
        case "choice": return { label: t.fastingQadhaConsequenceChoice, color: "bg-purple-500/20 text-purple-300 border-purple-500/30" };
        default: return { label: consequence, color: "bg-white/10 text-white/50 border-white/10" };
    }
}

export default function QadhaTracker({ pendingItems, onMarkDone }: QadhaTrackerProps) {
    const t = useTranslations() as any;

    const handleMarkDone = (hijriYear: number, hijriDay: number) => {
        onMarkDone(hijriYear, hijriDay);
        toast.success(t.fastingQadhaMarkDoneToast, { icon: "🤲", duration: 3000 });
    };

    if (pendingItems.length === 0) {
        return (
            <div className="text-center py-6">
                <p className="text-2xl mb-2">🎉</p>
                <p className="text-sm text-white/60">{t.fastingQadhaEmpty}</p>
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
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">{t.fastingQadhaTitle}</p>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {badgeLabel}
                </span>
            </div>

            {/* Year groups */}
            {Object.entries(grouped)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([year, items]) => (
                    <div key={year} className="space-y-1.5">
                        <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider px-1">
                            {year}H
                        </p>
                        {items.map((item) => {
                            const statusMeta = FASTING_STATUS_META[item.log.status];
                            const badge = getConsequenceBadge(item.log.consequence, t);
                            const dayLabel = (t.fastingQadhaDay as string)
                                .replace("{day}", String(item.hijriDay))
                                .replace("{year}", String(item.hijriYear));

                            return (
                                <div
                                    key={`${item.hijriYear}-${item.hijriDay}`}
                                    className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/5 px-3 py-2.5"
                                >
                                    <span className="text-base">{statusMeta?.icon ?? "❓"}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-white/80 truncate">{dayLabel}</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${badge.color}`}>
                                                {badge.label}
                                            </span>
                                            {item.log.note && (
                                                <span className="text-[9px] text-white/30 truncate">{item.log.note}</span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleMarkDone(item.hijriYear, item.hijriDay)}
                                        className="shrink-0 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border border-green-500/40 bg-green-500/20 text-green-300 hover:bg-green-500/30 transition-all active:scale-95"
                                    >
                                        {t.fastingQadhaMarkDone}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ))}

            {/* Disclaimer */}
            <p className="text-[9px] text-white/25 leading-relaxed pt-1 border-t border-white/5">
                {t.fastingFiqhDisclaimer}
            </p>
        </div>
    );
}
