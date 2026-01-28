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
            <div className="relative overflow-hidden rounded-3xl bg-emerald-600 border border-emerald-500 p-4 h-full flex flex-col justify-center items-center text-center shadow-lg group">
                {/* Minimalist Pulse */}
                <div className="absolute inset-0 bg-emerald-400/20 animate-pulse" />

                <div className="relative z-10 space-y-2">
                    <div className="bg-white/20 p-2 rounded-full w-fit mx-auto backdrop-blur-sm">
                        <Volume2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white leading-tight">
                            Adzan {displayPrayerName}
                        </h2>
                        <p className="text-[10px] text-white/80 mt-0.5">
                            Selamat menunaikan sholat
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // === PREPARATION MODE (< 15 minutes) ===
    if (isPreparationTime) {
        return (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900/80 to-black border border-emerald-500/30 p-4 h-full flex flex-col justify-between group">
                {/* Header: Label */}
                <div className="flex items-center gap-1.5 opacity-80">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                        Persiapan
                    </span>
                </div>

                {/* Main: Countdown */}
                <div className="flex-1 flex items-center justify-center">
                    <PrayerCountdown
                        targetTime={data.nextPrayerTime}
                        prayerName={data.nextPrayer}
                        compact={true}
                    />
                </div>

                {/* Footer: Context */}
                <div className="text-center">
                    <span className="text-[10px] font-medium text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Menuju {displayPrayerName}
                    </span>
                </div>
            </div>
        );
    }

    // === NORMAL MODE (Time is far) ===
    return (
        <div className="relative overflow-hidden rounded-3xl bg-black/20 border border-white/5 p-4 h-full flex flex-col justify-between group hover:bg-black/30 hover:border-white/10 transition-all">
            {/* Header: Label */}
            <div className="flex items-center gap-1.5 opacity-50 group-hover:opacity-70 transition-opacity">
                <Clock className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                    Selanjutnya
                </span>
            </div>

            {/* Main: Countdown */}
            <div className="flex-1 flex items-center justify-center scale-110">
                <PrayerCountdown
                    targetTime={data.nextPrayerTime}
                    prayerName={data.nextPrayer}
                    compact={true}
                />
            </div>

            {/* Footer: Target */}
            <div className="text-center">
                <span className="text-[10px] font-medium text-white/40">
                    {displayPrayerName} {data.nextPrayerTime}
                </span>
            </div>
        </div>
    );
}
