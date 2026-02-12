"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ChevronRight, Book, Flame, Sparkles, CheckCircle2, Moon, Heart, Compass, Edit2 } from "lucide-react";
import dynamic from "next/dynamic";

const IntentionPrompt = dynamic(() => import("./IntentionPrompt"), {
    ssr: false,
});

const ReflectionPrompt = dynamic(() => import("./ReflectionPrompt"), {
    ssr: false,
});
import { useLocale } from "@/context/LocaleContext";
import { INTENTION_TRANSLATIONS } from "@/data/intention-translations";
import { cn } from "@/lib/utils";

interface IntentionJournalWidgetProps {
    className?: string;
}

function getOrCreateAnonymousId(): string {
    const STORAGE_KEY = "nawaetu_anonymous_id";
    let anonymousId = localStorage.getItem(STORAGE_KEY);
    if (!anonymousId) {
        anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        localStorage.setItem(STORAGE_KEY, anonymousId);
    }
    return anonymousId;
}

export default function IntentionJournalWidget({ className = "" }: IntentionJournalWidgetProps) {
    const { locale } = useLocale();
    const t = INTENTION_TRANSLATIONS[locale as keyof typeof INTENTION_TRANSLATIONS] || INTENTION_TRANSLATIONS.id;

    const [showIntentionPrompt, setShowIntentionPrompt] = useState(false);
    const [showReflectionPrompt, setShowReflectionPrompt] = useState(false);
    const [todayData, setTodayData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState<string | null>(null);

    useEffect(() => {
        let token = localStorage.getItem("user_token") || localStorage.getItem("fcm_token") || getOrCreateAnonymousId();
        setUserToken(token);
    }, []);

    useEffect(() => {
        if (!userToken) return;

        const checkTodayStatus = async () => {
            try {
                const response = await fetch(`/api/intentions/today?user_token=${userToken}`);
                const data = await response.json();
                if (data.success) {
                    setTodayData(data.data);
                }
            } catch (error) {
            } finally {
                setIsLoading(false);
            }
        };

        checkTodayStatus();
    }, [userToken]);

    const handleSetIntention = async (niatText: string) => {
        if (!userToken) return;
        try {
            const response = await fetch("/api/intentions/daily", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_token: userToken, niat_text: niatText }),
            });
            const data = await response.json();
            if (data.success) {
                setTodayData({
                    has_intention: true,
                    intention: { id: data.data.id, niat_text: data.data.niat_text, niat_date: data.data.niat_date },
                    has_reflection: false,
                    streak: data.data.current_streak,
                });
                setShowIntentionPrompt(false);
            }
        } catch (error) {
        }
    };

    const handleReflect = async (rating: number, reflectionText?: string) => {
        if (!userToken || !todayData?.intention?.id) return;
        try {
            const response = await fetch("/api/intentions/reflect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_token: userToken,
                    intention_id: todayData.intention.id,
                    reflection_rating: rating,
                    reflection_text: reflectionText,
                }),
            });
            const data = await response.json();
            if (data.success) {
                setTodayData({
                    ...todayData,
                    has_reflection: true,
                    reflection: { rating: data.data.reflection_rating, text: data.data.reflection_text, reflected_at: data.data.reflected_at },
                });
                setShowReflectionPrompt(false);
            }
        } catch (error) {
        }
    };

    if (isLoading) {
        return (
            <div className={cn("relative w-full", className)}>
                <div className="relative bg-black/20 backdrop-blur-md border border-white/5 rounded-3xl p-4 sm:p-5 h-[105px] animate-pulse">
                    <div className="flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                            <div className="h-3 w-24 bg-white/10 rounded-full" />
                            <div className="h-4 w-8 bg-white/10 rounded-lg" />
                        </div>
                        <div className="flex items-center justify-between gap-4 mt-2">
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-32 bg-white/10 rounded" />
                                <div className="h-3 w-40 bg-white/10 rounded" />
                            </div>
                            <div className="h-10 w-20 bg-white/10 rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("relative w-full group", className)}>
            <div className="relative bg-black/20 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden transition-all duration-300 hover:bg-black/25 active:scale-[0.995] p-5 sm:p-6">
                <div className="flex flex-col gap-2.5">
                    {/* Compact Label */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 opacity-40 grayscale hover:opacity-60 transition-opacity">
                            <Compass className="w-3 h-3 text-white" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em] whitespace-nowrap">Jurnal Niat Harian</span>
                        </div>
                    </div>

                    {!todayData?.has_intention ? (
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold text-white tracking-tight leading-tight mb-0.5">Luruskan Niat Hari Ini</h3>
                                <p className="text-[10px] text-white/40 line-clamp-1 italic font-medium leading-none">
                                    "Amalan itu tergantung niatnya..."
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowIntentionPrompt(true)}
                                    className="px-4 py-2 rounded-xl bg-[rgb(var(--color-primary))] text-white text-[10px] font-bold shadow-lg active:scale-95 transition-all flex items-center gap-1"
                                >
                                    <span>Niat</span>
                                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                                </button>
                                <button
                                    onClick={() => window.location.href = '/journal'}
                                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/5"
                                    title="Riwayat"
                                >
                                    <Book className="w-4 h-4 text-white/30" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0 flex items-center gap-2 group/text cursor-pointer" onClick={() => setShowIntentionPrompt(true)}>
                                <p className="text-sm font-medium text-white/90 italic line-clamp-1 py-1">
                                    "{todayData.intention.niat_text}"
                                </p>
                                <Edit2 className="w-3 h-3 text-white/20 group-hover/text:text-white/60 transition-colors shrink-0" />
                            </div>

                            <div className="flex items-center gap-2">
                                {!todayData.has_reflection ? (
                                    <button
                                        onClick={() => setShowReflectionPrompt(true)}
                                        className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-1.5 active:scale-95"
                                    >
                                        <Moon className="w-3 h-3 text-blue-400" />
                                        <span className="text-[10px] font-bold text-white/70 uppercase tracking-tight">Refleksi</span>
                                    </button>
                                ) : (
                                    <div
                                        onClick={() => setShowReflectionPrompt(true)}
                                        className="px-3 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-1.5 opacity-60 hover:opacity-100 cursor-pointer transition-all"
                                    >
                                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                        <span className="text-[9px] font-bold text-emerald-500/80 uppercase">Selesai</span>
                                        <Edit2 className="w-2.5 h-2.5 text-white/30 ml-0.5" />
                                    </div>
                                )}
                                <button
                                    onClick={() => window.location.href = '/journal'}
                                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/5"
                                >
                                    <Book className="w-4 h-4 text-white/30" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {showIntentionPrompt && (
                    <IntentionPrompt
                        onSubmit={handleSetIntention}
                        currentStreak={todayData?.streak || 0}
                        onClose={() => setShowIntentionPrompt(false)}
                        initialValue={todayData?.intention?.niat_text}
                    />
                )}
                {showReflectionPrompt && todayData?.intention && (
                    <ReflectionPrompt
                        intentionText={todayData.intention.niat_text}
                        intentionId={todayData.intention.id}
                        onSubmit={handleReflect}
                        onSkip={() => setShowReflectionPrompt(false)}
                        initialValue={todayData?.reflection?.text}
                        initialRating={todayData?.reflection?.rating}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
