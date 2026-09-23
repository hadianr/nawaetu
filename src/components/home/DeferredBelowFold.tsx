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
import PrayerCardSkeleton from "@/components/skeleton/PrayerCardSkeleton";
import { useLocale } from "@/context/LocaleContext";

const PrayerTimesDisplay = dynamic(() => import("@/components/PrayerTimesDisplay"), {
  ssr: false,
  loading: () => <PrayerCardSkeleton />,
});

const MissionsWidget = dynamic(() => import("@/components/MissionsWidget"), {
  ssr: false,
  loading: () => <div className="w-full h-48 bg-[rgb(var(--color-surface-subtle))] border border-[rgb(var(--color-border))] animate-pulse rounded-2xl" />,
});

const DailySpiritWidget = dynamic(() => import("@/components/home/DailySpiritWidget"), {
  ssr: false,
  loading: () => <div className="w-full h-40 bg-[rgb(var(--color-surface-subtle))] border border-[rgb(var(--color-border))] animate-pulse rounded-[2rem]" />,
});

export default function DeferredBelowFold() {
  const [ready, setReady] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    // Let the first viewport paint before loading below-fold feature chunks.
    // The timeout keeps the content available on browsers without idle APIs.
    if ("requestIdleCallback" in window) {
      (window as Window).requestIdleCallback(() => setReady(true), { timeout: 1000 });
    } else {
      setTimeout(() => setReady(true), 500);
    }
  }, []);

  return (
    <>
      <div className="w-full flex flex-col gap-2">
        {/* Prayer overview: next prayer, schedule, and check-in share one section. */}
        <section className="w-full">
          {ready ? <PrayerTimesDisplay /> : <PrayerCardSkeleton />}
        </section>

        {/* 5. Daily Missions */}
        {
          <section className="w-full animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300">
            {ready ? (
              <MissionsWidget />
            ) : (
              <div className="w-full h-48 bg-[rgb(var(--color-surface-subtle))] border border-[rgb(var(--color-border))] animate-pulse rounded-2xl" />
            )}
          </section>
        }

        {/* 6. Unified Spiritual Feed */}
        {
          <section className="w-full mt-4 space-y-2 animate-in slide-in-from-bottom-6 fade-in duration-1000 delay-400">
            <div className="px-6 flex flex-col">
              <h2 className="text-sm font-black text-[rgb(var(--color-text-strong))] tracking-tight">{t.spiritualDailyTitle}</h2>
              <p className="text-[10px] text-[rgb(var(--color-text-muted))] font-medium">{t.spiritualDailySubtitle}</p>
            </div>

            <div>
              {ready ? (
                <DailySpiritWidget />
              ) : (
                <div className="w-full h-40 bg-[rgb(var(--color-surface-subtle))] border border-[rgb(var(--color-border))] animate-pulse rounded-[2.5rem]" />
              )}
            </div>
          </section>
        }
      </div>

    </>
  );
}
