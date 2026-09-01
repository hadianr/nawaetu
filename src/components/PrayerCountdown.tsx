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

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface PrayerCountdownProps {
    targetTime: string; // HH:MM
    prayerName: string;
    compact?: boolean;
}

function getTimeLeft(targetTime: string, nowMs: number) {
    const now = new Date(nowMs);
    const [targetHours, targetMinutes] = targetTime.split(":").map(Number);
    const target = new Date(now);
    target.setHours(targetHours, targetMinutes, 0, 0);

    if (target.getTime() < nowMs) target.setDate(target.getDate() + 1);

    const diff = Math.max(0, target.getTime() - nowMs);
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return {
        isNear: hours === 0 && minutes < 15,
        timeLeft: [hours, minutes, seconds].map((value) => value.toString().padStart(2, "0")).join(":"),
    };
}

export default function PrayerCountdown({ targetTime, prayerName, compact = false }: PrayerCountdownProps) {
    const [now, setNow] = useState(Date.now);
    const { timeLeft, isNear } = getTimeLeft(targetTime, now);

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);

        return () => clearInterval(timer);
    }, []);

    if (compact) {
        return (
            <div className="animate-in fade-in duration-700">
                <div className={cn(
                    "font-mono text-2xl font-bold tracking-tight",
                    isNear ? "text-emerald-400" : "text-current"
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
