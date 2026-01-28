"use client";

import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import PrayerCountdown from "@/components/PrayerCountdown";
import { Clock, Sparkles, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { PREPARATION_QUOTES } from "@/data/prayerQuotes";
import { cn } from "@/lib/utils";

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

            let diff = target.getTime() - now.getTime();

            // Logic Fix: If time passed slightly (e.g. within 15 mins), 
            // consider it "Adzan Now" instead of pushing to tomorrow.
            // Only push to tomorrow if it's REALLY past (e.g. > 30 mins ago) 
            // and the hooks haven't updated the 'nextPrayer' yet.
            if (diff < 0) {
                const GRACE_PERIOD = 1000 * 60 * 20; // 20 minutes window
                if (Math.abs(diff) > GRACE_PERIOD) {
                    target.setDate(target.getDate() + 1);
                    diff = target.getTime() - now.getTime();
                }
                // If within grace period, diff remains negative, triggering Adzan UI
            }

            const mins = Math.floor(diff / (1000 * 60));
            setMinutesLeft(mins);
        };

        checkTime();
        const timer = setInterval(checkTime, 1000); // Check every second for smoother updates
        return () => clearInterval(timer);
    }, [data?.nextPrayerTime]);

    if (!data || !data.nextPrayer || !data.nextPrayerTime) {
        return (
            <div className="h-full w-full rounded-2xl bg-white/5 border border-white/10 animate-pulse min-h-[100px]" />
        );
    }

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

    const isAdzanNow = minutesLeft <= 0 && minutesLeft > -20; // 0 to -20 mins
    const isPreparationTime = minutesLeft > 0 && minutesLeft <= 15;
    const activeQuote = PREPARATION_QUOTES[quoteIndex];

    // === ADZAN MODE (Sekarang!) ===
    if (isAdzanNow) {
        return (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 border-2 border-emerald-400 p-4 h-full group transition-all animate-in zoom-in-95 duration-500 shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)]">
                {/* Dynamic Background Pulse */}
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
                <div className="absolute inset-0 bg-emerald-400/20 animate-pulse" />

                {/* Ripples */}
                <span className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl animate-pulse" />

                <div className="relative z-10 flex flex-col h-full items-center justify-center text-center space-y-3">
                    <div className="bg-white/20 p-2.5 rounded-full animate-bounce shadow-lg backdrop-blur-sm">
                        <Volume2 className="w-6 h-6 text-white" />
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200 animate-pulse">
                            Sedang Berlangsung
                        </h3>
                        <h2 className="text-2xl font-bold text-white font-serif leading-none drop-shadow-md">
                            Adzan {displayPrayerName}
                        </h2>
                    </div>

                    <div className="w-full bg-black/20 rounded-full h-1 mt-2 overflow-hidden">
                        <div className="h-full bg-emerald-300 animate-[progress_2s_ease-in-out_infinite]" style={{ width: '100%' }} />
                    </div>

                    <p className="text-[10px] text-white/80 italic">
                        "Panggilah Sholat telah tiba..."
                    </p>
                </div>
            </div>
        );
    }

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
        <div className="relative overflow-hidden rounded-3xl bg-black/20 border border-white/5 p-5 h-full flex flex-col justify-center items-center text-center group hover:bg-black/30 hover:border-white/10 transition-all">
            {/* Subtle decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

            {/* Header: Label */}
            <div className="relative z-10 flex items-center gap-1.5 mb-2 opacity-60">
                <Clock className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                    Menuju {displayPrayerName}
                </span>
            </div>

            {/* Main: Countdown Timer - Centered */}
            <div className="relative z-10 scale-110">
                <PrayerCountdown
                    targetTime={data.nextPrayerTime}
                    prayerName={data.nextPrayer}
                    compact={true}
                />
            </div>
        </div>
    );
}
