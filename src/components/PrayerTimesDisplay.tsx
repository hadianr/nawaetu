"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Edit2, MapPin, Navigation } from "lucide-react";
import PrayerTimeCard from "@/components/PrayerTimeCard";
import PrayerCardSkeleton from "@/components/skeleton/PrayerCardSkeleton";
import PrayerCountdown from "@/components/PrayerCountdown";
import QuoteOfDay from "@/components/QuoteOfDay";
import UserProfileDialog from "@/components/UserProfileDialog"; // New Component
import MosqueFinderModal from "@/components/MosqueFinderModal";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/context/LocaleContext";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";


export default function PrayerTimesDisplay() {
    const { data, loading, error, refreshLocation } = usePrayerTimes();
    const { t } = useLocale();
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

    if (loading) {
        return <PrayerCardSkeleton />;
    }

    // Combined Error or Empty State (Needs Location)
    if (error || !data) {
        return (
            <div className="relative w-full max-w-md bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 rounded-3xl p-6 text-center shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[rgb(var(--color-primary))]/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center border border-white/5 shadow-inner mb-2">
                        <MapPin className="w-8 h-8 text-[rgb(var(--color-primary))]" />
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-lg font-bold text-white">{t.homeLocationRequiredTitle}</h3>
                        <p className="text-sm text-slate-400 leading-relaxed max-w-[280px] mx-auto">
                            {t.homeLocationRequiredDesc}
                        </p>
                    </div>

                    <div className="pt-2 w-full max-w-xs space-y-3">
                        <Button
                            onClick={refreshLocation}
                            className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Navigation className="w-4 h-4 fill-current" />
                            {t.homeEnableLocation}
                        </Button>

                        {!error && (
                            <p className="text-[10px] text-slate-500">
                                {t.homeLocationHint}
                            </p>
                        )}

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
        <div className="relative w-full max-w-md flex flex-col gap-6">

            <div className="relative space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-lg font-semibold text-white/80">{t.homePrayerTimesToday}</h2>
                    <div className="flex items-center gap-2">
                        {/* Qibla Button */}
                        <Link
                            href="/qibla"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-slate-300 hover:text-white group"
                        >
                            <span className="text-lg">🧭</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider">{t.homeQiblaLabel}</span>
                        </Link>
                        {/* Mosque Finder Button */}
                        <button
                            onClick={() => setShowMosqueFinder(true)}
                            aria-label={t.homeFindMosqueAria}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-slate-300 hover:text-white group"
                        >
                            <MapPin className="w-3.5 h-3.5 text-[rgb(var(--color-primary))] group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">{t.homeFindMosque}</span>
                        </button>
                    </div>
                </div>

                <PrayerTimeCard {...data} />

                {data.isDefaultLocation && (
                    <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mt-2 animate-in fade-in slide-in-from-top-2 duration-500">
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                            <Navigation className="w-5 h-5 text-amber-500" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-amber-200">{t.homeLocationDefaultTitle || "Lokasi Default (Jakarta)"}</p>
                            <p className="text-[10px] text-amber-200/60 leading-tight mt-0.5">
                                {t.homeLocationDefaultDesc || "Jadwal sholat saat ini berdasarkan Jakarta. Ketuk ikon lokasi di atas untuk memperbarui ke lokasi Anda."}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Quote of The Day */}
            <QuoteOfDay />

            {/* Bottom spacer to Ensure scrolling fits everything above bottom nav */}
            <div className="h-4" />

            <MosqueFinderModal
                isOpen={showMosqueFinder}
                onClose={() => setShowMosqueFinder(false)}
            />
        </div>
    );
}
