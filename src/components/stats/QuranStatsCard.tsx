'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, Flame } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import { AppIcon } from '@/components/ui/AppIcon';
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
            icon: <BookOpen className="w-4 h-4 text-[rgb(var(--color-info))]" />,
            label: t.tilawahTotalAyat,
            value: totalQuranAyat.toLocaleString(),
            sub: totalQuranAyat > 0 ? t.tilawahTotalAyatSub : t.tilawahTotalAyatEmpty,
            gradient: 'from-[rgb(var(--color-info))]/10',
            color: 'text-[rgb(var(--color-info))]',
        },
        {
            icon: <Clock className="w-4 h-4 text-[rgb(var(--color-primary-strong))]" />,
            label: t.tilawahDurationToday,
            value: formatDuration(todayReadSeconds),
            sub: todayReadSeconds > 0 ? t.tilawahTodaySub : t.tilawahNoSessionToday,
            gradient: 'from-[rgb(var(--color-primary))]/10',
            color: 'text-[rgb(var(--color-primary-strong))]',
        },
        {
            icon: <Flame className="w-4 h-4 text-[rgb(var(--color-accent-strong))]" />,
            label: t.tilawahTotalDuration,
            value: formatDuration(totalQuranReadSeconds),
            sub: t.tilawahTotalDurationSub,
            gradient: 'from-[rgb(var(--color-accent))]/10',
            color: 'text-[rgb(var(--color-accent-strong))]',
        },
    ];

    if (!mounted) return <div className="h-48 rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] animate-pulse shadow-[var(--shadow-card)]" />;

    return (
        <div className="rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] p-5 shadow-[var(--shadow-card)]">
            <h2 className="font-bold text-sm mb-4 flex items-center gap-2">
                <AppIcon name="book" size="sm" tone="primary" label={t.tilawahStatsTitle} />
                {t.tilawahStatsTitle}
            </h2>

            {!hasAnyData && (
                <p className="text-xs text-[rgb(var(--color-text-muted))] italic text-center py-2 mb-3">
                    {t.tilawahStatsHelp}
                </p>
            )}

            {/* A row per stat on phones; three columns from sm up. */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
                {stats.map((stat, i) => (
                    <div
                        key={i}
                        className={cn(
                            'relative flex items-center gap-3 overflow-hidden rounded-2xl border border-[rgb(var(--color-border))] bg-gradient-to-br to-transparent p-3 shadow-[var(--shadow-card)] sm:block',
                            stat.gradient
                        )}
                    >
                        <div className="flex shrink-0 items-center gap-1.5 sm:mb-2">
                            {stat.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-[rgb(var(--color-text-muted))] leading-tight sm:mb-1 sm:line-clamp-2">{stat.label}</p>
                            <p className="text-xs text-[rgb(var(--color-text-muted))] mt-0.5 sm:line-clamp-1">{stat.sub}</p>
                        </div>
                        <p className={cn('shrink-0 text-base font-bold sm:mt-1', stat.color)}>{stat.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
