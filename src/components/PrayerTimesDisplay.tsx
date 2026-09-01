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

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { CalendarDays, Clock, MapPin, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import PrayerTimeCard from "@/components/PrayerTimeCard";
import PrayerCardSkeleton from "@/components/skeleton/PrayerCardSkeleton";
import PrayerCountdown from "@/components/PrayerCountdown";

import MosqueFinderModal from "@/components/MosqueFinderModal";
import { usePrayerTimesContext } from "@/context/PrayerTimesContext";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";

const PrayerCheckInWidget = dynamic(() => import("@/components/PrayerCheckInWidget"), {
    ssr: false,
    loading: () => <div className="h-[88px] w-full animate-pulse rounded-2xl border border-white/10 bg-white/5" />,
});

export default function PrayerTimesDisplay() {
    const { data, loading, error, refreshLocation } = usePrayerTimesContext();
    const { t } = useLocale();
    const { currentTheme } = useTheme();
    const isDaylight = currentTheme === "daylight";
    const [showMosqueFinder, setShowMosqueFinder] = useState(false);

    if (loading && !data) {
        return <PrayerCardSkeleton />;
    }

    // Only show the full "Needs Location" screen if there is truly no data at all.
    // If `data` exists but there's a stale/transient error, we still show prayer times
    // normally — avoids the jarring "Izin Lokasi" flash when data is already cached.
    if (!data) {
        return (
            <div className={cn(
                "relative w-full max-w-md border rounded-3xl p-6 text-center shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500",
                isDaylight
                    ? "bg-white border-slate-200 shadow-slate-200/50"
                    : "bg-gradient-to-br from-slate-900 to-slate-950 border-white/10"
            )}>
                {/* Decorative Background */}
                <div className={cn(
                    "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none",
                    isDaylight ? "bg-emerald-500/10" : "bg-[rgb(var(--color-primary))]/5"
                )} />

                <div className="relative z-10 flex flex-col items-center space-y-4">
                    <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center border shadow-inner mb-2",
                        isDaylight ? "bg-slate-50 border-slate-100" : "bg-slate-800/50 border-white/5"
                    )}>
                        <MapPin className={cn("w-8 h-8", isDaylight ? "text-emerald-500" : "text-[rgb(var(--color-primary))]")} />
                    </div>

                    <div className="space-y-2">
                        <h3 className={cn("text-lg font-bold", isDaylight ? "text-slate-900" : "text-white")}>{t.homeLocationRequiredTitle}</h3>
                        <p className={cn("text-sm leading-relaxed max-w-[280px] mx-auto", isDaylight ? "text-slate-500" : "text-slate-400")}>
                            {t.homeLocationRequiredDesc}
                        </p>
                    </div>

                    <div className="pt-2 w-full max-w-xs space-y-3">
                        <Button
                            onClick={refreshLocation}
                            className={cn(
                                "w-full h-12 font-bold rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.5)]",
                                isDaylight
                                    ? "bg-amber-500 hover:bg-amber-600 text-white"
                                    : "bg-amber-500 hover:bg-amber-600 text-slate-900"
                            )}
                        >
                            <Navigation className="w-4 h-4 fill-current" />
                            {t.homeEnableLocation}
                        </Button>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-xs text-red-300 flex items-center gap-2 text-left">
                                <div className="shrink-0 w-1 h-8 bg-red-500 rounded-full" />
                                {error}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const nextPrayer = data.nextPrayer === "Imsak" ? "Fajr" : data.nextPrayer;
    const nextPrayerTime = data.nextPrayer === "Imsak"
        ? (data.prayerTimes?.Fajr ?? data.nextPrayerTime)
        : data.nextPrayerTime;
    const nextPrayerLabel = nextPrayer
        ? (t as Record<string, string>)[`prayer${nextPrayer}`] || nextPrayer
        : "";

    return (
        <div className="relative flex w-full max-w-md flex-col gap-2">

            <div className="relative space-y-2">
                {data.isDefaultLocation && (
                    <div className={cn(
                        "flex items-center gap-3 rounded-2xl p-4 mb-1 animate-in fade-in slide-in-from-top-2 duration-500 border transition-all",
                        isDaylight
                            ? "bg-amber-100/90 border-amber-300 shadow-[0_4px_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-400/20"
                            : "bg-amber-500/20 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                    )}>
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors shadow-sm",
                            isDaylight ? "bg-amber-500 text-white" : "bg-amber-500/20 text-amber-500"
                        )}>
                            <Navigation className="w-5 h-5 fill-current" />
                        </div>
                        <div className="flex-1">
                            <p className={cn("text-xs font-black uppercase tracking-wider", isDaylight ? "text-amber-900" : "text-amber-200")}>{t.homeLocationDefaultTitle}</p>
                            <p className={cn("text-[10px] leading-tight mt-0.5 font-bold", isDaylight ? "text-amber-800/80" : "text-amber-200/60")}>
                                {t.homeLocationDefaultDesc}
                            </p>
                        </div>
                    </div>
                )}

                <h2 className={cn("px-1 text-sm font-bold", isDaylight ? "text-slate-800" : "text-white/80")}>
                    {t.homePrayerCheckInTitle}
                </h2>

                {nextPrayer && nextPrayerTime && (
                    <div className={cn(
                        "flex items-center justify-between gap-4 rounded-2xl border px-4 py-3",
                        isDaylight
                            ? "border-blue-100 bg-blue-50/80"
                            : "border-[rgb(var(--color-primary))]/25 bg-[rgb(var(--color-primary))]/10",
                    )}>
                        <div className="min-w-0">
                            <div className={cn(
                                "flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest",
                                isDaylight ? "text-blue-600" : "text-[rgb(var(--color-primary-light))]",
                            )}>
                                <Clock className="h-3 w-3" />
                                {t.homeNextLabel}
                            </div>
                            <p className={cn("mt-1 truncate text-sm font-bold", isDaylight ? "text-slate-900" : "text-white")}>
                                {nextPrayerLabel} <span className="tabular-nums opacity-70">{nextPrayerTime}</span>
                            </p>
                        </div>
                        <div
                            role="timer"
                            aria-label={`${t.homeNextLabel} ${nextPrayerLabel}`}
                            className={isDaylight ? "text-slate-900" : "text-white"}
                        >
                            <PrayerCountdown targetTime={nextPrayerTime} prayerName={nextPrayer} compact />
                        </div>
                    </div>
                )}

                <PrayerTimeCard {...data} />
            </div>

            <PrayerCheckInWidget />

            <div className={cn(
                "flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-3 py-2.5",
                isDaylight ? "border-slate-200 bg-white/80" : "border-white/10 bg-white/[0.03]",
            )}>
                <span className={cn("text-[9px] font-black uppercase tracking-widest", isDaylight ? "text-slate-500" : "text-white/40")}>
                    {t.homeQuickAccessTitle}
                </span>
                <div className="grid w-full grid-cols-3 gap-2">
                    <Link
                        href="/hijri-calendar"
                        className={cn(
                            "flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-xl border px-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]",
                            isDaylight
                                ? "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10",
                        )}
                    >
                        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-[rgb(var(--color-primary))]" />
                        <span className="truncate text-[9px] font-black uppercase tracking-tight">{t.hijriCalendarTitle}</span>
                    </Link>
                    <Link
                        href="/qibla"
                        className={cn(
                            "flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-xl border px-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]",
                            isDaylight
                                ? "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10",
                        )}
                    >
                        <span className="text-xs">🧭</span>
                        <span className="text-[9px] font-black uppercase tracking-widest">{t.homeQiblaLabel}</span>
                    </Link>
                    <button
                        onClick={() => setShowMosqueFinder(true)}
                        aria-label={t.homeFindMosqueAria}
                        className={cn(
                            "flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-xl border px-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]",
                            isDaylight
                                ? "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10",
                        )}
                    >
                        <MapPin className="h-3 w-3 text-[rgb(var(--color-primary))]" />
                        <span className="truncate text-[9px] font-black uppercase tracking-tight">{t.homeFindMosque}</span>
                    </button>
                </div>
            </div>

            <MosqueFinderModal
                isOpen={showMosqueFinder}
                onClose={() => setShowMosqueFinder(false)}
            />
        </div>
    );
}
