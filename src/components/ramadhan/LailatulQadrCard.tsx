"use client";

/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { useEffect, useState } from "react";
import { usePrayerTimesContext } from "@/context/PrayerTimesContext";
import { BookOpen, ChevronRight } from "lucide-react";
import {
    LAILATUL_QADR_EVIDENCE,
    LAST_TEN_NIGHTS,
    ODD_NIGHTS,
    getNextLailatulQadrNight,
    isLailatulQadrNight,
} from "@/data/ramadhan";
import DalilBadge from "./DalilBadge";
import { useTranslations } from "@/context/LocaleContext";
import type { TranslationTree } from "@/context/LocaleContext";
import LailatulQadrGuideModal from "./LailatulQadrGuideModal";
import { useTarawehTracker } from "@/hooks/useTarawehTracker";
import { AppIcon } from "@/components/ui/AppIcon";
import { toast } from "sonner";
import { addHasanah } from "@/lib/habits/leveling";

type LailatulTranslations = TranslationTree & Partial<Record<"gamificationQiyamulLailSuccess" | "gamificationQiyamulLailDesc", string>>;

export default function LailatulQadrCard() {
    const { data } = usePrayerTimesContext();
    const t = useTranslations() as LailatulTranslations;
    const [guideOpen, setGuideOpen] = useState(false);
    const [now, setNow] = useState<Date | null>(null);
    useEffect(() => {
        queueMicrotask(() => setNow(new Date()));
    }, []);

    const hijriYear = parseInt(data?.hijriDate?.split(" ").pop()?.replace("H", "") ?? "1447", 10);
    const { log, updateDay } = useTarawehTracker(hijriYear);

    // In Islam, night precedes the day. Advance the Hijri day after Maghrib.
    let baseHijriDay = data?.hijriDay ?? 1;
    const currentTime = now ? `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}` : "00:00";
    const maghribTime = data?.prayerTimes?.Maghrib || "18:00";
    if (currentTime >= maghribTime) baseHijriDay += 1;
    const effectiveHijriDay = Math.min(baseHijriDay, 30);

    const isTonight = isLailatulQadrNight(effectiveHijriDay);
    const nextNight = getNextLailatulQadrNight(effectiveHijriDay);
    const daysUntilNext = nextNight ? nextNight - effectiveHijriDay : null;
    const allPassed = nextNight === null && effectiveHijriDay > 29;

    const getStatus = (night: number) => {
        if (night < effectiveHijriDay) return "past";
        if (night === effectiveHijriDay) return "tonight";
        return "upcoming";
    };

    const isOddNight = (night: number) =>
        ODD_NIGHTS.includes(night as (typeof ODD_NIGHTS)[number]);

    return (
        <div className="rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] backdrop-blur-md shadow-[var(--shadow-card)] overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3">
                <div className="flex items-center gap-2.5">
                    <AppIcon name="sparkles" size="lg" tone="primary" className={isTonight ? "animate-pulse" : undefined} />
                    <div>
                        <h3 className="font-bold text-[rgb(var(--color-text-strong))] text-sm sm:text-base leading-tight">
                            {t.lailatulQadrTitle}
                        </h3>
                        <p className="text-[10px] font-medium mt-0.5 text-[rgb(var(--color-primary-light))]/70">
                            Lebih baik dari 1.000 bulan, QS. Al-Qadr: 3
                        </p>
                    </div>
                </div>
                <DalilBadge dalil={LAILATUL_QADR_EVIDENCE} variant="pill" />
            </div>

            {/* Status Banner */}
            <div className="px-4 mb-3">
                {allPassed ? (
                    <div className="rounded-xl bg-[rgb(var(--color-surface-subtle))] border border-[rgb(var(--color-border))] px-3 py-2.5 text-center">
                        <p className="text-xs text-[rgb(var(--color-text-muted))]">{t.lailatulQadrAllPassed}</p>
                    </div>
                ) : isTonight ? (
                    <div
                        className="rounded-xl border px-4 py-3 text-center"
                        style={{
                            background: "rgba(var(--color-primary), 0.12)",
                            borderColor: "rgba(var(--color-primary), 0.25)",
                        }}
                    >
                        <p
                            className="text-xs font-bold uppercase tracking-widest mb-1"
                            style={{ color: "rgb(var(--color-primary-light))" }}
                        >
                            <AppIcon name="star" size="sm" tone="primary" /> {t.lailatulQadrTonightPossibility}
                        </p>
                        <p className="text-[11px] text-[rgb(var(--color-text-muted))]">
                            {t.lailatulQadrTonightMessage}
                        </p>
                    </div>
                ) : daysUntilNext !== null ? (
                    <div className="rounded-xl bg-[rgb(var(--color-surface-subtle))] border border-[rgb(var(--color-border))] px-3 py-2 text-center">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[rgb(var(--color-text-muted))]">
                            {t.lailatulQadrIn.replace("{night}", String(nextNight))}
                        </p>
                        <p
                            className="text-lg font-black mt-0.5"
                            style={{ color: "rgb(var(--color-primary-light))" }}
                        >
                            {daysUntilNext} {t.lailatulQadrNightsLeft}
                        </p>
                    </div>
                ) : null}
            </div>

            {/* Night Grid */}
            <div className="px-4 mb-3">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[rgb(var(--color-text-muted))] text-center mb-2">
                    {t.lailatulQadrSectionLabel}
                </p>

                <div className="grid grid-cols-5 gap-1.5">
                    {LAST_TEN_NIGHTS.map((night) => {
                        const status = getStatus(night);
                        const isOdd = isOddNight(night);
                        const isActive = status === "tonight";
                        const isPast = status === "past";
                        
                        // Qiyam Tracker Logic
                        const dKey = `${hijriYear}-${night}`;
                        const dData = log[dKey] || { choice: null, location: null, isQiyam: false };
                        const isDone = dData.isQiyam;

                        const handleToggleQiyam = () => {
                            if (status === "upcoming") return; // cannot check future days
                            
                            const newStatus = !isDone;
                            updateDay(night, { isQiyam: newStatus });
                            
                            if (newStatus) {
                                addHasanah(50);
                                toast.success(t.gamificationQiyamulLailSuccess || "Qiyamul Lail Tercatat", {
                                    description: t.gamificationQiyamulLailDesc || `Masya Allah! +50 ${t.gamificationXpName || "Hasanah"}`,
                                    duration: 3500,
                                    icon: <AppIcon name="hands" size="sm" tone="primary" />
                                });
                            }
                        };

                        return (
                            <button
                                key={night}
                                disabled={status === "upcoming"}
                                onClick={handleToggleQiyam}
                                className={`relative flex flex-col items-center justify-center rounded-xl py-2 border transition-all duration-200 
                                    ${isOdd && !isActive && !isDone ? "hover:-translate-y-0.5" : ""} 
                                    ${status === "upcoming" ? "opacity-40 cursor-not-allowed" : "active:scale-95 cursor-pointer"}
                                    ${isDone ? "shadow-[0_0_10px_rgba(var(--color-primary),0.2)]" : ""}
                                `}
                                style={{
                                    borderColor: isDone
                                        ? "rgba(var(--color-primary), 0.7)"
                                        : isActive
                                            ? "rgba(var(--color-primary), 0.5)"
                                            : isOdd
                                                ? "rgba(var(--color-primary-light), 0.12)"
                                                : "rgba(var(--color-border), 0.04)",
                                    background: isDone
                                        ? "rgba(var(--color-primary), 0.25)"
                                        : isActive
                                            ? "rgba(var(--color-primary), 0.15)"
                                            : isOdd
                                                ? "rgba(var(--color-primary), 0.05)"
                                                : "rgba(var(--color-border), 0.02)",
                                    transform: isActive && !isDone ? "scale(1.06)" : undefined,
                                }}
                            >
                                {/* Active dot */}
                                {isActive && !isDone && (
                                    <span
                                        className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full animate-pulse"
                                        style={{ background: "rgb(var(--color-primary-light))" }}
                                    />
                                )}
                                
                                {/* Completed Checkmark */}
                                {isDone && (
                                    <span
                                        className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[rgb(var(--color-success))] shadow-[var(--shadow-card)] ring-2 ring-[rgb(var(--color-surface))]"
                                    >
                                        <svg className="h-2.5 w-2.5 text-[rgb(var(--color-surface))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </span>
                                )}

                                {/* Icon */}
                                <AppIcon
                                    name={isDone ? "hands" : isActive && isOdd ? "star" : isPast ? "shield-check" : isOdd ? "sparkles" : "moon"}
                                    size={isOdd ? "sm" : "xs"}
                                    tone={isDone ? "success" : isActive ? "primary" : "muted"}
                                />

                                {/* Night number */}
                                <span
                                    className={`mt-1 leading-none ${isOdd ? "text-xs font-bold" : "text-[10px] font-medium"}`}
                                    style={{
                                        color: isDone 
                                        ? "rgb(var(--color-text-strong))"
                                            : isActive
                                                ? "rgb(var(--color-primary-light))"
                                                : isOdd
                                                    ? "rgba(var(--color-primary-light), 0.7)"
                                                    : "rgba(var(--color-border), 0.28)",
                                    }}
                                >
                                    {night}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-4 mt-2 text-[9px] text-[rgb(var(--color-text-muted))]">
                    <span className="flex items-center gap-1">
                        <AppIcon name="sparkles" size="sm" tone="primary" />{t.lailatulQadrOddNights}
                    </span>
                    <span className="flex items-center gap-1">
                        <AppIcon name="moon" size="sm" tone="primary" />{t.lailatulQadrEvenNights}
                    </span>
                </div>
            </div>

            {/* Guide CTA */}
            <div className="border-t border-[rgb(var(--color-border))] px-4 py-3">
                <button
                    onClick={() => setGuideOpen(true)}
                    className="w-full flex items-center gap-3 rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] px-3.5 py-3 text-left transition-all duration-200 hover:bg-[rgb(var(--color-surface))] hover:-translate-y-0.5 active:scale-[0.98] group"
                >
                    <div
                        className="h-9 w-9 shrink-0 flex items-center justify-center rounded-lg"
                        style={{ background: "rgba(var(--color-primary), 0.15)" }}
                    >
                        <BookOpen className="h-4 w-4" style={{ color: "rgb(var(--color-primary-light))" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[rgb(var(--color-text-strong))] leading-snug">
                            Panduan 10 Malam Terakhir
                        </p>
                        <p className="text-[10px] text-[rgb(var(--color-text-muted))] mt-0.5">
                        I&apos;tikaf, Doa, Dzikir & Dalil Sahih
                        </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-[rgb(var(--color-text-muted))] transition-colors" />
                </button>
            </div>

            <LailatulQadrGuideModal open={guideOpen} onOpenChange={setGuideOpen} />
        </div>
    );
}
