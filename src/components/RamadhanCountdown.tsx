"use client";

import { useState, useEffect } from "react";
import { Moon } from "lucide-react";
import { RAMADHAN_MISSIONS } from "@/data/missions-data";

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

        // Load Level Progress from LocalStorage (Read-Only here)
        // We calculate based on the RAMADHAN_MISSIONS imported from data
        // Note: MissionsWidget now handles the actual completion logic, but might store it in 'completed_missions'
        // We need to support reading from where MissionsWidget writes.
        // For backwards compatibility during migration, we might check both, or just switch to checking 'completed_missions' if we migrate fully.
        // Let's assume we are migrating to 'completed_missions' for everything.

        const savedCompleted = localStorage.getItem("completed_missions");
        if (savedCompleted) {
            const completedMap = JSON.parse(savedCompleted);
            // Count how many RAMADHAN_MISSIONS are in the completed map
            // For daily missions, valid if completed TODAY. For tracker, valid if completed EVER.
            const today = new Date().toISOString().split('T')[0];

            const currentXP = RAMADHAN_MISSIONS.reduce((acc, m) => {
                const record = completedMap[m.id];
                if (!record) return acc;

                // If it's a daily mission, it must be done today to count for "current state"? 
                // Actually for "Level Progress" in Ramadhan context, maybe we count total accumulation? 
                // Or maybe we just stick to "Is it done right now".
                // Let's stick to: If it's done today (for daily) or done ever (for tracker).

                const isDaily = m.type === 'daily';
                const isDone = isDaily ? record.date === today : true;

                return isDone ? acc + m.xpReward : acc;
            }, 0);

            const totalXP = RAMADHAN_MISSIONS.reduce((acc, m) => acc + m.xpReward, 0);
            setProgress(Math.round((currentXP / totalXP) * 100));
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

    return (
        <div className="w-full relative mb-6 group transition-transform hover:scale-[1.01]">
            {/* Background with Gold/Emerald Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-600/30 via-emerald-900/40 to-black rounded-3xl blur-md -z-10 transition-all duration-700 opacity-70" />

            <div className="relative w-full bg-black/40 backdrop-blur-md border border-amber-500/20 rounded-3xl p-6 flex flex-col justify-between overflow-hidden">
                {/* Decorative Accent */}
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col gap-1 z-10">
                        <div className="flex items-center gap-2 text-amber-400 mb-1">
                            <Moon className="w-4 h-4 fill-amber-400/20" />
                            <span className="text-xs font-bold uppercase tracking-wider">Menuju Ramadhan</span>
                        </div>
                        <h3 className="text-2xl font-serif text-white font-medium">
                            1447 H
                        </h3>
                    </div>
                </div>

                {/* Countdown & Level Section */}
                <div className="flex items-end justify-between z-10 text-white mt-2">
                    <div className="flex items-end gap-3">
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-bold font-mono leading-none">{timeLeft.days}</span>
                            <span className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Hari</span>
                        </div>
                        <span className="text-2xl font-light text-white/20 pb-4">:</span>
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-bold font-mono leading-none">{timeLeft.hours}</span>
                            <span className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Jam</span>
                        </div>
                    </div>

                    {/* Mini Progress Circle */}
                    <div className="flex flex-col items-end gap-1">
                        <div className="text-xs font-bold text-amber-400/90">{getLevelTitle(progress)}</div>
                        <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-amber-400 to-emerald-500 transition-all duration-1000"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="text-[10px] text-white/40">{progress}% Siap</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
