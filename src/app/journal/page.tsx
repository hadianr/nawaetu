"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, Book, Flame, ScrollText, Star, Calendar } from "lucide-react";
import IntentionStreak from "@/components/intentions/IntentionStreak";
import { useLocale } from "@/context/LocaleContext";
import { INTENTION_TRANSLATIONS } from "@/data/intention-translations";
import { cn } from "@/lib/utils";

interface Intention {
    id: string;
    niat_text: string;
    niat_date: string;
    reflection_text?: string;
    reflection_rating?: number;
    reflected_at?: string;
}

export default function JournalPage() {
    const { locale } = useLocale();
    const t = INTENTION_TRANSLATIONS[locale as keyof typeof INTENTION_TRANSLATIONS] || INTENTION_TRANSLATIONS.id;

    const [intentions, setIntentions] = useState<Intention[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const fetchHistory = async (pageNum: number) => {
        try {
            // Unify token retrieval logic with IntentionJournalWidget
            let token = localStorage.getItem("user_token") ||
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
        } catch (error) {
            console.error("Error fetching history:", error);
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
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
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

    // Helper to get rating label
    const getRatingLabel = (rating?: number) => {
        if (!rating) return "";
        const labels = [
            t.rating_struggled,
            t.rating_difficult,
            t.rating_okay,
            t.rating_good,
            t.rating_excellent
        ];
        return labels[rating - 1] || "";
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white pb-20">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors">
                        <ChevronLeft className="w-6 h-6 text-white/80" />
                    </Link>
                    <h1 className="text-lg font-bold">Jurnal Niat</h1>
                    <div className="w-10" /> {/* Spacer for balance */}
                </div>
            </div>

            <main className="max-w-md mx-auto px-4 py-6 space-y-6">

                {/* Stats Section */}
                {stats && (
                    <div className="space-y-4">
                        {/* 1. Primary Milestone Card (The Core) */}
                        <IntentionStreak
                            currentStreak={stats.current_streak}
                            longestStreak={stats.longest_streak || stats.current_streak}
                        />

                        {/* 2. Secondary Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                                <ScrollText className="w-5 h-5 text-blue-500/60 mb-2" />
                                <span className="text-xl font-bold text-white mb-0.5">{stats.total_intentions}</span>
                                <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Total Niat</span>
                            </div>
                            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                                <Star className="w-5 h-5 text-emerald-500/60 mb-2" />
                                <span className="text-xl font-bold text-white mb-0.5">{stats.reflection_rate}%</span>
                                <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Refleksi</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Timeline */}
                <div className="space-y-4">
                    <h2 className="text-sm font-bold text-white/50 uppercase tracking-wider pl-1">Riwayat Perjalanan</h2>

                    {isLoading && intentions.length === 0 ? (
                        // Loading Skeletons
                        [1, 2, 3].map((i) => (
                            <div key={i} className="h-32 w-full bg-white/5 rounded-2xl animate-pulse" />
                        ))
                    ) : intentions.length === 0 ? (
                        <div className="py-20 flex flex-col items-center justify-center text-center text-white/40">
                            <Book className="w-16 h-16 mb-4 opacity-50" />
                            <p className="font-medium text-lg text-white/70">{t.no_history_title}</p>
                            <p className="text-sm max-w-[250px]">{t.no_history_desc}</p>
                            <Link href="/" className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-colors">
                                Mulai Sekarang
                            </Link>
                        </div>
                    ) : (
                        <div className="relative border-l border-white/10 ml-4 space-y-8 pl-8 py-2">
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
                                        "absolute -left-[41px] top-0 w-5 h-5 rounded-full border-4 border-[#0f172a]",
                                        intention.reflected_at ? "bg-emerald-500" : "bg-blue-500"
                                    )} />

                                    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.05] transition-colors group">
                                        {/* Date Header */}
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2 text-white/60 text-xs">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span className="font-medium">{formatDate(intention.niat_date)}</span>
                                            </div>
                                            {intention.reflection_rating && (
                                                <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg">
                                                    <span className="text-sm">{getRatingEmoji(intention.reflection_rating)}</span>
                                                    <span className={cn(
                                                        "text-[10px] font-bold uppercase",
                                                        intention.reflection_rating >= 4 ? "text-emerald-400" :
                                                            intention.reflection_rating === 3 ? "text-yellow-400" : "text-red-400"
                                                    )}>
                                                        {getRatingLabel(intention.reflection_rating)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Intention Content */}
                                        <div className="mb-4">
                                            <div className="flex gap-3">
                                                <div className="w-1 bg-blue-500/30 rounded-full shrink-0" />
                                                <p className="text-white text-base italic leading-relaxed opacity-90">"{intention.niat_text}"</p>
                                            </div>
                                        </div>

                                        {/* Reflection Content */}
                                        {intention.reflection_text && (
                                            <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                                                <div className="flex items-start gap-2.5">
                                                    <span className="text-lg leading-none mt-0.5">💭</span>
                                                    <div>
                                                        <p className="text-xs font-bold text-white/40 uppercase mb-1">Catatan Refleksi</p>
                                                        <p className="text-sm text-white/80 leading-relaxed">{intention.reflection_text}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {!intention.reflected_at && (
                                            <div className="mt-3 flex justify-end">
                                                <span className="text-[10px] text-white/30 italic">Belum ada refleksi</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {hasMore && (
                                <button
                                    onClick={loadMore}
                                    className="w-full py-4 text-xs font-medium uppercase tracking-wider text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                                >
                                    {t.load_more} History
                                </button>
                            )}
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}
