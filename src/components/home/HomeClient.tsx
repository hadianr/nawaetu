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

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { CalendarDays, ChevronRight } from "lucide-react";
import { usePrayerTimesContext } from "@/context/PrayerTimesContext";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import RamadhanCountdown from "@/components/RamadhanCountdown";
import IntentionJournalWidget from "@/components/intentions/IntentionJournalWidget";
import DeferredBelowFold from "@/components/home/DeferredBelowFold";
import HomeHeader from "@/components/HomeHeader";
import EidCard from "@/components/ramadhan/EidCard";
import { formatHijriDate } from "@/lib/hijri-date";
import { cn } from "@/lib/utils";

export default function HomeClient() {
    const { data, loading } = usePrayerTimesContext();
    const { locale, t } = useLocale();
    const { currentTheme } = useTheme();
    const isDaylight = currentTheme === "daylight";

    // Move dynamic time calculation to internal state to avoid hydration mismatch.
    // Server renders a stable default, and client updates after mount.
    const [initialDaysLeft, setInitialDaysLeft] = useState(0);
    const [isRamadhanSeason, setIsRamadhanSeason] = useState(false);
    const mounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    );

    useEffect(() => {
        const RAMADHAN_START_MS = new Date("2026-02-18T00:00:00+07:00").getTime();
        const RAMADHAN_END_MS = new Date("2026-03-20T23:59:59+07:00").getTime();
        const now = Date.now();

        const isSeason = now >= RAMADHAN_START_MS && now <= RAMADHAN_END_MS;
        queueMicrotask(() => {
            setIsRamadhanSeason(isSeason);
            if (!isSeason) {
                const days = Math.max(0, Math.floor((RAMADHAN_START_MS - now) / 86400000));
                setInitialDaysLeft(days);
            }
        });
    }, []);

    // Use the server-computed flag as the ground truth if available, otherwise wait for mount.
    // Once the API loads, refine with the hijri month for accuracy.
    const hijriMonth = data?.hijriMonth || "";
    // If not mounted yet, default to NOT Ramadhan to match server static HTML
    const isRamadhan = mounted && (isRamadhanSeason || (data
        ? (hijriMonth.includes("Ramadan") || hijriMonth.includes("Ramadhan"))
        : false));
    const isEidSeason = mounted && (hijriMonth === "Shawwal" && (data?.hijriDay || 0) <= 3);
    const showSeasonalCard = isRamadhan || isEidSeason;
    const hijriLabel = data?.hijriDay && data.hijriMonthNumber && data.hijriYear
        ? formatHijriDate({
            day: data.hijriDay,
            month: data.hijriMonthNumber,
            monthName: data.hijriMonth || "",
            year: data.hijriYear,
        }, locale)
        : data?.hijriDate || "";

    return (
        <div className="flex min-h-screen flex-col items-center bg-[rgb(var(--color-background))] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(var(--color-primary),0.15),rgba(255,255,255,0))] px-4 py-4 font-sans sm:px-6">

            <main className="flex w-full max-w-md flex-col items-center gap-3 pb-nav">

                {/* 1. Header & Greeting */}
                <HomeHeader />

                {hijriLabel ? (
                    <Link
                        href="/hijri-calendar"
                        aria-label={`${t.hijriCalendarOpen}: ${hijriLabel}`}
                        className={cn(
                            "group flex min-h-16 w-full items-center gap-3 rounded-2xl border px-4 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]",
                            isDaylight ? "border-slate-200 bg-white/80 hover:bg-white" : "border-white/10 bg-white/5 hover:bg-white/10",
                        )}
                    >
                        <CalendarDays className="h-5 w-5 shrink-0 text-[rgb(var(--color-primary))]" />
                        <span className="min-w-0 flex-1">
                            <span className={cn("block truncate text-sm font-bold", isDaylight ? "text-slate-800" : "text-white")}>{hijriLabel}</span>
                            <span className={cn("block truncate text-xs", isDaylight ? "text-slate-500" : "text-white/45")}>{data?.gregorianDate}</span>
                        </span>
                        <span className="hidden text-xs font-semibold text-[rgb(var(--color-primary))] sm:inline">{t.hijriCalendarView}</span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-[rgb(var(--color-primary))] transition-transform group-hover:translate-x-0.5" />
                    </Link>
                ) : loading ? (
                    <div className={cn("h-16 w-full animate-pulse rounded-2xl", isDaylight ? "bg-slate-100" : "bg-white/5")} />
                ) : (
                    <div className={cn(
                        "flex min-h-16 w-full items-center gap-3 rounded-2xl border px-4 py-3",
                        isDaylight ? "border-slate-200 bg-white/80 text-slate-500" : "border-white/10 bg-white/5 text-white/50",
                    )}>
                        <CalendarDays className="h-5 w-5 shrink-0 text-[rgb(var(--color-primary))]" />
                        <span className="text-sm font-medium">{t.hijriCalendarLocationRequired}</span>
                    </div>
                )}


                {/* 2. Seasonal Card (Ramadhan / Lebaran) */}
                {showSeasonalCard && (
                    isEidSeason ? <EidCard /> : (
                        <section className="w-full mb-2">
                            <RamadhanCountdown initialDays={initialDaysLeft} />
                        </section>
                    )
                )}

                {/* 4. Nawaetu Journal - The core uniqueness */}
                <section className="w-full animate-in slide-in-from-bottom-3 fade-in duration-700">
                    <IntentionJournalWidget />
                </section>

                <DeferredBelowFold />

            </main>

        </div>
    );
}
