"use client";

import { useState, useEffect } from "react";
import { Moon } from "lucide-react";
import { RAMADHAN_MISSIONS, SYABAN_MISSIONS } from "@/data/missions-data";

export default function RamadhanCountdown() {
    const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number } | null>(null);
    const [progress, setProgress] = useState(0);

    // Target: Estimated 1 Ramadhan 1447H (Feb 18, 2026)
    const TARGET_DATE = new Date("2026-02-18T00:00:00+07:00");

    useEffect(() => {
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
            return null;
        };
        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 60000);

        // Load Level Progress from LocalStorage
        const savedCompleted = localStorage.getItem("completed_missions");
        if (savedCompleted) {
            const completedMap = JSON.parse(savedCompleted);
            const today = new Date().toISOString().split('T')[0];

            // Use SYABAN_MISSIONS as the "Prep" benchmark for now
            const targetMissions = SYABAN_MISSIONS;

            const currentXP = targetMissions.reduce((acc, m) => {
                const record = completedMap[m.id];
                if (!record) return acc;

                const isDaily = m.type === 'daily';
                const isDone = isDaily ? record.date === today : true;

                return isDone ? acc + m.xpReward : acc;
            }, 0);

            const totalXP = targetMissions.reduce((acc, m) => acc + m.xpReward, 0);
            setProgress(totalXP > 0 ? Math.round((currentXP / totalXP) * 100) : 0);
        }

        return () => clearInterval(timer);
    }, []);

    const getLevelTitle = (p: number) => {
        if (p === 100) return "Ramadhan Ready! 🌙";
        if (p >= 75) return "Pejuang Istiqomah";
        if (p >= 50) return "Siap Melangkah";
        if (p >= 25) return "Niat Terpasang";
        return "Newbie Ramadhan";
    };

    if (!timeLeft) return null;

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
                bg: "from-emerald-800/40 via-amber-700/20 to-black/60",
                border: "border-emerald-500/30 shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]",
                text: "text-emerald-400",
                icon: "fill-emerald-400/30 text-emerald-300",
                glow: "bg-emerald-500/20",
                animate: ""
            };
        }
        return {
            bg: "from-slate-900 via-emerald-950/40 to-black/80",
            border: "border-white/10",
            text: "text-slate-400",
            icon: "fill-white/10 text-slate-500",
            glow: "bg-white/5",
            animate: ""
        };
    };

    const styles = getIntensityStyles(timeLeft.days);

    return (
        <div className="w-full relative mb-4 group transition-all duration-500 hover:scale-[1.01]">
            {/* Background with Dynamic Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-r ${styles.bg} rounded-3xl blur-xl -z-10 opacity-70 transition-all duration-1000`} />

            <div className={`relative w-full bg-black/40 backdrop-blur-md border ${styles.border} rounded-3xl px-6 py-6 flex items-center justify-between overflow-hidden transition-all duration-500`}>
                {/* Decorative Glow */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 ${styles.glow} rounded-full blur-[60px] pointer-events-none transition-all duration-1000`} />

                {/* Sparkles for High Intensity */}
                {timeLeft.days <= 10 && (
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none" />
                )}

                {/* Left: Text & Title */}
                <div className="flex flex-col gap-1.5 z-10">
                    <div className={`flex items-center gap-2 ${styles.text} mb-1 transition-colors duration-500`}>
                        <Moon className={`w-4 h-4 ${styles.icon}`} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Menuju Ramadhan</span>
                    </div>
                    <div className="flex items-baseline gap-2.5">
                        <span className="text-4xl font-bold font-serif text-white leading-none tracking-tight filter drop-shadow-lg">
                            {timeLeft.days}
                        </span>
                        <span className="text-sm font-medium text-white/60">Hari Lagi</span>
                    </div>
                </div>

                {/* Right: Progress Ring (Visual Only) or Minimal Bar */}
                <div className="z-10 flex flex-col items-end gap-2">
                    <div className={`text-[10px] font-bold uppercase tracking-wider ${styles.text} text-right`}>
                        {getLevelTitle(progress)}
                    </div>
                    {/* Minimalist Bar */}
                    <div className="w-28 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className={`h-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-1000 ${styles.animate && 'animate-pulse'}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="text-[9px] text-white/30 font-medium">
                        {progress}% Persiapan
                    </div>
                </div>
            </div>
        </div>
    );
}
