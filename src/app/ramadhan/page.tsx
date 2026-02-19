"use client";

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

export default function RamadhanPage() {
    return (
        <div className="flex min-h-screen flex-col items-center bg-[rgb(var(--color-background))] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(var(--color-primary),0.12),rgba(255,255,255,0))] px-2 sm:px-3 md:px-4 py-3 sm:py-4 md:py-6 font-sans">
            <main className="flex w-full max-w-md flex-col items-center gap-2.5 sm:gap-3 md:gap-4 pb-nav">

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
