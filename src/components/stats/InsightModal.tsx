'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Flame,
    ZapIcon,
    Target,
    BookOpen,
    Award,
    TrendingUp,
    Calendar,
    MessageSquare
} from "lucide-react";
import { InsightKey, DailyActivity } from "@/hooks/useStatsInsights";

interface InsightModalProps {
    activeInsight: InsightKey | null;
    setActiveInsight: (val: InsightKey | null) => void;
    t: any;
    data: {
        streakData: { currentStreak: number; longestStreak: number };
        recentPrayerCount: number;
        primaryPrayer: string;
        sunnahTotal: number;
        weeklyXP: number;
        avgDailyXp: number;
        powerDayName: string;
        consistency: number;
        totalQuranAyat: number;
        nextQuranMilestone: number;
        history: DailyActivity[];
    };
}

export function InsightModal({
    activeInsight,
    setActiveInsight,
    t,
    data
}: InsightModalProps) {
    if (!activeInsight) return null;

    return (
        <Dialog open={!!activeInsight} onOpenChange={(open) => !open && setActiveInsight(null)}>
            <DialogContent showCloseButton={false} className="bg-[#0A0A0B]/95 border-white/5 backdrop-blur-2xl p-0 overflow-hidden max-w-[360px] rounded-[32px]">
                <div className="relative p-6">
                    <DialogHeader className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
                                {activeInsight === 'streak' && <Flame className="w-5 h-5 text-orange-400" />}
                                {activeInsight === 'prayers' && <span className="text-xl">🕌</span>}
                                {activeInsight === 'xp' && <ZapIcon className="w-5 h-5 text-yellow-400" />}
                                {activeInsight === 'consistency' && <Target className="w-5 h-5 text-violet-400" />}
                                {activeInsight === 'quran' && <BookOpen className="w-5 h-5 text-blue-400" />}
                                {activeInsight === 'dhikr' && <span className="text-xl">📿</span>}
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-black text-white">
                                    {t.stats.insights[activeInsight].title}
                                </DialogTitle>
                                <DialogDescription className="text-xs text-white/50 leading-relaxed mt-1">
                                    {t.stats.insights[activeInsight].desc}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-4">
                        {activeInsight === 'streak' && (
                            <>
                                <InsightRow label={t.stats.insights.streak.current} value={data.streakData.currentStreak.toString()} icon={<Flame className="w-3.5 h-3.5 text-orange-400" />} />
                                <InsightRow label={t.stats.insights.streak.longest} value={data.streakData.longestStreak.toString()} icon={<Award className="w-3.5 h-3.5 text-yellow-400" />} />
                                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
                                        <p className="text-[10px] font-bold text-orange-400 uppercase">{t.stats.insights.streak.status}</p>
                                    </div>
                                    <p className="text-xs text-white/90 font-medium leading-relaxed">
                                        {data.streakData.currentStreak >= 40
                                            ? t.stats.insights.streak.successDesc
                                            : t.stats.insights.streak.progressDesc?.replace('{{needed}}', (40 - data.streakData.currentStreak).toString())
                                        }
                                    </p>
                                </div>
                            </>
                        )}

                        {activeInsight === 'prayers' && (
                            <>
                                <InsightRow label={t.stats.insights.prayers.fardu} value={data.recentPrayerCount.toString()} icon={<span className="text-sm">🕌</span>} />
                                <InsightRow label={t.stats.insights.prayers.sunnah} value={data.sunnahTotal.toString()} icon={<span className="text-sm">✨</span>} />
                                <div className="p-4 bg-[rgb(var(--color-primary))]/10 border border-[rgb(var(--color-primary))]/20 rounded-2xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MessageSquare className="w-3.5 h-3.5 text-[rgb(var(--color-primary-light))]" />
                                        <p className="text-[10px] font-bold text-[rgb(var(--color-primary-light))] uppercase">{t.stats.insights.prayers.insightTitle}</p>
                                    </div>
                                    {data.primaryPrayer ? (
                                        <>
                                            <p className="text-xs text-white/90 italic mb-2">
                                                &quot;{t.stats.insights.prayers.mostConsistentMsg?.replace('{{prayer}}', data.primaryPrayer) || `${t.stats.insights.prayers.mostConsistent} ${data.primaryPrayer}.`}&quot;
                                            </p>
                                            <p className="text-[10px] text-white/50">
                                                {data.sunnahTotal > 0
                                                    ? t.stats.insights.prayers.sunnahDone?.replace('{{count}}', data.sunnahTotal.toString())
                                                    : t.stats.insights.prayers.sunnahNone
                                                }
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-xs text-white/40 italic">{t.stats.insights.prayers.noData}</p>
                                    )}
                                </div>
                            </>
                        )}

                        {activeInsight === 'xp' && (
                            <>
                                <InsightRow label={t.stats.insights.xp.weekly} value={data.weeklyXP.toLocaleString()} icon={<ZapIcon className="w-3.5 h-3.5 text-yellow-400" />} />
                                <InsightRow label={t.stats.insights.xp.avgDaily} value={data.avgDailyXp.toLocaleString()} icon={<Calendar className="w-3.5 h-3.5 text-blue-400" />} />
                                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-3.5 h-3.5 text-yellow-400" />
                                        <p className="text-[10px] font-bold text-yellow-400 uppercase">{t.stats.insights.xp.insightTitle}</p>
                                    </div>
                                    <p className="text-xs text-white/90">
                                        {data.powerDayName
                                            ? t.stats.insights.xp.powerDayDesc?.replace('{{day}}', data.powerDayName)
                                            : t.stats.insights.xp.noData
                                        }
                                    </p>
                                </div>
                            </>
                        )}

                        {activeInsight === 'consistency' && (
                            <>
                                <InsightRow label={t.stats.insights.consistency.rate} value={`${data.consistency}%`} icon={<Target className="w-3.5 h-3.5 text-violet-400" />} />
                                <div className="p-4 bg-violet-500/10 border border-violet-500/20 rounded-2xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-3.5 h-3.5 text-violet-400" />
                                        <p className="text-[10px] font-bold text-violet-400 uppercase">
                                            {data.consistency > 80 ? t.stats.insights.consistency.highTitle : t.stats.insights.consistency.tipTitle || "Tips Disiplin"}
                                        </p>
                                    </div>
                                    <p className="text-xs text-white/90">
                                        {data.consistency > 80
                                            ? t.stats.insights.consistency.highDesc
                                            : t.stats.insights.consistency.tipDesc || t.stats.insights.consistency.lowDesc
                                        }
                                    </p>
                                </div>
                            </>
                        )}

                        {activeInsight === 'quran' && (
                            <>
                                <InsightRow label={t.stats.insights.quran.totalRead} value={data.totalQuranAyat.toLocaleString()} icon={<BookOpen className="w-3.5 h-3.5 text-blue-400" />} />
                                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Award className="w-3.5 h-3.5 text-blue-400" />
                                        <p className="text-[10px] font-bold text-blue-400 uppercase">{t.stats.insights.quran.insightTitle || "Wawasan Tilawah"}</p>
                                    </div>
                                    <p className="text-xs text-white/90 font-medium mb-1">
                                        {t.stats.insights.quran.summary?.replace('{{count}}', data.totalQuranAyat.toString())}
                                    </p>
                                    <p className="text-[10px] text-white/60">
                                        {data.totalQuranAyat > 0
                                            ? t.stats.insights.quran.milestoneReach?.replace('{{needed}}', (data.nextQuranMilestone - data.totalQuranAyat).toString()).replace('{{target}}', data.nextQuranMilestone.toString())
                                            : t.stats.insights.quran.startTip
                                        }
                                    </p>
                                </div>
                            </>
                        )}

                        {activeInsight === 'dhikr' && (
                            <>
                                <InsightRow label={t.stats.insights.dhikr.total} value={data.history.reduce((s, d) => s + (d.tasbihCount || 0), 0).toLocaleString()} icon={<span className="text-sm">📿</span>} />
                                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                                        <p className="text-[10px] font-bold text-purple-400 uppercase">{t.stats.insights.dhikr.benefitTitle}</p>
                                    </div>
                                    <p className="text-xs text-white/90 italic">
                                        &quot;{t.stats.insights.dhikr.summary}&quot;
                                    </p>
                                </div>
                            </>
                        )}

                        <Button
                            onClick={() => setActiveInsight(null)}
                            className="w-full h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm border border-white/10 transition-all mt-2"
                        >
                            {t.stats.insights.close}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function InsightRow({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between p-3.5 bg-white/[0.03] border border-white/5 rounded-2xl">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                    {icon}
                </div>
                <span className="text-xs text-white/60 font-medium">{label}</span>
            </div>
            <span className="text-sm font-black text-white">{value}</span>
        </div>
    );
}
