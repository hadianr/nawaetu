"use client";

import { useState, useEffect } from "react";
import { BookOpen, Clock, Target, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/context/LocaleContext";
import { THEMES, useTheme } from "@/context/ThemeContext";

const DAILY_TARGET_KEY = "nawaetu_quran_daily_target_minutes";
const DEFAULT_TARGET_MINUTES = 15;

function getLocalDateString() {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    today.setMinutes(today.getMinutes() - offset);
    return today.toISOString().split("T")[0];
}

export default function QuranReadingBanner() {
    const [dailyTotalSeconds, setDailyTotalSeconds] = useState(0);
    const [targetMinutes, setTargetMinutes] = useState(DEFAULT_TARGET_MINUTES);
    const [showTargetPicker, setShowTargetPicker] = useState(false);
    const [mounted, setMounted] = useState(false);
    const t = useTranslations();
    const { currentTheme } = useTheme();
    const isLight = THEMES[currentTheme].mode === "light";

    const TARGET_OPTIONS = [
        { label: "5m", longLabel: `5 ${t.unitMinuteLong}`, value: 5 },
        { label: "10m", longLabel: `10 ${t.unitMinuteLong}`, value: 10 },
        { label: "15m", longLabel: `15 ${t.unitMinuteLong}`, value: 15 },
        { label: "30m", longLabel: `30 ${t.unitMinuteLong}`, value: 30 },
        { label: "1j", longLabel: `1 ${t.unitHourLong}`, value: 60 },
    ];

    function formatDuration(totalSeconds: number): string {
        if (totalSeconds === 0) return `0 ${t.unitMinuteLong}`;
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        let result = "";
        if (hours > 0) result += `${hours}${t.unitHour} `;
        if (minutes > 0) result += `${minutes}${t.unitMinute} `;
        if (seconds > 0 && hours === 0) result += `${seconds}${t.unitSecond}`;
        
        return result.trim() || `0 ${t.unitMinuteLong}`;
    }

    // Hydrate from localStorage on client
    useEffect(() => {
        queueMicrotask(() => setMounted(true));
        const dateString = getLocalDateString();
        const storedSeconds = parseInt(
            localStorage.getItem(`nawaetu_quran_daily_total_${dateString}`) || "0",
            10
        );
        const storedTarget = parseInt(
            localStorage.getItem(DAILY_TARGET_KEY) || String(DEFAULT_TARGET_MINUTES),
            10
        );
        queueMicrotask(() => {
            setDailyTotalSeconds(isNaN(storedSeconds) ? 0 : storedSeconds);
            setTargetMinutes(isNaN(storedTarget) ? DEFAULT_TARGET_MINUTES : storedTarget);
        });

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
        <div className={cn("relative rounded-2xl border p-4", isLight ? "border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] text-[rgb(var(--color-text-strong))] shadow-[var(--shadow-card)]" : "border-white/10 bg-gradient-to-br from-blue-900/20 via-black/30 to-black/10")}>
            {/* Background glow - uses negative z so it doesn't interfere with dropdown */}
            <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none -z-0", isLight ? "bg-[rgb(var(--color-primary))]/10" : "bg-blue-500/10")} />

            <div className="relative z-10">
                {/* Header row */}
                <div className="flex items-center justify-between mb-3 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className={cn("w-6 h-6 shrink-0 rounded-xl border flex items-center justify-center", isLight ? "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary-light))]" : "bg-blue-500/20 border-blue-400/20")}>
                            <BookOpen className={cn("w-3 h-3", isLight ? "text-[rgb(var(--color-primary-strong))]" : "text-blue-400")} />
                        </div>
                        <div className="min-w-0">
                            <p className={cn("text-[9px] font-bold uppercase tracking-widest", isLight ? "text-[rgb(var(--color-text-muted))]" : "text-white/40")}>{t.tilawahBannerTitle}</p>
                            <p className={cn("text-sm font-black leading-tight truncate", isLight ? "text-[rgb(var(--color-text-strong))]" : "text-white")}>
                                {dailyTotalSeconds > 0 ? formatDuration(dailyTotalSeconds) : (
                                    <span className={cn("font-medium text-xs", isLight ? "text-[rgb(var(--color-text-muted))]" : "text-white/40")}>{t.tilawahBannerNoStart}</span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Target toggle button */}
                    <button
                        onClick={() => setShowTargetPicker((prev) => !prev)}
                        className={cn("shrink-0 flex items-center gap-1 px-2 py-1.5 rounded-xl border transition-all text-[10px]", isLight ? "bg-[rgb(var(--color-surface))] hover:bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))] text-[rgb(var(--color-text))] hover:text-[rgb(var(--color-text-strong))]" : "bg-white/5 hover:bg-white/10 border-white/10 text-white/60 hover:text-white")}
                    >
                        <Target className="w-3 h-3" />
                        <span className="whitespace-nowrap">{targetMinutes < 60 ? `${targetMinutes}${t.unitMinute}` : `1${t.unitHour}`}</span>
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
                                        ? (isLight ? "bg-[rgb(var(--color-primary))]/15 border-[rgb(var(--color-ring))] text-[rgb(var(--color-primary-strong))] font-bold" : "bg-blue-500/20 border-blue-400/40 text-blue-300 font-bold")
                                        : (isLight ? "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))] text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-surface-subtle))] hover:text-[rgb(var(--color-text-strong))]" : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white")
                                )}
                            >
                                <span className="block">{opt.label}</span>
                                <span className="block text-[9px] opacity-60 mt-0.5">{opt.longLabel}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Progress bar */}
                <div className={cn("h-1.5 w-full rounded-full overflow-hidden border mb-2", isLight ? "bg-[rgb(var(--color-border))]/60 border-[rgb(var(--color-border))]" : "bg-white/5 border-white/5")}>
                    <div
                        className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            isCompleted
                                ? (isLight ? "bg-[rgb(var(--color-success))]" : "bg-gradient-to-r from-emerald-500 to-emerald-400")
                                : (isLight ? "bg-[rgb(var(--color-info))]" : "bg-gradient-to-r from-blue-600 to-blue-400")
                        )}
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Status row */}
                <div className="flex items-center justify-between">
                    <div className={cn("flex items-center gap-1 text-[10px]", isLight ? "text-[rgb(var(--color-text-muted))]" : "text-white/40")}>
                        <Clock className="w-3 h-3" />
                        {isCompleted ? (
                            <span className={cn("font-bold", isLight ? "text-[rgb(var(--color-success))]" : "text-emerald-400")}>{t.tilawahTargetReached}</span>
                        ) : (
                            <span>{t.tilawahTimeLeft.replace('{{time}}', formatDuration(timeLeft))}</span>
                        )}
                    </div>
                    <span className={cn(
                        "text-[10px] font-black",
                        isCompleted ? (isLight ? "text-[rgb(var(--color-success))]" : "text-emerald-400") : (isLight ? "text-[rgb(var(--color-text-muted))]" : "text-white/40")
                    )}>
                        {progress}%
                    </span>
                </div>
            </div>
        </div>
    );
}
