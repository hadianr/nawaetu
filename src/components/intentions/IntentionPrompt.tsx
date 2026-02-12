import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useLocale } from "@/context/LocaleContext";
import { INTENTION_TRANSLATIONS } from "@/data/intention-translations";

interface IntentionPromptProps {
    onSubmit: (niatText: string) => Promise<void>;
    currentStreak?: number;
    onClose?: () => void;
    initialValue?: string;
}

export default function IntentionPrompt({
    onSubmit,
    currentStreak = 0,
    onClose,
    initialValue = "",
}: IntentionPromptProps) {
    const { locale } = useLocale();
    const t = INTENTION_TRANSLATIONS[locale as keyof typeof INTENTION_TRANSLATIONS] || INTENTION_TRANSLATIONS.id;

    const [niatText, setNiatText] = useState(initialValue);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [greeting, setGreeting] = useState({ text: t.morning_title, emoji: "🌅" });

    useEffect(() => {
        setMounted(true);

        // Determine greeting based on time of day
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 11) {
            setGreeting({ text: t.morning_title, emoji: "🌅" });
        } else if (hour >= 11 && hour < 15) {
            setGreeting({ text: t.afternoon_title, emoji: "☀️" });
        } else if (hour >= 15 && hour < 19) {
            setGreeting({ text: t.evening_title, emoji: "🌇" });
        } else {
            setGreeting({ text: t.night_title, emoji: "🌙" });
        }

        return () => setMounted(false);
    }, [t]);

    const handleSubmit = async () => {
        if (!niatText.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onSubmit(niatText);
        } catch (error) {
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setNiatText(suggestion);
    };

    const content = (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
            {/* Backdrop with high blur to block distinct view of background */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={onClose}
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                className="relative w-full max-w-md bg-[#0f172a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-[101]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Glow Effect */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-[rgb(var(--color-primary))]/20 blur-3xl rounded-full pointer-events-none" />

                {/* Header */}
                <div className="relative p-6 pb-4 border-b border-white/5">
                    <div className="text-center relative z-10">
                        <div className="text-5xl mb-4 drop-shadow-lg">{greeting.emoji}</div>
                        <h2 className="text-2xl font-bold text-white mb-1">{greeting.text}</h2>
                        <p className="text-white/60 text-sm">{t.prompt_question}</p>
                    </div>

                    {/* Streak Display */}
                    {currentStreak > 0 && (
                        <div className="mt-4 flex items-center justify-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 w-fit mx-auto">
                            <span className="text-xl">🔥</span>
                            <span className="text-sm font-semibold text-white">
                                {currentStreak} {t.streak_label}
                            </span>
                        </div>
                    )}

                    {/* Close Button */}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all z-20"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-6 space-y-5 relative z-10">
                    {/* Textarea */}
                    <div className="relative group">
                        <textarea
                            value={niatText}
                            onChange={(e) => setNiatText(e.target.value)}
                            placeholder={t.placeholder}
                            maxLength={500}
                            rows={4}
                            className="w-full bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[rgb(var(--color-primary))]/50 focus:ring-1 focus:ring-[rgb(var(--color-primary))]/50 resize-none transition-all text-base leading-relaxed"
                            autoFocus
                        />
                        <div className="absolute bottom-3 right-3 text-xs text-white/40 group-focus-within:text-white/60 transition-colors">
                            {niatText.length}/500
                        </div>
                    </div>

                    {/* Inspiration Suggestions */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-xs font-medium text-white/50 uppercase tracking-wider">{t.need_inspiration}</label>
                            <button
                                onClick={() => {
                                    const randomSuggestion = t.suggestions[
                                        Math.floor(Math.random() * t.suggestions.length)
                                    ];
                                    handleSuggestionClick(randomSuggestion);
                                }}
                                className="text-xs text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary-light))] flex items-center gap-1 transition-colors"
                            >
                                <span>🎲</span>
                                {t.random_btn}
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {t.suggestions.slice(0, 3).map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="text-xs px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white transition-all text-left"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={!niatText.trim() || isSubmitting}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-primary-dark))] hover:shadow-[0_0_20px_rgba(var(--color-primary),0.3)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold shadow-lg transition-all transform active:scale-[0.98] text-lg"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>{t.setting_intention}</span>
                            </div>
                        ) : (
                            t.set_intention_btn
                        )}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );

    return mounted ? createPortal(content, document.body) : null;
}
