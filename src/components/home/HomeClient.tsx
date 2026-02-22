"use client";

import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import RamadhanCountdown from "@/components/RamadhanCountdown";
import IntentionJournalWidget from "@/components/intentions/IntentionJournalWidget";
import DeferredBelowFold from "@/components/home/DeferredBelowFold";
import HomeHeader from "@/components/HomeHeader";

interface HomeClientProps {
    initialDaysLeft: number;
    /** Server-computed flag: true if the current date falls within the Ramadhan season (1447H) */
    isRamadhanSeason: boolean;
}

export default function HomeClient({ initialDaysLeft, isRamadhanSeason }: HomeClientProps) {
    const { data } = usePrayerTimes();

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

                {/* 2. Ramadhan Countdown - Hidden during Ramadhan season */}
                {!isRamadhan && (
                    <section className="w-full">
                        <RamadhanCountdown initialDays={initialDaysLeft} />
                    </section>
                )}

                {/* 3. Nawaetu Journal - The core uniqueness */}
                <section className="w-full animate-in slide-in-from-bottom-3 fade-in duration-700">
                    <IntentionJournalWidget />
                </section>

                <DeferredBelowFold />

            </main>

        </div>
    );
}
