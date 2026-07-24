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
import { RotateCcw, Moon, Volume2, VolumeX } from "lucide-react";

export interface DhikrControlsProps {
    t: any;
    isDaylight: boolean;
    handleReset: () => void;
    setIsZenMode: (val: boolean) => void;
    feedbackMode: 'sound' | 'none';
    setFeedbackMode: (val: 'sound' | 'none') => void;
    toggleFeedback: () => void;
    children?: React.ReactNode;
}

export function DhikrControls({
    t,
    isDaylight,
    handleReset,
    setIsZenMode,
    feedbackMode,
    setFeedbackMode,
    toggleFeedback,
    children
}: DhikrControlsProps) {
    const FeedbackIcon = { sound: Volume2, none: VolumeX }[feedbackMode] || Volume2;

    return (
        <div className="grid grid-cols-4 gap-2 w-full max-w-[360px] pointer-events-auto px-2">
            <Button
                variant="ghost"
                onClick={(e) => { e.stopPropagation(); handleReset(); }}
                className={cn(
                    "flex flex-col h-auto py-3 gap-1 rounded-2xl border transition-colors",
                    isDaylight ? "bg-white shadow-sm border-slate-200 hover:bg-slate-50" : "bg-white/5 hover:bg-white/10 border-white/5"
                )}
            >
                <RotateCcw className={cn("h-4 w-4", isDaylight ? "text-slate-400" : "text-white/60")} />
                <span className={cn("text-[10px] font-medium", isDaylight ? "text-slate-500" : "text-white/40")}>{t.tasbihReset}</span>
            </Button>

            {children}

            <Button
                variant="ghost"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsZenMode(true);
                    // Ensure feedback is on for "feel"
                    if (feedbackMode === 'none') {
                        setFeedbackMode('sound');
                    }
                }}
                className={cn(
                    "flex flex-col h-auto py-3 gap-1 rounded-2xl border transition-colors",
                    isDaylight ? "bg-white shadow-sm border-slate-200 hover:bg-slate-50" : "bg-white/5 hover:bg-white/10 border-white/5"
                )}
            >
                <Moon className={cn("h-4 w-4", isDaylight ? "text-slate-400" : "text-white/60")} />
                <span className={cn("text-[10px] font-medium", isDaylight ? "text-slate-500" : "text-white/40")}>Mode Zen</span>
            </Button>

            <Button
                variant="ghost"
                onClick={(e) => { e.stopPropagation(); toggleFeedback(); }}
                className={cn(
                    "flex flex-col h-auto py-3 gap-1 rounded-2xl border transition-all",
                    feedbackMode !== 'none'
                        ? isDaylight
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                            : "bg-[rgb(var(--color-primary)/0.15)] text-[rgb(var(--color-primary-light))] border-[rgb(var(--color-primary)/0.25)]"
                        : isDaylight
                            ? "bg-white border-slate-200 text-slate-300"
                            : "bg-white/5 text-white/40 border-white/5"
                )}
            >
                <FeedbackIcon className="h-4 w-4" />
                <span className="text-[10px] font-medium uppercase tracking-tighter">
                    {feedbackMode === 'sound' ? t.tasbihSound : t.tasbihMute}
                </span>
            </Button>
        </div>
    );
}
