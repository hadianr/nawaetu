"use client";

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

import { memo } from "react";
import { KaabaIcon } from "@/components/icons/KaabaIcon";
import { cn } from "@/lib/utils";

export interface CompassDisplayProps {
    compassRotate: number;
    qiblaRelativeRotate: number;
    aligned: boolean;
    distance: number | null;
    isDaylight: boolean;
    t: any;
}

const CompassDisplay = memo(({
    compassRotate,
    qiblaRelativeRotate,
    aligned,
    distance,
    isDaylight,
    t
}: CompassDisplayProps) => {
    const displayDegrees = Math.round((-compassRotate + 3600) % 360);

    return (
        <>
            {/* COMPASS CONTAINER */}
            <div className="relative flex items-center justify-center w-[85vw] h-[85vw] max-w-[320px] max-h-[320px] md:max-w-[360px] md:max-h-[360px]">

                {/* 1. FIX: Radial Gradient Ambient Glow (No Boxy Edges) */}
                {/* Scales up significantly when aligned to fill screen with theme vibe */}
                <div
                    className={cn(
                        "absolute inset-[-35%] rounded-full transition-all duration-700 ease-out z-0 pointer-events-none",
                        aligned ? "opacity-100 scale-125 animate-pulse" : "opacity-0 scale-90"
                    )}
                    style={{
                        background: aligned
                            ? isDaylight
                                ? 'radial-gradient(circle at center, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0.1) 40%, transparent 75%)'
                                : 'radial-gradient(circle at center, rgba(var(--color-primary),0.35) 0%, rgba(var(--color-primary),0.15) 40%, rgba(var(--color-primary),0.05) 60%, transparent 75%)'
                            : 'none'
                    }}
                />

                {/* Success Rings Animation */}
                {aligned && (
                    <>
                        <div className={cn(
                            "absolute inset-[-20%] rounded-full border-2 animate-[ping_2s_ease-out_infinite]",
                            isDaylight ? "border-emerald-500/20" : "border-[rgb(var(--color-primary))]/30"
                        )} />
                        <div className={cn(
                            "absolute inset-[-30%] rounded-full border animate-[ping_2.5s_ease-out_infinite]",
                            isDaylight ? "border-emerald-500/10" : "border-[rgb(var(--color-primary))]/20"
                        )} style={{ animationDelay: '0.3s' }} />
                    </>
                )}

                {/* MAIN ROTATING DIAL */}
                <div
                    className="absolute inset-0 will-change-transform z-10"
                    style={{
                        transform: `rotate(${compassRotate}deg) translateZ(0)`,
                        transition: 'transform 400ms cubic-bezier(0.25,0.46,0.45,0.94)'
                    }}
                >
                    {/* Dial Background */}
                    <div className={cn(
                        "w-full h-full rounded-full border-2 transition-all duration-500 backdrop-blur-sm",
                        isDaylight
                            ? aligned
                                ? "bg-emerald-50/50 border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.2)]"
                                : "bg-white border-slate-200/60 shadow-lg shadow-slate-200/50"
                            : aligned
                                ? "bg-gradient-to-b from-white/10 to-transparent border-[rgb(var(--color-primary))] shadow-[0_0_50px_rgba(var(--color-primary),0.5),inset_0_0_30px_rgba(var(--color-primary),0.15)]"
                                : "bg-gradient-to-b from-white/10 to-transparent border-white/10"
                    )}>
                        {/* Cardinal Points */}
                        <div className={cn(
                            "absolute top-4 left-1/2 -translate-x-1/2 font-bold text-lg md:text-xl transform -translate-y-1 transition-colors",
                            isDaylight ? "text-emerald-600" : "text-[rgb(var(--color-primary-light))]"
                        )}>N</div>
                        <div className={cn(
                            "absolute bottom-4 left-1/2 -translate-x-1/2 font-medium md:text-lg transform translate-y-1",
                            isDaylight ? "text-slate-400" : "text-white/60"
                        )}>S</div>
                        <div className={cn(
                            "absolute left-4 top-1/2 -translate-y-1/2 font-medium md:text-lg transform -translate-x-1",
                            isDaylight ? "text-slate-400" : "text-white/60"
                        )}>W</div>
                        <div className={cn(
                            "absolute right-4 top-1/2 -translate-y-1/2 font-medium md:text-lg transform translate-x-1",
                            isDaylight ? "text-slate-400" : "text-white/60"
                        )}>E</div>

                        {/* Ticks */}
                        <div
                            className={cn(
                                "absolute inset-4 rounded-full transition-opacity",
                                isDaylight ? "opacity-15" : "opacity-30"
                            )}
                            style={{
                                background: isDaylight
                                    ? `repeating-conic-gradient(from 0deg, #1e293b 0deg 0.5deg, transparent 0.5deg 5deg)`
                                    : `repeating-conic-gradient(from 0deg, rgba(255,255,255,0.5) 0deg 0.5deg, transparent 0.5deg 5deg)`,
                                maskImage: 'radial-gradient(transparent 65%, black 70%)',
                                WebkitMaskImage: 'radial-gradient(transparent 65%, black 70%)'
                            }}
                        />
                    </div>

                    {/* KAABA ICON */}
                    <div
                        className="absolute inset-0"
                        style={{
                            transform: `rotate(${qiblaRelativeRotate}deg) translateZ(0)`
                        }}
                    >
                        <div className="absolute top-8 left-1/2 -translate-x-1/2">
                            {/* 2. FIX: Radar Ping Animation */}
                            <div className={cn(
                                "relative transition-all duration-700 flex items-center justify-center transform",
                                aligned ? "scale-125" : "scale-100",
                                !isDaylight && !aligned && "bg-white/[0.04] rounded-full p-2 border border-white/5"
                            )}>

                                {/* Ping Rings */}
                                {aligned && (
                                    <>
                                        <div className={cn(
                                            "absolute w-[110%] h-[110%] rounded-full animate-ping opacity-75",
                                            isDaylight ? "bg-emerald-400/30" : "bg-[rgb(var(--color-primary))]/40"
                                        )} />
                                        <div className={cn(
                                            "absolute w-[140%] h-[140%] border-2 rounded-full animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]",
                                            isDaylight ? "border-emerald-400/20" : "border-[rgb(var(--color-primary))]/50"
                                        )} />
                                    </>
                                )}

                                <KaabaIcon className={cn(
                                    "w-12 h-12 md:w-14 md:h-14 drop-shadow-2xl relative z-10 transition-all duration-300",
                                    aligned
                                        ? isDaylight
                                            ? "opacity-100 brightness-110 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] text-emerald-600"
                                            : "opacity-100 brightness-110 drop-shadow-[0_0_15px_rgba(var(--color-primary),0.8)] text-[rgb(var(--color-primary-light))]"
                                        : isDaylight ? "opacity-60 text-slate-400" : "opacity-100 text-zinc-700 drop-shadow-[0_0_1px_rgba(255,255,255,0.5)] drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                                )} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* CENTER ORNAMENT */}
                <div className={cn(
                    "absolute w-5 h-5 rounded-full z-20 border-2 flex items-center justify-center transition-all duration-500",
                    aligned
                        ? isDaylight
                            ? "bg-emerald-500 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-125"
                            : "bg-[rgb(var(--color-primary))]/40 border-[rgb(var(--color-primary))] shadow-[0_0_20px_rgba(var(--color-primary),0.8)] scale-125"
                        : isDaylight ? "bg-white border-slate-200 shadow-sm scale-100" : "bg-white/20 border-white/10 shadow-lg scale-100"
                )}>
                    <div className={cn(
                        "w-2 h-2 rounded-full transition-all duration-500",
                        aligned
                            ? isDaylight ? "bg-white animate-pulse" : "bg-[rgb(var(--color-primary-light))] animate-pulse shadow-[0_0_10px_rgba(var(--color-primary-light),0.8)]"
                            : isDaylight ? "bg-slate-300" : "bg-white/50"
                    )} />
                </div>

                {/* TOP INDICATOR */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20">
                    <div className={cn(
                        "w-1.5 rounded-full transition-all duration-500",
                        aligned
                            ? isDaylight
                                ? "bg-emerald-500 h-6 shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-pulse"
                                : "bg-[rgb(var(--color-primary-light))] h-6 shadow-[0_0_25px_rgb(var(--color-primary-light))] animate-pulse"
                            : isDaylight ? "bg-slate-300 h-3" : "bg-white/30 h-3"
                    )} />
                </div>
            </div>

            {/* STATUS DISPLAY */}
            <div className="mt-10 text-center space-y-3 z-30">
                {/* 3. FIX: Text Animation (Scale + Glow) */}
                <div className={`transition-all duration-500 transform ${aligned ? 'scale-105' : 'scale-100'}`}>
                    <h2 className={cn(
                        "text-xl md:text-2xl lg:text-3xl font-bold tracking-[0.22em] transition-all duration-300 uppercase",
                        aligned
                            ? isDaylight
                                ? "text-emerald-600 drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                                : "text-[rgb(var(--color-primary-light))] drop-shadow-[0_0_24px_rgba(var(--color-primary),0.7)]"
                            : isDaylight ? "text-slate-400" : "text-white/70"
                    )}>
                        {aligned ? '✓ ' + t.qiblaAligned : t.qiblaFinding}
                    </h2>
                </div>

                {/* Alignment Success Badge */}
                {aligned && (
                    <div className={cn(
                        "inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm transition-all shadow-sm",
                        isDaylight
                            ? "bg-emerald-50 border-emerald-100 shadow-emerald-100/50"
                            : "bg-[rgb(var(--color-primary))]/20 border-[rgb(var(--color-primary))]/40 shadow-[0_0_16px_rgba(var(--color-primary),0.35)]"
                    )}>
                        <div className={cn(
                            "w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.7)]",
                            isDaylight ? "bg-emerald-500" : "bg-[rgb(var(--color-primary-light))]"
                        )} />
                        <span className={cn(
                            "text-sm font-semibold tracking-wide",
                            isDaylight ? "text-emerald-700" : "text-[rgb(var(--color-primary-light))]"
                        )}>
                            {t.qiblaAlignedBadge}
                        </span>
                    </div>
                )}

                <div className="flex flex-col items-center gap-1">
                    <div className={cn(
                        "text-5xl font-mono font-bold tracking-tighter transition-colors",
                        isDaylight ? "text-slate-800" : "text-white"
                    )}>
                        {displayDegrees}°
                    </div>
                </div>

                <div className={cn(
                    "mt-3 max-w-xs md:max-w-md text-[9px] md:text-xs leading-relaxed border rounded-lg px-3 py-2 backdrop-blur-sm transition-all",
                    isDaylight ? "bg-white border-slate-100 text-slate-500 shadow-sm" : "bg-white/5 border-white/10 text-white/70"
                )}>
                    <div className="space-y-1">
                        {distance && (
                            <div className={isDaylight ? "text-slate-400" : "text-white/55"}>
                                {t.qiblaDistance?.replace("{distance}", distance.toLocaleString())}
                            </div>
                        )}
                        <div>
                            <span className={isDaylight ? "text-slate-400" : "text-white/70"}>{t.qiblaDalilQuranRef} · </span>
                            <span>{t.qiblaDalilQuranText}</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
});

CompassDisplay.displayName = 'CompassDisplay';

export default CompassDisplay;
