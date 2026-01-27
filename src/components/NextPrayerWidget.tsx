"use client";

import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import PrayerCountdown from "@/components/PrayerCountdown";
import { Clock, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { PREPARATION_QUOTES } from "@/data/prayerQuotes";

export default function NextPrayerWidget() {
    const { data } = usePrayerTimes();
    const [minutesLeft, setMinutesLeft] = useState<number>(Infinity);
    const [quoteIndex, setQuoteIndex] = useState(0);

    useEffect(() => {
        setQuoteIndex(Math.floor(Math.random() * PREPARATION_QUOTES.length));
    }, []);

    useEffect(() => {
        if (!data?.nextPrayerTime) return;

        const checkTime = () => {
            const now = new Date();
            const [targetHours, targetMinutes] = data.nextPrayerTime.split(":").map(Number);
            const target = new Date(now);
            target.setHours(targetHours);
            target.setMinutes(targetMinutes);
            target.setSeconds(0);

            if (target.getTime() < now.getTime()) {
                target.setDate(target.getDate() + 1);
            }

            const diff = target.getTime() - now.getTime();
            const mins = Math.floor(diff / (1000 * 60));
            setMinutesLeft(mins);
        };

        checkTime();
        const timer = setInterval(checkTime, 1000 * 60);
        return () => clearInterval(timer);
    }, [data?.nextPrayerTime]);

    if (!data || !data.nextPrayer || !data.nextPrayerTime) {
        return (
            <div className="h-full w-full rounded-2xl bg-white/5 border border-white/10 animate-pulse min-h-[100px]" />
        );
    }

    const isPreparationTime = minutesLeft <= 15;
    const activeQuote = PREPARATION_QUOTES[quoteIndex];

    // Indonesian prayer name mapping
    const prayerNameMap: Record<string, string> = {
        Imsak: "Imsak",
        Fajr: "Subuh",
        Dhuhr: "Dzuhur",
        Asr: "Ashar",
        Maghrib: "Maghrib",
        Isha: "Isya",
    };
    const displayPrayerName = prayerNameMap[data.nextPrayer] || data.nextPrayer;

    // === PREPARATION MODE (< 15 minutes) ===
    if (isPreparationTime) {
        return (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900/50 to-emerald-950/80 border border-emerald-500/40 p-4 h-full group hover:border-emerald-400/60 transition-all animate-in fade-in duration-500">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-emerald-500/10 animate-pulse pointer-events-none" />

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full">
                    {/* Badge */}
                    <div className="flex items-center gap-1.5 mb-3">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                            Persiapan Sholat
                        </span>
                    </div>

                    {/* Countdown - Prominent */}
                    <div className="flex-1 flex items-center">
                        <PrayerCountdown
                            targetTime={data.nextPrayerTime}
                            prayerName={data.nextPrayer}
                            compact={true}
                        />
                    </div>

                    {/* Quote - Small Footer */}
                    <div className="mt-2 pt-2 border-t border-emerald-500/20">
                        <p className="text-[10px] text-emerald-300/70 line-clamp-1 italic">
                            "{activeQuote.text}" — {activeQuote.source}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // === NORMAL MODE (Time is far) ===
    return (
        <div className="relative overflow-hidden rounded-2xl bg-slate-900/60 border border-white/10 p-4 h-full group hover:border-emerald-500/30 transition-all">
            {/* Subtle decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-emerald-500/3 rounded-full blur-xl -ml-6 -mb-6 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full">
                {/* Header: Label */}
                <div className="flex items-center gap-1.5 mb-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-500/70" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Menuju {displayPrayerName}
                    </span>
                </div>

                {/* Main: Countdown Timer */}
                <div className="flex-1 flex items-center">
                    <PrayerCountdown
                        targetTime={data.nextPrayerTime}
                        prayerName={data.nextPrayer}
                        compact={true}
                    />
                </div>
            </div>
        </div>
    );
}
