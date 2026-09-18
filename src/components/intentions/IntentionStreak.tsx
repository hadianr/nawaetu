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
import { AppIcon } from "@/components/ui/AppIcon";

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
    const { t } = useLocale();

    const MILESTONES = [
        { days: 7, label: t.intention_milestone_week, icon: "sparkles" as const },
        { days: 30, label: t.intention_milestone_month, icon: "trophy" as const },
        { days: 100, label: t.intention_milestone_100days, icon: "star" as const },
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
            className={`relative overflow-hidden rounded-3xl p-5 backdrop-blur-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] shadow-[var(--shadow-card)] text-[rgb(var(--color-text))] ${className}`}
        >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--color-primary))]/10 to-transparent pointer-events-none" />

            <div className="relative space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="flex size-10 shrink-0 items-center justify-center">
                            <AppIcon name="sparkles" size="lg" tone="primary" />
                        </span>
                        <div>
                            <h3 className="text-[rgb(var(--color-text-strong))] font-bold text-lg">{t.intention_streak}</h3>
                            <p className="text-[rgb(var(--color-text-muted))] text-xs">{getEncouragementMessage()}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-[rgb(var(--color-text-strong))]">{currentStreak}</div>
                        <div className="text-xs text-[rgb(var(--color-text-muted))]">{t.intention_days}</div>
                    </div>
                </div>

                {/* Progress to Next Milestone */}
                {currentStreak < nextMilestone.days && (
                    <div>
                        <div className="flex items-center justify-between text-xs text-[rgb(var(--color-text-muted))] mb-2">
                            <span>{t.intention_next_milestone}: {nextMilestone.label}</span>
                            <span>
                                {currentStreak}/{nextMilestone.days}
                            </span>
                        </div>
                        <div className="relative h-2 bg-[rgb(var(--color-surface-subtle))] rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="absolute inset-y-0 left-0 bg-[rgb(var(--color-primary))] rounded-full"
                            />
                        </div>
                    </div>
                )}

                {/* Longest Streak */}
                {longestStreak > currentStreak && (
                    <div className="flex items-center gap-2 text-xs text-[rgb(var(--color-text-muted))] bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-full px-3 py-1.5 w-fit">
                        <AppIcon name="trophy" size="xs" tone="primary" />
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
                                className={`flex min-h-24 flex-1 flex-col items-center justify-center gap-1 rounded-xl border py-2 text-center transition-all ${achieved
                                    ? "bg-[rgb(var(--color-primary))]/15 border-[rgb(var(--color-primary))]/40 text-[rgb(var(--color-primary-strong))]"
                                    : "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))] text-[rgb(var(--color-text-muted))]"
                                    }`}
                            >
                                <span className="flex size-8 items-center justify-center">
                                    <AppIcon name={milestone.icon} size="md" tone={achieved ? "primary" : "muted"} />
                                </span>
                                <div className="text-[10px] font-medium">{milestone.label}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}
