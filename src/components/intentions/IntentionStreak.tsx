"use client";

import { motion } from "framer-motion";

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
    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-6 border-2 border-orange-200 dark:border-orange-800 ${className}`}
        >
            <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🔥</span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Niat Streak
                </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Current Streak */}
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Current
                    </p>
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                        {currentStreak}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {currentStreak === 1 ? "day" : "days"}
                    </p>
                </div>

                {/* Longest Streak */}
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Longest
                    </p>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                        {longestStreak}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {longestStreak === 1 ? "day" : "days"}
                    </p>
                </div>
            </div>

            {/* Encouragement */}
            <div className="mt-4 text-center">
                {currentStreak === 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Start your streak today! 🌟
                    </p>
                )}
                {currentStreak > 0 && currentStreak < 7 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Keep it going! 💪
                    </p>
                )}
                {currentStreak >= 7 && currentStreak < 30 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Amazing consistency! 🎉
                    </p>
                )}
                {currentStreak >= 30 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Masha Allah! You're unstoppable! 🚀
                    </p>
                )}
            </div>

            {/* Milestone Progress */}
            {currentStreak > 0 && currentStreak < 100 && (
                <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <span>Next milestone</span>
                        <span>
                            {currentStreak < 7 && "7 days"}
                            {currentStreak >= 7 && currentStreak < 30 && "30 days"}
                            {currentStreak >= 30 && currentStreak < 100 && "100 days"}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{
                                width: `${currentStreak < 7
                                        ? (currentStreak / 7) * 100
                                        : currentStreak < 30
                                            ? (currentStreak / 30) * 100
                                            : (currentStreak / 100) * 100
                                    }%`,
                            }}
                            className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                        />
                    </div>
                </div>
            )}
        </motion.div>
    );
}
