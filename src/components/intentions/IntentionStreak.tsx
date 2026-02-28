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

import { motion } from "framer-motion";
import { useLocale } from "@/context/LocaleContext";

interface IntentionStreakProps {
    currentStreak: number;
    longestStreak: number;
    className?: string;
}

export default function IntentionStreak({
    currentStreak,
    longestStreak,
    className = "",
}: IntentionStreakProps) {
    const { locale, t } = useLocale();

    const MILESTONES = [
        { days: 7, label: t.intention_milestone_week, emoji: "🌟" },
        { days: 30, label: t.intention_milestone_month, emoji: "🏆" },
        { days: 100, label: t.intention_milestone_100days, emoji: "💎" },
    ];

    const nextMilestone = MILESTONES.find((m) => m.days > currentStreak) || MILESTONES[MILESTONES.length - 1];
    const progress = Math.min((currentStreak / nextMilestone.days) * 100, 100);

    const getEncouragementMessage = () => {
        if (currentStreak === 0) return t.intention_start_journey;
        if (currentStreak < 3) return t.intention_great_start;
        if (currentStreak < 7) return t.intention_building_momentum;
        if (currentStreak < 30) return t.intention_on_fire;
        if (currentStreak < 100) return t.intention_incredible;
        return t.intention_legendary;
    };

    return (
        <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`relative overflow-hidden rounded-3xl bg-black/20 backdrop-blur-md border border-white/10 p-5 shadow-lg ${className}`}
        >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--color-primary))]/10 to-transparent pointer-events-none" />

            <div className="relative space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-3xl">🔥</span>
                        <div>
                            <h3 className="text-white font-bold text-lg">{t.intention_streak}</h3>
                            <p className="text-white/50 text-xs">{getEncouragementMessage()}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-white">{currentStreak}</div>
                        <div className="text-xs text-white/50">{t.intention_days}</div>
                    </div>
                </div>

                {/* Progress to Next Milestone */}
                {currentStreak < nextMilestone.days && (
                    <div>
                        <div className="flex items-center justify-between text-xs text-white/60 mb-2">
                            <span>{t.intention_next_milestone}: {nextMilestone.label}</span>
                            <span>
                                {currentStreak}/{nextMilestone.days}
                            </span>
                        </div>
                        <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-primary-dark))] rounded-full"
                            />
                        </div>
                    </div>
                )}

                {/* Longest Streak */}
                {longestStreak > currentStreak && (
                    <div className="flex items-center gap-2 text-xs text-white/50 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5 w-fit">
                        <span>🏅</span>
                        <span>{t.intention_best_streak}: {longestStreak} {t.intention_days}</span>
                    </div>
                )}

                {/* Milestones */}
                <div className="flex gap-2">
                    {MILESTONES.map((milestone) => {
                        const achieved = currentStreak >= milestone.days;
                        return (
                            <div
                                key={milestone.days}
                                className={`flex-1 text-center py-2 rounded-xl border transition-all ${achieved
                                    ? "bg-[rgb(var(--color-primary))]/20 border-[rgb(var(--color-primary))]/30 text-white"
                                    : "bg-white/5 border-white/10 text-white/40"
                                    }`}
                            >
                                <div className="text-lg">{milestone.emoji}</div>
                                <div className="text-[10px] font-medium">{milestone.label}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}
