"use client";

import { useState, useEffect } from "react";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useLocale } from "@/context/LocaleContext";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import StreakBadge from "@/components/StreakBadge";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

// Inline critical icons to avoid lucide overhead on LCP
const NavigationIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3 11 22 2 13 21 11 13 3 11" />
    </svg>
);

export default function HomeHeader() {
    const { data, refreshLocation } = usePrayerTimes();
    const { t } = useLocale();
    const { data: session, status } = useSession(); // Get status
    const storage = getStorageService();
    const [userName, setUserName] = useState("Sobat Nawaetu");
    const [gender, setGender] = useState<'male' | 'female' | null>(null);
    const [userAvatar, setUserAvatar] = useState<string | null>(null);

    // Sync Session to Local Storage
    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            // Update local state immediately
            if (session.user.name) setUserName(session.user.name);
            if (session.user.image) setUserAvatar(session.user.image);

            // Persist to storage to prevent future flicker
            if (session.user.name) storage.set(STORAGE_KEYS.USER_NAME as any, session.user.name);
            if (session.user.image) storage.set(STORAGE_KEYS.USER_AVATAR as any, session.user.image);
        }
    }, [session, status, storage]);

    const refreshProfile = () => {
        // 1. If Authenticated & Session User exists -> Use it (Source of Truth)
        if (status === "authenticated" && session?.user?.name) {
            setUserName(session.user.name);
            if (session.user.image) setUserAvatar(session.user.image);

            // Gender isn't in default session user usually, check custom type or storage
            const savedGender = storage.getOptional(STORAGE_KEYS.USER_GENDER as any);
            if (savedGender) setGender(savedGender as 'male' | 'female' | null);
            return;
        }

        // 2. If Loading or Unauthenticated -> Use Storage (Cache)
        // This prevents the "glitch" where it shows default name while waiting for session
        const [savedName, savedGender, savedAvatar] = storage.getMany([
            STORAGE_KEYS.USER_NAME,
            STORAGE_KEYS.USER_GENDER,
            STORAGE_KEYS.USER_AVATAR
        ]).values();

        if (savedName) setUserName(savedName as string);
        if (savedAvatar) setUserAvatar(savedAvatar as string | null);
        if (savedGender) setGender(savedGender as 'male' | 'female' | null);
    };

    useEffect(() => {
        refreshProfile();
    }, [storage, status]); // Add status dependency

    useEffect(() => {
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
        };
    }, [storage]);

    const [greeting, setGreeting] = useState(t.homeGreetingWelcome);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const hour = new Date().getHours();
        if (hour >= 4 && hour < 10) setGreeting(t.homeGreetingMorning);
        else if (hour >= 10 && hour < 15) setGreeting(t.homeGreetingNoon);
        else if (hour >= 15 && hour < 18) setGreeting(t.homeGreetingAfternoon);
        else setGreeting(t.homeGreetingEvening);
    }, [t]);

    const locationLabel = data?.locationName?.split(",")[0] || "";
    const hijriLabel = data?.hijriDate || "";

    return (
        <div className="w-full flex items-start justify-between">
            <div className="flex flex-1 min-w-0 flex-col gap-1">
                <div className="flex items-center gap-2 mb-1">
                    <div className="text-sm font-medium text-[rgb(var(--color-primary-light))] uppercase tracking-widest opacity-90">
                        {greeting}
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight leading-none min-h-[2rem]">
                    {isMounted ? (
                        <span className="block truncate max-w-[12rem] xs:max-w-[16rem]">
                            {userName}
                        </span>
                    ) : (
                        <span className="inline-block w-32 xs:w-40 h-7 rounded bg-white/10 animate-pulse align-middle" />
                    )}
                </h1>
            </div>

            {/* Location, Streak & Date Badge */}
            <div className="flex shrink-0 flex-col items-end gap-1.5 text-right min-w-[120px]">
                <div className="flex items-center gap-2">
                    <StreakBadge gender={gender} />
                    <button
                        onClick={refreshLocation}
                        className={cn(
                            "flex items-center gap-1.5 px-2 py-1 rounded-full border transition-all active:scale-95",
                            data?.isDefaultLocation
                                ? "bg-amber-500/20 border-amber-500/40 hover:bg-amber-500/30"
                                : "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/20 hover:bg-[rgb(var(--color-primary))]/20"
                        )}
                    >
                        {data?.isDefaultLocation ? (
                            <NavigationIcon className="w-3 h-3 text-amber-400 animate-pulse" />
                        ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--color-primary))] animate-pulse"></span>
                        )}
                        <span className={cn(
                            "text-[10px] font-bold uppercase tracking-widest min-w-[60px] xs:min-w-[70px] text-center inline-block whitespace-nowrap overflow-hidden text-ellipsis",
                            data?.isDefaultLocation ? "text-amber-200" : "text-[rgb(var(--color-primary-light))]"
                        )}>
                            {locationLabel ? (
                                data?.isDefaultLocation ? t.homeSetLocationNow || "Set Lokasi" : locationLabel
                            ) : (
                                <span className="inline-block w-16 h-3 rounded bg-white/10 animate-pulse align-middle" />
                            )}
                        </span>
                    </button>
                </div>
                <span className="text-[10px] text-white/80 font-medium px-1 min-h-[0.875rem]">
                    {hijriLabel ? (
                        hijriLabel
                    ) : (
                        <span className="inline-block w-20 h-3 rounded bg-white/10 animate-pulse" />
                    )}
                </span>
            </div>
        </div >
    );
}
