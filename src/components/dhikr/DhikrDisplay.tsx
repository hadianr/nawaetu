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

export interface DhikrDisplayProps {
    t: any;
    isDaylight: boolean;
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
    isDaylight,
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
                        isDaylight ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-[rgb(var(--color-primary)/0.2)] text-[rgb(var(--color-primary-light))] border-[rgb(var(--color-primary)/0.3)] shadow-[0_0_15px_rgba(var(--color-primary),0.2)]"
                    )}>
                        {activeSequence.label} • {sequenceIndex + 1}/{activeSequence.items.length}
                    </div>
                )}
                <div className="mb-0.5 xs:mb-2">
                    <h1 className={cn(
                        "text-lg xs:text-xl font-bold tracking-tight leading-tight",
                        isDaylight ? "text-slate-900" : "text-white/90"
                    )}>{t.tasbihTitle}</h1>
                    <p className={cn(
                        "text-[9px] xs:text-[10px] uppercase tracking-[0.2em]",
                        isDaylight ? "text-slate-400" : "text-white/40"
                    )}>{t.tasbihSubtitle}</p>
                </div>

                {activeDhikr ? (
                    <div className="flex flex-col items-center animate-in fade-in slide-in-from-top-2 duration-500 pb-0.5 xs:pb-2">
                        <div className="px-4 pt-4 xs:pt-20 pb-0.5 xs:pb-1 bg-transparent">
                            <h2 className={cn(
                                "text-2xl xs:text-5xl font-bold font-serif leading-none transition-colors",
                                isDaylight ? "text-slate-900" : "text-white drop-shadow-2xl"
                            )}>
                                {activeDhikr.arab}
                            </h2>
                        </div>
                        <div className="mt-1 xs:mt-3 flex flex-col items-center">
                            <p className={cn(
                                "font-extrabold text-[10px] xs:text-base tracking-tight uppercase",
                                isDaylight ? "text-emerald-600" : "text-[rgb(var(--color-primary-light))]"
                            )}>
                                {activeDhikr.latin}
                            </p>
                            <p className={cn(
                                "text-[8px] xs:text-xs italic line-clamp-2 max-w-[90%] mt-0.5 xs:mt-1.5",
                                isDaylight ? "text-slate-500" : "text-white/40"
                            )}>
                                {activeDhikr.tadabbur}
                            </p>
                        </div>
                    </div>
                ) : (
                    <p className={cn(
                        "text-[10px] italic",
                        isDaylight ? "text-slate-400" : "text-white/20"
                    )}>{t.tasbihFreeMode}</p>
                )}
            </div>

            {/* Middle: Digital Counter - Responsive Size */}
            <div className="flex-1 flex items-center justify-center w-full pointer-events-none min-h-0 py-0.5 xs:py-10">
                <div className="relative w-52 h-52 xs:w-64 xs:h-64 md:w-64 md:h-64 lg:w-80 lg:h-80 flex items-center justify-center pointer-events-auto shadow-[0_0_60px_rgba(0,0,0,0.6)] rounded-full transition-all duration-300">
                    <div className="absolute inset-[-10px] rounded-full blur-3xl bg-[rgb(var(--color-primary)/0.08)] transition-all duration-700" />

                    <div className="absolute inset-0 rounded-full border-[6px] md:border-[12px] border-white/5" />

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
                            isDaylight
                                ? "bg-gradient-to-br from-emerald-100 to-emerald-50 border-emerald-200/50 shadow-emerald-500/10"
                                : "bg-gradient-to-br from-[rgb(var(--color-primary-dark)/0.4)] to-black border-[rgb(var(--color-primary)/0.15)] shadow-black/60"
                        )}
                    >
                        <span className={cn(
                            "text-[7px] md:text-xs font-bold tracking-widest uppercase mb-0.5 xs:mb-1.5",
                            isDaylight ? "text-emerald-700/40" : "text-white/30"
                        )}>
                            {activeDhikr ? activeDhikr.label : t.tasbihCounterLabel}
                        </span>
                        <span className={cn(
                            "text-7xl xs:text-8xl md:text-9xl font-mono font-bold tracking-tighter transition-colors",
                            isDaylight ? "text-slate-900" : "text-white drop-shadow-2xl"
                        )}>
                            {hasHydrated ? (
                                count
                            ) : (
                                <span className={cn(
                                    "inline-block w-12 xs:w-16 md:w-20 h-10 xs:h-12 md:h-14 rounded animate-pulse align-middle",
                                    isDaylight ? "bg-slate-200" : "bg-white/10"
                                )} />
                            )}
                        </span>
                        <div className={cn(
                            "mt-1 text-[8px] md:text-sm animate-pulse font-medium",
                            isDaylight ? "text-emerald-600/60" : "text-[rgb(var(--color-primary))]/40"
                        )}>
                            {t.tasbihTap}
                        </div>
                    </button>
                </div>
            </div>
        </>
    );
}
