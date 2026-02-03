"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Edit2, MapPin, Navigation } from "lucide-react";
import PrayerTimeCard from "@/components/PrayerTimeCard";
import PrayerCardSkeleton from "@/components/skeleton/PrayerCardSkeleton";
import PrayerCountdown from "@/components/PrayerCountdown";
import QuoteOfDay from "@/components/QuoteOfDay";
import UserProfileDialog from "@/components/UserProfileDialog"; // New Component
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { Button } from "@/components/ui/button";


export default function PrayerTimesDisplay() {
    const { data, loading, error, refreshLocation } = usePrayerTimes();
    const [userName, setUserName] = useState("Sobat Nawaetu");
    const [userTitle, setUserTitle] = useState("Hamba Allah");

    const refreshProfile = () => {
        const savedName = localStorage.getItem("user_name");
        const savedTitle = localStorage.getItem("user_title");
        if (savedName) setUserName(savedName);
        if (savedTitle) setUserTitle(savedTitle);
    };

    useEffect(() => {
        refreshProfile();
    }, []);

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
                        <h3 className="text-lg font-bold text-white">Izin Lokasi Diperlukan</h3>
                        <p className="text-sm text-slate-400 leading-relaxed max-w-[280px] mx-auto">
                            Nawaetu membutuhkan lokasi Anda untuk menghitung jadwal sholat dan arah kiblat yang akurat.
                        </p>
                    </div>

                    <div className="pt-2 w-full max-w-xs space-y-3">
                        <Button
                            onClick={refreshLocation}
                            className="w-full h-12 bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-dark))] text-white font-bold rounded-xl shadow-[0_0_20px_rgba(var(--color-primary),0.3)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Navigation className="w-4 h-4 fill-current" />
                            Aktifkan Lokasi
                        </Button>

                        {!error && (
                            <p className="text-[10px] text-slate-500">
                                Browser akan meminta izin setelah tombol diklik.
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
                    <h2 className="text-lg font-semibold text-white/80">Jadwal Sholat Hari Ini</h2>
                    <a
                        href="https://www.google.com/maps/search/?api=1&query=masjid+terdekat"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Cari Masjid Terdekat via Google Maps"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-slate-300 hover:text-white group"
                    >
                        <MapPin className="w-3.5 h-3.5 text-[rgb(var(--color-primary))] group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Cari Masjid</span>
                    </a>
                </div>

                <PrayerTimeCard {...data} />
            </div>

            {/* Quote of The Day */}
            <QuoteOfDay />

            {/* Bottom spacer to Ensure scrolling fits everything above bottom nav */}
            <div className="h-4" />
        </div>
    );
}
