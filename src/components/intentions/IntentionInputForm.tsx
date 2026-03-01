"use client";

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
import { useLocale } from "@/context/LocaleContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, BookHeart } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { IntentionDalil, getRandomDalil } from "@/data/intention-dalils";

interface IntentionInputFormProps {
    onComplete: () => void;
    userToken: string | null;
}

export default function IntentionInputForm({ onComplete, userToken }: IntentionInputFormProps) {
    const { locale, t } = useLocale();

    const [intention, setIntention] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [dalil, setDalil] = useState<IntentionDalil | null>(null);

    // Pick random dalil on mount to avoid hydration mismatch
    useEffect(() => {
        setDalil(getRandomDalil());
    }, []);

    const handleSubmit = async () => {
        if (!intention.trim()) return;
        if (!userToken) {
            setError(t.intention_error_no_token);
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            const response = await fetch("/api/intentions/daily", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_token: userToken,
                    intention_text: intention,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setIsSuccess(true);
                setTimeout(() => {
                    onComplete();
                }, 2000); // Wait bit longer for success animation
            } else {
                setError(data.error || t.intention_error_fail_save_niat);
            }
        } catch (err) {
            setError(t.intention_error_network);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center p-8 md:p-12 space-y-4 text-center"
            >
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-10 h-10 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-serif text-white tracking-wide">{t.intention_success_title}</h3>
                <p className="text-white/60 text-base font-serif italic max-w-xs">{t.intention_success_desc}</p>
            </motion.div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#FAFAF9] dark:bg-[#1A1A1A] rounded-xl overflow-hidden relative">
            {/* Journal Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/rice-paper.png')" }}></div>

            <div className="p-6 md:p-8 space-y-8 flex-grow relative z-10 flex flex-col justify-between">

                {/* Header & Dalil Section */}
                <div className="space-y-6">
                    <div className="flex justify-center mb-2">
                        <BookHeart className="w-6 h-6 text-amber-600/80 dark:text-amber-500/80" />
                    </div>

                    <AnimatePresence mode="wait">
                        {dalil && (
                            <motion.div
                                key="dalil"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="text-center space-y-3 px-2 md:px-4"
                            >
                                {dalil.arabic && (
                                    <p className="text-xl md:text-2xl font-arabic text-slate-800 dark:text-slate-200 leading-loose" dir="rtl">
                                        {dalil.arabic}
                                    </p>
                                )}
                                <p className="text-sm md:text-base font-serif italic text-slate-600 dark:text-slate-400 leading-relaxed">
                                    "{locale === 'id' ? dalil.textId : dalil.textEn}"
                                </p>
                                <p className="text-xs font-medium text-amber-600/70 dark:text-amber-500/70 tracking-widest uppercase mt-2">
                                    — {locale === 'id' ? dalil.sourceId : dalil.sourceEn}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Input Section */}
                <div className="space-y-4">
                    <div className="relative group">
                        <label className="text-sm md:text-base font-serif font-medium text-slate-700 dark:text-slate-300 mb-2 block text-center">
                            {t.intention_prompt_question}
                        </label>
                        <Textarea
                            value={intention}
                            onChange={(e) => setIntention(e.target.value)}
                            placeholder={t.intention_placeholder_niat || "Bismillah, niat saya hari ini adalah..."}
                            className="min-h-[160px] md:min-h-[200px] bg-transparent border-0 border-b-2 border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 resize-none rounded-none focus-visible:ring-0 focus-visible:border-amber-500 font-serif text-lg leading-relaxed shadow-none transition-colors px-2 py-4"
                            style={{
                                backgroundImage: "linear-gradient(transparent, transparent 31px, rgba(0,0,0,0.05) 31px, rgba(0,0,0,0.05) 32px)",
                                backgroundSize: "100% 32px",
                                lineHeight: "32px",
                                paddingTop: "4px"
                            }}
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
                </div>

                {/* Action Section */}
                <div className="pt-4">
                    <Button
                        onClick={handleSubmit}
                        disabled={!intention.trim() || isSubmitting}
                        className="w-full bg-slate-900 border border-slate-900 text-white hover:bg-slate-800 hover:text-white dark:bg-amber-600 dark:border-amber-600 dark:hover:bg-amber-500 font-serif font-medium py-6 rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                <span className="text-base tracking-wide">{t.intention_saving_wait}</span>
                            </>
                        ) : (
                            <span className="text-base tracking-wide">{(t.intention_save_btn as string).replace('{hasanah}', '50')}</span>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
