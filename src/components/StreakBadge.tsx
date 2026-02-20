"use client";

import { useState, useEffect } from "react";
import { Flame } from "lucide-react";
import { getDisplayStreak, STREAK_MILESTONES } from "@/lib/streak-utils";
import { cn } from "@/lib/utils";
import { useLocale } from "@/context/LocaleContext";

interface StreakBadgeProps {
    gender?: 'male' | 'female' | null;
    showLabel?: boolean;
}

export default function StreakBadge({ gender, showLabel = false }: StreakBadgeProps) {
    const { t } = useLocale();
    const [streak, setStreak] = useState(0);
    const [isActiveToday, setIsActiveToday] = useState(false);

    useEffect(() => {
        const updateDisplay = () => {
            const { streak: currentStreak, isActiveToday: active } = getDisplayStreak();
            setStreak(currentStreak);
            setIsActiveToday(active);
        };

        updateDisplay();

        // Listen for streak updates
        window.addEventListener("streak_updated", updateDisplay);
        return () => window.removeEventListener("streak_updated", updateDisplay);
    }, []);

    // Get next milestone
    const nextMilestone = STREAK_MILESTONES.find(m => m.days > streak);
    const daysToNext = nextMilestone ? nextMilestone.days - streak : null;

    // Theme colors
    const themeColor = gender === 'female' ? 'pink' : gender === 'male' ? 'blue' : 'orange';

    if (streak === 0 && !isActiveToday) {
        return (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/10">
                <Flame className="w-4 h-4 text-white/60" />
                <span className="text-xs font-bold text-white/60">0</span>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 h-6 sm:h-7 rounded-full transition-all",
                isActiveToday
                    ? gender === 'female' ? "bg-pink-500/20 border border-pink-500/30" :
                        gender === 'male' ? "bg-blue-500/20 border border-blue-500/30" :
                            "bg-orange-500/20 border border-orange-500/30"
                    : "bg-white/5 border border-white/10"
            )}
            title={nextMilestone
                ? t.streakNextMilestone.replace("{days}", String(daysToNext)).replace("{label}", nextMilestone.label)
                : t.streakLongest}
        >
            <Flame
                className={cn(
                    "w-4 h-4 sm:w-5 sm:h-5",
                    isActiveToday
                        ? gender === 'female' ? "text-pink-400" :
                            gender === 'male' ? "text-blue-400" :
                                "text-orange-400"
                        : "text-white/50"
                )}
                style={isActiveToday && streak >= 7 ? {
                    animation: "pulse 1.5s ease-in-out infinite"
                } : {}}
            />
            <span
                className={cn(
                    "text-xs sm:text-sm font-bold",
                    isActiveToday
                        ? gender === 'female' ? "text-pink-400" :
                            gender === 'male' ? "text-blue-400" :
                                "text-orange-400"
                        : "text-white/50"
                )}
            >
                {streak}
            </span>
            {showLabel && streak > 0 && (
                <span className="text-[10px] text-white/70">{t.streakDaysLabel}</span>
            )}
        </div>
    );
}
