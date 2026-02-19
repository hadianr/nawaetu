import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useLocale } from "@/context/LocaleContext";

interface ReflectionPromptProps {
    intentionText: string;
    intentionId: string;
    onSubmit: (rating: number, reflectionText?: string) => Promise<void>;
    onSkip?: () => void;
    initialValue?: string;
    initialRating?: number;
}

export default function ReflectionPrompt({
    intentionText,
    intentionId,
    onSubmit,
    onSkip,
    initialValue = "",
    initialRating = 0,
}: ReflectionPromptProps) {
    const { locale, t } = useLocale();

    const RATING_LABELS = [
        { emoji: "😔", label: t.niat_rating_struggled, color: "text-red-400" },
        { emoji: "😕", label: t.niat_rating_difficult, color: "text-orange-400" },
        { emoji: "😐", label: t.niat_rating_okay, color: "text-yellow-400" },
        { emoji: "😊", label: t.niat_rating_good, color: "text-green-400" },
        { emoji: "🤩", label: t.niat_rating_excellent, color: "text-emerald-400" },
    ];

    const [rating, setRating] = useState<number>(initialRating);
    const [reflectionText, setReflectionText] = useState(initialValue);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

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
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
            {/* Backdrop with high blur */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={onSkip}
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
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none" />

                {/* Header */}
                <div className="relative p-6 pb-4 border-b border-white/5">
                    <div className="text-center relative z-10">
                        <div className="text-5xl mb-4 drop-shadow-lg">🌙</div>
                        <h2 className="text-2xl font-bold text-white mb-1">{t.niat_reflection_title}</h2>
                        <p className="text-white/60 text-sm">{t.niat_reflection_question}</p>
                    </div>

                    {/* Close Button */}
                    {onSkip && (
                        <button
                            onClick={onSkip}
                            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all z-20"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 relative z-10">
                    {/* Today's Intention */}
                    <div className="bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl p-5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[rgb(var(--color-primary))]" />
                        <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">{t.niat_todays_niat}</p>
                        <p className="text-white text-lg font-medium italic leading-relaxed">"{intentionText}"</p>
                    </div>

                    {/* Rating */}
                    <div>
                        <p className="text-sm font-medium text-white/80 mb-4 text-center">{t.niat_rate_satisfaction}</p>
                        <div className="flex justify-between gap-1 px-2">
                            {RATING_LABELS.map((item, index) => {
                                const ratingValue = index + 1;
                                const isSelected = rating === ratingValue;

                                return (
                                    <button
                                        key={index}
                                        onClick={() => setRating(ratingValue)}
                                        className={`flex flex-col items-center gap-2 p-2 rounded-2xl transition-all duration-300 w-16 ${isSelected
                                            ? "bg-white/10 border-white/20 scale-110 shadow-lg"
                                            : "hover:bg-white/5 opacity-60 hover:opacity-100 scale-100"
                                            }`}
                                    >
                                        <span className={`text-3xl transition-transform ${isSelected ? 'scale-125' : ''}`}>{item.emoji}</span>
                                        <span className={`text-[9px] font-bold tracking-wide transition-colors ${isSelected ? item.color : "text-white/40"}`}>
                                            {item.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Optional Notes */}
                    <div>
                        <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block">
                            {t.niat_notes_label}
                        </label>
                        <textarea
                            value={reflectionText}
                            onChange={(e) => setReflectionText(e.target.value)}
                            placeholder={t.niat_notes_placeholder}
                            maxLength={1000}
                            rows={3}
                            className="w-full bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[rgb(var(--color-primary))]/50 focus:ring-1 focus:ring-[rgb(var(--color-primary))]/30 resize-none transition-all text-sm"
                        />
                        <div className="text-xs text-white/40 mt-1 text-right">
                            {reflectionText.length}/1000
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        {onSkip && (
                            <button
                                onClick={onSkip}
                                className="flex-1 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white font-medium transition-all"
                            >
                                {t.niat_skip_btn}
                            </button>
                        )}
                        <button
                            onClick={handleSubmit}
                            disabled={rating === 0 || isSubmitting}
                            className="flex-[1.5] py-3.5 rounded-xl bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-primary-dark))] hover:shadow-[0_0_20px_rgba(var(--color-primary),0.3)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold shadow-lg transition-all transform active:scale-[0.98]"
                        >
                            {isSubmitting ? t.niat_saving_reflection : t.niat_complete_journal_btn}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );

    return mounted ? createPortal(content, document.body) : null;
}
