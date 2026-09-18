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
import type { TranslationTree } from "@/context/LocaleContext";
import { DhikrPreset } from "./types";

export interface DhikrPresetSelectorProps {
    isDialogOpen: boolean;
    setIsDialogOpen: (open: boolean) => void;
    t: TranslationTree;
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
                        "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-surface-subtle))] shadow-[var(--shadow-card)]"
                    )}
                >
                    <Settings2 className="h-4 w-4 text-[rgb(var(--color-text-muted))]" />
                    <span className="text-[10px] font-medium text-[rgb(var(--color-text-muted))]">{t.tasbihSelectZikir}</span>
                </Button>
            </DialogTrigger>
            <DialogContent className={cn(
                "dhikr-preset-dialog w-[90%] max-w-sm rounded-[32px] border backdrop-blur-3xl",
                "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))] text-[rgb(var(--color-text-strong))]"
            )}>
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
                                            <span className="font-bold text-sm text-[rgb(var(--color-primary))] w-full truncate">{seq.label}</span>
                                            <span className="text-[10px] text-[rgb(var(--color-text-muted))] mt-0.5 truncate w-full">Otomatis lanjut ke dzikir berikutnya</span>
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        )}

                        {/* Group: Harian */}
                        <div>
                            <button
                                onClick={() => setExpandedCategory(expandedCategory === "harian" ? null : "harian")}
                                className="w-full flex items-center justify-between gap-2 mb-3 px-1 py-1 rounded-lg hover:bg-[rgb(var(--color-surface-subtle))] transition-colors"
                            >
                                <div className="flex items-center gap-2 flex-1">
                                    <div className="h-px bg-[rgb(var(--color-border))] flex-1"></div>
                                    <h3 className="text-[10px] font-bold opacity-70 uppercase tracking-widest text-left">Harian</h3>
                                    <div className="h-px bg-[rgb(var(--color-border))] flex-1"></div>
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
                                                "justify-between h-auto py-3 px-4 border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] rounded-2xl w-full text-left",
                                                activeSequenceId === null && activeDhikr?.id === p.id && "bg-[rgb(var(--color-primary)/0.15)] border-[rgb(var(--color-primary)/0.3)] shadow-[inset_0_0_12px_rgba(var(--color-primary),0.05)]"
                                            )}
                                        >
                                            <div className="flex flex-col items-start w-[80%] overflow-hidden">
                                                <span className="font-bold text-sm w-full truncate">{p.label}</span>
                                                <span className="text-[10px] text-[rgb(var(--color-text-muted))] truncate w-full mt-0.5">{p.latin}</span>
                                            </div>
                                            <span className="text-[10px] font-mono ml-2 shrink-0 text-[rgb(var(--color-text-muted))]">{p.target}x</span>
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
                                    className="w-full flex items-center justify-between gap-2 mb-3 px-1 py-1 rounded-lg hover:bg-[rgb(var(--color-surface-subtle))] transition-colors"
                                >
                                    <div className="flex items-center gap-2 flex-1">
                                        <div className="h-px bg-[rgb(var(--color-border))] flex-1"></div>
                                        <h3 className="text-[10px] font-bold opacity-70 uppercase tracking-widest text-left">{cat.label}</h3>
                                        <div className="h-px bg-[rgb(var(--color-border))] flex-1"></div>
                                    </div>
                                    <ChevronDown className={cn("w-3.5 h-3.5 opacity-50 transition-transform duration-200", expandedCategory === cat.id ? "rotate-180" : "rotate-0")} />
                                </button>

                                {expandedCategory === cat.id && (
                                    <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-200">

                                        {cat.items.map((p) => (
                                            <Button
                                                key={p.id}
                                                variant="outline"
                                                onClick={() => handlePresetSelect(p)}
                                                className={cn(
                                                "justify-between h-auto py-3 px-4 border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] rounded-2xl w-full text-left",
                                                    activeSequenceId === null && activeDhikr?.id === p.id && "bg-[rgb(var(--color-primary)/0.15)] border-[rgb(var(--color-primary)/0.3)] shadow-[inset_0_0_12px_rgba(var(--color-primary),0.05)]"
                                                )}
                                            >
                                                <div className="flex flex-col items-start w-[80%] overflow-hidden">
                                                    <span className="font-bold text-sm w-full truncate">{p.label}</span>
                                                <span className="text-[10px] text-[rgb(var(--color-text-muted))] truncate w-full mt-0.5">{p.latin}</span>
                                                </div>
                                            <span className="text-[10px] font-mono ml-2 shrink-0 text-[rgb(var(--color-text-muted))]">{p.target}x</span>
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
                                    className="w-full flex items-center justify-between gap-2 mb-3 px-1 py-1 rounded-lg hover:bg-[rgb(var(--color-surface-subtle))] transition-colors"
                                >
                                    <div className="flex items-center gap-2 flex-1">
                                        <div className="h-px bg-[rgb(var(--color-border))] flex-1"></div>
                                        <h3 className="text-[10px] font-bold opacity-70 uppercase tracking-widest text-left">Berantai</h3>
                                        <div className="h-px bg-[rgb(var(--color-border))] flex-1"></div>
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
                                                    <span className="font-bold text-sm text-[rgb(var(--color-primary))] w-full truncate">{seq.label}</span>
                                                    <span className="text-[10px] text-[rgb(var(--color-text-muted))] mt-0.5 truncate w-full">Otomatis lanjut ke dzikir berikutnya</span>
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
