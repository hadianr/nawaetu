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
import RamadhanCountdown from "@/components/RamadhanCountdown";
import IntentionJournalWidget from "@/components/intentions/IntentionJournalWidget";
import DeferredBelowFold from "@/components/home/DeferredBelowFold";
import HomeHeader from "@/components/HomeHeader";
import VotingBanner from "@/components/home/VotingBanner";

interface HomeClientProps {
    initialDaysLeft: number;
    /** Server-computed flag: true if the current date falls within the Ramadhan season (1447H) */
    isRamadhanSeason: boolean;
}

export default function HomeClient({ initialDaysLeft, isRamadhanSeason }: HomeClientProps) {
    const { data } = usePrayerTimesContext();

    // Use the server-computed flag as the ground truth on initial render.
    // Once the API loads, refine with the hijri month for accuracy.
    const hijriMonth = data?.hijriMonth || "";
    const isRamadhan = isRamadhanSeason || (data
        ? (hijriMonth.includes("Ramadan") || hijriMonth.includes("Ramadhan"))
        : false);

    return (
        <div className="flex min-h-screen flex-col items-center bg-[rgb(var(--color-background))] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(var(--color-primary),0.15),rgba(255,255,255,0))] px-4 py-4 font-sans sm:px-6">

            <main className="flex w-full max-w-md flex-col items-center gap-3 pb-nav">

                {/* 1. Header & Greeting */}
                <HomeHeader />

                {/* 1b. Voting Banner - Ma'a Impact Innovation Prize 2026 */}
                <section className="w-full">
                    <VotingBanner />
                </section>

                {/* 2. Ramadhan Countdown - Hidden during Ramadhan season */}
                {!isRamadhan && (
                    <section className="w-full">
                        <RamadhanCountdown initialDays={initialDaysLeft} />
                    </section>
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
