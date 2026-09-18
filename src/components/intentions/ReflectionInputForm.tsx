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

import { useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppIcon } from "@/components/ui/AppIcon";

interface ReflectionInputFormProps {
    onComplete: () => void;
    userToken: string | null;
    intentionId?: string; // We need the ID of the intention being reflected upon
    intentionText?: string;
}

export default function ReflectionInputForm({ onComplete, userToken, intentionId, intentionText }: ReflectionInputFormProps) {
    const { t } = useLocale();

    const RATING_LABELS = [
        { icon: "warning" as const, label: t.niat_rating_struggled, color: "text-[rgb(var(--color-danger))]" },
        { icon: "help" as const, label: t.niat_rating_difficult, color: "text-[rgb(var(--color-warning))]" },
        { icon: "target" as const, label: t.niat_rating_okay, color: "text-[rgb(var(--color-accent))]" },
        { icon: "heart-handshake" as const, label: t.niat_rating_good, color: "text-[rgb(var(--color-success))]" },
        { icon: "sparkles" as const, label: t.niat_rating_excellent, color: "text-[rgb(var(--color-primary-light))]" },
    ];

    const [rating, setRating] = useState(0);
    const [reflection, setReflection] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            setError(t.niat_rating_harimu_prompt);
            return;
        }
        if (!userToken || !intentionId) {
            setError(t.niat_error_no_intention_id);
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
                setError(data.error || t.niat_error_fail_save_reflection);
            }
        } catch {
            setError(t.niat_error_network);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 bg-[rgb(var(--color-success))]/15 rounded-full flex items-center justify-center mb-2">
                    <CheckCircle2 className="w-8 h-8 text-[rgb(var(--color-success))]" />
                </div>
                <h3 className="text-xl font-bold text-[rgb(var(--color-text-strong))]">{t.niat_success_reflection_title}</h3>
                <p className="text-[rgb(var(--color-text-muted))] text-sm">{t.niat_success_reflection_desc}</p>
            </div>
        );
    }

    if (!intentionId) {
        return (
            <div className="p-6 text-center text-[rgb(var(--color-text-muted))]">
                <p>{t.intention_no_today_title}</p>
                <p className="text-xs mt-2">{t.intention_no_today_desc}</p>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <div className="bg-[rgb(var(--color-surface-subtle))] p-4 rounded-xl border border-[rgb(var(--color-border))]">
                <p className="text-xs text-[rgb(var(--color-text-muted))] uppercase tracking-widest font-bold mb-2">{t.intention_todays_label}</p>
                        <p className="text-[rgb(var(--color-text))] italic">&quot;{intentionText}&quot;</p>
            </div>

            <div className="space-y-3">
                <label className="text-sm font-medium text-[rgb(var(--color-text))] block text-center">
                    {t.niat_rating_harimu}
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
                                    "flex flex-col items-center gap-2 p-2.5 rounded-2xl transition-all duration-300 w-14 sm:w-16 group border",
                                    isSelected
                                        ? "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/30 shadow-[var(--shadow-card)] scale-110"
                                        : "hover:bg-[rgb(var(--color-primary))]/5 hover:border-[rgb(var(--color-border))] border-transparent opacity-60 hover:opacity-100 scale-100"
                                )}
                            >
                                <span className={cn("text-2xl sm:text-3xl transition-transform", isSelected ? "scale-125" : "group-hover:scale-110")}>
                                    <AppIcon name={item.icon} size="xl" tone={isSelected ? "primary" : "muted"} />
                                </span>
                                <span className={cn(
                                    "text-[9px] font-bold tracking-wide transition-colors",
                                    isSelected ? item.color : "text-[rgb(var(--color-text-muted))] group-hover:text-[rgb(var(--color-text))]"
                                )}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-[rgb(var(--color-text))] block">
                    {t.niat_prompt_reflection_text}
                </label>
                <Textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder={t.niat_placeholder_reflect}
                    className="min-h-[100px] bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))] text-[rgb(var(--color-text))] placeholder:text-[rgb(var(--color-text-muted))] resize-none focus:border-[rgb(var(--color-primary))]/50 focus:ring-1 focus:ring-[rgb(var(--color-primary))]/50"
                />
                {error && <p className="text-[rgb(var(--color-danger))] text-xs">{error}</p>}
            </div>

            <Button
                onClick={handleSubmit}
                disabled={rating === 0 || isSubmitting}
                className="w-full bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-light))] text-[rgb(var(--color-primary-foreground))] font-bold py-6 shadow-[var(--shadow-floating)]"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t.niat_saving_wait}
                    </>
                ) : (
                    t.niat_complete_muhasabah_btn
                )}
            </Button>
        </div>
    );
}
