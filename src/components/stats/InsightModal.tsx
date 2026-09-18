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
import type { TranslationTree } from "@/context/LocaleContext";
import { AppIcon } from "@/components/ui/AppIcon";

function formatReadingTime(
    totalSeconds: number,
    q: Pick<TranslationTree, "unitMinuteLong" | "unitHour" | "unitMinute" | "unitSecond">
): string {
    if (totalSeconds === 0) return `0 ${q.unitMinuteLong}`;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    let result = "";
    if (hours > 0) result += `${hours}${q.unitHour} `;
    if (minutes > 0) result += `${minutes}${q.unitMinute} `;
    if (seconds > 0) result += `${seconds}${q.unitSecond}`;
    
    return result.trim() || `0 ${q.unitMinuteLong}`;
}
interface InsightModalProps {
    activeInsight: InsightKey | null;
    setActiveInsight: (val: InsightKey | null) => void;
    t: TranslationTree;
    data: {
        streakData: { currentStreak: number; longestStreak: number };
        recentPrayerCount: number;
        primaryPrayer: string;
        sunnahTotal: number;
        weeklyHasanah: number;
        avgDailyHasanah: number;
        powerDayName: string;
        consistency: number;
        totalQuranAyat: number;
        nextQuranMilestone: number;
        history: DailyActivity[];
        totalQuranReadSeconds?: number; // NEW: total reading time today
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
            <DialogContent showCloseButton={false} className="bg-[rgb(var(--color-surface))]/95 border-[rgb(var(--color-border))] backdrop-blur-2xl p-0 overflow-hidden max-w-[360px] rounded-[32px] text-[rgb(var(--color-text-strong))]">
                <div className="relative p-6">
                    <DialogHeader className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 rounded-2xl bg-[rgb(var(--color-surface-subtle))] border border-[rgb(var(--color-border))]">
                                {activeInsight === 'streak' && <Flame className="w-5 h-5 text-[rgb(var(--color-accent))]" />}
                                {activeInsight === 'prayers' && <AppIcon name="landmark" size="lg" tone="primary" label={t.stats.insights.prayers.title} />}
                                {activeInsight === 'hasanah' && <ZapIcon className="w-5 h-5 text-[rgb(var(--color-warning))]" />}
                                {activeInsight === 'consistency' && <Target className="w-5 h-5 text-[rgb(var(--color-info))]" />}
                                {activeInsight === 'quran' && <BookOpen className="w-5 h-5 text-[rgb(var(--color-info))]" />}
                                {activeInsight === 'dhikr' && <AppIcon name="hands" size="lg" tone="primary" label={t.stats.insights.dhikr.title} />}
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-black text-[rgb(var(--color-text-strong))]">
                                    {t.stats.insights[activeInsight].title}
                                </DialogTitle>
                                <DialogDescription className="text-xs text-[rgb(var(--color-text-muted))] leading-relaxed mt-1">
                                    {t.stats.insights[activeInsight].desc}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-4">
                        {activeInsight === 'streak' && (
                            <>
                                <InsightRow label={t.stats.insights.streak.current} value={data.streakData.currentStreak.toString()} icon={<Flame className="w-3.5 h-3.5 text-[rgb(var(--color-accent))]" />} />
                                <InsightRow label={t.stats.insights.streak.longest} value={data.streakData.longestStreak.toString()} icon={<Award className="w-3.5 h-3.5 text-[rgb(var(--color-warning))]" />} />
                                <div className="p-4 bg-[rgb(var(--color-accent))]/10 border border-[rgb(var(--color-accent))]/20 rounded-2xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-3.5 h-3.5 text-[rgb(var(--color-accent))]" />
                                        <p className="text-[10px] font-bold text-[rgb(var(--color-accent))] uppercase">{t.stats.insights.streak.status}</p>
                                    </div>
                                    <p className="text-xs text-[rgb(var(--color-text))] font-medium leading-relaxed">
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
                                <InsightRow label={t.stats.insights.prayers.fardu} value={data.recentPrayerCount.toString()} icon={<AppIcon name="landmark" size="sm" tone="primary" />} />
                                <InsightRow label={t.stats.insights.prayers.sunnah} value={data.sunnahTotal.toString()} icon={<AppIcon name="sparkles" size="sm" tone="primary" />} />
                                <div className="p-4 bg-[rgb(var(--color-primary))]/10 border border-[rgb(var(--color-primary))]/20 rounded-2xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MessageSquare className="w-3.5 h-3.5 text-[rgb(var(--color-primary-light))]" />
                                        <p className="text-[10px] font-bold text-[rgb(var(--color-primary-light))] uppercase">{t.stats.insights.prayers.insightTitle}</p>
                                    </div>
                                    {data.primaryPrayer ? (
                                        <>
                                            <p className="text-xs text-[rgb(var(--color-text))] italic mb-2">
                                                &quot;{`${t.stats.insights.prayers.mostConsistent} ${data.primaryPrayer}.`}&quot;
                                            </p>
                                            <p className="text-[10px] text-[rgb(var(--color-text-muted))]">
                                                {data.sunnahTotal > 0
                                                    ? t.stats.insights.prayers.sunnahDone?.replace('{{count}}', data.sunnahTotal.toString())
                                                    : t.stats.insights.prayers.sunnahNone
                                                }
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-xs text-[rgb(var(--color-text-muted))] italic">{t.stats.insights.prayers.noData}</p>
                                    )}
                                </div>
                            </>
                        )}

                        {activeInsight === 'hasanah' && (
                            <>
                                <InsightRow label={t.stats.insights.hasanah.weekly} value={data.weeklyHasanah.toLocaleString()} icon={<ZapIcon className="w-3.5 h-3.5 text-[rgb(var(--color-warning))]" />} />
                                <InsightRow label={t.stats.insights.hasanah.avgDaily} value={data.avgDailyHasanah.toLocaleString()} icon={<Calendar className="w-3.5 h-3.5 text-[rgb(var(--color-info))]" />} />
                                <div className="p-4 bg-[rgb(var(--color-warning))]/10 border border-[rgb(var(--color-warning))]/20 rounded-2xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-3.5 h-3.5 text-[rgb(var(--color-warning))]" />
                                        <p className="text-[10px] font-bold text-[rgb(var(--color-warning))] uppercase">{t.stats.insights.hasanah.insightTitle}</p>
                                    </div>
                                    <p className="text-xs text-[rgb(var(--color-text))]">
                                        {data.powerDayName
                                            ? t.stats.insights.hasanah.powerDayDesc?.replace('{{day}}', data.powerDayName)
                                            : t.stats.insights.hasanah.noData
                                        }
                                    </p>
                                </div>
                            </>
                        )}

                        {activeInsight === 'consistency' && (
                            <>
                                <InsightRow label={t.stats.insights.consistency.rate} value={`${data.consistency}%`} icon={<Target className="w-3.5 h-3.5 text-[rgb(var(--color-info))]" />} />
                                <div className="p-4 bg-[rgb(var(--color-info))]/10 border border-[rgb(var(--color-info))]/20 rounded-2xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-3.5 h-3.5 text-[rgb(var(--color-info))]" />
                                        <p className="text-[10px] font-bold text-[rgb(var(--color-info))] uppercase">
                                            {data.consistency > 80 ? t.stats.insights.consistency.highTitle : t.stats.insights.consistency.tipTitle || "Tips Disiplin"}
                                        </p>
                                    </div>
                                    <p className="text-xs text-[rgb(var(--color-text))]">
                                        {data.consistency > 80
                                            ? t.stats.insights.consistency.highDesc
                                            : t.stats.insights.consistency.lowDesc
                                        }
                                    </p>
                                </div>
                            </>
                        )}

                        {activeInsight === 'quran' && (
                            <>
                                <InsightRow label={t.stats.insights.quran.totalRead} value={data.totalQuranAyat.toLocaleString()} icon={<BookOpen className="w-3.5 h-3.5 text-[rgb(var(--color-info))]" />} />
                                {data.totalQuranReadSeconds !== undefined && data.totalQuranReadSeconds > 0 && (
                                    <InsightRow
                                        label={t.tilawahDurationToday}
                                        value={formatReadingTime(data.totalQuranReadSeconds, t)}
                                        icon={<AppIcon name="calendar" size="sm" tone="info" />}
                                    />
                                )}
                                <div className="p-4 bg-[rgb(var(--color-info))]/10 border border-[rgb(var(--color-info))]/20 rounded-2xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Award className="w-3.5 h-3.5 text-[rgb(var(--color-info))]" />
                                        <p className="text-[10px] font-bold text-[rgb(var(--color-info))] uppercase">{t.stats.insights.quran.insightTitle || "Wawasan Tilawah"}</p>
                                    </div>
                                    <p className="text-xs text-[rgb(var(--color-text))] font-medium mb-1">
                                        {t.stats.insights.quran.summary?.replace('{{count}}', data.totalQuranAyat.toString())}
                                    </p>
                                    <p className="text-[10px] text-[rgb(var(--color-text-muted))]">
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
                                <InsightRow label={t.stats.insights.dhikr.total} value={data.history.reduce((s, d) => s + (d.tasbihCount || 0), 0).toLocaleString()} icon={<AppIcon name="hands" size="sm" tone="primary" />} />
                                <div className="p-4 bg-[rgb(var(--color-primary))]/10 border border-[rgb(var(--color-primary))]/20 rounded-2xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MessageSquare className="w-3.5 h-3.5 text-[rgb(var(--color-primary-light))]" />
                                        <p className="text-[10px] font-bold text-[rgb(var(--color-primary-light))] uppercase">{t.stats.insights.dhikr.benefitTitle}</p>
                                    </div>
                                    <p className="text-xs text-[rgb(var(--color-text))] italic">
                                        &quot;{t.stats.insights.dhikr.summary}&quot;
                                    </p>
                                </div>
                            </>
                        )}

                        <Button
                            onClick={() => setActiveInsight(null)}
                            className="w-full h-12 rounded-2xl bg-[rgb(var(--color-surface-subtle))] hover:bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-strong))] font-bold text-sm border border-[rgb(var(--color-border))] transition-all mt-2"
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
        <div className="flex items-center justify-between p-3.5 bg-[rgb(var(--color-surface-subtle))] border border-[rgb(var(--color-border))] rounded-2xl">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[rgb(var(--color-surface))] flex items-center justify-center">
                    {icon}
                </div>
                <span className="text-xs text-[rgb(var(--color-text-muted))] font-medium">{label}</span>
            </div>
            <span className="text-sm font-black text-[rgb(var(--color-text-strong))]">{value}</span>
        </div>
    );
}
