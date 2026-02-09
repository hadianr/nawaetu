"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface IntentionPromptProps {
    onSubmit: (niatText: string) => Promise<void>;
    currentStreak?: number;
    onClose?: () => void;
}

const SUGGESTED_INTENTIONS = [
    "Be patient with my family",
    "Focus on quality over quantity in my work",
    "Remember Allah in every action",
    "Speak only words of kindness today",
    "Be grateful for every blessing",
    "Help someone without expecting anything in return",
    "Control my anger and respond with wisdom",
    "Make every prayer with full presence",
];

export default function IntentionPrompt({
    onSubmit,
    currentStreak = 0,
    onClose,
}: IntentionPromptProps) {
    const [niatText, setNiatText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!niatText.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onSubmit(niatText.trim());
            setNiatText("");
        } catch (error) {
            console.error("Error submitting intention:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const useSuggestion = (suggestion: string) => {
        setNiatText(suggestion);
        setShowSuggestions(false);
    };

    const randomSuggestions = SUGGESTED_INTENTIONS
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 md:p-8"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="text-4xl mb-2">🌅</div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        Good Morning!
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        What's your intention for today?
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <textarea
                            value={niatText}
                            onChange={(e) => setNiatText(e.target.value)}
                            placeholder="Ya Allah, today I intend to..."
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                            rows={4}
                            maxLength={500}
                            autoFocus
                        />
                        <div className="flex justify-between items-center mt-2 text-sm">
                            <button
                                type="button"
                                onClick={() => setShowSuggestions(!showSuggestions)}
                                className="text-emerald-600 dark:text-emerald-400 hover:underline"
                            >
                                💡 Need inspiration?
                            </button>
                            <span className="text-gray-500 dark:text-gray-400">
                                {niatText.length}/500
                            </span>
                        </div>
                    </div>

                    {/* Suggestions */}
                    <AnimatePresence>
                        {showSuggestions && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 space-y-2">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Examples:
                                    </p>
                                    {randomSuggestions.map((suggestion, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => useSuggestion(suggestion)}
                                            className="block w-full text-left px-3 py-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-sm text-gray-700 dark:text-gray-300 transition-colors"
                                        >
                                            • {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Streak Display */}
                    {currentStreak > 0 && (
                        <div className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl">
                            <span className="text-2xl">🔥</span>
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Current Streak
                                </p>
                                <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                                    {currentStreak} {currentStreak === 1 ? "day" : "days"}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={!niatText.trim() || isSubmitting}
                        className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Setting your niat...</span>
                            </>
                        ) : (
                            <>
                                <span>Set My Niat</span>
                                <span>🎯</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Quote */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-center text-sm italic text-gray-600 dark:text-gray-400">
                        "Innama al-a'malu bin-niyyat"
                    </p>
                    <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Indeed, actions are judged by intentions
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
}
