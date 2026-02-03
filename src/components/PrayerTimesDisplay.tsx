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
        <div className="relative w-full max-w-md flex flex-col gap-6">

            <div className="relative space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-lg font-semibold text-white/80">Jadwal Sholat Hari Ini</h3>
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
