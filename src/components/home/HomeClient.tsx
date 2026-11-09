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
import dynamic from "next/dynamic";
import { usePrayerTimesContext } from "@/context/PrayerTimesContext";
import IntentionJournalWidget from "@/components/intentions/IntentionJournalWidget";
import DeferredBelowFold from "@/components/home/DeferredBelowFold";
import HomeHeader from "@/components/HomeHeader";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { parseHijriAdjustment } from "@/lib/hijri-date";
import { getRamadhanJourney } from "@/lib/ramadhan-journey";

const RamadhanCountdown = dynamic(() => import("@/components/RamadhanCountdown"), { ssr: false });
const EidCard = dynamic(() => import("@/components/ramadhan/EidCard"), { ssr: false });
const JourneyCard = dynamic(() => import("@/components/home/JourneyCard"), { ssr: false });

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
        const adjustment = parseHijriAdjustment(
            getStorageService().getOptional<string>(STORAGE_KEYS.SETTINGS_HIJRI_ADJUSTMENT),
        );
        const journey = getRamadhanJourney(new Date(), adjustment);
        queueMicrotask(() => {
            setIsRamadhanSeason(journey.inRamadan);
            if (!journey.inRamadan) setInitialDaysLeft(journey.daysLeft);
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
        <div className="relative flex min-h-screen flex-col items-center overflow-x-hidden bg-transparent bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(var(--color-primary),0.15),rgba(255,255,255,0))] px-4 py-4 pb-nav font-sans sm:px-6">
            <main className="relative flex w-full max-w-none flex-col items-center gap-3 xl:max-w-md">

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

                {/* 3. 100 Days to Ramadan journey (renders nothing outside the window) */}
                {!showSeasonalCard && <JourneyCard />}

                {/* 4. Nawaetu Journal - The core uniqueness */}
                <section className="w-full">
                    <IntentionJournalWidget />
                </section>

                <DeferredBelowFold />

            </main>

        </div>
    );
}
