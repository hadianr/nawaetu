"use client";

import { useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

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

    const handleSubmit = async () => {
        if (!intention.trim()) return;
        if (!userToken) {
            setError(t.niat_error_no_token);
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
                    niat_text: intention,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setIsSuccess(true);
                setTimeout(() => {
                    onComplete();
                }, 1500); // Wait for animation
            } else {
                setError(data.error || t.niat_error_fail_save_niat);
            }
        } catch (err) {
            setError(t.niat_error_network);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-2">
                    <Sparkles className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white">{t.niat_success_niat_title}</h3>
                <p className="text-white/60 text-sm">{t.niat_success_niat_desc}</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-white/80 block">
                    {t.niat_prompt_question}
                </label>
                <Textarea
                    value={intention}
                    onChange={(e) => setIntention(e.target.value)}
                    placeholder={t.niat_placeholder_niat || "Contoh: Saya berniat bekerja dengan jujur..."}
                    className="min-h-[120px] bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50"
                />
                {error && <p className="text-red-400 text-xs">{error}</p>}
            </div>

            <Button
                onClick={handleSubmit}
                disabled={!intention.trim() || isSubmitting}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold py-6 shadow-lg shadow-amber-900/20"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t.niat_saving_wait}
                    </>
                ) : (
                    t.niat_save_niat_btn
                )}
            </Button>

            <p className="text-[10px] text-center text-white/40 italic">
                "Innamal a'malu bin niyyat"
            </p>
        </div>
    );
}
