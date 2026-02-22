"use client";

import { useState, useEffect } from "react";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useLocale } from "@/context/LocaleContext";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, TrendingUp } from "lucide-react";
import { getPlayerStats } from "@/lib/leveling";
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
            <div className="flex flex-1 min-w-0 flex-col">
                <div className="flex items-center gap-2 mb-0.5">
                    <div className="text-[11px] sm:text-sm font-medium text-[rgb(var(--color-primary-light))] uppercase tracking-widest opacity-90">
                        {greeting}
                    </div>
                    {isMounted && (
                        <Link
                            href="/stats"
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors active:scale-95 group"
                        >
                            <TrendingUp className="w-2.5 h-2.5 text-[rgb(var(--color-primary-light))]" />
                            <span className="text-[10px] font-bold text-white/50 group-hover:text-white/80">
                                Lv {getPlayerStats().level}
                            </span>
                        </Link>
                    )}
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-none min-h-[1.75rem] sm:min-h-[2rem]">
                    {isMounted ? (
                        <span className="block truncate max-w-[10rem] xs:max-w-[14rem] sm:max-w-[16rem]">
                            {userName}
                        </span>
                    ) : (
                        <span className="inline-block w-24 xs:w-32 sm:w-40 h-6 sm:h-7 rounded bg-white/10 animate-pulse align-middle" />
                    )}
                </h1>
            </div>

            {/* Location, Streak & Date Badge */}
            <div className="flex shrink-0 flex-col items-end gap-1 text-right min-w-[110px] sm:min-w-[120px]">
                <div className="flex items-center gap-2">
                    <StreakBadge gender={gender} />
                    <button
                        onClick={refreshLocation}
                        className={cn(
                            "flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 h-6 sm:h-7 rounded-full border transition-all active:scale-95 max-w-[140px] sm:max-w-[200px]",
                            data?.isDefaultLocation
                                ? "bg-amber-500/20 border-amber-500/40 hover:bg-amber-500/30"
                                : "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/20 hover:bg-[rgb(var(--color-primary))]/20"
                        )}
                    >
                        {data?.isDefaultLocation ? (
                            <NavigationIcon className="w-2 h-2 sm:w-3 sm:h-3 text-amber-400 animate-pulse shrink-0" />
                        ) : (
                            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[rgb(var(--color-primary))] animate-pulse shrink-0"></span>
                        )}
                        <span className={cn(
                            "text-[7.5px] sm:text-[10px] font-bold uppercase tracking-wider text-center line-clamp-1",
                            data?.isDefaultLocation ? "text-amber-200" : "text-[rgb(var(--color-primary-light))]"
                        )}>
                            {locationLabel ? (
                                data?.isDefaultLocation ? t.homeSetLocationNow || "Set Lokasi" : locationLabel
                            ) : (
                                <span className="inline-block w-12 h-3 rounded bg-white/10 animate-pulse align-middle" />
                            )}
                        </span>
                    </button>
                </div>
            </div>
        </div >
    );
}
