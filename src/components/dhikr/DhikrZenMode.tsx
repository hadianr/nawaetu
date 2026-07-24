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

export interface DhikrZenModeProps {
    isZenMode: boolean;
    setIsZenMode: (open: boolean) => void;
    activeDhikr: DhikrPreset | null;
    target: number | null;
    count: number;
    hasHydrated: boolean;
    t: any;
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
        <div className="fixed inset-0 z-[9999] bg-black text-white flex flex-col items-center justify-center overflow-hidden">
            {/* Full screen tap area */}
            <div className="absolute inset-0 cursor-pointer active:bg-white/5 transition-colors" onClick={handleClick} />

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
                className="absolute top-8 right-6 z-[110] p-4 rounded-full opacity-20 hover:opacity-100 hover:bg-white/10 active:scale-95 transition-all text-white/50 hover:text-white"
            >
                <X className="w-8 h-8" />
            </button>

            {/* Counter Content */}
            <div className="relative z-10 flex flex-col items-center pointer-events-none mt-[-10vh]">
                <span className="text-[12px] md:text-sm font-bold tracking-widest uppercase mb-4 text-white/20">
                    {activeDhikr ? activeDhikr.label : t.tasbihCounterLabel}
                </span>

                <span className="text-[120px] leading-none xs:text-[140px] md:text-[180px] font-mono font-bold tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                    {hasHydrated ? count : "..."}
                </span>

                {target && (
                    <span className="text-white/30 text-2xl md:text-3xl font-mono mt-2">
                        / {target}
                    </span>
                )}

                <div className="mt-16 text-xs md:text-sm animate-pulse font-medium text-white/20 tracking-widest uppercase">
                    {t.tasbihTap || "Ketuk Layar"}
                </div>
            </div>

            {/* Feedback Toggle */}
            <button
                onClick={(e) => { e.stopPropagation(); toggleFeedback(); }}
                className="absolute bottom-8 right-6 z-[110] p-4 rounded-full opacity-30 hover:opacity-100 hover:bg-white/10 active:scale-95 transition-all text-white/50 hover:text-white flex flex-col items-center gap-1.5"
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
