"use client";

import { useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { INTENTION_TRANSLATIONS } from "@/data/intention-translations";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReflectionInputFormProps {
    onComplete: () => void;
    userToken: string | null;
    intentionId?: string; // We need the ID of the intention being reflected upon
    intentionText?: string;
}

export default function ReflectionInputForm({ onComplete, userToken, intentionId, intentionText }: ReflectionInputFormProps) {
    const { locale } = useLocale();
    const t = INTENTION_TRANSLATIONS[locale as keyof typeof INTENTION_TRANSLATIONS] || INTENTION_TRANSLATIONS.id;

    const RATING_LABELS = [
        { emoji: "😔", label: t.rating_struggled, color: "text-red-400" },
        { emoji: "😕", label: t.rating_difficult, color: "text-orange-400" },
        { emoji: "😐", label: t.rating_okay, color: "text-yellow-400" },
        { emoji: "😊", label: t.rating_good, color: "text-green-400" },
        { emoji: "🤩", label: t.rating_excellent, color: "text-emerald-400" },
    ];

    const [rating, setRating] = useState(0);
    const [reflection, setReflection] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            setError("Mohon beri rating harimu.");
            return;
        }
        if (!userToken || !intentionId) {
            setError("Data intention tidak ditemukan.");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            const response = await fetch("/api/intentions/reflect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_token: userToken,
                    intention_id: intentionId,
                    reflection_rating: rating,
                    reflection_text: reflection,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setIsSuccess(true);
                setTimeout(() => {
                    onComplete();
                }, 1500);
            } else {
                setError(data.error || "Gagal menyimpan refleksi");
            }
        } catch (err) {
            setError("Gagal terhubung.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-2">
                    <CheckCircle2 className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Alhamdulillah!</h3>
                <p className="text-white/60 text-sm">Refleksi tercatat. Istirahatlah yang cukup.</p>
            </div>
        );
    }

    if (!intentionId) {
        return (
            <div className="p-6 text-center text-white/60">
                <p>Kamu belum menetapkan niat hari ini.</p>
                <p className="text-xs mt-2">Dahulukan misi "Luruskan Niat" besok pagi ya!</p>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <p className="text-xs text-white/40 uppercase tracking-widest font-bold mb-2">Niat Hari Ini</p>
                <p className="text-white/90 italic">"{intentionText}"</p>
            </div>

            <div className="space-y-3">
                <label className="text-sm font-medium text-white/80 block text-center">
                    {t.prompt_reflection_rating || "Bagaimana harimu?"}
                </label>
                <div className="flex justify-between gap-1 px-2">
                    {RATING_LABELS.map((item, index) => {
                        const ratingValue = index + 1;
                        const isSelected = rating === ratingValue;

                        return (
                            <button
                                key={index}
                                onClick={() => setRating(ratingValue)}
                                className={cn(
                                    "flex flex-col items-center gap-2 p-2 rounded-2xl transition-all duration-300 w-14 sm:w-16",
                                    isSelected
                                        ? "bg-white/10 border border-white/20 scale-110 shadow-lg"
                                        : "hover:bg-white/5 opacity-60 hover:opacity-100 scale-100"
                                )}
                            >
                                <span className={cn("text-2xl sm:text-3xl transition-transform", isSelected && "scale-125")}>
                                    {item.emoji}
                                </span>
                                <span className={cn(
                                    "text-[9px] font-bold tracking-wide transition-colors",
                                    isSelected ? item.color : "text-white/40"
                                )}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-white/80 block">
                    {t.prompt_reflection_text || "Catatan evaluasi diri (Muhasabah):"}
                </label>
                <Textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="Apa yang sudah baik? Apa yang perlu diperbaiki?"
                    className="min-h-[100px] bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                />
                {error && <p className="text-red-400 text-xs">{error}</p>}
            </div>

            <Button
                onClick={handleSubmit}
                disabled={rating === 0 || isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-6 shadow-lg shadow-blue-900/20"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Menyimpan...
                    </>
                ) : (
                    "Selesai Muhasabah (+50 XP)"
                )}
            </Button>
        </div>
    );
}
