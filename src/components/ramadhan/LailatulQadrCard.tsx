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

import { usePrayerTimesContext } from "@/context/PrayerTimesContext";
import {
    DALIL_LAILATUL_QADR,
    DALIL_LAST_10_NIGHTS,
    DALIL_ODD_NIGHTS,
    DOA_LAILATUL_QADR,
    LAST_TEN_NIGHTS,
    ODD_NIGHTS,
    getNextLailatulQadrNight,
    isLailatulQadrNight,
} from "@/data/ramadhan";
import DalilBadge from "./DalilBadge";
import NiatCard from "./NiatCard";
import { useTranslations } from "@/context/LocaleContext";

export default function LailatulQadrCard() {
    const { data } = usePrayerTimesContext();
    const t = useTranslations();
    const hijriDay = data?.hijriDay ?? 1;

    const isTonight = isLailatulQadrNight(hijriDay);
    const nextNight = getNextLailatulQadrNight(hijriDay);
    const daysUntilNext = nextNight ? nextNight - hijriDay : null;
    const allPassed = nextNight === null && hijriDay > 29;

    const getStatus = (night: number) => {
        if (night < hijriDay) return "past";
        if (night === hijriDay) return "tonight";
        return "upcoming";
    };

    const isOddNight = (night: number) => ODD_NIGHTS.includes(night as typeof ODD_NIGHTS[number]);

    return (
        <div className="rounded-2xl border border-white/5 bg-black/20 backdrop-blur-md shadow-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 pt-3 pb-2 sm:px-4 sm:pt-4 sm:pb-2">
                <div className="flex items-center gap-2">
                    <span className={`text-lg ${isTonight ? "animate-pulse" : ""}`}>✨</span>
                    <div>
                        <h3 className="font-bold text-white text-sm sm:text-base">{t.lailatulQadrTitle}</h3>
                    </div>
                </div>
                <DalilBadge dalil={DALIL_LAILATUL_QADR} variant="pill" />
            </div>

            {/* Status message - More compact */}
            <div className="px-3 mb-2 sm:px-4">
                {allPassed ? (
                    <div className="rounded-xl bg-black/20 border border-white/10 px-3 py-2 text-center backdrop-blur-sm">
                        <p className="text-xs text-white/60">
                            {t.lailatulQadrAllPassed}
                        </p>
                    </div>
                ) : isTonight ? (
                    <div className="rounded-xl border px-3 py-2 text-center backdrop-blur-md" style={{
                        background: "rgba(var(--color-primary), 0.15)",
                        borderColor: "rgba(var(--color-primary), 0.3)"
                    }}>
                        <p className="text-xs font-semibold" style={{ color: "rgb(var(--color-primary-light))" }}>
                            {t.lailatulQadrTonightPossibility}
                        </p>
                        <p className="text-[10px] mt-0.5 text-white/60">
                            {t.lailatulQadrTonightMessage}
                        </p>
                    </div>
                ) : daysUntilNext !== null ? (
                    <div className="rounded-xl bg-black/20 border border-white/10 px-3 py-1.5 text-center backdrop-blur-sm">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-white/30">{t.lailatulQadrIn.replace("{night}", String(nextNight))}</p>
                        <p className="text-xl font-black" style={{ color: "rgb(var(--color-primary-light))" }}>
                            {daysUntilNext} {t.lailatulQadrNightsLeft}
                        </p>
                    </div>
                ) : null}
            </div>

            {/* Night indicators - More compact grid */}
            <div className="px-3 mb-2 sm:px-4">
                <div className="text-center mb-2">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-0.5">
                        {t.lailatulQadrSectionLabel}
                    </p>
                </div>

                {/* Compact grid with two rows */}
                <div className="grid grid-cols-5 gap-1.5 mb-1.5">
                    {LAST_TEN_NIGHTS.map((night) => {
                        const status = getStatus(night);
                        const isOdd = isOddNight(night);

                        return (
                            <div
                                key={night}
                                className={`flex flex-col items-center justify-center rounded-lg py-2 border transition-all ${isOdd ? "hover:scale-105" : "hover:scale-102"
                                    }`}
                                style={{
                                    borderColor: isOdd
                                        ? status === "tonight"
                                            ? "rgba(var(--color-primary), 0.4)"
                                            : status === "past"
                                                ? "rgba(255,255,255,0.08)"
                                                : "rgba(var(--color-primary), 0.2)"
                                        : "rgba(255,255,255,0.05)",
                                    background: isOdd
                                        ? status === "tonight"
                                            ? "rgba(var(--color-primary), 0.2)"
                                            : status === "past"
                                                ? "rgba(0,0,0,0.2)"
                                                : "rgba(var(--color-primary), 0.08)"
                                        : "rgba(0,0,0,0.1)",
                                    opacity: status === "past" ? (isOdd ? 0.5 : 0.3) : 1,
                                    boxShadow: isOdd && status === "tonight"
                                        ? "0 0 16px rgba(var(--color-primary), 0.3)"
                                        : "none"
                                }}
                            >
                                {/* Compact icon */}
                                <span className={`${isOdd ? "text-base" : "text-sm"} leading-none`}>
                                    {status === "tonight" && isOdd
                                        ? "⭐"
                                        : status === "past"
                                            ? "✓"
                                            : isOdd
                                                ? "✨"
                                                : "🌙"}
                                </span>

                                {/* Night number */}
                                <span
                                    className={`${isOdd ? "text-xs font-bold mt-0.5" : "text-[10px] font-medium mt-0.5"}`}
                                    style={{
                                        color: isOdd
                                            ? status === "tonight"
                                                ? "rgb(var(--color-primary-light))"
                                                : status === "past"
                                                    ? "rgba(255,255,255,0.3)"
                                                    : "rgba(var(--color-primary-light), 0.85)"
                                            : "rgba(255,255,255,0.25)"
                                    }}
                                >
                                    {night}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Compact Legend */}
                <div className="flex items-center justify-center gap-3 text-[9px] text-white/30">
                    <div className="flex items-center gap-1">
                        <span className="text-xs">✨</span>
                        <span>{t.lailatulQadrOddNights}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-[10px]">🌙</span>
                        <span>{t.lailatulQadrEvenNights}</span>
                    </div>
                </div>
            </div>

            {/* Dalil & Doa - Ultra Compact */}
            <div className="border-t border-white/5 px-3 py-2 sm:px-4">
                <div className="flex flex-wrap gap-1.5">
                    <div className="flex-1 min-w-0">
                        <p className="text-[8px] font-bold uppercase tracking-wider text-white/30 mb-1">{t.lailatulQadrDalil}</p>
                        <div className="flex flex-col gap-0.5">
                            <DalilBadge dalil={DALIL_LAST_10_NIGHTS} variant="pill" />
                            <DalilBadge dalil={DALIL_ODD_NIGHTS} variant="pill" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[8px] font-bold uppercase tracking-wider text-white/30 mb-1">{t.lailatulQadrDoa}</p>
                        <NiatCard niat={DOA_LAILATUL_QADR} variant="pill" />
                    </div>
                </div>
            </div>
        </div>
    );
}
