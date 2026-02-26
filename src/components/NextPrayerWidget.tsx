"use client";

/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { usePrayerTimesContext } from "@/context/PrayerTimesContext";
import PrayerCountdown from "@/components/PrayerCountdown";
import { Clock, Sparkles, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { PREPARATION_QUOTES } from "@/data/prayerQuotes";
import { cn } from "@/lib/utils";
import { useLocale } from "@/context/LocaleContext";

export default function NextPrayerWidget() {
    const { data } = usePrayerTimesContext();
    const { t } = useLocale();
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
        const timer = setInterval(checkTime, 30000); // Check every 30 seconds to reduce main-thread work
        return () => clearInterval(timer);
    }, [data?.nextPrayerTime]);

    if (!data || !data.nextPrayer || !data.nextPrayerTime) {
        return (
            <div className="h-full w-full rounded-3xl bg-white/5 border border-white/10 animate-pulse min-h-[100px]" />
        );
    }

    // Skip Imsak in the countdown — always count down to an actual salah
    const effectiveNextPrayer = data.nextPrayer === "Imsak" ? "Fajr" : data.nextPrayer;
    const effectiveNextTime = data.nextPrayer === "Imsak"
        ? (data.prayerTimes?.["Fajr"] ?? data.nextPrayerTime)
        : data.nextPrayerTime;

    // Localized prayer name
    const displayPrayerName = (t as any)[`prayer${effectiveNextPrayer}`] || effectiveNextPrayer;


    const isAdzanNow = minutesLeft <= 0 && minutesLeft > -20; // 0 to -20 mins
    const isPreparationTime = minutesLeft > 0 && minutesLeft <= 15;
    const activeQuote = PREPARATION_QUOTES[quoteIndex];

    // === ADZAN MODE (Sekarang!) ===
    if (isAdzanNow) {
        return (
            <div className="relative overflow-hidden rounded-3xl bg-[rgb(var(--color-primary-dark))] border border-[rgb(var(--color-primary))] p-4 h-full flex flex-col justify-center items-center text-center shadow-lg group">
                {/* Minimalist Pulse */}
                <div className="absolute inset-0 bg-[rgb(var(--color-primary-light))]/20 animate-pulse" />

                <div className="relative z-10 space-y-2">
                    <div className="bg-white/20 p-2 rounded-full w-fit mx-auto backdrop-blur-sm">
                        <Volume2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white leading-tight">
                            {t.homeAdzanNow.replace("{prayer}", displayPrayerName)}
                        </h2>
                        <p className="text-[10px] text-white/80 mt-0.5">
                            {t.homeAdzanMessage}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // === PREPARATION MODE (< 15 minutes) ===
    if (isPreparationTime) {
        return (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[rgb(var(--color-primary-dark))]/80 to-black border border-[rgb(var(--color-primary))]/30 p-4 h-full flex flex-col justify-between group">
                {/* Header: Label */}
                <div className="flex items-center gap-1.5 opacity-80">
                    <Sparkles className="w-3 h-3 text-[rgb(var(--color-primary-light))]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[rgb(var(--color-primary-light))]">
                        {t.homePreparation}
                    </span>
                </div>

                {/* Main: Countdown */}
                <div className="flex-1 flex items-center justify-center">
                    <PrayerCountdown
                        targetTime={effectiveNextTime}
                        prayerName={effectiveNextPrayer}
                        compact={true}
                    />
                </div>

                {/* Footer: Context */}
                <div className="text-center">
                    <span className="text-[10px] font-medium text-[rgb(var(--color-primary-light))]/80 bg-[rgb(var(--color-primary))]/10 px-2 py-0.5 rounded-full border border-[rgb(var(--color-primary))]/20">
                        {t.homeTowards.replace("{prayer}", displayPrayerName)}
                    </span>
                </div>
            </div>
        );
    }

    // === NORMAL MODE (Time is far) ===
    return (
        <div className="relative overflow-hidden rounded-3xl bg-black/20 border border-white/5 p-4 sm:p-5 h-full flex flex-col justify-between group hover:bg-black/30 hover:border-white/10 transition-all">
            {/* Header: Label */}
            <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                <Clock className="w-3 h-3 text-[rgb(var(--color-primary-light))]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-200">
                    {t.homeNextLabel}
                </span>
            </div>

            {/* Main: Countdown */}
            <div className="flex-1 flex items-center justify-center scale-110" role="timer" aria-live="off" aria-label={`${t.homeNextLabel} ${displayPrayerName}`}>
                <PrayerCountdown
                    targetTime={effectiveNextTime}
                    prayerName={effectiveNextPrayer}
                    compact={true}
                />
            </div>

            {/* Footer: Target */}
            <div className="text-center">
                <span className="text-[10px] font-medium text-white/80">
                    {displayPrayerName} {effectiveNextTime}
                </span>
            </div>
        </div>
    );
}
