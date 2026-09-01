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
import { usePrayerTimesContext } from "@/context/PrayerTimesContext";
import RamadhanCountdown from "@/components/RamadhanCountdown";
import IntentionJournalWidget from "@/components/intentions/IntentionJournalWidget";
import DeferredBelowFold from "@/components/home/DeferredBelowFold";
import HomeHeader from "@/components/HomeHeader";
import EidCard from "@/components/ramadhan/EidCard";

export default function HomeClient() {
    const { data } = usePrayerTimesContext();

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

    return (
        <div className="flex min-h-screen flex-col items-center bg-[rgb(var(--color-background))] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(var(--color-primary),0.15),rgba(255,255,255,0))] px-4 py-4 font-sans sm:px-6">

            <main className="flex w-full max-w-md flex-col items-center gap-3 pb-nav">

                {/* 1. Header & Greeting */}
                <HomeHeader />

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
