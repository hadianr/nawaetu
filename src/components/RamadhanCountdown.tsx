"use client";

import { useState, useEffect } from "react";
import { Moon, Info } from "lucide-react";
import { RAMADHAN_MISSIONS, SYABAN_MISSIONS } from "@/data/missions-data";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
    initialDays?: number;
}

export default function RamadhanCountdown({ initialDays = 0 }: Props) {
    // Initialize with server-provided value to allow immediate rendering (LCP optimization)
    const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number }>({
        days: initialDays,
        hours: 0,
        minutes: 0
    });
    const [progress, setProgress] = useState(0);
    const [showInfo, setShowInfo] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Target: Estimated 1 Ramadhan 1447H (Feb 18, 2026)
    const TARGET_DATE = new Date("2026-02-18T00:00:00+07:00");

    useEffect(() => {
        setIsMounted(true);

        // Countdown Logic
        const calculateTimeLeft = () => {
            const now = new Date();
            const difference = TARGET_DATE.getTime() - now.getTime();
            if (difference > 0) {
                return {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                };
            }
            // If passed, maybe return 0
            return { days: 0, hours: 0, minutes: 0 };
        };

        // Immediately update on mount to catch up seconds/hours
        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 60000);

        const loadProgress = () => {
            const savedCompleted = localStorage.getItem("completed_missions");
            if (savedCompleted) {
                try {
                    const completedMap = JSON.parse(savedCompleted);

                    // Use SYABAN_MISSIONS as the "Prep" benchmark for now
                    const targetMissions = SYABAN_MISSIONS;

                    const currentXP = targetMissions.reduce((acc, m) => {
                        const record = completedMap[m.id];
                        if (!record) return acc;

                        const isDone = true; // Use simple existential check for progress accumulation in general scope

                        return isDone ? acc + m.xpReward : acc;
                    }, 0);

                    const totalXP = targetMissions.reduce((acc, m) => acc + m.xpReward, 0);
                    // Capped at 100%
                    const p = totalXP > 0 ? Math.round((currentXP / totalXP) * 100) : 0;
                    setProgress(Math.min(100, p));
                } catch (e) {
                    console.error("Failed to parse mission progress:", e);
                    setProgress(0);
                }
            } else {
                setProgress(0);
            }
        };

        loadProgress();

        // Listen for internal mission updates (same tab)
        window.addEventListener("mission_storage_updated", loadProgress);

        // Backup listener: wait a bit to ensure storage is written if sync failed
        const handleBackupUpdate = () => setTimeout(loadProgress, 50);
        window.addEventListener("xp_updated", handleBackupUpdate);

        // Listen for storage updates (cross tab)
        window.addEventListener("storage", loadProgress);

        return () => {
            clearInterval(timer);
            window.removeEventListener("mission_storage_updated", loadProgress);
            window.removeEventListener("xp_updated", handleBackupUpdate);
            window.removeEventListener("storage", loadProgress);
        };
    }, []);

    const getLevelTitle = (p: number) => {
        if (p === 100) return "Ramadhan Ready! 🌙";
        if (p >= 75) return "Pejuang Istiqomah";
        if (p >= 50) return "Siap Melangkah";
        if (p >= 25) return "Niat Terpasang";
        return "Newbie Ramadhan";
    };

    const handleCardClick = () => {
        // Dispatch custom event to open Missions Modal with 'seasonal' tab
        window.dispatchEvent(new CustomEvent("open_mission_modal", { detail: { tab: 'seasonal' } }));
    };

    // Dynamic Intensity Logic
    const getIntensityStyles = (days: number) => {
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

    // Use timeLeft.days directly (Server init or Client update)
    const styles = getIntensityStyles(timeLeft.days);

    return (
        <>
            <button
                onClick={handleCardClick}
                className="w-full relative mb-4 group transition-transform duration-300 hover:scale-[1.01] text-left appearance-none will-change-transform"
            >
                {/* Optimized Background: Solid colors/simple gradients only, no heavy blur/radial calculations */}
                <div className={`absolute inset-0 bg-gradient-to-r ${styles.bg} rounded-3xl -z-10 opacity-80`} />

                <div className={`relative w-full bg-black/40 border ${styles.border} rounded-3xl px-6 py-6 flex items-center justify-between overflow-hidden`}>

                    {/* Simple decorative glow */}
                    <div className={`absolute -right-10 -top-10 w-32 h-32 bg-${styles.glow.split('-')[1]}-500/20 rounded-full blur-2xl pointer-events-none`} />

                    {/* Left: Text & Title */}
                    <div className="flex flex-col gap-1.5 z-10">
                        <div className={`flex items-center gap-2 ${styles.text} mb-1 transition-colors duration-500`}>
                            <Moon className={`w-4 h-4 ${styles.icon}`} />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Menuju Ramadhan</span>
                        </div>
                        <div className="flex items-baseline gap-2.5">
                            <span className="text-4xl font-bold font-serif text-white leading-none tracking-tight filter drop-shadow-md">
                                {timeLeft.days}
                            </span>
                            <span className="text-sm font-medium text-white/80">Hari Lagi</span>
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
                                {progress}% Persiapan
                            </div>
                            <Info className="w-3 h-3 text-white/40 hover:text-white/80 cursor-pointer" />
                        </div>
                    </div>
                </div>
            </button>

            {/* Info Dialog */}
            <Dialog open={showInfo} onOpenChange={setShowInfo}>
                <DialogContent className="bg-black/80 backdrop-blur-xl border border-white/10 text-white w-[90%] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold flex items-center gap-2">
                            <Moon className="w-5 h-5 text-[rgb(var(--color-primary-light))]" /> Persiapan Ramadhan
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <p className="text-sm text-white/70 leading-relaxed">
                            Persentase <strong>"Persiapan"</strong> dihitung dari penyelesaian misi-misi khusus di bulan <strong>Sya'ban</strong> (seperti Puasa Sunnah, Baca Quran, dll).
                        </p>
                        <div className="bg-[rgb(var(--color-primary-dark))]/20 p-4 rounded-xl border border-[rgb(var(--color-primary))]/10">
                            <p className="text-xs font-bold text-[rgb(var(--color-primary-light))] mb-1">🎯 Cara Meningkatkan:</p>
                            <ul className="list-disc list-inside text-xs text-[rgb(var(--color-primary))]/70 space-y-1">
                                <li>Selesaikan misi Puasa Sunnah Sya'ban</li>
                                <li>Lakukan Sedekah Subuh</li>
                                <li>Mulai rutinkan baca Al-Quran</li>
                            </ul>
                        </div>
                        <Button onClick={() => setShowInfo(false)} className="w-full bg-white/10 hover:bg-white/20 text-white">
                            Mengerti
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
