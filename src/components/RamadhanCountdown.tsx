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

import { useState, useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { SYABAN_MISSIONS } from "@/data/missions";

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
import { AppIcon } from "@/components/ui/AppIcon";

// Lazy load dialog for better initial load
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Props {
    initialDays?: number;
}

interface HijriAdjustmentEventDetail {
    adjustment?: string | number;
}

const BASE_TARGET_DATE = new Date("2026-02-18T00:00:00+07:00");

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

export default function RamadhanCountdown({ initialDays = 0 }: Props) {
    const router = useRouter();
    const { t } = useLocale();
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
    const isMounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    );

    const [adjustment, setAdjustment] = useState(-1);

    useEffect(() => {
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

        // Immediately update on mount without cascading inside the effect body.
        const initialUpdate = window.setTimeout(() => setTimeLeft(calculateTimeLeft()), 0);

        // Update every 60 seconds
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 60000);

        // Listen for adjustment changes
        const handleAdjustmentChange = (event: Event) => {
            const detail = (event as CustomEvent<HijriAdjustmentEventDetail>).detail;
            const newAdj = parseInt(String(detail?.adjustment || "0"), 10);
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
                    const completedMap: Record<string, unknown> = Array.isArray(completedData)
                        ? completedData.reduce<Record<string, unknown>>((acc, mission: unknown) => {
                            if (isRecord(mission) && typeof mission.id === "string") {
                                acc[mission.id] = mission;
                            }
                            return acc;
                        }, {})
                        : isRecord(completedData) ? completedData : {};

                    const targetMissions = SYABAN_MISSIONS;

                    const currentXP = targetMissions.reduce((acc, m) => {
                        const record = completedMap[m.id];
                        if (!record) return acc;
                        return acc + m.hasanahReward;
                    }, 0);

                    const totalXP = targetMissions.reduce((acc, m) => acc + m.hasanahReward, 0);
                    const p = totalXP > 0 ? Math.round((currentXP / totalXP) * 100) : 0;
                    setProgress(Math.min(100, p));
                } catch {
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
            window.clearTimeout(initialUpdate);
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

    // Calculate effective days left/passed
    // On Feb 18 with -1 adj, we want "1 Hari Lagi" (Sha'ban 30)
    const displayDays = isRamadhan ? hijriDay : timeLeft.days;

    // Note: If it's 29 Sha'ban, and we assume 30 days, it's 1 day left. 
    // If Sha'ban is only 29 days, the hook will switch to Ramadan tomorrow anyway.

    // Dynamic Intensity Logic
    const getIntensityStyles = (days: number) => {
        if (days <= 10) {
            return {
                bg: "from-[rgb(var(--color-accent))]/30 via-[rgb(var(--color-surface))] to-[rgb(var(--color-primary))]/20",
                border: "border-[rgb(var(--color-accent))]/50 shadow-[var(--shadow-card)]",
                text: "text-[rgb(var(--color-accent-foreground))]",
                icon: "fill-[rgb(var(--color-accent))] text-[rgb(var(--color-accent-foreground))]",
                glow: "bg-[rgb(var(--color-accent))]/25",
                animate: "animate-pulse"
            };
        }
        if (days <= 40) {
            return {
                bg: "from-[rgb(var(--color-primary))]/20 via-[rgb(var(--color-surface))] to-[rgb(var(--color-primary))]/10",
                border: "border-[rgb(var(--color-primary))]/30 shadow-[var(--shadow-card)]",
                text: "text-[rgb(var(--color-primary-light))]",
                icon: "fill-[rgb(var(--color-primary-light))]/30 text-[rgb(var(--color-primary))]",
                glow: "bg-[rgb(var(--color-primary))]/20",
                animate: ""
            };
        }
        return {
            bg: "from-[rgb(var(--color-surface-subtle))] via-[rgb(var(--color-surface))] to-[rgb(var(--color-surface-subtle))]",
            border: "border-[rgb(var(--color-border))] shadow-[var(--shadow-card)]",
            text: "text-[rgb(var(--color-text-muted))]",
            icon: "fill-[rgb(var(--color-text-muted))]/10 text-[rgb(var(--color-text-muted))]",
            glow: "bg-[rgb(var(--color-text-muted))]/5",
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
                        router.push("/ramadhan");
                    } else {
                        handleCardClick();
                    }
                }}
                className="w-full relative mb-4 group transition-transform duration-300 hover:scale-[1.01] text-left appearance-none will-change-transform"
            >
                {/* Optimized Background */}
                <div className={`absolute inset-0 bg-gradient-to-r ${styles.bg} rounded-3xl -z-10 opacity-80`} />

                <div className={`relative w-full bg-[rgb(var(--color-surface))]/80 backdrop-blur-md border ${styles.border} rounded-3xl px-6 py-6 flex items-center justify-between overflow-hidden`}>

                    {/* Simple decorative glow */}
                    <div className={`absolute -right-10 -top-10 w-32 h-32 ${styles.glow} rounded-full blur-2xl pointer-events-none`} />

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
                                    <span className="text-3xl font-bold font-serif text-[rgb(var(--color-text-strong))] leading-none tracking-tight pb-1">
                                        Hari ke-{displayDays}
                                    </span>
                                    {/* Next Prayer Time (Imsak / Maghrib) */}
                                    <span className="text-sm font-medium text-[rgb(var(--color-text-muted))] mt-1 flex items-center gap-1.5">
                                        <AppIcon name="calendar" size="xs" tone="muted" /> {
                                            !isMounted ? "..." : (() => {
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
                                        <span className="opacity-50">|</span>
                                        <span className="underline decoration-dotted underline-offset-2 inline-flex items-center gap-1">Buka Dashboard <AppIcon name="target" size="xs" tone="muted" /></span>
                                    </span>
                                </div>
                            </div>

                            {/* Visual Icon */}
                            <div className="text-5xl opacity-80 grayscale-[30%] group-hover:grayscale-0 transition-all duration-500 scale-110">
                                <AppIcon name="moon" size="display" tone="primary" />
                            </div>
                        </div>
                    ) : (
                        /* COUNTDOWN MODE (Normal) */
                        <>
                            {/* Left: Text & Title */}
                            <div className="flex flex-col gap-1.5 z-10 w-full">
                                <div className={`flex items-center gap-2 ${styles.text} mb-1 transition-colors duration-500`}>
                                    <MoonIcon className={`w-4 h-4 ${styles.icon}`} />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                                        {t.ramadhanHeading}
                                    </span>
                                </div>
                                <div className="flex items-baseline gap-2.5">
                                    <span className="text-4xl font-bold font-serif text-[rgb(var(--color-text-strong))] leading-none tracking-tight" suppressHydrationWarning>
                                        {displayDays}
                                    </span>
                                    <span className="text-sm font-medium text-[rgb(var(--color-text-muted))]">{t.ramadhanDaysLeft}</span>
                                </div>
                            </div>

                            {/* Right: Progress Ring (Visual Only) or Minimal Bar */}
                            <div className="z-10 flex flex-col items-end gap-2">
                                <div className={`text-[10px] font-bold uppercase tracking-wider ${styles.text} text-right flex items-center gap-1`}>
                                    {getLevelTitle(progress)}
                                </div>
                                {/* Minimalist Bar */}
                                <div className="w-28 h-1.5 bg-[rgb(var(--color-surface-subtle))] rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-[rgb(var(--color-primary))] transition-all duration-1000 ${styles.animate && 'animate-pulse'}`}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <div className="flex items-center gap-1.5" onClick={(e) => {
                                    e.stopPropagation();
                                    setShowInfo(true);
                                }}>
                                    <div className="text-[9px] text-[rgb(var(--color-text-muted))] font-medium cursor-pointer hover:text-[rgb(var(--color-text))] transition-colors">
                                        {`${progress}% ${t.ramadhanPreparationLabel}`}
                                    </div>
                                    <InfoIcon className="w-3 h-3 text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text))] cursor-pointer" />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </button>

            {/* Info Dialog */}
            <Dialog open={showInfo} onOpenChange={setShowInfo}>
                <DialogContent className="bg-[rgb(var(--color-surface))] backdrop-blur-xl border border-[rgb(var(--color-border))] text-[rgb(var(--color-text))] w-[90%] rounded-2xl shadow-[var(--shadow-floating)]">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold flex items-center gap-2">
                            <MoonIcon className="w-5 h-5 text-[rgb(var(--color-primary-light))]" /> {t.ramadhanInfoTitle}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <p className="text-sm text-[rgb(var(--color-text-muted))] leading-relaxed">
                            {t.ramadhanInfoDesc}
                        </p>
                        <div className="bg-[rgb(var(--color-primary))]/10 p-4 rounded-xl border border-[rgb(var(--color-primary))]/10">
                            <p className="text-xs font-bold text-[rgb(var(--color-primary-light))] mb-1">{t.ramadhanImproveTitle}</p>
                            <ul className="list-disc list-inside text-xs text-[rgb(var(--color-text-muted))] space-y-1">
                                <li>{t.ramadhanImproveItem1}</li>
                                <li>{t.ramadhanImproveItem2}</li>
                                <li>{t.ramadhanImproveItem3}</li>
                            </ul>
                        </div>
                        <Button onClick={() => setShowInfo(false)} className="w-full bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-light))] text-[rgb(var(--color-primary-foreground))]">
                            {t.ramadhanUnderstand}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
