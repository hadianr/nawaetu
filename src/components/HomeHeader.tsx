"use client";

import { useState, useEffect } from "react";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import StreakBadge from "@/components/StreakBadge";

import { MapPin } from "lucide-react";

export default function HomeHeader() {
    const { data } = usePrayerTimes();
    const [userName, setUserName] = useState("Sobat Nawaetu");
    const [userTitle, setUserTitle] = useState("Hamba Allah");
    const [gender, setGender] = useState<'male' | 'female' | null>(null);
    const [userAvatar, setUserAvatar] = useState<string | null>(null);

    const refreshProfile = () => {
        const savedName = localStorage.getItem("user_name");
        const savedTitle = localStorage.getItem("user_title");
        const savedGender = localStorage.getItem("user_gender") as 'male' | 'female' | null;
        const savedAvatar = localStorage.getItem("user_avatar");
        if (savedName) setUserName(savedName);
        if (savedTitle) setUserTitle(savedTitle);
        setGender(savedGender);
        setUserAvatar(savedAvatar);
    };

    useEffect(() => {
        refreshProfile();

        // Listen for storage events (in case changed in Settings) and custom XP events
        const handleStorage = () => refreshProfile();
        window.addEventListener("storage", handleStorage);
        window.addEventListener("xp_updated", handleStorage);
        window.addEventListener("avatar_updated", handleStorage); // Real-time avatar sync
        window.addEventListener("focus", handleStorage);

        return () => {
            window.removeEventListener("storage", handleStorage);
            window.removeEventListener("xp_updated", handleStorage);
            window.removeEventListener("avatar_updated", handleStorage);
            window.removeEventListener("focus", handleStorage);
        }
    }, []);

    const [greeting, setGreeting] = useState("Selamat Datang");
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const hour = new Date().getHours();
        if (hour >= 4 && hour < 10) setGreeting("Selamat Pagi");
        else if (hour >= 10 && hour < 15) setGreeting("Selamat Siang");
        else if (hour >= 15 && hour < 18) setGreeting("Selamat Sore");
        else setGreeting("Selamat Malam");
    }, []);

    // ... existing start of return ...
    return (
        <div className="w-full flex items-start justify-between animate-in slide-in-from-top-4 duration-700">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 mb-1">
                    <div className="text-sm font-medium text-[rgb(var(--color-primary-light))] uppercase tracking-widest opacity-90">
                        {greeting}
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight leading-none min-h-[2rem]">
                    {isMounted ? userName : "Sobat Nawaetu"}
                </h1>
                <span className="inline-block mt-1 text-[10px] uppercase tracking-widest text-white/70 bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                    {userTitle}
                </span>
            </div>

            {/* Location, Streak & Date Badge */}
            <div className="flex flex-col items-end gap-1.5 text-right">
                <div className="flex items-center gap-2">
                    <StreakBadge gender={gender} />
                    <div className="flex items-center gap-1.5 bg-[rgb(var(--color-primary))]/10 px-2 py-1 rounded-full border border-[rgb(var(--color-primary))]/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--color-primary))] animate-pulse"></span>
                        <span className="text-[10px] font-bold text-[rgb(var(--color-primary-light))] uppercase tracking-widest min-w-[60px] text-center inline-block whitespace-nowrap overflow-hidden text-ellipsis">
                            {data?.locationName?.split(",")[0] || "Lokasi..."}
                        </span>
                    </div>
                </div>
                <span className="text-[10px] text-white/60 font-medium px-1">
                    {data?.hijriDate || "Loading..."}
                </span>
            </div>
        </div>
    );
}
