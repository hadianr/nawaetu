"use client";

import { useState, useEffect } from "react";
import { BookOpen, Clock, Target, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const DAILY_TARGET_KEY = "nawaetu_quran_daily_target_minutes";
const DEFAULT_TARGET_MINUTES = 15;

const TARGET_OPTIONS = [
    { label: "5m", longLabel: "5 menit", value: 5 },
    { label: "10m", longLabel: "10 menit", value: 10 },
    { label: "15m", longLabel: "15 menit", value: 15 },
    { label: "30m", longLabel: "30 menit", value: 30 },
    { label: "1j", longLabel: "1 jam", value: 60 },
];

function getLocalDateString() {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    today.setMinutes(today.getMinutes() - offset);
    return today.toISOString().split("T")[0];
}

function formatDuration(totalSeconds: number): string {
    if (totalSeconds === 0) return "0 menit";
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) return `${hours}j ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds} detik`;
}

export default function QuranReadingBanner() {
    const [dailyTotalSeconds, setDailyTotalSeconds] = useState(0);
    const [targetMinutes, setTargetMinutes] = useState(DEFAULT_TARGET_MINUTES);
    const [showTargetPicker, setShowTargetPicker] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Hydrate from localStorage on client
    useEffect(() => {
        setMounted(true);
        const dateString = getLocalDateString();
        const storedSeconds = parseInt(
            localStorage.getItem(`nawaetu_quran_daily_total_${dateString}`) || "0",
            10
        );
        const storedTarget = parseInt(
            localStorage.getItem(DAILY_TARGET_KEY) || String(DEFAULT_TARGET_MINUTES),
            10
        );
        setDailyTotalSeconds(isNaN(storedSeconds) ? 0 : storedSeconds);
        setTargetMinutes(isNaN(storedTarget) ? DEFAULT_TARGET_MINUTES : storedTarget);

        // Also poll every 5 seconds to pick up changes from the reading page
        const interval = setInterval(() => {
            const latest = parseInt(
                localStorage.getItem(`nawaetu_quran_daily_total_${dateString}`) || "0",
                10
            );
            setDailyTotalSeconds(isNaN(latest) ? 0 : latest);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const handleTargetChange = (minutes: number) => {
        setTargetMinutes(minutes);
        localStorage.setItem(DAILY_TARGET_KEY, String(minutes));
        setShowTargetPicker(false);
    };

    if (!mounted) return null;

    const targetSeconds = targetMinutes * 60;
    const progress = Math.min(100, Math.round((dailyTotalSeconds / targetSeconds) * 100));
    const isCompleted = dailyTotalSeconds >= targetSeconds;
    const timeLeft = Math.max(0, targetSeconds - dailyTotalSeconds);

    return (
        <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-blue-900/20 via-black/30 to-black/10 p-4">
            {/* Background glow - uses negative z so it doesn't interfere with dropdown */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

            <div className="relative z-10">
                {/* Header row */}
                <div className="flex items-center justify-between mb-3 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 shrink-0 rounded-xl bg-blue-500/20 border border-blue-400/20 flex items-center justify-center">
                            <BookOpen className="w-3 h-3 text-blue-400" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">Tilawah Hari Ini</p>
                            <p className="text-sm font-black text-white leading-tight truncate">
                                {dailyTotalSeconds > 0 ? formatDuration(dailyTotalSeconds) : (
                                    <span className="text-white/40 font-medium text-xs">Belum mulai</span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Target toggle button */}
                    <button
                        onClick={() => setShowTargetPicker((prev) => !prev)}
                        className="shrink-0 flex items-center gap-1 px-2 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-[10px] text-white/60 hover:text-white"
                    >
                        <Target className="w-3 h-3" />
                        <span className="whitespace-nowrap">{targetMinutes < 60 ? `${targetMinutes}m` : "1j"}</span>
                        <ChevronDown className={cn("w-3 h-3 transition-transform", showTargetPicker && "rotate-180")} />
                    </button>
                </div>

                {/* Inline target picker - 5 columns grid for compact all-in-one-row layout */}
                {showTargetPicker && (
                    <div className="grid grid-cols-5 gap-1.5 mb-3">
                        {TARGET_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => handleTargetChange(opt.value)}
                                className={cn(
                                    "py-1.5 rounded-xl text-xs font-medium transition-all border text-center",
                                    targetMinutes === opt.value
                                        ? "bg-blue-500/20 border-blue-400/40 text-blue-300 font-bold"
                                        : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
                                )}
                            >
                                <span className="block">{opt.label}</span>
                                <span className="block text-[9px] opacity-60 mt-0.5">{opt.longLabel}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Progress bar */}
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 mb-2">
                    <div
                        className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            isCompleted
                                ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                                : "bg-gradient-to-r from-blue-600 to-blue-400"
                        )}
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Status row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[10px] text-white/40">
                        <Clock className="w-3 h-3" />
                        {isCompleted ? (
                            <span className="text-emerald-400 font-bold">Target tercapai! 🎉</span>
                        ) : (
                            <span>{formatDuration(timeLeft)} lagi menuju target</span>
                        )}
                    </div>
                    <span className={cn(
                        "text-[10px] font-black",
                        isCompleted ? "text-emerald-400" : "text-white/40"
                    )}>
                        {progress}%
                    </span>
                </div>
            </div>
        </div>
    );
}
