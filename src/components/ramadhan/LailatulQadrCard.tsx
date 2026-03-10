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

import { useState } from "react";
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
import LailatulQadrGuideModal from "./LailatulQadrGuideModal";

export default function LailatulQadrCard() {
    const { data } = usePrayerTimesContext();
    const t = useTranslations();
    const [guideOpen, setGuideOpen] = useState(false);

    // In Islam, night precedes the day. Advance the Hijri day after Maghrib.
    let baseHijriDay = data?.hijriDay ?? 1;
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
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
        <div className="rounded-2xl border border-white/5 bg-black/20 backdrop-blur-md shadow-lg overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3">
                <div className="flex items-center gap-2.5">
                    <span className={`text-xl ${isTonight ? "animate-pulse" : ""}`}>✨</span>
                    <div>
                        <h3 className="font-bold text-white text-sm sm:text-base leading-tight">
                            {t.lailatulQadrTitle}
                        </h3>
                        <p className="text-[10px] font-medium mt-0.5" style={{ color: "rgba(var(--color-primary-light), 0.7)" }}>
                            Lebih baik dari 1.000 bulan · QS. Al-Qadr: 3
                        </p>
                    </div>
                </div>
                <DalilBadge dalil={LAILATUL_QADR_EVIDENCE} variant="pill" />
            </div>

            {/* Status Banner */}
            <div className="px-4 mb-3">
                {allPassed ? (
                    <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-center">
                        <p className="text-xs text-white/50">{t.lailatulQadrAllPassed}</p>
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
                            ⭐ {t.lailatulQadrTonightPossibility}
                        </p>
                        <p className="text-[11px] text-white/55">
                            {t.lailatulQadrTonightMessage}
                        </p>
                    </div>
                ) : daysUntilNext !== null ? (
                    <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-center">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-white/30">
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
                <p className="text-[9px] font-bold uppercase tracking-wider text-white/30 text-center mb-2">
                    {t.lailatulQadrSectionLabel}
                </p>

                <div className="grid grid-cols-5 gap-1.5">
                    {LAST_TEN_NIGHTS.map((night) => {
                        const status = getStatus(night);
                        const isOdd = isOddNight(night);
                        const isActive = status === "tonight";
                        const isPast = status === "past";

                        return (
                            <div
                                key={night}
                                className={`relative flex flex-col items-center justify-center rounded-xl py-2 border transition-all duration-200 ${isOdd && !isActive ? "hover:-translate-y-0.5" : ""
                                    } ${isPast ? "opacity-40" : ""}`}
                                style={{
                                    borderColor: isActive
                                        ? "rgba(var(--color-primary), 0.5)"
                                        : isOdd
                                            ? "rgba(var(--color-primary-light), 0.12)"
                                            : "rgba(255,255,255,0.04)",
                                    background: isActive
                                        ? "rgba(var(--color-primary), 0.15)"
                                        : isOdd
                                            ? "rgba(var(--color-primary), 0.05)"
                                            : "rgba(255,255,255,0.02)",
                                    transform: isActive ? "scale(1.06)" : undefined,
                                }}
                            >
                                {/* Active dot */}
                                {isActive && (
                                    <span
                                        className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full animate-pulse"
                                        style={{ background: "rgb(var(--color-primary-light))" }}
                                    />
                                )}

                                {/* Icon */}
                                <span className={`${isOdd ? "text-base" : "text-sm"} leading-none`}>
                                    {isActive && isOdd
                                        ? "⭐"
                                        : isPast
                                            ? "✓"
                                            : isOdd
                                                ? "✨"
                                                : "🌙"}
                                </span>

                                {/* Night number */}
                                <span
                                    className={`mt-1 leading-none ${isOdd ? "text-xs font-bold" : "text-[10px] font-medium"}`}
                                    style={{
                                        color: isActive
                                            ? "rgb(var(--color-primary-light))"
                                            : isOdd
                                                ? "rgba(var(--color-primary-light), 0.7)"
                                                : "rgba(255,255,255,0.28)",
                                    }}
                                >
                                    {night}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-4 mt-2 text-[9px] text-white/30">
                    <span className="flex items-center gap-1">
                        <span>✨</span>{t.lailatulQadrOddNights}
                    </span>
                    <span className="flex items-center gap-1">
                        <span>🌙</span>{t.lailatulQadrEvenNights}
                    </span>
                </div>
            </div>

            {/* Guide CTA */}
            <div className="border-t border-white/5 px-4 py-3">
                <button
                    onClick={() => setGuideOpen(true)}
                    className="w-full flex items-center gap-3 rounded-xl border border-white/8 bg-white/5 px-3.5 py-3 text-left transition-all duration-200 hover:bg-white/8 hover:-translate-y-0.5 active:scale-[0.98] group"
                >
                    <div
                        className="h-9 w-9 shrink-0 flex items-center justify-center rounded-lg"
                        style={{ background: "rgba(var(--color-primary), 0.15)" }}
                    >
                        <BookOpen className="h-4 w-4" style={{ color: "rgb(var(--color-primary-light))" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white leading-snug">
                            Panduan 10 Malam Terakhir
                        </p>
                        <p className="text-[10px] text-white/40 mt-0.5">
                            I'tikaf, Doa, Dzikir & Dalil Sahih
                        </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-white/25 group-hover:text-white/60 transition-colors" />
                </button>
            </div>

            <LailatulQadrGuideModal open={guideOpen} onOpenChange={setGuideOpen} />
        </div>
    );
}
