"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import PrayerCardSkeleton from "@/components/skeleton/PrayerCardSkeleton";
import { useLocale } from "@/context/LocaleContext";
import QuoteOfDay from "@/components/QuoteOfDay";

const NextPrayerWidget = dynamic(() => import("@/components/NextPrayerWidget"), {
  ssr: false,
  loading: () => <div className="h-full w-full rounded-3xl bg-white/5 border border-white/10 animate-pulse min-h-[100px]" />,
});

const HomeLastRead = dynamic(
  () => import("@/components/HomeWidgets").then((mod) => ({ default: mod.HomeLastRead })),
  {
    ssr: false,
    loading: () => <div className="w-full h-32 bg-slate-800/30 animate-pulse rounded-2xl" />,
  }
);

const HomeMissions = dynamic(
  () => import("@/components/HomeWidgets").then((mod) => ({ default: mod.HomeMissions })),
  {
    ssr: false,
    loading: () => <div className="w-full h-48 bg-slate-800/30 animate-pulse rounded-2xl" />,
  }
);


const PrayerTimesDisplay = dynamic(() => import("@/components/PrayerTimesDisplay"), {
  ssr: false,
  loading: () => <PrayerCardSkeleton />,
});

export default function DeferredBelowFold() {
  const [ready, setReady] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    if ("requestIdleCallback" in window) {
      (window as Window).requestIdleCallback(() => setReady(true), { timeout: 1500 });
    } else {
      setTimeout(() => setReady(true), 400);
    }
  }, []);

  return (
    <>
      <div className="w-full flex flex-col gap-2">
        {/* 3. Quick Status Grid - Prayer Times + Last Read */}
        <section className="w-full grid grid-cols-2 gap-2 animate-in slide-in-from-bottom-2 fade-in duration-700 delay-100">
          <div className="w-full h-32">
            {ready ? (
              <NextPrayerWidget />
            ) : (
              <div className="h-full w-full rounded-3xl bg-white/5 border border-white/10 animate-pulse min-h-[100px]" />
            )}
          </div>
          <div className="w-full h-32">
            {ready ? (
              <HomeLastRead />
            ) : (
              <div className="w-full h-32 bg-slate-800/30 animate-pulse rounded-2xl" />
            )}
          </div>
        </section>

        {/* 4. Prayer Times List */}
        <section className="w-full">
          {ready ? <PrayerTimesDisplay /> : <PrayerCardSkeleton />}
        </section>

        {/* 5. Daily Missions */}
        <section className="w-full animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300">
          {ready ? (
            <HomeMissions />
          ) : (
            <div className="w-full h-48 bg-slate-800/30 animate-pulse rounded-2xl" />
          )}
        </section>

        {/* 6. Quote of The Day - Always at bottom */}
        <QuoteOfDay />
      </div>

      {/* AI Mentor Access Point - Lazy loaded */}
      <div className="fixed bottom-[90px] left-0 right-0 z-40 pointer-events-none">
        <div className="max-w-md mx-auto w-full relative px-4">
          <Link
            href="/mentor-ai"
            className="absolute right-4 bottom-0 pointer-events-auto group animate-in slide-in-from-right-4 fade-in duration-700 delay-500"
            prefetch={false}
          >
            <div className="relative flex items-center gap-2 bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-primary-dark))] p-1 pr-4 pl-1.5 rounded-full border border-white/20 shadow-[0_8px_32px_rgba(var(--color-primary),0.3)] hover:scale-105 active:scale-95 transition-all">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-[rgb(var(--color-primary))] rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse" />

              {/* Icon Circle */}
              <div className="relative w-10 h-10 bg-black/20 rounded-full flex items-center justify-center border border-white/10">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                </svg>
                <svg viewBox="0 0 24 24" className="absolute -top-1 -right-1 w-3 h-3 text-amber-300 animate-pulse" fill="currentColor">
                  <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" />
                </svg>
              </div>

              {/* Label */}
              <div className="relative flex flex-col">
                <span className="text-[11px] font-bold text-white leading-none">{t.homeAiTitle}</span>
                <span className="text-[9px] text-white/70 leading-normal">{t.homeAiSubtitle}</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
