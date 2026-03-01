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

import { useState, useEffect, memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Compass, Settings, Fingerprint, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/context/LocaleContext";
import { usePrayerTimesContext } from "@/context/PrayerTimesContext";
import { useTheme } from "@/context/ThemeContext";
import { useFeaturePreset } from "@/hooks/useFeaturePreset";

// Enhanced Moon icon for Ramadhan with crescent and star
const MoonStarIcon = ({ className, isActive }: { className?: string; isActive?: boolean }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor">
        {/* Crescent Moon */}
        <path
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
            fill={isActive ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
        />
        {/* Star */}
        <path
            d="M16 3l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"
            fill="currentColor"
            className={isActive ? "animate-pulse" : ""}
        />
    </svg>
);

const BottomNav = memo(function BottomNav() {
    const pathname = usePathname();
    const { t } = useLocale();
    const { currentTheme } = useTheme();
    const isDaylight = currentTheme === "daylight";
    const [mounted, setMounted] = useState(false);
    const { data } = usePrayerTimesContext();
    const { showStats } = useFeaturePreset();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Detect Ramadhan from hijriMonth returned by usePrayerTimes
    const hijriMonth = data?.hijriMonth ?? "";
    const isRamadhan = hijriMonth.toLowerCase().includes("ramadan") || hijriMonth.toLowerCase().includes("ramadhan");

    // Seasonal nav: during Ramadhan, replace Tasbih (center) with Ramadhan Hub
    // Stats icon hanya tampil jika preset Lengkap
    const navItems = isRamadhan
        ? [
            { href: "/", label: t.navHome, icon: Home, special: false },
            { href: "/quran", label: t.navQuran, icon: BookOpen, special: false },
            { href: "/ramadhan", label: "Ramadhan", icon: MoonStarIcon, special: true },
            { href: "/dhikr", label: t.navTasbih, icon: Fingerprint, special: false },
            { href: "/settings", label: t.navSettings, icon: Settings, special: false },
        ]
        : [
            { href: "/", label: t.navHome, icon: Home, special: false },
            { href: "/quran", label: t.navQuran, icon: BookOpen, special: false },
            showStats ? { href: "/stats", label: (t as any).navStats ?? "Statistik", icon: BarChart3, special: false } : null,
            { href: "/dhikr", label: t.navTasbih, icon: Fingerprint, special: false },
            { href: "/qibla", label: t.navQibla, icon: Compass, special: false },
            { href: "/settings", label: t.navSettings, icon: Settings, special: false },
        ].filter(Boolean) as { href: string; label: string; icon: React.ElementType; special: boolean }[];

    if (!mounted || pathname === "/mentor-ai") return null;

    return (
        <nav
            className={cn(
                "fixed bottom-0 left-0 z-50 w-full border-t backdrop-blur-xl pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.05)]",
                isDaylight ? "bg-white/90 border-slate-200/60" : "bg-black/80 border-white/10"
            )}
        >
            <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2 relative">
                {mounted &&
                    navItems.map(({ href, label, icon: Icon, special }) => {
                        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

                        if (special) {
                            // Special Ramadhan center button — elevated with starry glow
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    prefetch={true}
                                    className="relative flex flex-col items-center justify-center gap-1 min-w-[64px]"
                                >
                                    {/* Elevated Button Container */}
                                    <div className="relative -mt-5 mb-1">
                                        {/* Animated outer glow ring */}
                                        <span
                                            className={cn(
                                                "absolute inset-0 rounded-full transition-all duration-500",
                                                isActive
                                                    ? "blur-lg opacity-70 animate-pulse-glow"
                                                    : "blur-md opacity-40",
                                                isDaylight && isActive ? "bg-emerald-300" : ""
                                            )}
                                            style={!isDaylight ? {
                                                transform: "scale(1.4)",
                                                backgroundColor: isActive
                                                    ? "rgb(var(--color-primary-light))"
                                                    : "rgba(var(--color-primary), 0.8)"
                                            } : {
                                                transform: "scale(1.4)",
                                                backgroundColor: isActive ? "" : "rgba(16, 185, 129, 0.2)"
                                            }}
                                        />

                                        {/* Small decorative stars around the circle */}
                                        {isActive && (
                                            <>
                                                <span className="absolute -top-1 -right-1 text-[8px] animate-pulse" style={{ animationDelay: "0s" }}>✨</span>
                                                <span className="absolute -bottom-1 -left-1 text-[8px] animate-pulse" style={{ animationDelay: "0.5s" }}>✨</span>
                                                <span className="absolute top-0 -left-2 text-[6px] animate-pulse" style={{ animationDelay: "1s" }}>⭐</span>
                                            </>
                                        )}

                                        {/* Button pill */}
                                        <span
                                            className={cn(
                                                "relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300",
                                                isActive && "scale-105 shadow-xl shadow-emerald-500/20"
                                            )}
                                            style={isActive ? (isDaylight ? {
                                                borderColor: "#34d399",
                                                background: `radial-gradient(circle at 30% 30%, #a7f3d0, #34d399)`,
                                                boxShadow: `
                                                    0 0 0 1px rgba(16, 185, 129, 0.3),
                                                    0 4px 15px rgba(16, 185, 129, 0.2),
                                                    inset 0 1px 2px rgba(255, 255, 255, 0.4)
                                                `
                                            } : {
                                                borderColor: "rgb(var(--color-primary-light))",
                                                background: `radial-gradient(circle at 30% 30%, rgb(var(--color-primary-light)), rgb(var(--color-primary)), rgb(var(--color-primary-dark)))`,
                                                boxShadow: `
                                                    0 0 0 1px rgba(var(--color-primary-light), 0.5),
                                                    0 4px 20px rgba(var(--color-primary), 0.5),
                                                    0 8px 40px rgba(var(--color-primary-light), 0.3),
                                                    inset 0 1px 2px rgba(255, 255, 255, 0.3)
                                                `
                                            }) : (isDaylight ? {
                                                borderColor: "rgba(16, 185, 129, 0.2)",
                                                background: `radial-gradient(circle at 30% 30%, #f0fdf4, #d1fae5)`,
                                                boxShadow: `
                                                    0 2px 8px rgba(16, 185, 129, 0.05)
                                                `
                                            } : {
                                                borderColor: "rgba(var(--color-primary), 0.5)",
                                                background: `radial-gradient(circle at 30% 30%, rgba(var(--color-primary), 0.9), rgba(var(--color-primary-dark), 0.8))`,
                                                boxShadow: `
                                                    0 0 0 1px rgba(var(--color-primary), 0.3),
                                                    0 4px 16px rgba(var(--color-primary), 0.3)
                                                `
                                            })}
                                        >
                                            {/* Inner highlight for depth */}
                                            <span
                                                className="absolute inset-0 rounded-full opacity-30"
                                                style={{
                                                    background: "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4), transparent 60%)"
                                                }}
                                            />

                                            <Icon
                                                isActive={isActive}
                                                className={cn(
                                                    "relative h-6 w-6 transition-all duration-300",
                                                    isActive
                                                        ? isDaylight
                                                            ? "text-emerald-950"
                                                            : "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]"
                                                        : isDaylight ? "text-emerald-600" : "text-white/90"
                                                )}
                                            />
                                        </span>
                                    </div>
                                    <span
                                        className={cn(
                                            "text-[10px] font-extrabold tracking-tight transition-all duration-300",
                                            isActive && (isDaylight ? "text-emerald-700" : "drop-shadow-[0_0_4px_rgba(var(--color-primary-light),0.8)]")
                                        )}
                                        style={{
                                            color: isActive
                                                ? isDaylight ? "" : `rgb(var(--color-primary-light))`
                                                : isDaylight ? "rgba(5, 150, 105, 0.7)" : `rgba(var(--color-primary-light), 0.7)`
                                        }}
                                    >
                                        {label}
                                    </span>
                                </Link>
                            );
                        }

                        return (
                            <Link
                                key={href}
                                href={href}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1 p-2 transition-all duration-300",
                                    isActive
                                        ? isDaylight
                                            ? "text-emerald-600"
                                            : "text-[rgb(var(--color-primary-light))] drop-shadow-[0_0_8px_rgba(var(--color-primary),0.5)]"
                                        : isDaylight
                                            ? "text-slate-400 hover:text-slate-600"
                                            : "text-slate-400 hover:text-white/90"
                                )}
                                prefetch={true}
                            >
                                <Icon className={cn(
                                    "h-6 w-6 transition-transform duration-300",
                                    isActive && (isDaylight ? "fill-emerald-500/10 scale-110" : "fill-[rgb(var(--color-primary-light))]/20 scale-110")
                                )} />
                                <span className={cn(
                                    "text-[10px] transition-all",
                                    isActive ? "font-bold" : "font-medium"
                                )}>{label}</span>
                            </Link>
                        );
                    })}
            </div>
        </nav>
    );
});

export default BottomNav;
