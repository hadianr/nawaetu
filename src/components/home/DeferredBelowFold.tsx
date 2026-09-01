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

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import PrayerCardSkeleton from "@/components/skeleton/PrayerCardSkeleton";
import { useLocale } from "@/context/LocaleContext";
import { useFeaturePreset } from "@/hooks/useFeaturePreset";

const PrayerTimesDisplay = dynamic(() => import("@/components/PrayerTimesDisplay"), {
  ssr: false,
  loading: () => <PrayerCardSkeleton />,
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
  const { showMissions, showHadith } = useFeaturePreset();

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
        {/* Prayer overview: next prayer, schedule, and check-in share one section. */}
        <section className="w-full">
          <PrayerTimesDisplay />
        </section>

        {/* 5. Daily Missions — hidden for Esensial preset */}
        {showMissions && (
          <section className="w-full animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300">
            {ready ? (
              <MissionsWidget />
            ) : (
              <div className="w-full h-48 bg-white/5 border border-white/10 animate-pulse rounded-2xl" />
            )}
          </section>
        )}

        {/* 6. Unified Spiritual Feed — hidden for Esensial preset */}
        {showHadith && (
          <section className="w-full mt-4 space-y-2 animate-in slide-in-from-bottom-6 fade-in duration-1000 delay-400">
            <div className="px-6 flex flex-col">
              <h2 className="text-sm font-black text-white/90 tracking-tight">{t.spiritualDailyTitle}</h2>
              <p className="text-[10px] text-white/40 font-medium">{t.spiritualDailySubtitle}</p>
            </div>

            <div>
              {ready ? (
                <DailySpiritWidget />
              ) : (
                <div className="w-full h-40 bg-white/5 border border-white/10 animate-pulse rounded-[2.5rem]" />
              )}
            </div>
          </section>
        )}
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-40">
        <div className="mx-auto flex w-full max-w-md justify-end px-4">
          <Link
            href="/mentor-ai"
            aria-label={`${t.homeAiTitle}: ${t.homeAiSubtitle}`}
            className="pointer-events-auto group animate-in slide-in-from-right-4 fade-in duration-700 delay-500"
            prefetch={false}
          >
            <div className="relative flex items-center gap-2 rounded-full border border-white/20 bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-primary-dark))] p-1.5 pr-4 shadow-[0_8px_28px_rgba(var(--color-primary),0.3)] transition-transform hover:scale-105 active:scale-95">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/20">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                </svg>
                <svg viewBox="0 0 24 24" className="absolute -right-1 -top-1 h-3 w-3 text-amber-300" fill="currentColor">
                  <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" />
                </svg>
              </div>
              <span className="relative flex flex-col">
                <span className="text-[11px] font-bold leading-none text-white">{t.homeAiTitle}</span>
                <span className="mt-0.5 text-[9px] leading-none text-white/70">{t.homeAiSubtitle}</span>
              </span>
            </div>
          </Link>
        </div>
      </div>


    </>
  );
}
