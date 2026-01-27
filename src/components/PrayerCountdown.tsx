"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface PrayerCountdownProps {
    targetTime: string; // HH:MM
    prayerName: string;
    compact?: boolean;
}

export default function PrayerCountdown({ targetTime, prayerName, compact = false }: PrayerCountdownProps) {
    const [timeLeft, setTimeLeft] = useState<string>("--:--:--");
    const [isNear, setIsNear] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const [targetHours, targetMinutes] = targetTime.split(":").map(Number);

            const target = new Date(now);
            target.setHours(targetHours);
            target.setMinutes(targetMinutes);
            target.setSeconds(0);

            // If target is earlier than now, assumes it's for tomorrow
            if (target.getTime() < now.getTime()) {
                target.setDate(target.getDate() + 1);
            }

            const diff = target.getTime() - now.getTime();

            if (diff <= 0) {
                return "00:00:00";
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setIsNear(hours === 0 && minutes < 15);

            return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetTime]);

    if (compact) {
        return (
            <div className="animate-in fade-in duration-700">
                <div className={cn(
                    "font-mono text-2xl font-bold tracking-tight",
                    isNear ? "text-emerald-400" : "text-white"
                )}>
                    {timeLeft}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center py-6 animate-in fade-in zoom-in duration-700">
            <p className="text-emerald-200/60 font-medium text-sm uppercase tracking-widest mb-2">
                Menuju {prayerName}
            </p>
            <div className={cn(
                "font-mono text-5xl md:text-6xl font-bold tracking-tighter transition-all duration-500",
                isNear ? "text-emerald-400 drop-shadow-[0_0_30px_rgba(52,211,153,0.6)]" : "text-white drop-shadow-xl"
            )}>
                {timeLeft}
            </div>
            {isNear && (
                <p className="mt-2 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full animate-pulse border border-emerald-500/20">
                    Waktu Sholat Segera Tiba
                </p>
            )}
        </div>
    );
}
