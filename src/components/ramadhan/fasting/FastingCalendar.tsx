"use client";

/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * FastingCalendar — 30-day Ramadan grid with year navigation.
 *
 * Mobile UX improvements:
 * - 5-column grid (better cell size on iPhone SE)
 * - Year nav arrows are inline small, no longer huge standalone buttons
 * - ⏳ indicator removed from cells (too cramped); visible only in QadhaTracker list
 * - Today cell has strong ring-2 ring-primary highlight
 * - Future dates are greyed/locked
 * - Status icon sized up for readability
 * - Gender-aware legend (female-only statuses hidden for males)
 */

import { useState, useMemo } from "react";
import { useTranslations } from "@/context/LocaleContext";
import type { TranslationTree } from "@/context/LocaleContext";
import type { FastingDayLog, FastingStatus, FastingYearLog, Madzhab } from "@/data/fasting/types";
import { makeDayKey } from "@/data/fasting/types";
import FastingDayModal from "./FastingDayModal";

// ─── Status colors ─────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, { bg: string; border: string }> = {
    fasting: { bg: "rgba(var(--color-primary), 0.25)", border: "rgba(var(--color-primary), 0.5)" },
    not_fasting: { bg: "rgba(239,68,68,0.22)", border: "rgba(239,68,68,0.5)" },
    sick: { bg: "rgba(245,158,11,0.22)", border: "rgba(245,158,11,0.5)" },
    traveling: { bg: "rgba(59,130,246,0.22)", border: "rgba(59,130,246,0.5)" },
    menstruation: { bg: "rgba(244,63,94,0.22)", border: "rgba(244,63,94,0.5)" },
    postpartum: { bg: "rgba(236,72,153,0.22)", border: "rgba(236,72,153,0.5)" },
    pregnant: { bg: "rgba(168,85,247,0.22)", border: "rgba(168,85,247,0.5)" },
    breastfeeding: { bg: "rgba(139,92,246,0.22)", border: "rgba(139,92,246,0.5)" },
    elderly: { bg: "rgba(100,116,139,0.22)", border: "rgba(100,116,139,0.5)" },
};

const STATUS_ICONS: Record<string, string> = {
    fasting: "✅", not_fasting: "❌", sick: "🤒",
    traveling: "✈️", menstruation: "🌸", postpartum: "🌺",
    pregnant: "🤰", breastfeeding: "🤱", elderly: "👴",
};

// ─── Legend config (female-only flagged) ───────────────────────────────────────

const LEGEND: Array<{ status: string | null; label?: string; bg: string; border: string; femaleOnly?: boolean }> = [
    { status: "fasting", bg: "rgba(var(--color-primary),0.35)", border: "rgba(var(--color-primary),0.5)" },
    { status: "sick", bg: "rgba(245,158,11,0.3)", border: "rgba(245,158,11,0.5)" },
    { status: "traveling", bg: "rgba(59,130,246,0.3)", border: "rgba(59,130,246,0.5)", },
    { status: "menstruation", bg: "rgba(244,63,94,0.3)", border: "rgba(244,63,94,0.5)", femaleOnly: true },
    { status: "pregnant", bg: "rgba(168,85,247,0.3)", border: "rgba(168,85,247,0.5)", femaleOnly: true },
    { status: "elderly", bg: "rgba(100,116,139,0.3)", border: "rgba(100,116,139,0.5)" },
    { status: null, bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.12)" },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface FastingCalendarProps {
    hijriYear: number;
    hijriDay: number;
    yearLog: FastingYearLog;
    defaultMadzhab: Madzhab | null;
    gender?: "male" | "female" | null;
    availableYears: number[];
    selectedYear: number;
    onYearChange: (year: number) => void;
    onLogDay: (
        hijriYear: number,
        hijriDay: number,
        status: FastingStatus,
        madzhab?: Madzhab | null,
        note?: string
    ) => void;
}

