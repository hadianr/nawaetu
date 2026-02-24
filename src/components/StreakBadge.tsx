"use client";

import { useState, useEffect } from "react";
import { Flame } from "lucide-react";
import { getDisplayStreak, STREAK_MILESTONES } from "@/lib/streak-utils";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

interface StreakBadgeProps {
    gender?: 'male' | 'female' | null;
    showLabel?: boolean;
}

export default function StreakBadge({ gender, showLabel = false }: StreakBadgeProps) {
    const { t } = useLocale();
    const { currentTheme } = useTheme();
    const isDaylight = currentTheme === "daylight";
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
            <div className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full border transition-colors",
                isDaylight ? "bg-slate-50 border-slate-100" : "bg-white/5 border-white/10"
            )}>
                <Flame className={cn("w-4 h-4", isDaylight ? "text-slate-300" : "text-white/60")} />
                <span className={cn("text-xs font-bold", isDaylight ? "text-slate-300" : "text-white/60")}>0</span>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 h-7 sm:h-8 rounded-full transition-all shadow-sm",
                isActiveToday
                    ? isDaylight
                        ? gender === 'female' ? "bg-pink-50 border-pink-200 shadow-pink-100/50" :
                            gender === 'male' ? "bg-blue-50 border-blue-200 shadow-blue-100/50" :
                                "bg-orange-50 border-orange-200 shadow-orange-200/50"
                        : gender === 'female' ? "bg-pink-500/20 border border-pink-500/30" :
                            gender === 'male' ? "bg-blue-500/20 border border-blue-500/30" :
                                "bg-orange-500/20 border border-orange-500/30"
                    : isDaylight ? "bg-white border-slate-100" : "bg-white/5 border border-white/10"
            )}
            title={nextMilestone
                ? t.streakNextMilestone.replace("{days}", String(daysToNext)).replace("{label}", nextMilestone.label)
                : t.streakLongest}
        >
            <Flame
                className={cn(
                    "w-4 h-4 sm:w-5 sm:h-5",
                    isActiveToday
                        ? isDaylight
                            ? gender === 'female' ? "text-pink-500" :
                                gender === 'male' ? "text-blue-500" :
                                    "text-orange-500"
                            : gender === 'female' ? "text-pink-400" :
                                gender === 'male' ? "text-blue-400" :
                                    "text-orange-400"
                        : isDaylight ? "text-slate-300" : "text-white/50"
                )}
                style={isActiveToday && streak >= 7 ? {
                    animation: "pulse 1.5s ease-in-out infinite"
                } : {}}
            />
            <span
                className={cn(
                    "text-xs sm:text-sm font-black transition-colors",
                    isActiveToday
                        ? isDaylight
                            ? gender === 'female' ? "text-pink-600" :
                                gender === 'male' ? "text-blue-600" :
                                    "text-orange-600"
                            : gender === 'female' ? "text-pink-400" :
                                gender === 'male' ? "text-blue-400" :
                                    "text-orange-400"
                        : isDaylight ? "text-slate-300" : "text-white/50"
                )}
            >
                {streak}
            </span>
            {showLabel && streak > 0 && (
                <span className={cn(
                    "text-[10px]",
                    isDaylight ? "text-slate-400" : "text-white/70"
                )}>{t.streakDaysLabel}</span>
            )}
        </div>
    );
}
