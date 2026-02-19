"use client";

import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import RamadhanCountdown from "@/components/RamadhanCountdown";
import IntentionJournalWidget from "@/components/intentions/IntentionJournalWidget";
import DeferredBelowFold from "@/components/home/DeferredBelowFold";
import HomeHeader from "@/components/HomeHeader";

interface HomeClientProps {
    initialDaysLeft: number;
}

export default function HomeClient({ initialDaysLeft }: HomeClientProps) {
    const { data } = usePrayerTimes();

    // Safe check for Ramadhan month
    const hijriMonth = data?.hijriMonth || "";
    const isRamadhan = hijriMonth.includes("Ramadan") || hijriMonth.includes("Ramadhan");

    return (
        <div className="flex min-h-screen flex-col items-center bg-[rgb(var(--color-background))] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(var(--color-primary),0.15),rgba(255,255,255,0))] px-4 py-6 font-sans sm:px-6">

            <main className="flex w-full max-w-md flex-col items-center gap-4 pb-nav">

                {/* 1. Header & Greeting */}
                <HomeHeader />

                {/* 2. Ramadhan Countdown (Hero) - Only show OUTSIDE Ramadhan */}
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
