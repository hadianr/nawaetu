"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, TrendingUp, Calendar, Flame, Trophy, Lock, Crown, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInfaq } from "@/context/InfaqContext";
import InfaqModal from "@/components/InfaqModal";
import { getWeeklyStats, getMonthlyStats, getDailyActivityHistory, generateMockData } from "@/lib/analytics-utils";
import { cn } from "@/lib/utils";

export default function StatsPage() {
    const { isMuhsinin } = useInfaq();
    const [showInfaqModal, setShowInfaqModal] = useState(false);
    const [weeklyStats, setWeeklyStats] = useState(getWeeklyStats());
    const [monthlyStats, setMonthlyStats] = useState(getMonthlyStats());
    const [history, setHistory] = useState(getDailyActivityHistory());

    useEffect(() => {
        // Generate mock data if empty (for demo purposes)
        if (history.length === 0) {
            generateMockData();
            setHistory(getDailyActivityHistory());
            setWeeklyStats(getWeeklyStats());
            setMonthlyStats(getMonthlyStats());
        }
    }, []);

    // Get last 30 days for chart
    const chartData = history.slice(-30);
    const maxXP = Math.max(...chartData.map((d) => d.xpGained), 100);

    return (
        <div className="min-h-screen bg-[rgb(var(--color-background))] text-white pb-20">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-b from-[rgb(var(--color-surface))] to-transparent backdrop-blur-xl border-b border-white/5">
                <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full text-white/70 hover:bg-white/10 hover:text-white">
                        <Link href="/">
                            <ChevronLeft className="h-6 w-6" />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold">Statistik Ibadah</h1>
                        <p className="text-xs text-white/60">Pantau perkembangan spiritualmu</p>
                    </div>
                    {isMuhsinin && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                            <Crown className="w-3 h-3 text-emerald-400" />
                            <span className="text-xs font-bold text-emerald-400">MUHSININ</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Content with Blur/Overlay for Coming Soon */}
            <div className="max-w-2xl mx-auto px-6 py-6 space-y-6 relative">
                {/* Coming Soon Overlay */}
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 text-center bg-black/40 backdrop-blur-md rounded-3xl mt-6 mx-6 h-[80vh]">
                    <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse border border-blue-500/30">
                        <BarChart3 className="w-10 h-10 text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-3">Fitur Sedang Dimatangkan ✨</h2>
                    <p className="text-sm text-slate-300 max-w-xs leading-relaxed">
                        Kami sedang menyempurnakan algoritma statistik agar jurnal ibadah Anda lebih akurat dan bermakna. Sabar ya, Kak!
                    </p>
                    <Button asChild className="mt-8 bg-white/10 hover:bg-white/20 text-white rounded-xl px-8">
                        <Link href="/">Kembali ke Beranda</Link>
                    </Button>
                </div>

                <div className="opacity-20 pointer-events-none grayscale">
                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Weekly XP */}
                        <div className={cn(
                            "p-4 rounded-2xl border relative overflow-hidden",
                            !isMuhsinin && "blur-sm"
                        )}>
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                                    <span className="text-xs text-white/60">7 Hari</span>
                                </div>
                                <div className="text-2xl font-black text-white">{weeklyStats.totalXP}</div>
                                <div className="text-[10px] text-white/60 mt-1">Total XP</div>
                            </div>
                        </div>

                        {/* Streak */}
                        <div className={cn(
                            "p-4 rounded-2xl border relative overflow-hidden",
                            !isMuhsinin && "blur-sm"
                        )}>
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Flame className="w-4 h-4 text-orange-400" />
                                    <span className="text-xs text-white/60">Streak</span>
                                </div>
                                <div className="text-2xl font-black text-white">{weeklyStats.streak}</div>
                                <div className="text-[10px] text-white/60 mt-1">Hari Berturut</div>
                            </div>
                        </div>

                        {/* Monthly Missions */}
                        <div className={cn(
                            "p-4 rounded-2xl border relative overflow-hidden",
                            !isMuhsinin && "blur-sm"
                        )}>
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="w-4 h-4 text-blue-400" />
                                    <span className="text-xs text-white/60">30 Hari</span>
                                </div>
                                <div className="text-2xl font-black text-white">{monthlyStats.totalMissions}</div>
                                <div className="text-[10px] text-white/60 mt-1">Misi Selesai</div>
                            </div>
                        </div>

                        {/* Consistency */}
                        <div className={cn(
                            "p-4 rounded-2xl border relative overflow-hidden",
                            !isMuhsinin && "blur-sm"
                        )}>
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Trophy className="w-4 h-4 text-violet-400" />
                                    <span className="text-xs text-white/60">Konsistensi</span>
                                </div>
                                <div className="text-2xl font-black text-white">{Math.round(monthlyStats.consistency)}%</div>
                                <div className="text-[10px] text-white/60 mt-1">Hari Aktif</div>
                            </div>
                        </div>
                    </div>

                    {/* XP Growth Chart */}
                    <div className={cn(
                        "relative p-5 rounded-2xl border border-white/10 bg-white/[0.02]",
                        !isMuhsinin && "overflow-hidden"
                    )}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                                <h2 className="font-bold">Grafik XP (30 Hari)</h2>
                            </div>
                        </div>

                        {/* Chart */}
                        <div className={cn("space-y-2", !isMuhsinin && "blur-md")}>
                            {chartData.slice(-14).map((day, i) => {
                                const percentage = (day.xpGained / maxXP) * 100;
                                const date = new Date(day.date);
                                const dayName = date.toLocaleDateString("id-ID", { weekday: "short" });

                                return (
                                    <div key={day.date} className="flex items-center gap-3">
                                        <span className="text-xs text-white/60 w-8">{dayName}</span>
                                        <div className="flex-1 h-8 bg-white/5 rounded-lg overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-primary-light))] transition-all duration-500"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-mono text-white/80 w-12 text-right">{day.xpGained}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Best Day */}
                    {isMuhsinin && monthlyStats.bestDay.xp > 0 && (
                        <div className="p-5 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-emerald-500/20 rounded-lg">
                                    <Trophy className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-amber-200 mb-1">Hari Terbaikmu</h3>
                                    <p className="text-sm text-amber-200/70">
                                        {new Date(monthlyStats.bestDay.date).toLocaleDateString("id-ID", {
                                            weekday: "long",
                                            day: "numeric",
                                            month: "long",
                                        })}
                                    </p>
                                    <p className="text-2xl font-black text-amber-400 mt-2">{monthlyStats.bestDay.xp} XP</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <InfaqModal isOpen={showInfaqModal} onClose={() => setShowInfaqModal(false)} />
        </div>
    );
}
