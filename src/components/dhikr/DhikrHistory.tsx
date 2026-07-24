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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CalendarDays, Flame, Trophy, Medal, Check } from "lucide-react";
import { dhikrMilestones } from "@/data/dhikrMilestones";
import { DhikrPreset } from "./types";

export interface DhikrHistoryProps {
    isMilestoneModalOpen: boolean;
    setIsMilestoneModalOpen: (open: boolean) => void;
    t: any;
    isDaylight: boolean;
    dailyCount: number;
    streak: number;
    lifetimeCount: number;
    hasHydrated: boolean;
    dhikrHistory: Record<string, number>;
    allPresets: DhikrPreset[];
}

export function DhikrHistory({
    isMilestoneModalOpen,
    setIsMilestoneModalOpen,
    t,
    isDaylight,
    dailyCount,
    streak,
    lifetimeCount,
    hasHydrated,
    dhikrHistory,
    allPresets
}: DhikrHistoryProps) {
    return (
        <Dialog open={isMilestoneModalOpen} onOpenChange={setIsMilestoneModalOpen}>
            <DialogTrigger asChild>
                <button
                    className={cn(
                        "flex flex-wrap justify-center items-center gap-2 text-[9px] font-bold uppercase tracking-widest mb-4 cursor-pointer hover:opacity-80 transition-opacity pointer-events-auto relative z-50",
                        isDaylight ? "text-slate-400" : "text-white/30"
                    )}
                >
                    <div className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-full border transition-colors",
                        isDaylight ? "bg-slate-100 border-slate-200/60" : "bg-white/5 border-white/5"
                    )}>
                        <CalendarDays className={cn(
                            "h-3.5 w-3.5",
                            isDaylight ? "text-emerald-600/50" : "text-[rgb(var(--color-primary-light)/0.4)]"
                        )} />
                        <span>
                            {t.tasbihDaily}:{" "}
                            <span className={isDaylight ? "text-slate-900" : "text-white"}>
                                {hasHydrated ? (isNaN(dailyCount) ? 0 : dailyCount) : "--"}
                            </span>
                        </span>
                    </div>
                    <div className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-full border transition-colors",
                        isDaylight ? "bg-slate-100 border-slate-200/60" : "bg-white/5 border-white/5"
                    )}>
                        <Flame className="h-3.5 w-3.5 text-orange-500/70" />
                        <span>
                            {t.tasbihStreak}:{" "}
                            <span className={isDaylight ? "text-slate-900" : "text-white"}>
                                {hasHydrated ? (isNaN(streak) ? 0 : streak) : "--"}
                            </span>{" "}
                            {t.tasbihDays}
                        </span>
                    </div>
                    <div className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-full border transition-colors",
                        isDaylight ? "bg-amber-100 border-amber-200/60 text-amber-700" : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    )}>
                        <Trophy className="h-3.5 w-3.5" />
                        <span>
                            Total:{" "}
                            <span className={isDaylight ? "text-slate-900 font-black" : "text-white font-black"}>
                                {hasHydrated ? (lifetimeCount || 0).toLocaleString('id-ID') : "--"}
                            </span>
                        </span>
                    </div>
                </button>
            </DialogTrigger>
            <DialogContent className={cn("w-[90%] max-w-sm rounded-[32px] border-white/10 backdrop-blur-3xl z-[100]", isDaylight ? "bg-white/90 text-slate-900" : "bg-neutral-950/98 text-white")}>
                <DialogHeader>
                    <DialogTitle className="text-center text-sm font-bold uppercase tracking-widest opacity-60">Statistik Zikir</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col py-2 max-h-[60vh] overflow-y-auto pr-1 space-y-6">

                    {/* Top Dhikr Stats */}
                    <div>
                        <h3 className="text-[10px] font-bold opacity-50 uppercase tracking-widest mb-3">Zikir Terfavorit</h3>
                        <div className="space-y-2">
                            {Object.entries(dhikrHistory || {})
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 3)
                                .map(([id, total], index) => {
                                    const preset = allPresets.find(p => p.id === id);
                                    return (
                                        <div key={id} className={cn("flex justify-between items-center px-4 py-3 rounded-2xl border", isDaylight ? "bg-slate-50 border-slate-100" : "bg-white/5 border-white/5")}>
                                            <div className="flex items-center gap-3">
                                                <span className={cn("text-xs font-bold w-4", index === 0 ? "text-[rgb(var(--color-primary))]" : "opacity-30")}>#{index + 1}</span>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm w-full truncate max-w-[150px]">{preset?.label || "Zikir"}</span>
                                                </div>
                                            </div>
                                            <span className="text-xs font-mono font-bold">{total.toLocaleString('id-ID')}x</span>
                                        </div>
                                    );
                                })}
                            {(!dhikrHistory || Object.keys(dhikrHistory).length === 0) && (
                                <div className="text-center text-xs opacity-50 py-4">Belum ada riwayat zikir.</div>
                            )}
                        </div>
                    </div>

                    {/* Milestones List */}
                    <div>
                        <h3 className="text-[10px] font-bold opacity-50 uppercase tracking-widest mb-3">Pencapaian</h3>
                        <div className="space-y-3">
                            {dhikrMilestones.map(ms => {
                                const isCompleted = (lifetimeCount || 0) >= ms.target;
                                const progress = Math.min(100, ((lifetimeCount || 0) / ms.target) * 100);

                                return (
                                    <div key={ms.id} className={cn("flex flex-col gap-2 p-4 rounded-2xl border", isCompleted ? (isDaylight ? "bg-[rgb(var(--color-primary))]/5 border-[rgb(var(--color-primary))]/20" : "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/20") : (isDaylight ? "bg-slate-50 border-slate-100 opacity-60" : "bg-white/5 border-white/5 opacity-50"))}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Medal className={cn("h-4 w-4", isCompleted ? "text-[rgb(var(--color-primary))]" : "opacity-30")} />
                                                <h4 className="font-bold text-sm">{ms.title}</h4>
                                            </div>
                                            {isCompleted ? (
                                                <Check className="h-4 w-4 text-[rgb(var(--color-primary))]" />
                                            ) : (
                                                <span className="text-[10px] font-mono opacity-50">{ms.target.toLocaleString('id-ID')}x</span>
                                            )}
                                        </div>
                                        {!isCompleted && (
                                            <div className="w-full bg-slate-200/50 dark:bg-black/40 rounded-full h-1.5 mt-1 overflow-hidden">
                                                <div className="bg-[rgb(var(--color-primary))] h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
