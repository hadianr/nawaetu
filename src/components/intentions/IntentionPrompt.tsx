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

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { IntentionDalil, getRandomDalil } from "@/data/intention-dalils";
import { BookHeart, Sparkles, Loader2 } from "lucide-react";

interface IntentionPromptProps {
    onSubmit: (intentionText: string) => Promise<void>;
    currentStreak?: number;
    onClose?: () => void;
    initialValue?: string;
    isBackdated?: boolean;
}

export default function IntentionPrompt({
    onSubmit,
    currentStreak = 0,
    onClose,
    initialValue = "",
    isBackdated = false,
}: IntentionPromptProps) {
    const { locale, t } = useLocale();
    const { currentTheme } = useTheme();
    const isDaylight = currentTheme === "daylight";
    const isId = locale === 'id' || (locale && locale.startsWith('id'));

    const [intentionText, setIntentionText] = useState(initialValue);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [dalil, setDalil] = useState<IntentionDalil | null>(null);

    // Calculate greeting dynamically to ensure it's always in sync with t and locale
    const hour = new Date().getHours();
    const { greetingText, greetingEmoji } = (() => {
        if (hour >= 3 && hour < 11) return { greetingText: t.intention_morning_title, greetingEmoji: "🌅" };
        if (hour >= 11 && hour < 15) return { greetingText: t.intention_afternoon_title, greetingEmoji: "☀️" };
        if (hour >= 15 && hour < 18) return { greetingText: t.intention_evening_title, greetingEmoji: "🌤️" };
        return { greetingText: t.intention_night_title, greetingEmoji: "🌙" };
    })();

    useEffect(() => {
        setMounted(true);
        if (!dalil) {
            setDalil(getRandomDalil());
        }

        return () => setMounted(false);
    }, [locale]);

    const handleSubmit = async () => {
        if (!intentionText.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onSubmit(intentionText);
        } catch (error) {
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setIntentionText(suggestion);
    };

    const content = (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] overflow-y-auto scrollbar-hide"
        >
            {/* Backdrop - fixed to stay put while card scrolls */}
            <div
                className={isDaylight ? "fixed inset-0 bg-slate-900/40 backdrop-blur-sm" : "fixed inset-0 bg-black/80 backdrop-blur-md"}
                onClick={onClose}
            />

            {/* Modal Wrapper for centering with scroll support */}
            <div className="flex min-h-full items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                    className={`relative w-full max-w-md ${isDaylight ? "bg-white border-slate-200 shadow-xl" : "bg-[rgb(var(--color-surface))] border-white/10 shadow-2xl"} border rounded-3xl overflow-hidden z-[101]`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Journal Texture Overlay */}
                    <div className={`absolute inset-0 pointer-events-none ${isDaylight ? "opacity-[0.03]" : "opacity-[0.01]"}`} style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/rice-paper.png')" }}></div>

                    {/* Glow Effect */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-[rgb(var(--color-primary))]/20 blur-3xl rounded-full pointer-events-none" />

                    {/* Header */}
                    <div className={`relative p-5 sm:p-6 border-b ${isDaylight ? "border-slate-100" : "border-white/5"}`}>
                        <div className="text-center relative z-10 space-y-3 sm:space-y-4">
                            <div className="text-3xl sm:text-4xl drop-shadow-lg mb-1 sm:mb-2">{greetingEmoji}</div>
                            <h2 className={`text-xl sm:text-2xl font-serif font-bold mb-1 ${isDaylight ? "text-slate-900" : "text-white"}`}>{greetingText}</h2>

                            <AnimatePresence mode="wait">
                                {dalil && (
                                    <motion.div
                                        key="dalil"
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 1 }}
                                        className="space-y-2 py-2"
                                    >
                                        {dalil.arabic && (
                                            <p className={`text-base sm:text-lg md:text-xl font-arabic leading-loose ${isDaylight ? "text-slate-800" : "text-slate-200"}`} dir="rtl">
                                                {dalil.arabic}
                                            </p>
                                        )}
                                        <p className={`text-[10px] sm:text-xs md:text-sm font-serif italic leading-relaxed px-4 ${isDaylight ? "text-slate-600" : "text-slate-400"}`}>
                                            "{isId ? dalil.textId : dalil.textEn}"
                                        </p>
                                        <p className="text-[9px] font-medium text-[rgb(var(--color-primary))] opacity-80 tracking-widest uppercase">
                                            — {isId ? dalil.sourceId : dalil.sourceEn}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Streak Display */}
                        {currentStreak > 0 && (
                            <div className={`mt-4 flex items-center justify-center gap-2 backdrop-blur-sm border rounded-full px-4 py-1.5 w-fit mx-auto ${isDaylight ? "bg-amber-50 border-amber-200" : "bg-white/5 border-white/10"}`}>
                                <span className="text-lg">🔥</span>
                                <span className={`text-xs font-semibold ${isDaylight ? "text-amber-700" : "text-white"}`}>
                                    {currentStreak} {t.intention_streak_label}
                                </span>
                            </div>
                        )}

                        {/* Close Button */}
                        {onClose && (
                            <button
                                onClick={onClose}
                                className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all z-20 border ${isDaylight ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-500 hover:text-slate-700" : "bg-white/5 hover:bg-white/10 border-white/10 text-white/50 hover:text-white"}`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className={`p-4 sm:p-6 space-y-4 sm:space-y-5 relative z-10 ${isDaylight ? "bg-slate-50/50" : "bg-transparent"}`}>
                        {/* Textarea */}
                        <div className="relative group">
                            <label className={`text-xs font-serif font-medium mb-2 block text-center uppercase tracking-widest ${isDaylight ? "text-slate-500" : "text-white/50"}`}>
                                {t.intention_prompt_question}
                            </label>
                            <textarea
                                value={intentionText}
                                onChange={(e) => setIntentionText(e.target.value)}
                                placeholder={t.intention_placeholder || "Bismillah, niat saya hari ini adalah..."}
                                maxLength={500}
                                rows={3}
                                className={`w-full bg-transparent border-0 border-b-2 px-2 py-4 focus:outline-none resize-none transition-all font-serif text-base sm:text-lg leading-relaxed shadow-none ${isDaylight ? "border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500/50" : "border-white/10 text-white placeholder:text-white/30 focus:border-[rgb(var(--color-primary))]/50"}`}
                                style={{
                                    backgroundImage: "linear-gradient(transparent, transparent 31px, rgba(0,0,0,0.05) 31px, rgba(0,0,0,0.05) 32px)",
                                    backgroundSize: "100% 32px",
                                    lineHeight: "32px",
                                }}
                                autoFocus
                            />
                            <div className={`absolute bottom-3 right-3 text-[10px] uppercase font-medium transition-colors ${isDaylight ? "text-slate-400 group-focus-within:text-slate-600" : "text-white/40 group-focus-within:text-white/60"}`}>
                                {intentionText.length}/500
                            </div>
                        </div>

                        {/* Inspiration Suggestions */}
                        <div className="pt-2">
                            <div className="flex items-center justify-between mb-3 px-1">
                                <label className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDaylight ? "text-slate-400" : "text-white/50"}`}>{t.intention_need_inspiration}</label>
                                <button
                                    onClick={() => {
                                        const suggestions = t.intention_suggestions as string[];
                                        const randomSuggestion = suggestions[
                                            Math.floor(Math.random() * suggestions.length)
                                        ];
                                        handleSuggestionClick(randomSuggestion);
                                    }}
                                    className={`text-[10px] font-bold flex items-center gap-1 transition-colors uppercase tracking-widest ${isDaylight ? "text-emerald-600 hover:text-emerald-500" : "text-[rgb(var(--color-primary))] hover:opacity-80"}`}
                                >
                                    <span>🎲</span>
                                    {t.intention_random_btn}
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {(t.intention_suggestions as string[]).slice(0, 3).map((suggestion: string, index: number) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className={`text-[11px] px-3 py-1.5 border rounded-lg transition-all text-left font-serif italic ${isDaylight ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600 hover:text-slate-800" : "bg-white/5 hover:bg-white/10 border-white/10 text-white/70 hover:text-white"}`}
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={!intentionText.trim() || isSubmitting}
                            className={`w-full py-3.5 sm:py-4 rounded-xl border disabled:opacity-50 disabled:cursor-not-allowed font-serif font-bold shadow-lg transition-all transform active:scale-[0.98] text-base sm:text-lg mt-1 sm:mt-2 ${isDaylight ? "bg-slate-900 border-slate-900 text-white hover:bg-slate-800" : "bg-[rgb(var(--color-primary))] border-[rgb(var(--color-primary))] text-white hover:opacity-90"}`}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center gap-3 text-white">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>{t.intention_save_btn.replace('{hasanah}', isBackdated ? '25' : '50')}</span>
                                </div>
                            ) : (
                                <span className="text-white">
                                    {t.intention_set_intention_btn || t.intention_save_btn.replace('{hasanah}', isBackdated ? '25' : '50')}
                                </span>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );

    return mounted ? createPortal(content, document.body) : null;
}
