"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface ReflectionPromptProps {
    intentionText: string;
    intentionId: string;
    onSubmit: (rating: number, reflectionText?: string) => Promise<void>;
    onSkip?: () => void;
}

export default function ReflectionPrompt({
    intentionText,
    intentionId,
    onSubmit,
    onSkip,
}: ReflectionPromptProps) {
    const [rating, setRating] = useState<number>(0);
    const [reflectionText, setReflectionText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hoveredStar, setHoveredStar] = useState<number>(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0 || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onSubmit(rating, reflectionText.trim() || undefined);
        } catch (error) {
            console.error("Error submitting reflection:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkip = () => {
        if (onSkip) onSkip();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 md:p-8"
            >
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="text-4xl mb-2">🌙</div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        Evening Reflection
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        How did you honor your intention today?
                    </p>
                </div>

                {/* Show Today's Intention */}
                <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border-l-4 border-emerald-500">
                    <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300 mb-1">
                        Your intention today:
                    </p>
                    <p className="text-gray-900 dark:text-white italic">
                        "{intentionText}"
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Star Rating */}
                    <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
                            Rate your day (1-5)
                        </p>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredStar(star)}
                                    onMouseLeave={() => setHoveredStar(0)}
                                    className="transition-transform hover:scale-110 focus:outline-none"
                                >
                                    <span
                                        className={`text-4xl ${star <= (hoveredStar || rating)
                                                ? "text-yellow-400"
                                                : "text-gray-300 dark:text-gray-600"
                                            }`}
                                    >
                                        ⭐
                                    </span>
                                </button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                                {rating === 5 && "Masha Allah! Excellent! 🎉"}
                                {rating === 4 && "Great job! Keep it up! 💪"}
                                {rating === 3 && "Good effort! Tomorrow is a new day 🌟"}
                                {rating === 2 && "It's okay, progress not perfection 🤲"}
                                {rating === 1 && "Tomorrow is a fresh start 🌅"}
                            </p>
                        )}
                    </div>

                    {/* Optional Reflection Text */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Add notes (optional)
                        </label>
                        <textarea
                            value={reflectionText}
                            onChange={(e) => setReflectionText(e.target.value)}
                            placeholder="What went well? What could be better tomorrow?"
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                            rows={3}
                            maxLength={1000}
                        />
                        <div className="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {reflectionText.length}/1000
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleSkip}
                            className="flex-1 py-3 px-6 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                        >
                            Skip
                        </button>
                        <button
                            type="submit"
                            disabled={rating === 0 || isSubmitting}
                            className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <span>Complete Reflection</span>
                                    <span>✨</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Encouragement */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                        Reflecting on your day helps build self-awareness and gratitude 🤲
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
}
