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
import { createPortal } from "react-dom";
import { Volume2, VolumeX, X } from "lucide-react";
import { DhikrPreset } from "./types";
import type { TranslationTree } from "@/context/LocaleContext";
import { cn } from "@/lib/utils";

export interface DhikrZenModeProps {
    isZenMode: boolean;
    setIsZenMode: (open: boolean) => void;
    activeDhikr: DhikrPreset | null;
    target: number | null;
    count: number;
    hasHydrated: boolean;
    t: TranslationTree;
    handleIncrement: () => void;
    feedbackMode: 'sound' | 'none';
    toggleFeedback: () => void;
}

export function DhikrZenMode({
    isZenMode,
    setIsZenMode,
    activeDhikr,
    target,
    count,
    hasHydrated,
    t,
    handleIncrement,
    feedbackMode,
    toggleFeedback
}: DhikrZenModeProps) {
    const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

    if (!isZenMode || typeof document === 'undefined') return null;

    const FeedbackIcon = { sound: Volume2, none: VolumeX }[feedbackMode] || Volume2;

    const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
        const id = Date.now();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        setRipples(prev => [...prev.slice(-5), { id, x: clientX, y: clientY }]);
        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== id));
        }, 600);
        handleIncrement();
    };

    const zenModeUI = (
        <div className={cn(
            "dhikr-zen-mode fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden",
            "bg-[rgb(var(--color-canvas))] text-[rgb(var(--color-text-strong))]"
        )}>
            {/* Full screen tap area */}
            <div className="absolute inset-0 cursor-pointer transition-colors active:bg-[rgb(var(--color-primary))]/10" onClick={handleClick} />

            {/* Ripples */}
            {ripples.map(ripple => (
                <div
                    key={ripple.id}
                    className="absolute rounded-full bg-[rgb(var(--color-primary)/0.2)] pointer-events-none animate-ripple"
                    style={{
                        left: ripple.x,
                        top: ripple.y,
                        width: '20px',
                        height: '20px',
                        transform: 'translate(-50%, -50%)',
                    }}
                />
            ))}

            {/* Close Button */}
            <button
                onClick={() => setIsZenMode(false)}
                className="absolute top-8 right-6 z-[110] p-4 rounded-full active:scale-95 transition-all text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-primary))]/10 hover:text-[rgb(var(--color-primary-strong))]"
            >
                <X className="w-8 h-8" />
            </button>

            {/* Counter Content */}
            <div className="relative z-10 flex flex-col items-center pointer-events-none mt-[-10vh]">
                <span className="text-[12px] md:text-sm font-bold tracking-widest uppercase mb-4 text-[rgb(var(--color-primary-strong))]">
                    {activeDhikr ? activeDhikr.label : t.tasbihCounterLabel}
                </span>

                <span className="text-[120px] leading-none xs:text-[140px] md:text-[180px] font-mono font-bold tracking-tighter text-[rgb(var(--color-text-strong))]">
                    {hasHydrated ? count : "..."}
                </span>

                {target && (
                    <span className="text-2xl md:text-3xl font-mono mt-2 text-[rgb(var(--color-text-muted))]">
                        / {target}
                    </span>
                )}

                <div className="mt-16 text-xs md:text-sm animate-pulse font-medium tracking-widest uppercase text-[rgb(var(--color-primary-strong))]">
                    {t.tasbihTap || "Ketuk Layar"}
                </div>
            </div>

            {/* Feedback Toggle */}
            <button
                onClick={(e) => { e.stopPropagation(); toggleFeedback(); }}
                className="absolute bottom-8 right-6 z-[110] p-4 rounded-full active:scale-95 transition-all flex flex-col items-center gap-1.5 text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-primary))]/10 hover:text-[rgb(var(--color-primary-strong))]"
            >
                <FeedbackIcon className="w-5 h-5" />
                <span className="text-[8px] font-medium uppercase tracking-tighter opacity-70">
                    {feedbackMode === 'sound' ? t.tasbihSound : t.tasbihMute}
                </span>
            </button>
        </div>
    );

    return createPortal(zenModeUI, document.body);
}
