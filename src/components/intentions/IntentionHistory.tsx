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
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useLocale } from "@/context/LocaleContext";

interface Intention {
    id: string;
    niat_text: string;
    niat_date: string;
    reflection_text?: string;
    reflection_rating?: number;
    reflected_at?: string;
}

interface IntentionHistoryProps {
    onClose: () => void;
}

export default function IntentionHistory({ onClose }: IntentionHistoryProps) {
    const { locale, t } = useLocale();

    const [intentions, setIntentions] = useState<Intention[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const fetchHistory = async (pageNum: number) => {
        try {
            // Get user token (FCM or anonymous)
            let token = localStorage.getItem("fcm_token");
            if (!token) token = localStorage.getItem("nawaetu_anonymous_id");

            if (!token) return;

            const response = await fetch(
                `/api/intentions/history?user_token=${token}&limit=20&offset=${pageNum * 20}`
            );
            const data = await response.json();

            if (data.success) {
                if (pageNum === 0) {
                    setIntentions(data.data.intentions);
                    setStats(data.data.stats);
                } else {
                    setIntentions((prev) => [...prev, ...data.data.intentions]);
                }
                setHasMore(data.data.pagination.has_more);
            }
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory(0);
    }, []);

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchHistory(nextPage);
    };

    // Helper to format date
    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        };
        // Use current locale for date formatting
        return new Date(dateString).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', options);
    };

    // Helper to get rating emoji
    const getRatingEmoji = (rating?: number) => {
        if (!rating) return "😶";
        const emojis = ["😔", "😕", "😐", "😊", "🤩"];
        return emojis[rating - 1] || "😶";
    };

    const content = (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={onClose}
            />

            <motion.div
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-lg h-[90vh] sm:h-[85vh] flex flex-col bg-[#0f172a] border-t sm:border border-white/10 rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden z-[101]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Drag Handle for mobile */}
                <div className="w-full flex justify-center pt-3 pb-1 sm:hidden" onClick={onClose}>
                    <div className="w-16 h-1.5 bg-white/20 rounded-full" />
                </div>

                {/* Header */}
                <div className="relative px-6 py-4 border-b border-white/5 shrink-0 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{t.niat_history_title}</h2>
                        <p className="text-xs text-white/50">{t.niat_history_subtitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
                    >
                        ✕
                    </button>
                </div>

                {/* Stats Grid */}
                {stats && (
                    <div className="px-6 py-4 grid grid-cols-3 gap-3 shrink-0">
                        <div className="bg-white/5 rounded-2xl p-3 border border-white/5 text-center">
                            <div className="text-xl mb-1">🔥</div>
                            <div className="text-lg font-bold text-white">{stats.current_streak}</div>
                            <div className="text-[10px] font-medium text-white/40 uppercase tracking-wider">{t.niat_stat_streak}</div>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-3 border border-white/5 text-center">
                            <div className="text-xl mb-1">📝</div>
                            <div className="text-lg font-bold text-white">{stats.total_intentions}</div>
                            <div className="text-[10px] font-medium text-white/40 uppercase tracking-wider">{t.niat_stat_total}</div>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-3 border border-white/5 text-center">
                            <div className="text-xl mb-1">✨</div>
                            <div className="text-lg font-bold text-white">{stats.reflection_rate}%</div>
                            <div className="text-[10px] font-medium text-white/40 uppercase tracking-wider">{t.niat_stat_reflected}</div>
                        </div>
                    </div>
                )}

                {/* List Content */}
                <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3 custom-scrollbar">
                    {isLoading && intentions.length === 0 ? (
                        // Loading Skeletons
                        [1, 2, 3].map((i) => (
                            <div key={i} className="h-28 w-full bg-white/5 rounded-2xl animate-pulse" />
                        ))
                    ) : intentions.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 text-white/40">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-4xl mb-4">📭</div>
                            <p className="font-medium text-white/70">{t.niat_no_history_title}</p>
                            <p className="text-sm">{t.niat_no_history_desc}</p>
                        </div>
                    ) : (
                        <>
                            {intentions.map((intention, idx) => (
                                <motion.div
                                    key={intention.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 hover:bg-white/[0.05] transition-colors group"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 px-2 py-1 rounded-lg text-white/70">
                                                {formatDate(intention.niat_date)}
                                            </span>
                                            {intention.reflected_at && (
                                                <span className="text-[10px] font-bold uppercase tracking-wider bg-[rgb(var(--color-primary))]/20 text-[rgb(var(--color-primary-light))] px-2 py-1 rounded-lg border border-[rgb(var(--color-primary))]/20">
                                                    {t.niat_reflection_done}
                                                </span>
                                            )}
                                        </div>
                                        {intention.reflection_rating && (
                                            <div className="text-xl bg-black/20 w-8 h-8 rounded-full flex items-center justify-center" title={`Rating: ${intention.reflection_rating}/5`}>
                                                {getRatingEmoji(intention.reflection_rating)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="w-1 bg-white/10 rounded-full shrink-0 group-hover:bg-[rgb(var(--color-primary))]/50 transition-colors" />
                                        <div className="flex-1">
                                            <p className="text-white text-sm italic mb-3 leading-relaxed opacity-90">"{intention.niat_text}"</p>

                                            {intention.reflection_text && (
                                                <div className="pt-3 border-t border-white/5 text-xs text-white/50 flex gap-2">
                                                    <span className="opacity-70">💭</span>
                                                    <span>{intention.reflection_text}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {hasMore && (
                                <button
                                    onClick={loadMore}
                                    className="w-full py-3 mt-2 text-xs font-medium uppercase tracking-wider text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                                >
                                    {t.niat_load_more}
                                </button>
                            )}

                            <div className="h-6" /> {/* Bottom spacer */}
                        </>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );

    return mounted ? createPortal(content, document.body) : null;
}
