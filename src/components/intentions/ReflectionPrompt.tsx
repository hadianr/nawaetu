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

import { useState, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/context/LocaleContext";
import { ReflectionDalil, getRandomReflectionDalil } from "@/data/reflection-dalils";
import { AppIcon } from "@/components/ui/AppIcon";

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
    onSubmit,
    onSkip,
    initialValue = "",
    initialRating = 0,
    isBackdated = false,
}: ReflectionPromptProps) {
    const { locale, t } = useLocale();
    const isId = locale === 'id' || (locale && locale.startsWith('id'));

    const RATING_LABELS = [
        { icon: "warning" as const, label: t.intention_rating_struggled, color: "text-[rgb(var(--color-danger))]" },
        { icon: "help" as const, label: t.intention_rating_difficult, color: "text-[rgb(var(--color-warning))]" },
        { icon: "target" as const, label: t.intention_rating_okay, color: "text-[rgb(var(--color-accent))]" },
        { icon: "heart-handshake" as const, label: t.intention_rating_good, color: "text-[rgb(var(--color-success))]" },
        { icon: "sparkles" as const, label: t.intention_rating_excellent, color: "text-[rgb(var(--color-primary-light))]" },
    ];

    const [rating, setRating] = useState<number>(initialRating);
    const [reflectionText, setReflectionText] = useState(initialValue);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
    const [dalil, setDalil] = useState<ReflectionDalil | null>(null);

    const hour = new Date().getHours();
    const headerIcon = (() => {
        if (hour >= 3 && hour < 15) return "sun" as const;
        if (hour >= 15 && hour < 18) return "cloud-sun" as const;
        return "moon" as const;
    })();

    useEffect(() => {
        if (!dalil) {
            queueMicrotask(() => setDalil(getRandomReflectionDalil()));
        }
    }, [dalil]);

    const handleSubmit = async () => {
        if (rating === 0 || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onSubmit(rating, reflectionText || undefined);
        } catch {
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
                className="fixed inset-0 bg-[rgb(var(--color-background))]/70 backdrop-blur-md"
                onClick={onSkip}
            />

            {/* Modal Wrapper for centering with scroll support */}
            <div className="flex min-h-full items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                    className="relative w-full max-w-md bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] shadow-[var(--shadow-floating)] rounded-3xl overflow-hidden z-[101]"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Glow Effect */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-[rgb(var(--color-primary))]/20 blur-3xl rounded-full pointer-events-none" />

                    {/* Header */}
                    <div className="relative p-5 sm:p-6 border-b border-[rgb(var(--color-border))]">
                        <div className="text-center relative z-10">
                            <AppIcon name={headerIcon} size="display" tone="primary" className="mb-2 sm:mb-4" />
                            <h2 className="text-xl sm:text-2xl font-bold mb-1 text-[rgb(var(--color-text-strong))]">{t.intention_reflection_title}</h2>
                            <p className="text-xs sm:text-sm text-[rgb(var(--color-text-muted))]">{t.intention_reflection_question}</p>

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
                                            <p className="text-base sm:text-lg font-arabic leading-loose text-[rgb(var(--color-text-strong))]" dir="rtl">
                                                {dalil.arabic}
                                            </p>
                                        )}
                                        <p className="text-[10px] sm:text-xs md:text-sm font-serif italic leading-relaxed px-2 text-[rgb(var(--color-text-muted))]">
                                            &quot;{isId ? dalil.textId : dalil.textEn}&quot;
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
                                className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all z-20 border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] hover:bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text))]"
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
                        <div className="backdrop-blur-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] rounded-2xl p-5 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[rgb(var(--color-primary))]" />
                            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1 sm:mb-2 text-[rgb(var(--color-text-muted))]">{t.intention_todays_niat}</p>
                            <p className="text-base sm:text-lg font-medium italic leading-relaxed text-[rgb(var(--color-text))]">&quot;{intentionText}&quot;</p>
                        </div>

                        {/* Rating */}
                        <div>
                            <p className="text-sm font-medium mb-4 text-center text-[rgb(var(--color-text))]">{t.intention_rate_satisfaction}</p>
                            <div className="flex justify-between gap-1 px-2">
                                {RATING_LABELS.map((item, index) => {
                                    const ratingValue = index + 1;
                                    const isSelected = rating === ratingValue;

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => setRating(ratingValue)}
                                            className={`flex flex-col items-center gap-1 sm:gap-2 p-1.5 sm:p-2.5 rounded-2xl transition-all duration-300 w-14 sm:w-16 group border ${isSelected
                                                ? "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/30 shadow-[var(--shadow-card)] scale-110"
                                                : "hover:bg-[rgb(var(--color-primary))]/5 hover:border-[rgb(var(--color-border))] border-transparent opacity-60 hover:opacity-100 scale-100"
                                                }`}
                                        >
                                            <AppIcon name={item.icon} size="xl" tone={isSelected ? "primary" : "muted"} className={`transition-transform ${isSelected ? 'scale-125' : 'group-hover:scale-110'}`} />
                                            <span className={`text-[8px] sm:text-[9px] font-bold tracking-wide transition-colors leading-tight ${isSelected ? item.color :
                                                "text-[rgb(var(--color-text-muted))] group-hover:text-[rgb(var(--color-text))]"
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
                            <label htmlFor="reflection-prompt-text" className="text-xs font-medium uppercase tracking-wider mb-2 block text-[rgb(var(--color-text-muted))]">
                                {t.intention_notes_label}
                            </label>
                            <textarea
                                id="reflection-prompt-text"
                                value={reflectionText}
                                onChange={(e) => setReflectionText(e.target.value)}
                                placeholder={t.intention_notes_placeholder}
                                maxLength={1000}
                                rows={3}
                                className="w-full backdrop-blur-sm border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] rounded-2xl px-4 py-3 resize-none transition-all text-sm text-[rgb(var(--color-text))] placeholder:text-[rgb(var(--color-text-muted))] focus:outline-none focus:ring-1 focus:border-[rgb(var(--color-primary))]/50 focus:ring-[rgb(var(--color-primary))]/30"
                            />
                            <div className="text-xs mt-1 text-right text-[rgb(var(--color-text-muted))]">
                                {reflectionText.length}/1000
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-2">
                            {onSkip && (
                                <button
                                    onClick={onSkip}
                                    className="flex-1 py-3.5 rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] hover:bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text))] font-medium transition-all"
                                >
                                    {t.intention_skip_btn}
                                </button>
                            )}
                            <button
                                onClick={handleSubmit}
                                disabled={rating === 0 || isSubmitting}
                                className="flex-[1.5] py-3.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed text-[rgb(var(--color-primary-foreground))] font-bold shadow-[var(--shadow-floating)] transition-all transform active:scale-[0.98] bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-light))]"
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
