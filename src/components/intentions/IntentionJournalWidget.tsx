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
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { useTheme } from "@/context/ThemeContext";
import { addXP } from "@/lib/leveling";

interface IntentionJournalWidgetProps {
    className?: string;
}

function getOrCreateAnonymousId(): string {
    const STORAGE_KEY = "nawaetu_anonymous_id";
    let anonymousId = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (!anonymousId && typeof window !== "undefined") {
        anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        localStorage.setItem(STORAGE_KEY, anonymousId);
    }
    return anonymousId || "";
}

const CACHE_PREFIX = "nawaetu_intention_cache_";

// Helper to get today's date string in YYYY-MM-DD format (local time)
function getTodayDateString() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function IntentionJournalWidget({ className = "" }: IntentionJournalWidgetProps) {
    const { locale, t } = useLocale();
    const { currentTheme } = useTheme();
    const isDaylight = currentTheme === "daylight";

    const [showIntentionPrompt, setShowIntentionPrompt] = useState(false);
    const [showReflectionPrompt, setShowReflectionPrompt] = useState(false);

    // Add selectedDate state
    const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());

    const isBackdated = selectedDate !== getTodayDateString();

    // Default structure to avoid layout/hydration shifts when caching kicks in
    const [todayData, setTodayData] = useState<any>(null);

    // Only show loading if we really have no cached data at all on first paint
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState<string | null>(null);

    // 1. Initialize Token & Try reading cache synchronously (or fast mount)
    useEffect(() => {
        const token = localStorage.getItem("user_token") || localStorage.getItem("fcm_token") || getOrCreateAnonymousId();
        setUserToken(token);

        // Check cache immediately when token is known
        const cacheKey = `${CACHE_PREFIX}${token}_${selectedDate}`;
        const cachedStr = localStorage.getItem(cacheKey);

        if (cachedStr) {
            try {
                const cachedData = JSON.parse(cachedStr);
                setTodayData(cachedData);
                setIsLoading(false); // Skip skeleton if cache exists
            } catch (e) {
                // Ignore parsing errors
            }
        } else {
            // Need to show loading if cache misses when date changes
            setIsLoading(true);
        }
    }, [selectedDate]);

    // 2. Background Fetch (Stale-While-Revalidate)
    useEffect(() => {
        if (!userToken) return;

        const checkTodayStatus = async () => {
            try {
                // Background fetch
                const response = await fetch(`/api/intentions/today?date=${selectedDate}`, {
                    // Cache busting or ensure next.js doesn't hard cache this for real-time widgets
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Authorization': `Bearer ${userToken}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setTodayData(data.data);

                        // Update cache
                        const cacheKey = `${CACHE_PREFIX}${userToken}_${selectedDate}`;
                        localStorage.setItem(cacheKey, JSON.stringify(data.data));
                    }
                }
            } catch (error) {
                console.error("Failed to sync intention status", error);
            } finally {
                // Ensure loading is off whether it failed or succeeded
                setIsLoading(false);
            }
        };

        checkTodayStatus();
    }, [userToken, selectedDate]);

    const handleSetIntention = async (intentionText: string) => {
        if (!userToken) return;

        // Optimistic update for snappy UX
        const optimisticData = {
            has_intention: true,
            intention: { id: Date.now().toString(), intention_text: intentionText, intention_date: new Date(selectedDate).toISOString() },
            has_reflection: false,
            streak: (todayData?.streak || 0) + (todayData?.has_intention ? 0 : 1),
        };

        setTodayData(optimisticData);
        setShowIntentionPrompt(false);
        toast.success(locale === 'id' ? 'Niat berhasil disimpan' : 'Intention saved successfully');

        try {
            const response = await fetch("/api/intentions/daily", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_token: userToken, intention_text: intentionText, intention_date: selectedDate }),
            });
            const data = await response.json();

            if (data.success) {
                const finalData = {
                    has_intention: true,
                    intention: { id: data.data.id, intention_text: data.data.intention_text, intention_date: data.data.intention_date },
                    has_reflection: false,
                    streak: data.data.current_streak,
                };

                setTodayData(finalData);

                // Update Cache
                const cacheKey = `${CACHE_PREFIX}${userToken}_${selectedDate}`;
                localStorage.setItem(cacheKey, JSON.stringify(finalData));

                // Add XP locally
                if (data.data.intention_points_earned > 0) {
                    addXP(data.data.intention_points_earned, selectedDate);
                }
            } else {
                // Revert if failed
                setTodayData(todayData);
                setShowIntentionPrompt(true); // Bring form back
                toast.error(data.error || (locale === 'id' ? 'Gagal menyimpan niat' : 'Failed to save intention'));
            }
        } catch (error) {
            setTodayData(todayData);
            setShowIntentionPrompt(true);
            toast.error(locale === 'id' ? 'Terjadi kesalahan' : 'An error occurred');
        }
    };

    const handleReflect = async (rating: number, reflectionText?: string) => {
        if (!userToken || !todayData?.intention?.id) return;

        const optimisticData = {
            ...todayData,
            has_reflection: true,
            reflection: { rating: rating, text: reflectionText, reflected_at: new Date().toISOString() },
        };

        setTodayData(optimisticData);
        setShowReflectionPrompt(false);
        toast.success(locale === 'id' ? 'Refleksi berhasil disimpan' : 'Reflection saved successfully');

        try {
            const todayStr = getTodayDateString();
            const isBackdated = selectedDate !== todayStr;
            const xpAmount = isBackdated ? 25 : 50;

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
                const finalData = {
                    ...todayData,
                    has_reflection: true,
                    reflection: { rating: data.data.reflection_rating, text: data.data.reflection_text, reflected_at: data.data.reflected_at },
                };

                setTodayData(finalData);

                // Add XP locally
                addXP(xpAmount, selectedDate);
                window.dispatchEvent(new CustomEvent("xp_updated"));

                // Update Cache
                const cacheKey = `${CACHE_PREFIX}${userToken}_${selectedDate}`;
                localStorage.setItem(cacheKey, JSON.stringify(finalData));
            } else {
                setTodayData(todayData);
                toast.error(data.error || (locale === 'id' ? 'Gagal menyimpan refleksi' : 'Failed to save reflection'));
            }
        } catch (error) {
            setTodayData(todayData);
            toast.error(locale === 'id' ? 'Terjadi kesalahan' : 'An error occurred');
        }
    };

    if (isLoading) {
        return (
            <div className={cn("relative w-full", className)}>
                <div className={cn(
                    "relative border rounded-3xl p-4 sm:p-5 h-[90px] animate-pulse",
                    isDaylight ? "bg-white/50 border-slate-200" : "bg-white/5 border-white/5"
                )}>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 space-y-2">
                            <div className={cn("h-3 w-20 rounded-full", isDaylight ? "bg-slate-200" : "bg-white/10")} />
                            <div className={cn("h-4 w-32 rounded", isDaylight ? "bg-slate-200" : "bg-white/10")} />
                        </div>
                        <div className={cn("h-9 w-20 rounded-xl", isDaylight ? "bg-slate-200" : "bg-white/10")} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("relative w-full group", className)}>
            <div className={cn(
                "relative backdrop-blur-md rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-lg active:scale-[0.995] p-3.5 sm:p-4",
                isDaylight
                    ? "bg-white/60 border border-slate-200 shadow-sm"
                    : "bg-[rgb(var(--color-surface))]/20 border border-white/5"
            )}>
                <div className="flex flex-col gap-1.5">
                    {/* Compact Label and Date Selector */}
                    <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 opacity-40 grayscale group-hover:opacity-60 transition-opacity min-w-0">
                            <Compass className={cn("w-3 h-3 shrink-0", isDaylight ? "text-slate-900" : "text-white")} />
                            <span className={cn("text-[9px] font-bold uppercase tracking-tight truncate", isDaylight ? "text-slate-900" : "text-white")}>
                                {selectedDate === getTodayDateString()
                                    ? t.intention_widget_title
                                    : t.intention_widget_history_title}
                            </span>
                        </div>

                        {/* Date Selector */}
                        <div className="relative shrink-0">
                            <input
                                type="date"
                                value={selectedDate}
                                max={getTodayDateString()}
                                onChange={(e) => {
                                    if (e.target.value) {
                                        setSelectedDate(e.target.value);
                                    }
                                }}
                                className={cn(
                                    "text-[9px] font-bold uppercase cursor-pointer outline-none bg-transparent appearance-none text-right px-0 relative z-10 w-[72px] h-5",
                                    isDaylight
                                        ? "text-slate-400 hover:text-slate-600"
                                        : "text-white/40 hover:text-white/70",
                                    "flex-row-reverse"
                                )}
                                style={{ colorScheme: isDaylight ? 'light' : 'dark' }}
                            />
                        </div>
                    </div>

                    {!todayData?.has_intention ? (
                        <div className="flex items-center justify-between gap-3 mt-0.5">
                            <div className="flex-1 min-w-0">
                                <h3 className={cn("text-sm md:text-base font-bold tracking-tight leading-tight mb-0.5", isDaylight ? "text-slate-800" : "text-white")}>
                                    {t.intention_widget_subtitle}
                                </h3>
                                <p className={cn("text-[10px] line-clamp-1 italic font-serif leading-relaxed pr-2", isDaylight ? "text-slate-500" : "text-white/40")}>
                                    {t.intention_widget_quote}
                                </p>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                    onClick={() => setShowIntentionPrompt(true)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-md active:scale-95 transition-all flex items-center gap-1 group/btn",
                                        isDaylight
                                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20"
                                            : "bg-[rgb(var(--color-primary))] text-white font-bold hover:opacity-90 shadow-[rgb(var(--color-primary))]/20"
                                    )}
                                >
                                    <span>{t.intention_set_btn}</span>
                                    <ChevronRight className="w-3 h-3 opacity-80 group-hover/btn:translate-x-0.5 transition-transform" />
                                </button>
                                <button
                                    onClick={() => window.location.href = '/journal'}
                                    className={cn(
                                        "w-7 h-7 rounded-xl flex items-center justify-center transition-colors border",
                                        isDaylight
                                            ? "bg-slate-100 border-slate-200 hover:bg-slate-200"
                                            : "bg-white/5 border-white/10 hover:bg-white/10"
                                    )}
                                    title={t.intention_history_btn_title}
                                >
                                    <Book className={cn("w-3.5 h-3.5", isDaylight ? "text-slate-400" : "text-white/30")} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between gap-3 mt-0.5">
                            <div className="flex-1 min-w-0 flex items-center gap-2 group/text cursor-pointer" onClick={() => setShowIntentionPrompt(true)}>
                                <p className={cn("text-xs md:text-sm font-medium italic line-clamp-1 py-0.5", isDaylight ? "text-slate-700" : "text-white/90")}>
                                    "{todayData.intention.intention_text}"
                                </p>
                                <Edit2 className={cn("w-2.5 h-2.5 transition-colors shrink-0", isDaylight ? "text-slate-300 group-hover/text:text-slate-500" : "text-white/20 group-hover/text:text-white/60")} />
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                                {!todayData.has_reflection ? (
                                    <button
                                        onClick={() => setShowReflectionPrompt(true)}
                                        className={cn(
                                            "px-2.5 py-1.5 rounded-xl border transition-all flex items-center gap-1 active:scale-95",
                                            isDaylight
                                                ? "bg-slate-100 border-slate-200 hover:bg-slate-200"
                                                : "bg-white/5 border-white/10 hover:bg-white/10"
                                        )}
                                    >
                                        <Moon className={cn("w-3 h-3", isDaylight ? "text-blue-500" : "text-blue-400")} />
                                        <span className={cn("text-[9px] font-bold uppercase tracking-tight", isDaylight ? "text-slate-600" : "text-white/70")}>
                                            {t.intention_refleksi_btn}
                                        </span>
                                    </button>
                                ) : (
                                    <div
                                        onClick={() => setShowReflectionPrompt(true)}
                                        className={cn(
                                            "px-2.5 py-1.5 rounded-xl border flex items-center gap-1 opacity-80 hover:opacity-100 cursor-pointer transition-all",
                                            isDaylight
                                                ? "bg-emerald-50/50 border-emerald-500/20"
                                                : "bg-emerald-500/5 border-emerald-500/20"
                                        )}
                                    >
                                        <CheckCircle2 className={cn("w-3 h-3", isDaylight ? "text-emerald-600" : "text-emerald-500")} />
                                        <span className={cn("text-[9px] font-bold uppercase", isDaylight ? "text-emerald-600" : "text-emerald-500/80")}>
                                            {t.intention_selesai_label}
                                        </span>
                                    </div>
                                )}
                                <button
                                    onClick={() => window.location.href = '/journal'}
                                    className={cn(
                                        "w-7 h-7 rounded-xl flex items-center justify-center transition-colors border",
                                        isDaylight
                                            ? "bg-slate-100 border-slate-200 hover:bg-slate-200"
                                            : "bg-white/5 border-white/10 hover:bg-white/10"
                                    )}
                                >
                                    <Book className={cn("w-3.5 h-3.5", isDaylight ? "text-slate-400" : "text-white/30")} />
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
                        initialValue={todayData?.intention?.intention_text}
                        isBackdated={isBackdated}
                    />
                )}
                {showReflectionPrompt && todayData?.intention && (
                    <ReflectionPrompt
                        intentionText={todayData.intention.intention_text}
                        intentionId={todayData.intention.id}
                        onSubmit={handleReflect}
                        onSkip={() => setShowReflectionPrompt(false)}
                        initialValue={todayData?.reflection?.text}
                        initialRating={todayData?.reflection?.rating}
                        isBackdated={isBackdated}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
