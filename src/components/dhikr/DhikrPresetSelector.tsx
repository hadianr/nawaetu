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
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings2, ChevronDown } from "lucide-react";
import { dhikrCategories, dhikrSequences } from "@/data/dhikrLibrary";
import { DhikrPreset } from "./types";

export interface DhikrPresetSelectorProps {
    isDialogOpen: boolean;
    setIsDialogOpen: (open: boolean) => void;
    t: any;
    isDaylight: boolean;
    expandedCategory: string | null;
    setExpandedCategory: (cat: string | null) => void;
    handleSequenceSelect: (sequence: typeof dhikrSequences[0]) => void;
    handlePresetSelect: (preset: DhikrPreset) => void;
    dhikrPresets: DhikrPreset[];
    activeSequenceId: string | null;
    activeDhikr: DhikrPreset | null;
}

export function DhikrPresetSelector({
    isDialogOpen,
    setIsDialogOpen,
    t,
    isDaylight,
    expandedCategory,
    setExpandedCategory,
    handleSequenceSelect,
    handlePresetSelect,
    dhikrPresets,
    activeSequenceId,
    activeDhikr
}: DhikrPresetSelectorProps) {
    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                        "flex flex-col h-auto py-3 gap-1 rounded-2xl border transition-colors",
                        isDaylight ? "bg-white shadow-sm border-slate-200 hover:bg-slate-50" : "bg-white/5 hover:bg-white/10 border-white/5"
                    )}
                >
                    <Settings2 className={cn("h-4 w-4", isDaylight ? "text-slate-400" : "text-white/60")} />
                    <span className={cn("text-[10px] font-medium", isDaylight ? "text-slate-500" : "text-white/40")}>{t.tasbihSelectZikir}</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="w-[90%] max-w-sm rounded-[32px] border-white/10 bg-neutral-950/98 backdrop-blur-3xl text-white">
                <DialogHeader>
                    <DialogTitle className="text-center text-sm font-bold uppercase tracking-widest opacity-40">{t.tasbihListTitle}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col py-2 max-h-[60vh] overflow-y-auto pr-1 overflow-x-hidden">
                    <div className="space-y-6 pb-4">

                        {/* Standalone Berantai (if only 1) */}
                        {dhikrSequences.length === 1 && (
                            <div className="space-y-2">
                                {dhikrSequences.map((seq) => (
                                    <Button
                                        key={seq.id}
                                        variant="outline"
                                        onClick={() => handleSequenceSelect(seq)}
                                        className={cn(
                                            "justify-between h-auto py-3 px-4 w-full border-[rgb(var(--color-primary)/0.2)] bg-[rgb(var(--color-primary)/0.1)] rounded-2xl transition-all text-left shadow-sm",
                                            activeSequenceId === seq.id && "bg-[rgb(var(--color-primary)/0.25)] border-[rgb(var(--color-primary)/0.5)] shadow-[inset_0_0_15px_rgba(var(--color-primary),0.15)]"
                                        )}
                                    >
                                        <div className="flex flex-col items-start w-full overflow-hidden">
                                            <span className="font-bold text-sm text-[rgb(var(--color-primary-light))] w-full truncate">{seq.label}</span>
                                            <span className="text-[10px] text-white/50 mt-0.5 truncate w-full">Otomatis lanjut ke dzikir berikutnya</span>
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        )}

                        {/* Group: Harian */}
                        <div>
                            <button
                                onClick={() => setExpandedCategory(expandedCategory === "harian" ? null : "harian")}
                                className="w-full flex items-center justify-between gap-2 mb-3 px-1 py-1 rounded-lg hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-center gap-2 flex-1">
                                    <div className="h-px bg-white/10 flex-1"></div>
                                    <h3 className="text-[10px] font-bold opacity-70 uppercase tracking-widest text-left">Harian</h3>
                                    <div className="h-px bg-white/10 flex-1"></div>
                                </div>
                                <ChevronDown className={cn("w-3.5 h-3.5 opacity-50 transition-transform duration-200", expandedCategory === "harian" ? "rotate-180" : "rotate-0")} />
                            </button>

                            {expandedCategory === "harian" && (
                                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-200">

                                    {dhikrPresets.map((p) => (
                                        <Button
                                            key={p.id}
                                            variant="outline"
                                            onClick={() => handlePresetSelect(p)}
                                            className={cn(
                                                "justify-between h-auto py-3 px-4 border-white/5 bg-white/5 rounded-2xl w-full text-left",
                                                activeSequenceId === null && activeDhikr?.id === p.id && "bg-[rgb(var(--color-primary)/0.15)] border-[rgb(var(--color-primary)/0.3)] shadow-[inset_0_0_12px_rgba(var(--color-primary),0.05)]"
                                            )}
                                        >
                                            <div className="flex flex-col items-start w-[80%] overflow-hidden">
                                                <span className="font-bold text-sm w-full truncate">{p.label}</span>
                                                <span className="text-[10px] text-white/40 truncate w-full mt-0.5">{p.latin}</span>
                                            </div>
                                            <span className="text-[10px] font-mono opacity-30 ml-2 shrink-0">{p.target}x</span>
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Group: Categories from Library */}
                        {dhikrCategories.map(cat => (
                            <div key={cat.id}>
                                <button
                                    onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                                    className="w-full flex items-center justify-between gap-2 mb-3 px-1 py-1 rounded-lg hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center gap-2 flex-1">
                                        <div className="h-px bg-white/10 flex-1"></div>
                                        <h3 className="text-[10px] font-bold opacity-70 uppercase tracking-widest text-left">{cat.label}</h3>
                                        <div className="h-px bg-white/10 flex-1"></div>
                                    </div>
                                    <ChevronDown className={cn("w-3.5 h-3.5 opacity-50 transition-transform duration-200", expandedCategory === cat.id ? "rotate-180" : "rotate-0")} />
                                </button>

                                {expandedCategory === cat.id && (
                                    <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-200">

                                        {cat.items.map((p) => (
                                            <Button
                                                key={p.id}
                                                variant="outline"
                                                onClick={() => handlePresetSelect(p as any)}
                                                className={cn(
                                                    "justify-between h-auto py-3 px-4 border-white/5 bg-white/5 rounded-2xl w-full text-left",
                                                    activeSequenceId === null && activeDhikr?.id === p.id && "bg-[rgb(var(--color-primary)/0.15)] border-[rgb(var(--color-primary)/0.3)] shadow-[inset_0_0_12px_rgba(var(--color-primary),0.05)]"
                                                )}
                                            >
                                                <div className="flex flex-col items-start w-[80%] overflow-hidden">
                                                    <span className="font-bold text-sm w-full truncate">{p.label}</span>
                                                    <span className="text-[10px] text-white/40 truncate w-full mt-0.5">{p.latin}</span>
                                                </div>
                                                <span className="text-[10px] font-mono opacity-30 ml-2 shrink-0">{p.target}x</span>
                                            </Button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Group: Berantai (if > 1) */}
                        {dhikrSequences.length > 1 && (
                            <div>
                                <button
                                    onClick={() => setExpandedCategory(expandedCategory === "berantai" ? null : "berantai")}
                                    className="w-full flex items-center justify-between gap-2 mb-3 px-1 py-1 rounded-lg hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center gap-2 flex-1">
                                        <div className="h-px bg-white/10 flex-1"></div>
                                        <h3 className="text-[10px] font-bold opacity-70 uppercase tracking-widest text-left">Berantai</h3>
                                        <div className="h-px bg-white/10 flex-1"></div>
                                    </div>
                                    <ChevronDown className={cn("w-3.5 h-3.5 opacity-50 transition-transform duration-200", expandedCategory === "berantai" ? "rotate-180" : "rotate-0")} />
                                </button>

                                {expandedCategory === "berantai" && (
                                    <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-200">

                                        {dhikrSequences.map((seq) => (
                                            <Button
                                                key={seq.id}
                                                variant="outline"
                                                onClick={() => handleSequenceSelect(seq)}
                                                className={cn(
                                                    "justify-between h-auto py-3 px-4 w-full border-[rgb(var(--color-primary)/0.1)] bg-[rgb(var(--color-primary)/0.05)] rounded-2xl transition-all text-left",
                                                    activeSequenceId === seq.id && "bg-[rgb(var(--color-primary)/0.2)] border-[rgb(var(--color-primary)/0.4)] shadow-[inset_0_0_15px_rgba(var(--color-primary),0.1)]"
                                                )}
                                            >
                                                <div className="flex flex-col items-start w-full overflow-hidden">
                                                    <span className="font-bold text-sm text-[rgb(var(--color-primary-light))] w-full truncate">{seq.label}</span>
                                                    <span className="text-[10px] text-white/50 mt-0.5 truncate w-full">Otomatis lanjut ke dzikir berikutnya</span>
                                                </div>
                                            </Button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
