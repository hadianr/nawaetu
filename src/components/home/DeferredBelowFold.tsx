"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import PrayerCardSkeleton from "@/components/skeleton/PrayerCardSkeleton";
import WidgetSkeleton from "@/components/skeleton/WidgetSkeleton";
import { useLocale } from "@/context/LocaleContext";
import QuoteOfDay from "@/components/QuoteOfDay";

const NextPrayerWidget = dynamic(() => import("@/components/NextPrayerWidget"), {
  ssr: false,
  loading: () => <div className="h-full w-full rounded-3xl bg-white/5 border border-white/10 animate-pulse min-h-[100px]" />,
});

const LastReadWidget = dynamic(() => import("@/components/LastReadWidget"), {
  ssr: false,
  loading: () => <WidgetSkeleton />,
});

const PrayerTimesDisplay = dynamic(() => import("@/components/PrayerTimesDisplay"), {
  ssr: false,
  loading: () => <PrayerCardSkeleton />,
});

const PrayerCheckInWidget = dynamic(() => import("@/components/PrayerCheckInWidget"), {
  ssr: false,
  loading: () => <div className="w-full h-[88px] bg-white/5 border border-white/10 animate-pulse rounded-2xl" />,
});

const MissionsWidget = dynamic(() => import("@/components/MissionsWidget"), {
  ssr: false,
  loading: () => <div className="w-full h-48 bg-white/5 border border-white/10 animate-pulse rounded-2xl" />,
});

const DailySpiritWidget = dynamic(() => import("@/components/home/DailySpiritWidget"), {
  ssr: false,
  loading: () => <div className="w-full h-40 bg-white/5 border border-white/10 animate-pulse rounded-[2rem]" />,
});

export default function DeferredBelowFold() {
  const [ready, setReady] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    // Reduced from 1500ms to 200ms — components are blocked by this gate.
    // 200ms gives the browser just enough time to paint the above-the-fold
    // content before starting dynamic imports for below-fold widgets.
    if ("requestIdleCallback" in window) {
      (window as Window).requestIdleCallback(() => setReady(true), { timeout: 200 });
    } else {
      setTimeout(() => setReady(true), 100);
    }
  }, []);

  return (
    <>
      <div className="w-full flex flex-col gap-2">
        {/* 3. Quick Status Grid: Countdown + Last Read (side by side) */}
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
              <LastReadWidget />
            ) : (
              <div className="w-full h-32 bg-white/5 border border-white/10 animate-pulse rounded-3xl" />
            )}
          </div>
        </section>

        {/* 4. Prayer Times List - always shown early since it reads from cache */}
        <section className="w-full">
          <PrayerTimesDisplay />
        </section>

        {/* 4b. Prayer Check-in Strip */}
        <section className="w-full animate-in slide-in-from-bottom-3 fade-in duration-700 delay-200">
          {ready ? (
            <PrayerCheckInWidget />
          ) : (
            <div className="w-full h-[88px] bg-white/5 border border-white/10 animate-pulse rounded-2xl" />
          )}
        </section>

        {/* 5. Daily Missions */}
        <section className="w-full animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300">
          {ready ? (
            <MissionsWidget />
          ) : (
            <div className="w-full h-48 bg-white/5 border border-white/10 animate-pulse rounded-2xl" />
          )}
        </section>

        {/* 6. Unified Spiritual Feed */}
        <section className="w-full mt-4 space-y-2 animate-in slide-in-from-bottom-6 fade-in duration-1000 delay-400">
          <div className="px-6 flex flex-col">
            <h2 className="text-sm font-black text-white/90 tracking-tight">{t.spiritualDailyTitle}</h2>
            <p className="text-[10px] text-white/40 font-medium">{t.spiritualDailySubtitle}</p>
          </div>

          <div className="flex flex-col gap-3">
            {ready ? (
              <DailySpiritWidget />
            ) : (
              <div className="w-full h-40 bg-white/5 border border-white/10 animate-pulse rounded-[2.5rem]" />
            )}

            {/* Quote of The Day - Blended into the feed */}
            {ready && <QuoteOfDay />}
          </div>
        </section>
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
