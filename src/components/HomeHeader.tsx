"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { usePrayerTimesContext } from "@/context/PrayerTimesContext";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { cn } from "@/lib/utils";
import StreakBadge from "@/components/StreakBadge";

const NavigationIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3 11 22 2 13 21 11 13 3 11" />
    </svg>
);

const storage = getStorageService();

export default function HomeHeader() {
    const { data, refreshLocation } = usePrayerTimesContext();
    const { t } = useLocale();
    const { currentTheme } = useTheme();
    const { data: session, status } = useSession();
    const [userName, setUserName] = useState("Sobat Nawaetu");
    const [greeting, setGreeting] = useState(t.homeGreetingWelcome);
    const [isMounted, setIsMounted] = useState(false);
    const isDaylight = isMounted && currentTheme === "daylight";

    useEffect(() => {
        setIsMounted(true);
        const hour = new Date().getHours();
        if (hour >= 4 && hour < 10) setGreeting(t.homeGreetingMorning);
        else if (hour >= 10 && hour < 15) setGreeting(t.homeGreetingNoon);
        else if (hour >= 15 && hour < 18) setGreeting(t.homeGreetingAfternoon);
        else setGreeting(t.homeGreetingEvening);
    }, [t]);

    useEffect(() => {
        const refreshProfile = () => {
            const name = status === "authenticated" ? session?.user?.name : null;
            if (name) {
                setUserName(name);
                storage.set(STORAGE_KEYS.USER_NAME, name);
                return;
            }
            const savedName = storage.getOptional<string>(STORAGE_KEYS.USER_NAME);
            if (savedName) setUserName(savedName);
        };
        refreshProfile();
        window.addEventListener("storage", refreshProfile);
        window.addEventListener("avatar_updated", refreshProfile);
        return () => {
            window.removeEventListener("storage", refreshProfile);
            window.removeEventListener("avatar_updated", refreshProfile);
        };
    }, [session, status]);

    const locationLabel = isMounted ? data?.locationName?.split(",")[0] || "" : "";

    return (
        <header className="flex w-full items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
                <p className={cn(
                    "text-[11px] font-medium uppercase tracking-widest sm:text-sm",
                    isDaylight ? "text-emerald-600/80" : "text-[rgb(var(--color-primary-light))]/90",
                )}>
                    {greeting}
                </p>
                <h1 className={cn("mt-1 min-h-8 truncate text-xl font-bold leading-none tracking-tight sm:text-2xl", isDaylight ? "text-slate-900" : "text-white")}>
                    {isMounted ? userName : <span className={cn("inline-block h-6 w-32 animate-pulse rounded", isDaylight ? "bg-slate-100" : "bg-white/10")} />}
                </h1>
            </div>
            <div className="flex shrink-0 items-center gap-2">
                <StreakBadge />
                <button
                    type="button"
                    onClick={refreshLocation}
                    className={cn(
                        "flex min-h-11 max-w-[130px] shrink-0 items-center gap-2 rounded-full border px-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))] sm:max-w-[160px]",
                        isDaylight
                            ? data?.isDefaultLocation ? "border-amber-200 bg-amber-50 hover:bg-amber-100" : "border-emerald-100 bg-emerald-50 hover:bg-emerald-100/70"
                            : data?.isDefaultLocation ? "border-amber-500/40 bg-amber-500/20 hover:bg-amber-500/30" : "border-[rgb(var(--color-primary))]/20 bg-[rgb(var(--color-primary))]/10 hover:bg-[rgb(var(--color-primary))]/20",
                    )}
                >
                    <NavigationIcon className={cn("h-3.5 w-3.5 shrink-0", data?.isDefaultLocation ? "text-amber-500" : "text-[rgb(var(--color-primary))]")} />
                    <span className={cn(
                        "truncate text-[10px] font-black uppercase tracking-widest",
                        isDaylight ? data?.isDefaultLocation ? "text-amber-700" : "text-emerald-700" : data?.isDefaultLocation ? "text-amber-200" : "text-[rgb(var(--color-primary-light))]",
                    )}>
                        {locationLabel ? data?.isDefaultLocation ? t.homeSetLocationNow : locationLabel : t.hijriCalendarYourLocation}
                    </span>
                </button>
            </div>
        </header>
    );
}
