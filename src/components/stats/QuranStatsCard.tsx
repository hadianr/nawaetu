'use client';

import React from 'react';
import { BookOpen, Clock, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuranStatsCardProps {
    totalQuranAyat: number;
    totalQuranReadSeconds: number;
    todayReadSeconds?: number;
}

function formatDuration(totalSeconds: number): string {
    if (!totalSeconds || totalSeconds === 0) return '0 menit';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) return `${hours}j ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds} detik`;
}

export function QuranStatsCard({ totalQuranAyat, totalQuranReadSeconds, todayReadSeconds = 0 }: QuranStatsCardProps) {
    const hasAnyData = totalQuranAyat > 0 || totalQuranReadSeconds > 0 || todayReadSeconds > 0;

    const stats = [
        {
            icon: <BookOpen className="w-4 h-4 text-blue-400" />,
            label: 'Total Ayat Dibaca',
            value: totalQuranAyat > 0 ? totalQuranAyat.toLocaleString() : '—',
            sub: totalQuranAyat > 0 ? 'ayat kumulatif' : 'Mulai baca untuk tracking',
            gradient: 'from-blue-500/10',
            color: 'text-blue-400',
        },
        {
            icon: <Clock className="w-4 h-4 text-emerald-400" />,
            label: 'Durasi Tilawah Hari Ini',
            value: todayReadSeconds > 0 ? formatDuration(todayReadSeconds) : '—',
            sub: todayReadSeconds > 0 ? 'Hari ini' : 'Belum ada sesi hari ini',
            gradient: 'from-emerald-500/10',
            color: 'text-emerald-400',
        },
        {
            icon: <Flame className="w-4 h-4 text-orange-400" />,
            label: 'Total Durasi Baca',
            value: totalQuranReadSeconds > 0 ? formatDuration(totalQuranReadSeconds) : '—',
            sub: 'Akumulasi seluruh waktu',
            gradient: 'from-orange-500/10',
            color: 'text-orange-400',
        },
    ];

    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <h2 className="font-bold text-sm mb-4 flex items-center gap-2">
                <span className="text-base">📖</span>
                Statistik Al-Quran
            </h2>

            {!hasAnyData && (
                <p className="text-xs text-white/30 italic text-center py-2 mb-3">
                    Mulai membaca Al-Quran dan gunakan tombol &quot;Mulai Tilawah&quot; untuk mencatat aktivitasmu.
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