export default function FastingCalendar({
    hijriYear,
    hijriDay,
    yearLog,
    defaultMadzhab,
    gender,
    availableYears,
    selectedYear,
    onYearChange,
    onLogDay,
}: FastingCalendarProps) {
    const t = useTranslations() as TranslationTree;
    const getTranslation = (key: string, fallback: string) => {
        const value = t[key as keyof TranslationTree];
        return typeof value === "string" ? value : fallback;
    };
    const [modalDay, setModalDay] = useState<number | null>(null);

    const days = useMemo(() => Array.from({ length: 30 }, (_, i) => i + 1), []);

    const isFutureDay = (day: number): boolean => {
        if (selectedYear > hijriYear) return true;
        if (selectedYear < hijriYear) return false;
        return day > hijriDay;
    };

    const selectedDayLog = modalDay ? (yearLog[makeDayKey(modalDay)] ?? null) : null;

    const handleSave = (status: FastingStatus, madzhab?: Madzhab | null, note?: string) => {
        if (!modalDay) return;
        onLogDay(selectedYear, modalDay, status, madzhab, note);
    };

    const prevIdx = availableYears.indexOf(selectedYear) - 1;
    const nextIdx = availableYears.indexOf(selectedYear) + 1;
    const canGoPrev = prevIdx >= 0;
    const canGoNext = nextIdx < availableYears.length;

    const visibleLegend = LEGEND.filter(l => !(l.femaleOnly && gender === "male"));

    return (
        <div>
            {/* ── Year navigation — compact inline ── */}
            <div className="flex items-center justify-between mb-2">
                <button
                    onClick={() => canGoPrev && onYearChange(availableYears[prevIdx])}
                    disabled={!canGoPrev}
                    className="flex items-center gap-1 text-white/50 hover:text-white/80 disabled:opacity-20 transition-colors px-1 py-1"
                    aria-label="Previous year"
                >
                    <span className="text-sm">‹</span>
                    {canGoPrev && (
                        <span className="text-[10px] text-white/30">{availableYears[prevIdx]}H</span>
                    )}
                </button>

                <p className="text-[12px] font-bold text-white">{selectedYear}H</p>

                <button
                    onClick={() => canGoNext && onYearChange(availableYears[nextIdx])}
                    disabled={!canGoNext}
                    className="flex items-center gap-1 text-white/50 hover:text-white/80 disabled:opacity-0 transition-colors px-1 py-1"
                    aria-label="Next year"
                >
                    {canGoNext && (
                        <span className="text-[10px] text-white/30">{availableYears[nextIdx]}H</span>
                    )}
                    <span className="text-sm">›</span>
                </button>
            </div>

            {/* ── 5-column grid (better tap targets on SE) ── */}
            <div className="grid grid-cols-5 gap-1.5">
                {days.map((day) => {
                    const key = makeDayKey(day);
                    const log = yearLog[key] as FastingDayLog | undefined;
                    const isToday = selectedYear === hijriYear && day === hijriDay;
                    const future = isFutureDay(day);
                    const icon = log?.status ? STATUS_ICONS[log.status] : null;
                    const colors = log?.status ? STATUS_COLORS[log.status] : null;

                    // Qadha indicator as a small dot on corner, not inline text
                    return (
                        <button
                            key={day}
                            disabled={future}
                            onClick={() => !future && setModalDay(day)}
                            className={`relative aspect-square rounded-xl border flex flex-col items-center justify-center transition-all duration-200 ${future
                                ? "opacity-25 cursor-not-allowed"
                                : "active:scale-95 cursor-pointer hover:brightness-110"
                                }`}
                            style={{
                                background: future
                                    ? "rgba(255,255,255,0.03)"
                                    : colors?.bg ?? "rgba(255,255,255,0.05)",
                                borderColor: future
                                    ? "rgba(255,255,255,0.07)"
                                    : colors?.border ?? "rgba(255,255,255,0.12)",
                                // Today gets a ring
                                boxShadow: isToday && !future
                                    ? "0 0 0 2px rgb(var(--color-primary)), 0 0 0 3px rgba(var(--color-primary),0.25)"
                                    : undefined,
                            }}
                            aria-label={`Hijri day ${day}${isToday ? " (today)" : ""}${future ? " locked" : ""}`}
                        >
                            {/* Day number */}
                            <span
                                className="text-[11px] font-bold leading-none"
                                style={{
                                    color: isToday
                                        ? "rgb(var(--color-primary-light, var(--color-primary)))"
                                        : future
                                            ? "rgba(255,255,255,0.15)"
                                            : "rgba(255,255,255,0.6)",
                                }}
                            >
                                {day}
                            </span>

                            {/* Status icon — or empty dot */}
                            {icon ? (
                                <span className="text-[18px] leading-none mt-0.5">{icon}</span>
                            ) : (
                                <span
                                    className="w-2 h-2 rounded-full mt-1"
                                    style={{ background: future ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.2)" }}
                                />
                            )}


                        </button>
                    );
                })}
            </div>

            {/* ── Legend (gender-aware, compact horizontal) ── */}
            <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1">
                {visibleLegend.map((item, i) => {
                    const labelKey = item.status
                        ? `fastingStatus${item.status.charAt(0).toUpperCase() + item.status.slice(1).replace(/_([a-z])/g, (_: string, c: string) => c.toUpperCase())}`
                        : null;
                    const label = labelKey ? getTranslation(labelKey, item.status ?? "") : t.fastingCalendarUnfilled;
                    return (
                        <div key={i} className="flex items-center gap-1">
                            <span
                                className="w-2.5 h-2.5 rounded-sm border inline-block"
                                style={{ background: item.bg, borderColor: item.border }}
                            />
                            <span className="text-[9px] text-white/35">{label}</span>
                        </div>
                    );
                })}
                <div className="flex items-center gap-1">
                    <span className="text-[10px]">⏳</span>
                    <span className="text-[9px] text-white/35">{t.fastingQadhaConsequenceQadha}</span>
                </div>
            </div>

            {/* Day Modal */}
            {modalDay !== null && (
                <FastingDayModal
                    isOpen={true}
                    hijriYear={selectedYear}
                    hijriDay={modalDay}
                    initialLog={selectedDayLog}
                    defaultMadzhab={defaultMadzhab}
                    gender={gender}
                    onSave={handleSave}
                    onClose={() => setModalDay(null)}
                />
            )}
        </div>
    );
}
