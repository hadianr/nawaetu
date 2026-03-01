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

import { useState, useEffect } from "react";
import { RAMADHAN_MISSIONS, SYABAN_MISSIONS, getLocalizedMission } from "@/data/missions";
import dynamic from "next/dynamic";

// Inline critical icons to avoid lucide overhead on LCP
const MoonIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
);

const InfoIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
    </svg>
);
import { Button } from "@/components/ui/button";
import { useLocale } from "@/context/LocaleContext";
import { usePrayerTimesContext } from "@/context/PrayerTimesContext";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

// Lazy load dialog for better initial load
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Props {
    initialDays?: number;
}

export default function RamadhanCountdown({ initialDays = 0 }: Props) {
    const { t, locale } = useLocale();
    const { data: prayerData } = usePrayerTimesContext();
    // Initialize with server-provided value to allow immediate rendering (LCP optimization)
    const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; totalMs: number }>({
        days: initialDays,
        hours: 0,
        minutes: 0,
        totalMs: initialDays * 24 * 60 * 60 * 1000 // Approximate for init
    });
    const [progress, setProgress] = useState(0);
    const [showInfo, setShowInfo] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    const [adjustment, setAdjustment] = useState(-1);

    // Target: Estimated 1 Ramadhan 1447H (Feb 18, 2026)
    const BASE_TARGET_DATE = new Date("2026-02-18T00:00:00+07:00");

    useEffect(() => {
        setIsMounted(true);

        const storage = getStorageService();

        // Load initial adjustment
        const loadAdjustment = () => {
            const savedAdj = storage.getOptional(STORAGE_KEYS.SETTINGS_HIJRI_ADJUSTMENT);
            if (savedAdj !== null && savedAdj !== undefined && savedAdj !== "") {
                const parsed = parseInt(savedAdj as string, 10);
                setAdjustment(!isNaN(parsed) ? parsed : -1);
            } else {
                setAdjustment(-1); // Default to -1 (Muhammadiyah/Government alignment)
            }
        };
        loadAdjustment();

        // Countdown Logic - optimized to not block render
        const calculateTimeLeft = () => {
            const now = new Date();
            // Adjust the target date based on user preference
            // If adjustment is +1 (My Hijri date is ahead), Ramadhan comes SOONER.
            // So we SUBTRACT days from the Target Date.
            // Example: Adj +1. Original Target Feb 18. New Target Feb 17.
            // Example: Adj -1. Original Target Feb 18. New Target Feb 19.
            // Formula: Base - (Adjustment * Days)
            const adjustedTarget = new Date(BASE_TARGET_DATE.getTime() - (adjustment * 24 * 60 * 60 * 1000));

            const difference = adjustedTarget.getTime() - now.getTime();

            // Allow negative values to track days passed
            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)) + 1,
                hours: Math.floor((Math.abs(difference) / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((Math.abs(difference) / 1000 / 60) % 60),
                totalMs: difference
            };
        };

        // Immediately update on mount
        setTimeLeft(calculateTimeLeft());

        // Update every 60 seconds
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 60000);

        // Listen for adjustment changes
        const handleAdjustmentChange = (e: any) => {
            const newAdj = parseInt(e.detail?.adjustment || "0", 10);
            setAdjustment(newAdj);
        };
        window.addEventListener('hijri_adjustment_changed', handleAdjustmentChange);

        // Defer progress loading to not block initial render (LCP optimization)
        const loadProgress = () => {
            // ... (Progress loading logic unchanged) ...
            const savedCompleted = storage.getOptional(STORAGE_KEYS.COMPLETED_MISSIONS);
            if (savedCompleted) {
                try {
                    const completedData = typeof savedCompleted === 'string' ? JSON.parse(savedCompleted) : savedCompleted;
                    const completedMap: Record<string, any> = Array.isArray(completedData)
                        ? completedData.reduce((acc, m) => {
                            acc[m.id] = m;
                            return acc;
                        }, {} as Record<string, any>)
                        : completedData;

                    const targetMissions = SYABAN_MISSIONS;

                    const currentXP = targetMissions.reduce((acc, m) => {
                        const record = completedMap[m.id];
                        if (!record) return acc;
                        return acc + m.hasanahReward;
                    }, 0);

                    const totalXP = targetMissions.reduce((acc, m) => acc + m.hasanahReward, 0);
                    const p = totalXP > 0 ? Math.round((currentXP / totalXP) * 100) : 0;
                    setProgress(Math.min(100, p));
                } catch (e) {
                    setProgress(0);
                }
            } else {
                setProgress(0);
            }
        };

        // ... (rest of listeners) ...
        if (typeof window !== "undefined" && "requestIdleCallback" in window) {
            (window as Window).requestIdleCallback(() => loadProgress(), { timeout: 3000 });
        } else {
            setTimeout(loadProgress, 100);
        }

        window.addEventListener("mission_storage_updated", loadProgress);

        const handleBackupUpdate = () => setTimeout(loadProgress, 50);
        window.addEventListener("hasanah_updated", handleBackupUpdate);

        const handleStorageUpdate = () => {
            loadAdjustment(); // Reload adjustment on storage event
            if (typeof window !== "undefined" && "requestIdleCallback" in window) {
                (window as Window).requestIdleCallback(() => loadProgress(), { timeout: 3000 });
            } else {
                setTimeout(loadProgress, 100);
            }
        };
        window.addEventListener("storage", handleStorageUpdate);

        return () => {
            clearInterval(timer);
            window.removeEventListener("mission_storage_updated", loadProgress);
            window.removeEventListener("hasanah_updated", handleBackupUpdate);
            window.removeEventListener("storage", handleStorageUpdate);
            window.removeEventListener("hijri_adjustment_changed", handleAdjustmentChange);
        };
    }, [adjustment]); // Re-run effect when adjustment changes to recalculate immediately

    const getLevelTitle = (p: number) => {
        if (p === 100) return t.ramadhanReady;
        if (p >= 75) return t.ramadhanLevel75;
        if (p >= 50) return t.ramadhanLevel50;
        if (p >= 25) return t.ramadhanLevel25;
        return t.ramadhanLevel0;
    };

    const handleCardClick = () => {
        // Dispatch custom event to open Missions Modal with 'seasonal' tab
        window.dispatchEvent(new CustomEvent("open_mission_modal", { detail: { tab: 'seasonal' } }));
    };

    // Determine Phase based on Hijri Date if available, fallback to Gregorian
    const hijriMonth = prayerData?.hijriMonth;
    const hijriDay = prayerData?.hijriDay || 0;

    const isRamadhan = hijriMonth === "Ramadan";
    const isEid = hijriMonth === "Shawwal";

    // Calculate effective days left/passed
    // On Feb 18 with -1 adj, we want "1 Hari Lagi" (Sha'ban 30)
    const displayDays = isRamadhan ? hijriDay : timeLeft.days;

    // Note: If it's 29 Sha'ban, and we assume 30 days, it's 1 day left. 
    // If Sha'ban is only 29 days, the hook will switch to Ramadan tomorrow anyway.

    // Dynamic Intensity Logic
    const getIntensityStyles = (days: number) => {
        if (isEid) {
            return {
                bg: "from-yellow-600/40 via-amber-500/20 to-yellow-900/60", // Gold/Festive
                border: "border-yellow-500/50 shadow-[0_0_30px_-5px_rgba(234,179,8,0.3)]",
                text: "text-yellow-400",
                icon: "fill-yellow-400 text-yellow-200",
                glow: "bg-yellow-500/30",
                animate: "animate-pulse"
            };
        }

        if (isRamadhan) {
            // Use CSS Variables for Dynamic Theme Integration
            return {
                bg: "from-[rgb(var(--color-primary-dark))]/60 via-[rgb(var(--color-primary))]/20 to-black/60",
                border: "border-[rgb(var(--color-primary))]/50 shadow-[0_0_30px_-5px_rgba(var(--color-primary),0.3)]",
                text: "text-[rgb(var(--color-primary-light))]",
                icon: "fill-[rgb(var(--color-primary-light))] text-[rgb(var(--color-primary))]",
                glow: "bg-[rgb(var(--color-primary))]/40",
                animate: ""
            };
        }

        // Prep Phase
        if (days <= 10) {
            return {
                bg: "from-amber-600/40 via-yellow-500/20 to-emerald-900/60",
                border: "border-amber-500/50 shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)]",
                text: "text-amber-400",
                icon: "fill-amber-400 text-amber-200",
                glow: "bg-amber-500/30",
                animate: "animate-pulse"
            };
        }
        if (days <= 40) {
            return {
                bg: "from-[rgb(var(--color-primary-dark))]/40 via-amber-700/20 to-black/60",
                border: "border-[rgb(var(--color-primary))]/30 shadow-[0_0_20px_-5px_rgba(var(--color-primary),0.2)]",
                text: "text-[rgb(var(--color-primary-light))]",
                icon: "fill-[rgb(var(--color-primary-light))]/30 text-[rgb(var(--color-primary))]",
                glow: "bg-[rgb(var(--color-primary))]/20",
                animate: ""
            };
        }
        return {
            bg: "from-slate-900 via-[rgb(var(--color-primary-dark))]/40 to-black/80",
            border: "border-white/10",
            text: "text-slate-400",
            icon: "fill-white/10 text-slate-500",
            glow: "bg-white/5",
            animate: ""
        };
    };

    // Use displayDays for consistency
    const styles = getIntensityStyles(isRamadhan ? 0 : displayDays);

    return (
        <>
            <button
                onClick={() => {
                    if (isRamadhan) {
                        // Portal to Ramadhan Hub
                        window.location.href = "/ramadhan";
                    } else {
                        handleCardClick();
                    }
                }}
                className="w-full relative mb-4 group transition-transform duration-300 hover:scale-[1.01] text-left appearance-none will-change-transform"
            >
                {/* Optimized Background */}
                <div className={`absolute inset-0 bg-gradient-to-r ${styles.bg} rounded-3xl -z-10 opacity-80`} />

                <div className={`relative w-full bg-black/40 border ${styles.border} rounded-3xl px-6 py-6 flex items-center justify-between overflow-hidden`}>

                    {/* Simple decorative glow */}
                    <div className={`absolute -right-10 -top-10 w-32 h-32 bg-${styles.glow.split('-')[1]}-500/20 rounded-full blur-2xl pointer-events-none`} />

                    {isRamadhan ? (
                        /* RAMADHAN MODE: Portal to Hub */
                        <div className="flex items-center justify-between w-full">
                            <div className="flex flex-col gap-1 z-10">
                                <div className={`flex items-center gap-2 ${styles.text} mb-1 transition-colors duration-500`}>
                                    <MoonIcon className={`w-4 h-4 ${styles.icon}`} />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                                        Ramadhan Hub
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-3xl font-bold font-serif text-white leading-none tracking-tight filter drop-shadow-md pb-1">
                                        Hari ke-{displayDays}
                                    </span>
                                    {/* Next Prayer Time (Imsak / Maghrib) */}
                                    <span className="text-sm font-medium text-white/70 mt-1 flex items-center gap-1.5">
                                        ⏱️ {
                                            (() => {
                                                const now = new Date();
                                                const imsak = prayerData?.prayerTimes?.["Imsak"];
                                                const maghrib = prayerData?.prayerTimes?.["Maghrib"];

                                                const parseTime = (t: string) => {
                                                    const [h, m] = t.split(":").map(Number);
                                                    const d = new Date();
                                                    d.setHours(h, m, 0);
                                                    return d;
                                                };

                                                if (imsak && maghrib) {
                                                    const iDate = parseTime(imsak);
                                                    const mDate = parseTime(maghrib);

                                                    if (now < iDate) return `Imsak ${imsak}`;
                                                    if (now < mDate) return `Buka ${maghrib}`;
                                                    return "Istirahat";
                                                }
                                                return "Lihat Jadwal";
                                            })()
                                        }
                                        <span className="opacity-50">•</span>
                                        <span className="underline decoration-dotted underline-offset-2">Buka Dashboard →</span>
                                    </span>
                                </div>
                            </div>

                            {/* Visual Icon */}
                            <div className="text-5xl opacity-80 grayscale-[30%] group-hover:grayscale-0 transition-all duration-500 scale-110">
                                🌙
                            </div>
                        </div>
                    ) : (
                        /* COUNTDOWN MODE (Normal) */
                        <>
                            {/* Left: Text & Title */}
                            <div className="flex flex-col gap-1.5 z-10">
                                <div className={`flex items-center gap-2 ${styles.text} mb-1 transition-colors duration-500`}>
                                    <MoonIcon className={`w-4 h-4 ${styles.icon}`} />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                                        {isEid ? t.ramadhanEidGreeting : t.ramadhanHeading}
                                    </span>
                                </div>
                                <div className="flex items-baseline gap-2.5">
                                    {isEid ? (
                                        <span className="text-xl font-bold font-serif text-white leading-none tracking-tight filter drop-shadow-md pb-1">
                                            {t.ramadhanFinished}
                                        </span>
                                    ) : (
                                        <>
                                            <span className="text-4xl font-bold font-serif text-white leading-none tracking-tight filter drop-shadow-md" suppressHydrationWarning>
                                                {displayDays}
                                            </span>
                                            <span className="text-sm font-medium text-white/80">{t.ramadhanDaysLeft}</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Right: Progress Ring (Visual Only) or Minimal Bar */}
                            <div className="z-10 flex flex-col items-end gap-2">
                                <div className={`text-[10px] font-bold uppercase tracking-wider ${styles.text} text-right flex items-center gap-1`}>
                                    {getLevelTitle(progress)}
                                </div>
                                {/* Minimalist Bar */}
                                <div className="w-28 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-gradient-to-r from-[rgb(var(--color-primary))] to-amber-400 transition-all duration-1000 ${styles.animate && 'animate-pulse'}`}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <div className="flex items-center gap-1.5" onClick={(e) => {
                                    e.stopPropagation();
                                    setShowInfo(true);
                                }}>
                                    <div className="text-[9px] text-white/60 font-medium cursor-pointer hover:text-white/80 transition-colors">
                                        {`${progress}% ${t.ramadhanPreparationLabel}`}
                                    </div>
                                    <InfoIcon className="w-3 h-3 text-white/40 hover:text-white/80 cursor-pointer" />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </button>

            {/* Info Dialog */}
            <Dialog open={showInfo} onOpenChange={setShowInfo}>
                <DialogContent className="bg-black/80 backdrop-blur-xl border border-white/10 text-white w-[90%] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold flex items-center gap-2">
                            <MoonIcon className="w-5 h-5 text-[rgb(var(--color-primary-light))]" /> {t.ramadhanInfoTitle}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <p className="text-sm text-white/70 leading-relaxed">
                            {t.ramadhanInfoDesc}
                        </p>
                        <div className="bg-[rgb(var(--color-primary-dark))]/20 p-4 rounded-xl border border-[rgb(var(--color-primary))]/10">
                            <p className="text-xs font-bold text-[rgb(var(--color-primary-light))] mb-1">{t.ramadhanImproveTitle}</p>
                            <ul className="list-disc list-inside text-xs text-[rgb(var(--color-primary))]/70 space-y-1">
                                <li>{t.ramadhanImproveItem1}</li>
                                <li>{t.ramadhanImproveItem2}</li>
                                <li>{t.ramadhanImproveItem3}</li>
                            </ul>
                        </div>
                        <Button onClick={() => setShowInfo(false)} className="w-full bg-white/10 hover:bg-white/20 text-white">
                            {t.ramadhanUnderstand}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
