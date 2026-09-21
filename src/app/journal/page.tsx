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
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, Book, ScrollText, Star, Calendar } from "lucide-react";
import IntentionStreak from "@/components/intentions/IntentionStreak";
import { useLocale } from "@/context/LocaleContext";
import { cn } from "@/lib/utils";
import { AppIcon } from "@/components/ui/AppIcon";

interface Intention {
    id: string;
    intention_text: string;
    intention_date: string;
    reflection_text?: string;
    reflection_rating?: number;
    reflected_at?: string;
}

interface JournalStats {
    current_streak: number;
    longest_streak?: number;
    total_intentions: number;
    reflection_rate: number;
}

export default function JournalPage() {
    const { locale, t } = useLocale();

    const [intentions, setIntentions] = useState<Intention[]>([]);
    const [stats, setStats] = useState<JournalStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const fetchHistory = async (pageNum: number) => {
        try {
            // Unify token retrieval logic with IntentionJournalWidget
            const token = localStorage.getItem("user_token") ||
                localStorage.getItem("fcm_token") ||
                localStorage.getItem("nawaetu_anonymous_id");

            if (!token) {
                // Return empty if no token found (matches widget logic)
                setIsLoading(false);
                return;
            }

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
        } catch {
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        queueMicrotask(() => fetchHistory(0));
    }, []);

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchHistory(nextPage);
    };

    // Helper to format date
    const formatDate = (dateString: string) => {
        const d = new Date(dateString);
        const day = d.getDate();
        const monthNamesId = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
        const monthNamesEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = locale === 'id' ? monthNamesId[d.getMonth()] : monthNamesEn[d.getMonth()];
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');

        return `${day} ${month} ${year}, ${hours}.${minutes}`;
    };

    // Helper to format time only for reflections
    const formatTime = (dateString?: string) => {
        if (!dateString) return "";
        const d = new Date(dateString);
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${hours}.${minutes}`;
    };

    const getRatingIcon = (rating?: number) => {
        if (!rating) return "help" as const;
        const icons = ["warning", "help", "target", "heart-handshake", "sparkles"] as const;
        return icons[rating - 1] || "help";
    };

    // Helper to get rating label
    const getRatingLabel = (rating?: number) => {
        if (!rating) return "";
        const labels = [
            t.intention_rating_struggled,
            t.intention_rating_difficult,
            t.intention_rating_okay,
            t.intention_rating_good,
            t.intention_rating_excellent
        ];
        return labels[rating - 1] || "";
    };

    return (
        <div className="min-h-screen pb-20 bg-[rgb(var(--color-background))] text-[rgb(var(--color-text))]">
            {/* Header */}
            <div className="sticky top-0 z-10 backdrop-blur-md border-b bg-[rgb(var(--color-surface))]/95 border-[rgb(var(--color-border))]">
                <div className="w-full max-w-none mx-auto px-4 py-4 flex items-center justify-between xl:max-w-md">
                    <Link href="/" className="p-2 -ml-2 rounded-full transition-colors hover:bg-[rgb(var(--color-surface-subtle))]">
                        <ChevronLeft className="w-6 h-6 text-[rgb(var(--color-text-muted))]" />
                    </Link>
                    <h1 className="text-lg font-bold">{t.intention_journal_title}</h1>
                    <div className="w-10" /> {/* Spacer for balance */}
                </div>
            </div>

            <main className="w-full max-w-none mx-auto px-4 py-6 space-y-6 xl:max-w-md">

                {/* Stats Section */}
                {stats && (
                    <div className="space-y-4">
                        {/* 1. Primary Milestone Card (The Core) */}
                        <IntentionStreak
                            currentStreak={stats.current_streak}
                            longestStreak={stats.longest_streak || stats.current_streak}
                        />

                        {/* 2. Secondary Stats Grid */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-2xl border p-3 flex flex-col items-center justify-center text-center relative overflow-hidden group shadow-[var(--shadow-card)] bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))]">
                                <ScrollText className="w-4 h-4 mb-1 text-[rgb(var(--color-primary-light))]" />
                                <span className="text-lg font-bold mb-0.5 text-[rgb(var(--color-text-strong))]">{stats.total_intentions}</span>
                                <span className="text-[9px] uppercase tracking-wider font-bold text-[rgb(var(--color-text-muted))]">{t.intention_stat_total}</span>
                            </div>
                            <div className="rounded-2xl border p-3 flex flex-col items-center justify-center text-center relative overflow-hidden group shadow-[var(--shadow-card)] bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))]">
                                <Star className="w-4 h-4 mb-1 text-[rgb(var(--color-primary-light))]" />
                                <span className="text-lg font-bold mb-0.5 text-[rgb(var(--color-text-strong))]">{stats.reflection_rate}%</span>
                                <span className="text-[9px] uppercase tracking-wider font-bold text-[rgb(var(--color-text-muted))]">{t.intention_refleksi_btn}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Timeline */}
                <div className="space-y-4">
                    <h2 className="text-sm font-bold uppercase tracking-wider pl-1 text-[rgb(var(--color-text-muted))]">{t.intention_history_journey}</h2>

                    {isLoading && intentions.length === 0 ? (
                        // Loading Skeletons
                        [1, 2, 3].map((i) => (
                            <div key={i} className="h-32 w-full bg-[rgb(var(--color-surface-subtle))] rounded-2xl animate-pulse" />
                        ))
                    ) : intentions.length === 0 ? (
                        <div className="py-20 flex flex-col items-center justify-center text-center text-[rgb(var(--color-text-muted))]">
                            <Book className="w-16 h-16 mb-4 opacity-50" />
                            <p className="font-medium text-lg text-[rgb(var(--color-text))]">{t.intention_no_history_title}</p>
                            <p className="text-sm max-w-[250px]">{t.intention_no_history_desc}</p>
                            <Link href="/" className="mt-6 px-6 py-2 bg-[rgb(var(--color-surface-subtle))] hover:bg-[rgb(var(--color-surface))] rounded-full text-sm font-medium transition-colors">
                                {t.intention_start_now}
                            </Link>
                        </div>
                    ) : (
                        <div className="relative border-l ml-4 space-y-4 pl-8 py-2 border-[rgb(var(--color-border))]">
                            {intentions.map((intention, idx) => (
                                <motion.div
                                    key={intention.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="relative"
                                >
                                    {/* Timeline Dot */}
                                    <div className={cn(
                                        "absolute -left-[41px] top-4 w-5 h-5 rounded-full border-4 border-[rgb(var(--color-canvas))]",
                                        intention.reflected_at ? "bg-[rgb(var(--color-primary))]" : "bg-[rgb(var(--color-primary-light))]"
                                    )} />

                                    <div className="rounded-2xl border p-4 transition-colors group shadow-[var(--shadow-card)] bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-surface-subtle))]">
                                        {/* Date Header */}
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-1.5 text-[10px] text-[rgb(var(--color-text-muted))]">
                                                <Calendar className="w-3 h-3" />
                                                <span className="font-bold uppercase tracking-wider">{formatDate(intention.intention_date)}</span>
                                            </div>
                                            {intention.reflection_rating && (
                                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[rgb(var(--color-primary-light))]/20">
                                                    <AppIcon name={getRatingIcon(intention.reflection_rating)} size="sm" tone="primary" />
                                                    <span className={cn(
                                                        "text-[10px] font-bold uppercase",
                                                        intention.reflection_rating >= 4 ? "text-[rgb(var(--color-primary-strong))]" :
                                                            intention.reflection_rating === 3 ? "text-[rgb(var(--color-warning))]" : "text-[rgb(var(--color-danger))]"
                                                    )}>
                                                        {getRatingLabel(intention.reflection_rating)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Intention Content */}
                                        <div className="mb-3">
                                            <div className="flex gap-2.5">
                                                <div className="w-0.5 rounded-full shrink-0 bg-[rgb(var(--color-primary))]/60" />
                            <p className="text-[15px] italic leading-relaxed opacity-90 text-[rgb(var(--color-text-strong))]">&quot;{intention.intention_text}&quot;</p>
                                            </div>
                                        </div>

                                        {/* Reflection Content */}
                                        {intention.reflection_text && (
                                            <div className="rounded-xl p-3 border bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))]">
                                                <div className="flex items-start gap-2.5">
                                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-[rgb(var(--color-primary-light))]/20">
                                                        <AppIcon name="book-marked" size="xs" tone="primary" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <p className="text-[9px] font-bold uppercase tracking-widest text-[rgb(var(--color-text-muted))]">{t.intention_reflection_note}</p>
                                                            <p className="text-[9px] font-medium italic text-[rgb(var(--color-text-muted))]">{formatTime(intention.reflected_at)}</p>
                                                        </div>
                                                        <p className="text-sm leading-relaxed font-serif text-[rgb(var(--color-text))]">{intention.reflection_text}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {!intention.reflected_at && (
                                            <div className="mt-3 flex justify-end">
                                                <span className="text-[10px] italic text-[rgb(var(--color-text-muted))]">{t.intention_no_reflection}</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {hasMore && (
                                <button
                                    onClick={loadMore}
                                    className="w-full py-4 text-xs font-medium uppercase tracking-wider text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-strong))] bg-[rgb(var(--color-surface-subtle))] hover:bg-[rgb(var(--color-surface))] rounded-xl transition-all"
                                >
                                    {t.intention_load_more} {t.intention_history_btn_title}
                                </button>
                            )}
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}
