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

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Lazy load all heavy components — 'use client' allows ssr: false
const RamadhanHeroCard = dynamic(() => import("@/components/ramadhan/RamadhanHeroCard"), {
    ssr: false,
    loading: () => <div className="h-32 rounded-2xl bg-white/5 animate-pulse" />,
});
const RamadhanScheduleCard = dynamic(() => import("@/components/ramadhan/RamadhanScheduleCard"), {
    ssr: false,
    loading: () => <div className="h-48 rounded-2xl bg-white/5 animate-pulse" />,
});
const SunnahFoodsWidget = dynamic(() => import("@/components/ramadhan/SunnahFoodsWidget"), {
    ssr: false,
    loading: () => <div className="h-48 rounded-2xl bg-white/5 animate-pulse" />,
});
const TarawehTracker = dynamic(() => import("@/components/ramadhan/TarawehTracker"), {
    ssr: false,
    loading: () => <div className="h-40 rounded-2xl bg-white/5 animate-pulse" />,
});
const KhatamanProgress = dynamic(() => import("@/components/ramadhan/KhatamanProgress"), {
    ssr: false,
    loading: () => <div className="h-48 rounded-2xl bg-white/5 animate-pulse" />,
});
const LailatulQadrCard = dynamic(() => import("@/components/ramadhan/LailatulQadrCard"), {
    ssr: false,
    loading: () => <div className="h-40 rounded-2xl bg-white/5 animate-pulse" />,
});
const RamadhanGuideCard = dynamic(() => import("@/components/ramadhan/RamadhanGuideCard"), {
    ssr: false,
    loading: () => <div className="h-32 rounded-2xl bg-white/5 animate-pulse" />,
});

const ZakatFitrahCard = dynamic(() => import("@/components/ramadhan/ZakatFitrahCard"), {
    ssr: false,
    loading: () => <div className="h-40 rounded-2xl bg-white/5 animate-pulse" />,
});

export default function RamadhanPage() {
    return (
        <div className="flex min-h-screen flex-col items-center bg-[rgb(var(--color-background))] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(var(--color-primary),0.12),rgba(255,255,255,0))] px-2 sm:px-3 md:px-4 py-2 sm:py-4 md:py-6 font-sans">
            <main className="flex w-full max-w-md flex-col items-center gap-2 sm:gap-3 md:gap-4 pb-nav">

                {/* Hero */}
                <section className="w-full">
                    <Suspense fallback={<div className="h-32 w-full rounded-2xl bg-white/5 animate-pulse" />}>
                        <RamadhanHeroCard />
                    </Suspense>
                </section>

                {/* Jadwal Imsak & Buka */}
                <section className="w-full animate-in slide-in-from-bottom-3 fade-in duration-500" style={{ animationDelay: "100ms" }}>
                    <Suspense fallback={<div className="h-48 w-full rounded-2xl bg-white/5 animate-pulse" />}>
                        <RamadhanScheduleCard />
                    </Suspense>
                </section>

                {/* Sunnah Foods */}
                <section className="w-full animate-in slide-in-from-bottom-3 fade-in duration-500" style={{ animationDelay: "150ms" }}>
                    <Suspense fallback={<div className="h-48 w-full rounded-2xl bg-white/5 animate-pulse" />}>
                        <SunnahFoodsWidget />
                    </Suspense>
                </section>

                {/* Taraweh Tracker */}
                <section className="w-full animate-in slide-in-from-bottom-3 fade-in duration-500" style={{ animationDelay: "200ms" }}>
                    <Suspense fallback={<div className="h-40 w-full rounded-2xl bg-white/5 animate-pulse" />}>
                        <TarawehTracker />
                    </Suspense>
                </section>

                {/* Khataman Progress */}
                <section className="w-full animate-in slide-in-from-bottom-3 fade-in duration-500" style={{ animationDelay: "300ms" }}>
                    <Suspense fallback={<div className="h-48 w-full rounded-2xl bg-white/5 animate-pulse" />}>
                        <KhatamanProgress />
                    </Suspense>
                </section>

                {/* Lailatul Qadr */}
                <section className="w-full animate-in slide-in-from-bottom-3 fade-in duration-500" style={{ animationDelay: "400ms" }}>
                    <Suspense fallback={<div className="h-40 w-full rounded-2xl bg-white/5 animate-pulse" />}>
                        <LailatulQadrCard />
                    </Suspense>
                </section>

                {/* Zakat Fitrah */}
                <section className="w-full animate-in slide-in-from-bottom-3 fade-in duration-500" style={{ animationDelay: "450ms" }}>
                    <Suspense fallback={<div className="h-40 w-full rounded-2xl bg-white/5 animate-pulse" />}>
                        <ZakatFitrahCard />
                    </Suspense>
                </section>

                {/* Panduan Puasa (Fiqh & FAQ) */}
                <section className="w-full animate-in slide-in-from-bottom-3 fade-in duration-500" style={{ animationDelay: "500ms" }}>
                    <Suspense fallback={<div className="h-32 w-full rounded-2xl bg-white/5 animate-pulse" />}>
                        <RamadhanGuideCard />
                    </Suspense>
                </section>

            </main>
        </div>
    );
}
