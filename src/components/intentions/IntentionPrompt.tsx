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

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/context/LocaleContext";
import { IntentionDalil, getRandomDalil } from "@/data/intention-dalils";
import { Loader2 } from "lucide-react";
import { AppIcon } from "@/components/ui/AppIcon";

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
    const isId = locale === 'id' || (locale && locale.startsWith('id'));

    const [intentionText, setIntentionText] = useState(initialValue);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const mounted = useSyncExternalStore(() => () => undefined, () => true, () => false);
    // Keep the SSR snapshot deterministic; choose a random dalil after mount.
    const [dalil, setDalil] = useState<IntentionDalil | null>(null);
    useEffect(() => {
        queueMicrotask(() => setDalil(getRandomDalil()));
    }, []);

    // Calculate greeting dynamically to ensure it's always in sync with t and locale
    const hour = new Date().getHours();
    const { greetingText, greetingIcon } = (() => {
        if (hour >= 3 && hour < 11) return { greetingText: t.intention_morning_title, greetingIcon: "sun" as const };
        if (hour >= 11 && hour < 15) return { greetingText: t.intention_afternoon_title, greetingIcon: "sun" as const };
        if (hour >= 15 && hour < 18) return { greetingText: t.intention_evening_title, greetingIcon: "cloud-sun" as const };
        return { greetingText: t.intention_night_title, greetingIcon: "moon" as const };
    })();

    const handleSubmit = async () => {
        if (!intentionText.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onSubmit(intentionText);
        } catch {
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
                className="fixed inset-0 bg-[rgb(var(--color-background))]/70 backdrop-blur-md"
                onClick={onClose}
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
                    {/* Journal Texture Overlay */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/rice-paper.png')" }}></div>

                    {/* Glow Effect */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-[rgb(var(--color-primary))]/20 blur-3xl rounded-full pointer-events-none" />

                    {/* Header */}
                    <div className="relative p-5 sm:p-6 border-b border-[rgb(var(--color-border))]">
                        <div className="text-center relative z-10 space-y-3 sm:space-y-4">
                            <AppIcon name={greetingIcon} size="display" tone="primary" className="mb-1 sm:mb-2" />
                            <h2 className="text-xl sm:text-2xl font-serif font-bold mb-1 text-[rgb(var(--color-text-strong))]">{greetingText}</h2>

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
                                            <p className="text-base sm:text-lg md:text-xl font-arabic leading-loose text-[rgb(var(--color-text-strong))]" dir="rtl">
                                                {dalil.arabic}
                                            </p>
                                        )}
                                        <p className="text-[10px] sm:text-xs md:text-sm font-serif italic leading-relaxed px-4 text-[rgb(var(--color-text-muted))]">
                            &quot;{isId ? dalil.textId : dalil.textEn}&quot;
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
                            <div className="mt-4 flex items-center justify-center gap-2 backdrop-blur-sm border border-[rgb(var(--color-accent))]/30 bg-[rgb(var(--color-accent))]/10 rounded-full px-4 py-1.5 w-fit mx-auto">
                                <AppIcon name="sparkles" size="md" tone="primary" />
                                <span className="text-xs font-semibold text-[rgb(var(--color-accent-foreground))]">
                                    {currentStreak} {t.intention_streak_label}
                                </span>
                            </div>
                        )}

                        {/* Close Button */}
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all z-20 border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] hover:bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text))]"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 relative z-10">
                        {/* Textarea */}
                        <div className="relative group">
                            <label htmlFor="intention-prompt-text" className="text-xs font-serif font-medium mb-2 block text-center uppercase tracking-widest text-[rgb(var(--color-text-muted))]">
                                {t.intention_prompt_question}
                            </label>
                            <textarea
                                id="intention-prompt-text"
                                value={intentionText}
                                onChange={(e) => setIntentionText(e.target.value)}
                                placeholder={t.intention_placeholder || "Bismillah, niat saya hari ini adalah..."}
                                maxLength={500}
                                rows={3}
                                className="w-full bg-transparent border-0 border-b-2 border-[rgb(var(--color-border))] px-2 py-4 focus:outline-none resize-none transition-all font-serif text-base sm:text-lg leading-relaxed shadow-none text-[rgb(var(--color-text))] placeholder:text-[rgb(var(--color-text-muted))] focus:border-[rgb(var(--color-primary))]/50"
                                style={{
                                    backgroundImage: "linear-gradient(transparent, transparent 31px, rgba(0,0,0,0.05) 31px, rgba(0,0,0,0.05) 32px)",
                                    backgroundSize: "100% 32px",
                                    lineHeight: "32px",
                                }}
                                autoFocus
                            />
                            <div className="absolute bottom-3 right-3 text-[10px] uppercase font-medium transition-colors text-[rgb(var(--color-text-muted))]">
                                {intentionText.length}/500
                            </div>
                        </div>

                        {/* Inspiration Suggestions */}
                        <div className="pt-2">
                            <div className="flex items-center justify-between mb-3 px-1">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[rgb(var(--color-text-muted))]">{t.intention_need_inspiration}</label>
                                <button
                                    onClick={() => {
                                        const suggestions = t.intention_suggestions as string[];
                                        const randomSuggestion = suggestions[
                                            Math.floor(Math.random() * suggestions.length)
                                        ];
                                        handleSuggestionClick(randomSuggestion);
                                    }}
                                    className="text-[10px] font-bold flex items-center gap-1 transition-colors uppercase tracking-widest text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary-light))]"
                                >
                                    <AppIcon name="sparkles" size="xs" tone="primary" />
                                    {t.intention_random_btn}
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {(t.intention_suggestions as string[]).slice(0, 3).map((suggestion: string, index: number) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="text-[11px] px-3 py-1.5 border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] hover:bg-[rgb(var(--color-primary))]/10 rounded-lg transition-all text-left font-serif italic text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text))]"
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
                            className="w-full py-3.5 sm:py-4 rounded-xl border border-[rgb(var(--color-primary))] disabled:opacity-50 disabled:cursor-not-allowed font-serif font-bold shadow-[var(--shadow-floating)] transition-all transform active:scale-[0.98] text-base sm:text-lg mt-1 sm:mt-2 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))] hover:bg-[rgb(var(--color-primary-light))]"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center gap-3 text-[rgb(var(--color-primary-foreground))]">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>{t.intention_save_btn.replace('{hasanah}', isBackdated ? '25' : '50')}</span>
                                </div>
                            ) : (
                                <span className="text-[rgb(var(--color-primary-foreground))]">
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
