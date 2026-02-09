"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import IntentionPrompt from "./IntentionPrompt";
import ReflectionPrompt from "./ReflectionPrompt";
import IntentionStreak from "./IntentionStreak";
import IntentionHistory from "./IntentionHistory";
import { useLocale } from "@/context/LocaleContext";
import { INTENTION_TRANSLATIONS } from "@/data/intention-translations";

interface IntentionJournalWidgetProps {
    className?: string;
}

/**
 * Generate or retrieve anonymous user ID from localStorage
 * This allows users to use Intention Journal without enabling notifications
 */
function getOrCreateAnonymousId(): string {
    const STORAGE_KEY = "nawaetu_anonymous_id";

    let anonymousId = localStorage.getItem(STORAGE_KEY);

    if (!anonymousId) {
        // Generate unique ID: timestamp + random string
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
    const [showHistory, setShowHistory] = useState(false);
    const [todayData, setTodayData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState<string | null>(null);

    // Get user token (FCM token or anonymous ID)
    useEffect(() => {
        // Try FCM token first (for users with notifications enabled)
        let token = localStorage.getItem("fcm_token");

        // Fallback to anonymous ID (for users without notifications)
        if (!token) {
            token = getOrCreateAnonymousId();
        }

        setUserToken(token);
    }, []);

    // Check today's intention status
    useEffect(() => {
        if (!userToken) return;

        const checkTodayStatus = async () => {
            try {
                const response = await fetch(`/api/intentions/today?user_token=${userToken}`);
                const data = await response.json();

                if (data.success) {
                    setTodayData(data.data);

                    // Show prompts based on time and status
                    const hour = new Date().getHours();

                    // Morning (5 AM - 11 AM): Show intention prompt if not set
                    if (hour >= 5 && hour < 11 && !data.data.has_intention) {
                        setShowIntentionPrompt(true);
                    }

                    // Evening (6 PM - 10 PM): Show reflection prompt if intention set but not reflected
                    if (hour >= 18 && hour < 22 && data.data.has_intention && !data.data.has_reflection) {
                        setShowReflectionPrompt(true);
                    }
                }
            } catch (error) {
                console.error("Error checking today's intention:", error);
            } finally {
                setIsLoading(false);
            }
        };

        checkTodayStatus();
    }, [userToken]);

    const handleSetIntention = async (niatText: string) => {
        if (!userToken) {
            alert("Unable to save intention. Please try again.");
            return;
        }

        try {
            const response = await fetch("/api/intentions/daily", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_token: userToken,
                    niat_text: niatText,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setTodayData({
                    has_intention: true,
                    intention: {
                        id: data.data.id,
                        niat_text: data.data.niat_text,
                        niat_date: data.data.niat_date,
                    },
                    has_reflection: false,
                    streak: data.data.current_streak,
                });
                setShowIntentionPrompt(false);
            } else {
                alert(data.error || "Failed to set intention");
            }
        } catch (error) {
            console.error("Error setting intention:", error);
            alert("Failed to set intention. Please try again.");
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
                    reflection: {
                        rating: data.data.reflection_rating,
                        text: data.data.reflection_text,
                        reflected_at: data.data.reflected_at,
                    },
                });
                setShowReflectionPrompt(false);
            } else {
                alert(data.error || "Failed to save reflection");
            }
        } catch (error) {
            console.error("Error saving reflection:", error);
            alert("Failed to save reflection. Please try again.");
        }
    };

    if (isLoading) {
        return (
            <div className="w-full h-32 bg-black/20 backdrop-blur-md border border-white/10 rounded-3xl animate-pulse" />
        );
    }

    return (
        <div className={`space-y-3 ${className}`}>
            {/* Streak Widget - Always visible if user has set at least one intention */}
            {todayData && todayData.streak > 0 && (
                <div onClick={() => setShowHistory(true)} className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]">
                    <IntentionStreak
                        currentStreak={todayData.streak}
                        longestStreak={todayData.streak}
                    />
                </div>
            )}

            {/* Intention Prompt Modal */}
            <AnimatePresence>
                {showIntentionPrompt && (
                    <IntentionPrompt
                        onSubmit={handleSetIntention}
                        currentStreak={todayData?.streak || 0}
                        onClose={() => setShowIntentionPrompt(false)}
                    />
                )}
            </AnimatePresence>

            {/* Reflection Prompt Modal */}
            <AnimatePresence>
                {showReflectionPrompt && todayData?.intention && (
                    <ReflectionPrompt
                        intentionText={todayData.intention.niat_text}
                        intentionId={todayData.intention.id}
                        onSubmit={handleReflect}
                        onSkip={() => setShowReflectionPrompt(false)}
                    />
                )}
            </AnimatePresence>

            {/* History Modal */}
            <AnimatePresence>
                {showHistory && (
                    <IntentionHistory onClose={() => setShowHistory(false)} />
                )}
            </AnimatePresence>

            {/* Manual Trigger Button - Show if user hasn't set intention today */}
            {!todayData?.has_intention && (
                <button
                    onClick={() => setShowIntentionPrompt(true)}
                    className="w-full py-4 px-5 rounded-3xl bg-black/20 backdrop-blur-md border border-white/10 hover:bg-black/30 hover:border-white/20 transition-all shadow-lg group"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[rgb(var(--color-primary))]/20 to-[rgb(var(--color-primary-dark))]/20 border border-[rgb(var(--color-primary))]/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            🎯
                        </div>
                        <div className="flex-1 text-left">
                            <div className="text-white font-bold text-sm">{t.set_niat_today}</div>
                            <div className="text-white/50 text-xs">{t.start_pure}</div>
                        </div>
                        <svg className="w-5 h-5 text-white/40 group-hover:text-white/60 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </button>
            )}

            {/* Today's Intention Display - Show if set */}
            {todayData?.has_intention && (
                <div className="w-full rounded-3xl bg-black/20 backdrop-blur-md border border-white/10 p-5 shadow-lg">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[rgb(var(--color-primary))]/20 border border-[rgb(var(--color-primary))]/30 flex items-center justify-center text-xl flex-shrink-0">
                            ✅
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[rgb(var(--color-primary))] mb-1">
                                {t.todays_niat}
                            </p>
                            <p className="text-white text-sm italic break-words leading-relaxed">
                                "{todayData.intention.niat_text}"
                            </p>
                            {!todayData.has_reflection && (
                                <button
                                    onClick={() => setShowReflectionPrompt(true)}
                                    className="mt-3 text-xs text-white/60 hover:text-white flex items-center gap-1 transition-colors"
                                >
                                    <span>🌙</span>
                                    {t.add_reflection}
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
