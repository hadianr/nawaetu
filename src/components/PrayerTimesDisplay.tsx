"use client";

import { RefreshCw } from "lucide-react";
import PrayerTimeCard from "@/components/PrayerTimeCard";
import PrayerCardSkeleton from "@/components/skeleton/PrayerCardSkeleton";
import PrayerCountdown from "@/components/PrayerCountdown";
import QuoteOfDay from "@/components/QuoteOfDay";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { Button } from "@/components/ui/button";

export default function PrayerTimesDisplay() {
    const { data, loading, error, refreshLocation } = usePrayerTimes();

    // Greeting Logic
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 4 && hour < 10) return "Selamat Pagi";
        if (hour >= 10 && hour < 15) return "Selamat Siang";
        if (hour >= 15 && hour < 18) return "Selamat Sore";
        return "Selamat Malam";
    };

    if (loading) {
        return <PrayerCardSkeleton />;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg">
                <p className="text-red-400 font-medium">{error}</p>
                <Button
                    variant="outline"
                    onClick={refreshLocation}
                    className="gap-2 border-white/20 text-white hover:bg-white/10"
                >
                    <RefreshCw className="h-4 w-4" />
                    Retry Location
                </Button>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="relative w-full max-w-md flex flex-col gap-8">

            {/* 1. Dashboard Header: Greeting & Date */}
            <div className="flex flex-col items-start space-y-2 animate-in slide-in-from-left-4 duration-700">
                <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                    {getGreeting()}, <br />
                    <span className="text-emerald-400 font-medium text-2xl md:text-3xl opacity-90">Sobat Nawaetu</span>
                </h2>

                {/* Location & Date Info */}
                <div className="flex flex-wrap items-center gap-3 text-white/70 text-sm font-medium pt-2">
                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>{data.locationName || "Lokasi Anda"}</span>
                    </div>
                    <div className="flex items-center gap-2 px-1">
                        <span>{data.hijriDate}</span>
                        <span className="w-1 h-1 rounded-full bg-white/30" />
                        <span>{data.gregorianDate}</span>
                    </div>
                </div>
            </div>

            {/* 2. Hero Section: NEXT PRAYER Countdown */}
            {/* Visually distinct card that draws attention */}
            {data.nextPrayer && data.nextPrayerTime && (
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900/40 to-black border border-emerald-500/20 p-8 text-center shadow-[0_0_40px_rgba(16,185,129,0.15)] group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />

                    {/* Background decoration */}
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-1000" />

                    <PrayerCountdown
                        targetTime={data.nextPrayerTime}
                        prayerName={data.nextPrayer}
                    />
                </div>
            )}

            {/* 3. Prayer Schedule List - Clean & Accessible */}
            <div className="relative space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-lg font-semibold text-white/80">Jadwal Sholat Hari Ini</h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={refreshLocation}
                        className="text-white/40 hover:text-white hover:bg-white/10 gap-1 text-xs h-auto py-1.5"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Update Lokasi</span>
                    </Button>
                </div>

                <PrayerTimeCard {...data} />
            </div>

            {/* 4. Quote of The Day */}
            <QuoteOfDay />

            {/* Bottom spacer to Ensure scrolling fits everything above bottom nav */}
            <div className="h-4" />
        </div>
    );
}
