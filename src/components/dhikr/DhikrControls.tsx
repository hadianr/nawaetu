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
import type { TranslationTree } from "@/context/LocaleContext";

export interface DhikrControlsProps {
    t: TranslationTree;
    handleReset: () => void;
    setIsZenMode: (val: boolean) => void;
    feedbackMode: 'sound' | 'none';
    setFeedbackMode: (val: 'sound' | 'none') => void;
    toggleFeedback: () => void;
    children?: React.ReactNode;
}

export function DhikrControls({
    t,
    handleReset,
    setIsZenMode,
    feedbackMode,
    setFeedbackMode,
    toggleFeedback,
    children
}: DhikrControlsProps) {
    const FeedbackIcon = { sound: Volume2, none: VolumeX }[feedbackMode] || Volume2;

    return (
        <div className="grid grid-cols-4 gap-2 w-full max-w-none xl:max-w-[360px] pointer-events-auto px-2">
            <Button
                variant="ghost"
                onClick={(e) => { e.stopPropagation(); handleReset(); }}
                className={cn(
                    "flex flex-col h-auto py-3 gap-1 rounded-2xl border transition-colors",
                    "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-surface-subtle))] shadow-[var(--shadow-card)]"
                )}
            >
                <RotateCcw className="h-4 w-4 text-[rgb(var(--color-text-muted))]" />
                <span className="text-[10px] font-medium text-[rgb(var(--color-text-muted))]">{t.tasbihReset}</span>
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
                    "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-surface-subtle))] shadow-[var(--shadow-card)]"
                )}
            >
                <Moon className="h-4 w-4 text-[rgb(var(--color-text-muted))]" />
                <span className="text-[10px] font-medium text-[rgb(var(--color-text-muted))]">Mode Zen</span>
            </Button>

            <Button
                variant="ghost"
                onClick={(e) => { e.stopPropagation(); toggleFeedback(); }}
                className={cn(
                    "flex flex-col h-auto py-3 gap-1 rounded-2xl border transition-all",
                    feedbackMode !== 'none'
                        ? "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary-strong))] border-[rgb(var(--color-primary))]/25"
                        : "bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-muted))] border-[rgb(var(--color-border))]"
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
