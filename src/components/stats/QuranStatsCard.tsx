'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/context/LocaleContext';

interface QuranStatsCardProps {
    totalQuranAyat: number;
    totalQuranReadSeconds: number;
    todayReadSeconds?: number;
}

export function QuranStatsCard({ totalQuranAyat, totalQuranReadSeconds, todayReadSeconds = 0 }: QuranStatsCardProps) {
    const t = useTranslations();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        queueMicrotask(() => setMounted(true));
    }, []);

    const hasAnyData = totalQuranAyat > 0 || totalQuranReadSeconds > 0 || todayReadSeconds > 0;

    function formatDuration(totalSeconds: number): string {
        if (!totalSeconds || totalSeconds === 0) return `0 ${t.unitMinuteLong}`;
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        let result = "";
        if (hours > 0) result += `${hours}${t.unitHour} `;
        if (minutes > 0) result += `${minutes}${t.unitMinute} `;
        if (seconds > 0 && hours === 0) result += `${seconds}${t.unitSecond}`;
        
        return result.trim() || `0 ${t.unitMinuteLong}`;
    }

    const stats = [
        {
            icon: <BookOpen className="w-4 h-4 text-blue-400" />,
            label: t.tilawahTotalAyat,
            value: totalQuranAyat > 0 ? totalQuranAyat.toLocaleString() : '—',
            sub: totalQuranAyat > 0 ? t.tilawahTotalAyatSub : t.tilawahTotalAyatEmpty,
            gradient: 'from-blue-500/10',
            color: 'text-blue-400',
        },
        {
            icon: <Clock className="w-4 h-4 text-emerald-400" />,
            label: t.tilawahDurationToday,
            value: todayReadSeconds > 0 ? formatDuration(todayReadSeconds) : '—',
            sub: todayReadSeconds > 0 ? t.tilawahTodaySub : t.tilawahNoSessionToday,
            gradient: 'from-emerald-500/10',
            color: 'text-emerald-400',
        },
        {
            icon: <Flame className="w-4 h-4 text-orange-400" />,
            label: t.tilawahTotalDuration,
            value: totalQuranReadSeconds > 0 ? formatDuration(totalQuranReadSeconds) : '—',
            sub: t.tilawahTotalDurationSub,
            gradient: 'from-orange-500/10',
            color: 'text-orange-400',
        },
    ];

    if (!mounted) return <div className="h-48 rounded-2xl border border-white/10 bg-white/[0.02] animate-pulse" />;

    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <h2 className="font-bold text-sm mb-4 flex items-center gap-2">
                <span className="text-base">📖</span>
                {t.tilawahStatsTitle}
            </h2>

            {!hasAnyData && (
                <p className="text-xs text-white/30 italic text-center py-2 mb-3">
                    {t.tilawahStatsHelp}
                </p>
            )}

            <div className="grid grid-cols-3 gap-3">
                {stats.map((stat, i) => (
                    <div
                        key={i}
                        className={cn(
                            'relative overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-br to-transparent p-3',
                            stat.gradient
                        )}
                    >
                        <div className="flex items-center gap-1.5 mb-2">
                            {stat.icon}
                        </div>
                        <p className="text-[9px] text-white/40 leading-tight mb-1 line-clamp-2">{stat.label}</p>
                        <p className={cn('text-base font-black', stat.color)}>{stat.value}</p>
                        <p className="text-[9px] text-white/30 mt-0.5 line-clamp-1">{stat.sub}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
