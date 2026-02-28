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

import { Crown, Flame, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/context/LocaleContext";
import { useState } from "react";

interface GamificationStatsProps {
    isDaylight: boolean;
    stats: {
        streak: number;
        level: number;
        xp: number;
        nextLevelXp: number;
        progress: number;
    };
}

export function GamificationStats({ isDaylight, stats }: GamificationStatsProps) {
    const { t } = useLocale();
    const [showLevelInfo, setShowLevelInfo] = useState(false);

    return (
        <div className="flex flex-col gap-3 mb-6">
            {/* Level Progress */}
            <div className={cn(
                "rounded-2xl p-4 transition-all border",
                isDaylight ? "bg-slate-50 border-slate-100" : "bg-white/5 border-white/5"
            )}>
                <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                            isDaylight ? "bg-emerald-100" : "bg-[rgb(var(--color-primary))]/20"
                        )}>
                            <Crown className={cn("w-4 h-4", isDaylight ? "text-emerald-500" : "text-[rgb(var(--color-primary-light)) ]")} />
                        </div>
                        <div>
                            <div
                                className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => setShowLevelInfo(!showLevelInfo)}
                            >
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                                    {(t as any).gamificationLevelName} {stats.level} • {
                                        stats.level <= 10 ? (t as any).gamificationLevelTitle_0_10 :
                                            stats.level <= 25 ? (t as any).gamificationLevelTitle_11_25 :
                                                stats.level <= 50 ? (t as any).gamificationLevelTitle_26_50 :
                                                    stats.level <= 99 ? (t as any).gamificationLevelTitle_51_99 : (t as any).gamificationLevelTitle_100
                                    }
                                </p>
                                <Info className="w-3 h-3 text-slate-500" />
                            </div>
                            <p className={cn("text-sm font-bold", isDaylight ? "text-slate-900" : "text-white")}>{stats.xp} {(t as any).gamificationXpName}</p>
                        </div>
                    </div>
                    <span className="text-[10px] text-slate-400">{stats.xp} / {stats.nextLevelXp} {(t as any).gamificationXpName}</span>
                </div>
                <div className={cn(
                    "h-2.5 w-full rounded-full overflow-hidden border shadow-inner mb-2.5 transition-all",
                    isDaylight ? "bg-slate-100 border-slate-200" : "bg-black/20 border-white/5"
                )}>
                    <div
                        className="h-full rounded-full transition-all duration-500 shadow-lg"
                        style={{
                            width: `${stats.progress}%`,
                            background: isDaylight
                                ? `linear-gradient(to right, #10b981, #34d399)`
                                : `linear-gradient(to right, rgb(var(--color-primary-dark)), rgb(var(--color-primary-light)))`,
                            boxShadow: isDaylight ? "none" : "0 0 10px rgba(var(--color-primary), 0.5)"
                        }}
                    />
                </div>

                {showLevelInfo ? (
                    <div className={cn(
                        "mt-3 p-4 rounded-xl border space-y-3 animate-in fade-in slide-in-from-top-1",
                        isDaylight ? "bg-emerald-50/50 border-emerald-100 text-slate-500" : "bg-black/40 border-white/5 text-slate-400"
                    )}>
                        <div className={cn("font-bold mb-1 text-[11px] uppercase tracking-wider", isDaylight ? "text-emerald-700" : "text-white")}>{(t as any).gamificationLevelName} Tingkatan:</div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-baseline">
                                <span className="font-bold text-[rgb(var(--color-primary-light))]">{(t as any).gamificationLevelTitle_0_10} (Lvl 1-10)</span>
                            </div>
                            <p className="text-[9px] leading-relaxed italic border-l border-white/10 pl-2">{(t as any).gamificationLevelDesc_0_10}</p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-baseline">
                                <span className="font-bold text-[rgb(var(--color-primary-light))]">{(t as any).gamificationLevelTitle_11_25} (Lvl 11-25)</span>
                            </div>
                            <p className="text-[9px] leading-relaxed italic border-l border-white/10 pl-2">{(t as any).gamificationLevelDesc_11_25}</p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-baseline">
                                <span className="font-bold text-[rgb(var(--color-primary-light))]">{(t as any).gamificationLevelTitle_26_50} (Lvl 26-50)</span>
                            </div>
                            <p className="text-[9px] leading-relaxed italic border-l border-white/10 pl-2">{(t as any).gamificationLevelDesc_26_50}</p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-baseline">
                                <span className="font-bold text-[rgb(var(--color-primary-light))]">{(t as any).gamificationLevelTitle_51_99} (Lvl 51-99)</span>
                            </div>
                            <p className="text-[9px] leading-relaxed italic border-l border-white/10 pl-2">{(t as any).gamificationLevelDesc_51_99}</p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-baseline">
                                <span className="font-bold text-[rgb(var(--color-primary-light))]">{(t as any).gamificationLevelTitle_100} (Lvl 100+)</span>
                            </div>
                            <p className="text-[9px] leading-relaxed italic border-l border-white/10 pl-2">{(t as any).gamificationLevelDesc_100}</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-[10px] text-slate-500 leading-snug">
                        {(t as any).profileXpDesc}
                    </p>
                )}
            </div>

            {/* Streak Row (Full Width) */}
            <div className={cn(
                "rounded-2xl p-4 flex items-center gap-4 border transition-all",
                isDaylight ? "bg-slate-50 border-slate-100" : "bg-white/5 border-white/5"
            )}>
                <div className={cn(
                    "w-12 h-12 rounded-full flex flex-shrink-0 items-center justify-center transition-all",
                    isDaylight ? "bg-emerald-100" : "bg-[rgb(var(--color-primary))]/20"
                )}>
                    <Flame className={cn("w-6 h-6", isDaylight ? "text-emerald-500" : "text-[rgb(var(--color-primary-light)) ]")} />
                </div>
                <div>
                    <div className="flex items-end gap-2">
                        <span className={cn("text-2xl font-black leading-none", isDaylight ? "text-slate-900" : "text-white")}>{stats.streak}</span>
                        <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-[2px]">{(t as any).profileDays}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 leading-snug">{(t as any).profileStreakDesc}</div>
                </div>
            </div>
        </div>
    );
}
