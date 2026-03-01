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
import { ReflectionDalil, getRandomReflectionDalil } from "@/data/reflection-dalils";

interface ReflectionPromptProps {
    intentionText: string;
    intentionId: string;
    onSubmit: (rating: number, reflectionText?: string) => Promise<void>;
    onSkip?: () => void;
    initialValue?: string;
    initialRating?: number;
    isBackdated?: boolean;
}

export default function ReflectionPrompt({
    intentionText,
    intentionId,
    onSubmit,
    onSkip,
    initialValue = "",
    initialRating = 0,
    isBackdated = false,
}: ReflectionPromptProps) {
    const { locale, t } = useLocale();
    const { currentTheme } = useTheme();
    const isDaylight = currentTheme === "daylight";
    const isId = locale === 'id' || (locale && locale.startsWith('id'));

    const RATING_LABELS = [
        { emoji: "😔", label: t.intention_rating_struggled, color: "text-red-400" },
        { emoji: "😕", label: t.intention_rating_difficult, color: "text-orange-400" },
        { emoji: "😐", label: t.intention_rating_okay, color: "text-yellow-400" },
        { emoji: "😊", label: t.intention_rating_good, color: "text-green-400" },
        { emoji: "🤩", label: t.intention_rating_excellent, color: "text-emerald-400" },
    ];

    const [rating, setRating] = useState<number>(initialRating);
    const [reflectionText, setReflectionText] = useState(initialValue);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [dalil, setDalil] = useState<ReflectionDalil | null>(null);

    const hour = new Date().getHours();
    const headerEmoji = (() => {
        if (hour >= 3 && hour < 11) return "🌅";
        if (hour >= 11 && hour < 15) return "☀️";
        if (hour >= 15 && hour < 18) return "🌤️";
        return "🌙";
    })();

    useEffect(() => {
        setMounted(true);
        if (!dalil) {
            setDalil(getRandomReflectionDalil());
        }
        return () => setMounted(false);
    }, [locale]);

    const handleSubmit = async () => {
        if (rating === 0 || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onSubmit(rating, reflectionText || undefined);
        } catch (error) {
        } finally {
            setIsSubmitting(false);
        }
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
                onClick={onSkip}
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
                    {/* Glow Effect */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-[rgb(var(--color-primary))]/20 blur-3xl rounded-full pointer-events-none" />

                    {/* Header */}
                    <div className={`relative p-5 sm:p-6 border-b ${isDaylight ? "border-slate-100" : "border-white/5"}`}>
                        <div className="text-center relative z-10">
                            <div className="text-4xl sm:text-5xl mb-2 sm:mb-4 drop-shadow-lg">{headerEmoji}</div>
                            <h2 className={`text-xl sm:text-2xl font-bold mb-1 ${isDaylight ? "text-slate-900" : "text-white"}`}>{t.intention_reflection_title}</h2>
                            <p className={`text-xs sm:text-sm ${isDaylight ? "text-slate-500" : "text-white/60"}`}>{t.intention_reflection_question}</p>

                            <AnimatePresence mode="wait">
                                {dalil && (
                                    <motion.div
                                        key="dalil"
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 1 }}
                                        className="space-y-1 sm:space-y-2 py-2 sm:py-4"
                                    >
                                        {dalil.arabic && (
                                            <p className={`text-base sm:text-lg font-arabic leading-loose ${isDaylight ? "text-slate-800" : "text-slate-200"}`} dir="rtl">
                                                {dalil.arabic}
                                            </p>
                                        )}
                                        <p className={`text-[10px] sm:text-xs md:text-sm font-serif italic leading-relaxed px-2 ${isDaylight ? "text-slate-600" : "text-slate-400"}`}>
                                            "{isId ? dalil.textId : dalil.textEn}"
                                        </p>
                                        <p className="text-[9px] font-medium text-[rgb(var(--color-primary))] opacity-80 tracking-widest uppercase">
                                            — {isId ? dalil.sourceId : dalil.sourceEn}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Close Button */}
                        {onSkip && (
                            <button
                                onClick={onSkip}
                                className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all z-20 border ${isDaylight ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-500 hover:text-slate-700" : "bg-white/5 hover:bg-white/10 border-white/10 text-white/50 hover:text-white"}`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 relative z-10">
                        {/* Today's Intention */}
                        <div className={`backdrop-blur-md border rounded-2xl p-5 relative overflow-hidden ${isDaylight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/5"}`}>
                            <div className="absolute top-0 left-0 w-1 h-full bg-[rgb(var(--color-primary))]" />
                            <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1 sm:mb-2 ${isDaylight ? "text-slate-400" : "text-white/50"}`}>{t.intention_todays_niat}</p>
                            <p className={`text-base sm:text-lg font-medium italic leading-relaxed ${isDaylight ? "text-slate-800" : "text-white"}`}>"{intentionText}"</p>
                        </div>

                        {/* Rating */}
                        <div>
                            <p className={`text-sm font-medium mb-4 text-center ${isDaylight ? "text-slate-600" : "text-white/80"}`}>{t.intention_rate_satisfaction}</p>
                            <div className="flex justify-between gap-1 px-2">
                                {RATING_LABELS.map((item, index) => {
                                    const ratingValue = index + 1;
                                    const isSelected = rating === ratingValue;

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => setRating(ratingValue)}
                                            className={`flex flex-col items-center gap-1 sm:gap-2 p-1.5 sm:p-2.5 rounded-2xl transition-all duration-300 w-14 sm:w-16 group border ${isSelected
                                                ? `${isDaylight ? "bg-slate-100 border-slate-300 shadow-sm" : "bg-white/10 border-white/20 shadow-lg"} scale-110`
                                                : `${isDaylight ? "hover:bg-slate-100 hover:border-slate-200" : "hover:bg-white/5 hover:border-white/10"} border-transparent opacity-60 hover:opacity-100 scale-100`
                                                }`}
                                        >
                                            <span className={`text-2xl sm:text-3xl transition-transform ${isSelected ? 'scale-125' : 'group-hover:scale-110'}`}>{item.emoji}</span>
                                            <span className={`text-[8px] sm:text-[9px] font-bold tracking-wide transition-colors leading-tight ${isSelected ? item.color :
                                                (isDaylight ? "text-slate-400 group-hover:text-slate-600" : "text-white/40 group-hover:text-white/80")
                                                }`}>
                                                {item.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Optional Notes */}
                        <div>
                            <label className={`text-xs font-medium uppercase tracking-wider mb-2 block ${isDaylight ? "text-slate-400" : "text-white/50"}`}>
                                {t.intention_notes_label}
                            </label>
                            <textarea
                                value={reflectionText}
                                onChange={(e) => setReflectionText(e.target.value)}
                                placeholder={t.intention_notes_placeholder}
                                maxLength={1000}
                                rows={3}
                                className={`w-full backdrop-blur-sm border rounded-2xl px-4 py-3 resize-none transition-all text-sm focus:outline-none focus:ring-1 ${isDaylight ? "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/30" : "bg-black/40 border-white/10 text-white placeholder:text-white/30 focus:border-[rgb(var(--color-primary))]/50 focus:ring-[rgb(var(--color-primary))]/30"}`}
                            />
                            <div className={`text-xs mt-1 text-right ${isDaylight ? "text-slate-400" : "text-white/40"}`}>
                                {reflectionText.length}/1000
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-2">
                            {onSkip && (
                                <button
                                    onClick={onSkip}
                                    className={`flex-1 py-3.5 rounded-xl border font-medium transition-all ${isDaylight ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600" : "bg-white/5 hover:bg-white/10 border-white/10 text-white/60 hover:text-white"}`}
                                >
                                    {t.intention_skip_btn}
                                </button>
                            )}
                            <button
                                onClick={handleSubmit}
                                disabled={rating === 0 || isSubmitting}
                                className={`flex-[1.5] py-3.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold shadow-lg transition-all transform active:scale-[0.98] ${isDaylight ? "bg-slate-900 hover:bg-slate-800" : "bg-[rgb(var(--color-primary))] hover:opacity-90"}`}
                            >
                                {isSubmitting
                                    ? t.intention_saving_reflection
                                    : t.intention_complete_muhasabah_btn.replace('{hasanah}', isBackdated ? '25' : '50')}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );

    return mounted ? createPortal(content, document.body) : null;
}
