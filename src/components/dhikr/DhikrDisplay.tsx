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

import { cn } from "@/lib/utils";
import { DhikrPreset } from "./types";
import { dhikrSequences } from "@/data/dhikrLibrary";
import type { TranslationTree } from "@/context/LocaleContext";

export interface DhikrDisplayProps {
    t: TranslationTree;
    activeSequence: typeof dhikrSequences[0] | null;
    sequenceIndex: number;
    activeDhikr: DhikrPreset | null;
    target: number | null;
    progress: number;
    count: number;
    hasHydrated: boolean;
    handleIncrement: (e?: React.MouseEvent | React.TouchEvent) => void;
}

export function DhikrDisplay({
    t,
    activeSequence,
    sequenceIndex,
    activeDhikr,
    target,
    progress,
    count,
    hasHydrated,
    handleIncrement
}: DhikrDisplayProps) {
    return (
        <>
            {/* Top: Branding + Zikir Text */}
            <div className="w-full text-center z-10 pointer-events-none mt-1 xs:mt-6 shrink-0 relative">
                {activeSequence && (
                    <div className={cn(
                        "inline-flex items-center justify-center px-3 py-1 mb-2 rounded-full border text-[10px] font-bold tracking-widest uppercase shadow-sm",
                        "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary-strong))] border-[rgb(var(--color-primary))]/25 shadow-[var(--shadow-card)]"
                    )}>
                        {activeSequence.label} ({sequenceIndex + 1}/{activeSequence.items.length})
                    </div>
                )}
                <div className="mb-0.5 xs:mb-2">
                    <h1 className={cn(
                        "text-lg xs:text-xl font-bold tracking-tight leading-tight",
                        "text-[rgb(var(--color-text-strong))]"
                    )}>{t.tasbihTitle}</h1>
                    <p className={cn(
                        "text-[9px] xs:text-[10px] uppercase tracking-[0.2em]",
                        "text-[rgb(var(--color-text-muted))]"
                    )}>{t.tasbihSubtitle}</p>
                </div>

                {activeDhikr ? (
                    <div className="flex flex-col items-center animate-in fade-in slide-in-from-top-2 duration-500 pb-0.5 xs:pb-2 mb-5 sm:mb-0 max-h-[27dvh] sm:max-h-[38dvh] overflow-y-auto overscroll-contain">
                        <div className="px-4 pt-4 xs:pt-10 sm:pt-20 pb-0.5 xs:pb-1 bg-transparent">
                            <h2 className={cn(
                                "text-[clamp(1.35rem,5vw,2.75rem)] font-bold font-serif leading-[1.2] transition-colors",
                                "text-[rgb(var(--color-text-strong))]"
                            )}>
                                {activeDhikr.arab}
                            </h2>
                        </div>
                        <div className="mt-1 xs:mt-3 flex flex-col items-center">
                            <p className={cn(
                                "font-extrabold text-[10px] xs:text-base tracking-tight uppercase",
                                "text-[rgb(var(--color-primary-strong))]"
                            )}>
                                {activeDhikr.latin}
                            </p>
                            <p className={cn(
                                "text-[8px] xs:text-xs italic line-clamp-2 max-w-[90%] mt-0.5 xs:mt-1.5",
                                "text-[rgb(var(--color-text-muted))]"
                            )}>
                                {activeDhikr.tadabbur}
                            </p>
                        </div>
                    </div>
                ) : (
                    <p className={cn(
                        "text-[10px] italic",
                        "text-[rgb(var(--color-text-muted))]"
                    )}>{t.tasbihFreeMode}</p>
                )}
            </div>

            {/* Middle: Digital Counter - Responsive Size */}
            <div className="flex-1 flex items-center justify-center w-full pointer-events-none min-h-0 py-0.5 xs:py-10">
                <div className={cn(
                    "relative w-44 h-44 xs:w-56 xs:h-56 md:w-64 md:h-64 lg:w-80 lg:h-80 flex items-center justify-center pointer-events-auto rounded-full transition-all duration-300",
                    "shadow-[var(--shadow-floating)]"
                )}>
                    <div className="absolute inset-[-10px] rounded-full blur-3xl bg-[rgb(var(--color-primary)/0.08)] transition-all duration-700" />

                    <div className="absolute inset-0 rounded-full border-[6px] md:border-[12px] border-[rgb(var(--color-border))]/60" />

                    {target && (
                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle
                                cx="50" cy="50" r="46.5"
                                fill="transparent"
                                stroke="rgb(var(--color-primary))"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeDasharray="292"
                                strokeDashoffset={292 - (292 * progress) / 100}
                                className="transition-all duration-300 ease-out"
                            />
                        </svg>
                    )}

                    <button
                        onClick={(e) => { e.stopPropagation(); handleIncrement(e); }}
                        className={cn(
                            "absolute inset-1.5 md:inset-4 rounded-full active:scale-95 transition-all duration-75 flex flex-col items-center justify-center group z-20 shadow-xl border",
                            "bg-gradient-to-br from-[rgb(var(--color-primary))]/15 to-[rgb(var(--color-surface))] border-[rgb(var(--color-border))] shadow-[var(--shadow-floating)]"
                        )}
                    >
                        <span className={cn(
                            "text-[7px] md:text-xs font-bold tracking-widest uppercase mb-0.5 xs:mb-1.5",
                            "text-[rgb(var(--color-primary-strong))]/60"
                        )}>
                            {activeDhikr ? activeDhikr.label : t.tasbihCounterLabel}
                        </span>
                        <span className={cn(
                            "text-[clamp(4.5rem,15vw,8rem)] font-mono font-bold tracking-tighter transition-colors",
                            "text-[rgb(var(--color-text-strong))]"
                        )}>
                            {hasHydrated ? (
                                count
                            ) : (
                                <span className={cn(
                                    "inline-block w-12 xs:w-16 md:w-20 h-10 xs:h-12 md:h-14 rounded animate-pulse align-middle",
                                    "bg-[rgb(var(--color-border))]/30"
                                )} />
                            )}
                        </span>
                        <div className={cn(
                            "mt-1 text-[8px] md:text-sm animate-pulse font-medium",
                            "text-[rgb(var(--color-primary-strong))]/70"
                        )}>
                            {t.tasbihTap}
                        </div>
                    </button>
                </div>
            </div>
        </>
    );
}
