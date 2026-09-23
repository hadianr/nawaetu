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

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ChevronRight, Book, CheckCircle2, Moon, Compass, Edit2, Calendar } from "lucide-react";
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

import { addHasanah } from "@/lib/habits/leveling";
import { DateUtils } from "@/lib/utils/date";

interface IntentionJournalWidgetProps {
    className?: string;
}

interface IntentionData {
    has_intention: boolean;
    has_reflection: boolean;
    streak: number;
    intention?: { id: string; intention_text: string; intention_date: string };
    reflection?: { rating: number; text?: string; reflected_at?: string };
}

function getOrCreateAnonymousId(): string {
    const STORAGE_KEY = "nawaetu_anonymous_id";
    let anonymousId = null;
    try {
        if (typeof window !== "undefined") {
            anonymousId = window.localStorage.getItem(STORAGE_KEY);
            if (!anonymousId) {
                anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
                window.localStorage.setItem(STORAGE_KEY, anonymousId);
            }
        }
    } catch {
        console.warn("localStorage denied in getOrCreateAnonymousId");
        anonymousId = `anon_mem_${Date.now()}`;
    }
    return anonymousId || "";
}

const CACHE_PREFIX = "nawaetu_intention_cache_";

export default function IntentionJournalWidget({ className = "" }: IntentionJournalWidgetProps) {
    const { locale, t } = useLocale();

    const [showIntentionPrompt, setShowIntentionPrompt] = useState(false);
    const [showReflectionPrompt, setShowReflectionPrompt] = useState(false);

    // Add selectedDate state
    const [selectedDate, setSelectedDate] = useState<string>(DateUtils.today());
    const dateInputRef = useRef<HTMLInputElement>(null);

    const isBackdated = selectedDate !== DateUtils.today();

    // Default structure to avoid layout/hydration shifts when caching kicks in
    const [todayData, setTodayData] = useState<IntentionData | null>(null);

    // Only show loading if we really have no cached data at all on first paint
    const [isLoading, setIsLoading] = useState(true);
    const [userToken] = useState<string | null>(() => {
        if (typeof window === "undefined") return null;
        try {
            return window.localStorage.getItem("user_token")
                || window.localStorage.getItem("fcm_token")
                || getOrCreateAnonymousId();
        } catch {
            return "anon_fallback";
        }
    });

    // 1. Initialize Token & Try reading cache synchronously (or fast mount)
    useEffect(() => {
        if (!userToken) return;

        let cachedStr: string | null = null;
        try {
            const cacheKey = `${CACHE_PREFIX}${userToken}_${selectedDate}`;
            cachedStr = window.localStorage.getItem(cacheKey);
        } catch {
            console.warn("localStorage read denied in IntentionJournalWidget");
        }

        if (cachedStr) {
            try {
                const cachedData = JSON.parse(cachedStr) as IntentionData;
                queueMicrotask(() => {
                    setTodayData(cachedData);
                    setIsLoading(false);
                });
            } catch {
                // Ignore parsing errors
                queueMicrotask(() => setIsLoading(true));
            }
        } else {
            // Need to show loading if cache misses when date changes
            queueMicrotask(() => setIsLoading(true));
        }
    }, [selectedDate, userToken]);

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
                        try {
                            const cacheKey = `${CACHE_PREFIX}${userToken}_${selectedDate}`;
                            window.localStorage.setItem(cacheKey, JSON.stringify(data.data));
                        } catch {
                            // ignore storage errors
                        }
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
                try {
                    const cacheKey = `${CACHE_PREFIX}${userToken}_${selectedDate}`;
                    window.localStorage.setItem(cacheKey, JSON.stringify(finalData));
                } catch { }

                // Add XP locally
                if (data.data.intention_points_earned > 0) {
                    addHasanah(data.data.intention_points_earned, selectedDate);
                }
            } else {
                // Revert if failed
                setTodayData(todayData);
                setShowIntentionPrompt(true); // Bring form back
                toast.error(data.error || (locale === 'id' ? 'Gagal menyimpan niat' : 'Failed to save intention'));
            }
        } catch {
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
            const todayStr = DateUtils.today();
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
                addHasanah(xpAmount, selectedDate);
                window.dispatchEvent(new CustomEvent("hasanah_updated"));

                // Update Cache
                try {
                    const cacheKey = `${CACHE_PREFIX}${userToken}_${selectedDate}`;
                    window.localStorage.setItem(cacheKey, JSON.stringify(finalData));
                } catch { }
            } else {
                setTodayData(todayData);
                toast.error(data.error || (locale === 'id' ? 'Gagal menyimpan refleksi' : 'Failed to save reflection'));
            }
        } catch {
            setTodayData(todayData);
            toast.error(locale === 'id' ? 'Terjadi kesalahan' : 'An error occurred');
        }
    };

    if (isLoading) {
        return (
            <div className={cn("relative w-full", className)}>
                <div className={cn(
                    "relative h-20 rounded-3xl border p-3 animate-pulse",
                    "bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))]"
                )}>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 space-y-2">
                            <div className="h-3 w-20 rounded-full bg-[rgb(var(--color-border))]" />
                            <div className="h-4 w-32 rounded bg-[rgb(var(--color-border))]" />
                        </div>
                        <div className="h-9 w-20 rounded-xl bg-[rgb(var(--color-border))]" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("relative w-full group", className)}>
            <div className={cn(
                "glass-surface relative overflow-hidden rounded-3xl p-3 transition-all duration-300 hover:shadow-lg sm:p-4",
                "border shadow-[var(--shadow-card)]"
            )}>
                <div className="flex flex-col gap-2">
                    {/* Compact Label and Date Selector */}
                    <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 text-[rgb(var(--color-text-muted))] grayscale transition-colors group-hover:text-[rgb(var(--color-text))] min-w-0">
                            <Compass className="w-3 h-3 shrink-0 text-[rgb(var(--color-text-strong))]" />
                            <span className="text-[9px] font-bold uppercase tracking-tight truncate text-[rgb(var(--color-text-strong))]">
                                {selectedDate === DateUtils.today()
                                    ? t.intention_widget_title
                                    : t.intention_widget_history_title}
                            </span>
                        </div>

                        {/* Date Selector */}
                        <label
                            htmlFor="intention-date"
                            onClick={() => {
                                try {
                                    dateInputRef.current?.showPicker();
                                } catch {
                                    dateInputRef.current?.focus();
                                }
                            }}
                            className="relative shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-[rgb(var(--color-primary))]/10 transition-colors cursor-pointer group/date"
                        >
                            <Calendar className="w-3 h-3 transition-colors text-[rgb(var(--color-text-muted))] group-hover/date:text-[rgb(var(--color-text))]" />
                            <span className="text-[9px] font-bold uppercase transition-colors text-[rgb(var(--color-text-muted))] group-hover/date:text-[rgb(var(--color-text))]">
                                {new Date(selectedDate).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </span>
                            <input
                                id="intention-date"
                                ref={dateInputRef}
                                type="date"
                                value={selectedDate}
                                max={new Date().toLocaleDateString('en-CA')} // Strict YYYY-MM-DD format for native mobile picker
                                onChange={(e) => {
                                    if (e.target.value) {
                                        if (e.target.value > new Date().toLocaleDateString('en-CA')) {
                                            toast.error(locale === 'id' ? 'Tidak bisa memilih tanggal di masa depan' : 'Cannot select future dates');
                                            return;
                                        }
                                        setSelectedDate(e.target.value);
                                    }
                                }}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                            />
                        </label>
                    </div>

                    {!todayData?.has_intention ? (
                        <div className="flex flex-col gap-2">
                            <div className="min-w-0">
                                <h2 className="text-sm font-bold leading-tight tracking-tight text-[rgb(var(--color-text-strong))]">
                                    {t.intention_widget_subtitle}
                                </h2>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowIntentionPrompt(true)}
                                    className={cn(
                                        "flex min-h-11 flex-1 items-center justify-center gap-1 rounded-xl px-4 py-2 text-xs font-bold shadow-md transition-all active:scale-95 group/btn sm:flex-none",
                                        "bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))] border border-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-light))] shadow-[var(--shadow-card)]"
                                    )}
                                >
                                    <span>{t.intention_set_btn}</span>
                                    <ChevronRight className="w-3 h-3 opacity-80 group-hover/btn:translate-x-0.5 transition-transform" />
                                </button>
                                <Link
                                    href="/journal"
                                    className={cn(
                                        "flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))] sm:flex-none",
                                        "bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))] text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-primary))]/10"
                                    )}
                                >
                                    <Book className="h-4 w-4 text-[rgb(var(--color-primary-strong))]" />
                                    <span>{t.intention_history_btn_title}</span>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <button type="button" className="flex min-w-0 items-center gap-2 text-left group/text" onClick={() => setShowIntentionPrompt(true)}>
                                <p className="text-xs md:text-sm font-medium italic line-clamp-1 py-0.5 text-[rgb(var(--color-text))]">
                                    &quot;{todayData.intention?.intention_text}&quot;
                                </p>
                                <Edit2 className="w-2.5 h-2.5 transition-colors shrink-0 text-[rgb(var(--color-text-muted))] group-hover/text:text-[rgb(var(--color-text))]" />
                            </button>

                            <div className="flex flex-wrap items-center gap-2">
                                {!todayData.has_reflection ? (
                                    <button
                                        type="button"
                                        onClick={() => setShowReflectionPrompt(true)}
                                        className={cn(
                                            "flex min-h-11 flex-1 items-center justify-center gap-1 rounded-xl border px-4 py-2 transition-all active:scale-95 sm:flex-none",
                                            "bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-primary))]/10"
                                        )}
                                    >
                                        <Moon className="w-3 h-3 text-[rgb(var(--color-primary))]" />
                                        <span className="text-[9px] font-bold uppercase tracking-tight text-[rgb(var(--color-text))]">
                                            {t.intention_refleksi_btn}
                                        </span>
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setShowReflectionPrompt(true)}
                                        className={cn(
                                            "flex min-h-11 flex-1 items-center justify-center gap-1 rounded-xl border px-4 py-2 opacity-80 transition-all hover:opacity-100 sm:flex-none",
                                            "bg-[rgb(var(--color-success))]/10 border-[rgb(var(--color-success))]/20"
                                        )}
                                    >
                                        <CheckCircle2 className="w-3 h-3 text-[rgb(var(--color-success))]" />
                                        <span className="text-[9px] font-bold uppercase text-[rgb(var(--color-success))]">
                                            {t.intention_selesai_label}
                                        </span>
                                    </button>
                                )}
                                <Link
                                    href="/journal"
                                    className={cn(
                                        "flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))] sm:flex-none",
                                        "bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))] text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-primary))]/10"
                                    )}
                                >
                                    <Book className="h-4 w-4 text-[rgb(var(--color-primary-strong))]" />
                                    <span>{t.intention_history_btn_title}</span>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <>
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
            </>
        </div>
    );
}
