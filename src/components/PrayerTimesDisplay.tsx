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

import { useState, useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Edit2, MapPin, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import PrayerTimeCard from "@/components/PrayerTimeCard";
import PrayerCardSkeleton from "@/components/skeleton/PrayerCardSkeleton";
import PrayerCountdown from "@/components/PrayerCountdown";

import UserProfileDialog from "@/components/UserProfileDialog"; // New Component
import MosqueFinderModal from "@/components/MosqueFinderModal";
import { usePrayerTimesContext } from "@/context/PrayerTimesContext";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";


export default function PrayerTimesDisplay() {
    const { data, loading, error, refreshLocation } = usePrayerTimesContext();
    const { t } = useLocale();
    const { currentTheme } = useTheme();
    const isDaylight = currentTheme === "daylight";
    const [userName, setUserName] = useState("Sobat Nawaetu");
    const [showMosqueFinder, setShowMosqueFinder] = useState(false);

    const refreshProfile = () => {
        const storage = getStorageService();
        const savedName = storage.getOptional(STORAGE_KEYS.USER_NAME);
        if (savedName) setUserName(savedName as string);
    };

    useEffect(() => {
        refreshProfile();
    }, []);

    // Greeting Logic
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 4 && hour < 10) return t.homeGreetingMorning;
        if (hour >= 10 && hour < 15) return t.homeGreetingNoon;
        if (hour >= 15 && hour < 18) return t.homeGreetingAfternoon;
        return t.homeGreetingEvening;
    };

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

    return (
        <div className="relative w-full max-w-md flex flex-col gap-4">

            <div className="relative space-y-3">
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

                <div className="flex items-center justify-between px-1">
                    <h2 className={cn("text-sm font-bold shrink-0", isDaylight ? "text-slate-800" : "text-white/80")}>{t.homePrayerTimesToday}</h2>
                    <div className="flex items-center gap-1.5 shrink-0">
                        {/* Qibla Button */}
                        <Link
                            href="/qibla"
                            className={cn(
                                "flex items-center justify-center gap-1 min-w-[72px] h-[22px] px-2 rounded-full border transition-all group",
                                isDaylight
                                    ? "bg-slate-50 hover:bg-slate-100 border-slate-100 text-slate-600 hover:text-slate-900"
                                    : "bg-white/5 hover:bg-white/10 border-white/5 text-slate-300 hover:text-white"
                            )}
                        >
                            <span className="text-[9px] shrink-0">🧭</span>
                            <span className="text-[7.5px] font-black uppercase tracking-widest whitespace-nowrap">{t.homeQiblaLabel}</span>
                        </Link>
                        {/* Mosque Finder Button */}
                        <button
                            onClick={() => setShowMosqueFinder(true)}
                            aria-label={t.homeFindMosqueAria}
                            className={cn(
                                "flex items-center justify-center gap-1 min-w-[72px] h-[22px] px-2 rounded-full border transition-all group",
                                isDaylight
                                    ? "bg-slate-50 hover:bg-slate-100 border-slate-100 text-slate-600 hover:text-slate-900"
                                    : "bg-white/5 hover:bg-white/10 border-white/5 text-slate-300 hover:text-white"
                            )}
                        >
                            <MapPin className={cn("w-2.5 h-2.5 shrink-0 group-hover:scale-110 transition-transform", isDaylight ? "text-emerald-500" : "text-[rgb(var(--color-primary))]")} />
                            <span className="text-[7.5px] font-black uppercase tracking-widest whitespace-nowrap">{t.homeFindMosque}</span>
                        </button>
                    </div>
                </div>

                <PrayerTimeCard {...data} />
            </div>

            {/* Bottom spacer to Ensure scrolling fits everything above bottom nav */}
            <div className="h-4" />

            <MosqueFinderModal
                isOpen={showMosqueFinder}
                onClose={() => setShowMosqueFinder(false)}
            />
        </div>
    );
}
