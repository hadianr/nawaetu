import { motion } from "framer-motion";
import { useLocale } from "@/context/LocaleContext";
import { INTENTION_TRANSLATIONS } from "@/data/intention-translations";

interface IntentionStreakProps {
    currentStreak: number;
    longestStreak: number;
    className?: string;
}

const MILESTONES = [
    { days: 7, label: "1 Week", emoji: "🌟" },
    { days: 30, label: "1 Month", emoji: "🏆" },
    { days: 100, label: "100 Days", emoji: "💎" },
];

export default function IntentionStreak({
    currentStreak,
    longestStreak,
    className = "",
}: IntentionStreakProps) {
    const { locale } = useLocale();
    const t = INTENTION_TRANSLATIONS[locale as keyof typeof INTENTION_TRANSLATIONS] || INTENTION_TRANSLATIONS.id;

    const nextMilestone = MILESTONES.find((m) => m.days > currentStreak) || MILESTONES[MILESTONES.length - 1];
    const progress = Math.min((currentStreak / nextMilestone.days) * 100, 100);

    const getEncouragementMessage = () => {
        if (currentStreak === 0) return t.start_journey;
        if (currentStreak < 3) return t.great_start;
        if (currentStreak < 7) return t.building_momentum;
        if (currentStreak < 30) return t.on_fire;
        if (currentStreak < 100) return t.incredible;
        return t.legendary;
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
                            <h3 className="text-white font-bold text-lg">{t.niat_streak}</h3>
                            <p className="text-white/50 text-xs">{getEncouragementMessage()}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-white">{currentStreak}</div>
                        <div className="text-xs text-white/50">{t.days}</div>
                    </div>
                </div>

                {/* Progress to Next Milestone */}
                {currentStreak < nextMilestone.days && (
                    <div>
                        <div className="flex items-center justify-between text-xs text-white/60 mb-2">
                            <span>{t.next_milestone}: {nextMilestone.label}</span>
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
                        <span>{t.best_streak}: {longestStreak} {t.days}</span>
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
