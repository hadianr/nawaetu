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
import { AppIcon } from "@/components/ui/AppIcon";
import { cn } from "@/lib/utils";
import PrayerTimeCard from "@/components/PrayerTimeCard";
import PrayerCardSkeleton from "@/components/skeleton/PrayerCardSkeleton";
import PrayerCountdown from "@/components/PrayerCountdown";

import MosqueFinderModal from "@/components/MosqueFinderModal";
import { usePrayerTimesContext } from "@/context/PrayerTimesContext";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/context/LocaleContext";

const PrayerCheckInWidget = dynamic(() => import("@/components/PrayerCheckInWidget"), {
    ssr: false,
    loading: () => <div className="h-[88px] w-full animate-pulse rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))]" />,
});

export default function PrayerTimesDisplay() {
    const { data, loading, error, refreshLocation } = usePrayerTimesContext();
    const { t } = useLocale();
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
                "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))] shadow-[var(--shadow-floating)]"
            )}>
                {/* Decorative Background */}
                <div className={cn(
                    "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none",
                    "bg-[rgb(var(--color-primary))]/10"
                )} />

                <div className="relative z-10 flex flex-col items-center space-y-4">
                    <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center border shadow-inner mb-2",
                        "bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))]"
                    )}>
                        <MapPin className="w-8 h-8 text-[rgb(var(--color-primary))]" />
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-lg font-bold text-[rgb(var(--color-text-strong))]">{t.homeLocationRequiredTitle}</h3>
                        <p className="text-sm leading-relaxed max-w-[280px] mx-auto text-[rgb(var(--color-text-muted))]">
                            {t.homeLocationRequiredDesc}
                        </p>
                    </div>

                    <div className="pt-2 w-full max-w-xs space-y-3">
                        <Button
                            onClick={refreshLocation}
                            className={cn(
                                "w-full h-12 font-bold rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_20px_rgb(var(--color-accent)/0.5)]",
                                "bg-[rgb(var(--color-accent))] hover:bg-[rgb(var(--color-accent))]/90 text-[rgb(var(--color-accent-foreground))]"
                            )}
                        >
                            <Navigation className="w-4 h-4 fill-current" />
                            {t.homeEnableLocation}
                        </Button>

                        {error && (
                            <div className="bg-[rgb(var(--color-danger))]/10 border border-[rgb(var(--color-danger))]/20 rounded-lg p-3 text-xs text-[rgb(var(--color-danger))] flex items-center gap-2 text-left">
                                <div className="shrink-0 w-1 h-8 bg-[rgb(var(--color-danger))] rounded-full" />
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
                        "bg-[rgb(var(--color-warning))]/10 border-[rgb(var(--color-warning))]/30 shadow-[var(--shadow-card)] ring-1 ring-[rgb(var(--color-warning))]/20"
                    )}>
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors shadow-sm",
                            "bg-[rgb(var(--color-warning))]/15 text-[rgb(var(--color-warning))]"
                        )}>
                            <Navigation className="w-5 h-5 fill-current" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-black uppercase tracking-wider text-[rgb(var(--color-warning))]">{t.homeLocationDefaultTitle}</p>
                            <p className="text-[10px] leading-tight mt-0.5 font-bold text-[rgb(var(--color-warning))]/80">
                                {t.homeLocationDefaultDesc}
                            </p>
                        </div>
                    </div>
                )}

                <h2 className="px-1 text-sm font-bold text-[rgb(var(--color-text-strong))]">
                    {t.homePrayerCheckInTitle}
                </h2>

                {nextPrayer && nextPrayerTime && (
                    <div className={cn(
                        "flex items-center justify-between gap-4 rounded-2xl border px-4 py-3",
                            "border-[rgb(var(--color-primary))]/25 bg-[rgb(var(--color-primary))]/10",
                    )}>
                        <div className="min-w-0">
                            <div className={cn(
                                "flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest",
                                "text-[rgb(var(--color-primary-strong))]",
                            )}>
                                <Clock className="h-3 w-3" />
                                {t.homeNextLabel}
                            </div>
                            <p className="mt-1 truncate text-sm font-bold text-[rgb(var(--color-text-strong))]">
                                {nextPrayerLabel} <span className="tabular-nums opacity-70">{nextPrayerTime}</span>
                            </p>
                        </div>
                        <div
                            role="timer"
                            aria-label={`${t.homeNextLabel} ${nextPrayerLabel}`}
                            className="text-[rgb(var(--color-text-strong))]"
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
                "border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]",
            )}>
                <span className="text-[9px] font-black uppercase tracking-widest text-[rgb(var(--color-text-muted))]">
                    {t.homeQuickAccessTitle}
                </span>
                <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
                    <Link
                        href="/hijri-calendar"
                        className={cn(
                            "flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-xl border px-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]",
                            "border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-primary))]/10",
                        )}
                    >
                        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-[rgb(var(--color-primary))]" />
                        <span className="truncate text-[9px] font-black uppercase tracking-tight">{t.homeQuickHijri}</span>
                    </Link>
                    <Link
                        href="/qibla"
                        className={cn(
                            "flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-xl border px-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]",
                            "border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-primary))]/10",
                        )}
                    >
                        <AppIcon name="compass" size="xs" tone="primary" />
                        <span className="text-[9px] font-black uppercase tracking-widest">{t.homeQiblaLabel}</span>
                    </Link>
                    <button
                        onClick={() => setShowMosqueFinder(true)}
                        aria-label={t.homeFindMosqueAria}
                        className={cn(
                            "flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-xl border px-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]",
                            "border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-primary))]/10",
                        )}
                    >
                        <MapPin className="h-3 w-3 text-[rgb(var(--color-primary))]" />
                        <span className="truncate text-[9px] font-black uppercase tracking-tight">{t.homeQuickMosque}</span>
                    </button>
                    <Link
                        href="/mentor-ai"
                        prefetch={false}
                        aria-label={`${t.homeAiTitle}: ${t.homeAiSubtitle}`}
                        className={cn(
                            "flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-xl border px-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]",
                            "border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-primary))]/10",
                        )}
                    >
                        <AppIcon name="sparkles" size="xs" tone="primary" />
                        <span className="truncate text-[9px] font-black uppercase tracking-tight">{t.homeQuickAi}</span>
                    </Link>
                </div>
            </div>

            <MosqueFinderModal
                isOpen={showMosqueFinder}
                onClose={() => setShowMosqueFinder(false)}
            />
        </div>
    );
}
