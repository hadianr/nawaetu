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

import { useSyncExternalStore, memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Scroll, Settings, Fingerprint } from "lucide-react";
import { AppIcon } from "@/components/ui/AppIcon";
import { cn } from "@/lib/utils";
import { useLocale } from "@/context/LocaleContext";
import { usePrayerTimesContext } from "@/context/PrayerTimesContext";

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
    const mounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    );
    const { data } = usePrayerTimesContext();

    // Detect Ramadhan from hijriMonth returned by usePrayerTimes
    const hijriMonth = data?.hijriMonth ?? "";
    const isRamadhan = hijriMonth.toLowerCase().includes("ramadan") || hijriMonth.toLowerCase().includes("ramadhan");

    // Seasonal nav: during Ramadhan, replace Tasbih (center) with Ramadhan Hub
    const navItems = isRamadhan
        ? [
            { href: "/", label: t.navHome, icon: Home, special: false },
            { href: "/quran", label: t.navQuran, icon: BookOpen, special: false },
            { href: "/ramadhan", label: "Ramadhan", icon: MoonStarIcon, special: true },
            { href: "/sirah", label: t.navSirah ?? "Sirah", icon: Scroll, special: false },
            { href: "/settings", label: t.navSettings, icon: Settings, special: false },
        ]
        : [
            { href: "/", label: t.navHome, icon: Home, special: false },
            { href: "/quran", label: t.navQuran, icon: BookOpen, special: false },
            { href: "/sirah", label: t.navSirah ?? "Sirah", icon: Scroll, special: false },
            { href: "/dhikr", label: t.navTasbih, icon: Fingerprint, special: false },
            { href: "/settings", label: t.navSettings, icon: Settings, special: false },
        ];

    if (!mounted || pathname === "/mentor-ai") return null;

    return (
        <nav
            aria-label="Navigasi utama"
            className={cn(
                "glass-surface fixed bottom-0 left-0 z-50 w-full border-t pb-safe shadow-[var(--shadow-floating)]"
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
                                    prefetch={false}
                                    aria-current={isActive ? "page" : undefined}
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
                                                isActive ? "bg-[rgb(var(--color-primary-light))]" : "bg-[rgb(var(--color-primary))]"
                                            )}
                                            style={{ transform: "scale(1.4)" }}
                                        />

                                        {/* Small decorative stars around the circle */}
                                        {isActive && (
                                            <>
                                                <AppIcon name="sparkles" size="xs" tone="primary" className="absolute -top-1 -right-1 animate-pulse" />
                                                <AppIcon name="sparkles" size="xs" tone="primary" className="absolute -bottom-1 -left-1 animate-pulse" />
                                                <AppIcon name="star" size="xs" tone="warning" className="absolute top-0 -left-2 animate-pulse" />
                                            </>
                                        )}

                                        {/* Button pill */}
                                        <span
                                            className={cn(
                                                "relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-[rgb(var(--color-primary-light))] bg-[rgb(var(--color-primary))]/20 transition-all duration-300 shadow-[var(--shadow-floating)]",
                                                isActive && "scale-105 bg-[rgb(var(--color-primary))]"
                                            )}
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
                                                        ? "text-[rgb(var(--color-primary-foreground))]"
                                                        : "text-[rgb(var(--color-primary-strong))]"
                                                )}
                                            />
                                        </span>
                                    </div>
                                    <span
                                        className={cn(
                                            "text-[10px] font-extrabold tracking-tight transition-all duration-300",
                                            isActive && "text-[rgb(var(--color-primary-strong))]"
                                        )}
                                        style={{ color: isActive ? "rgb(var(--color-primary-light))" : "rgb(var(--color-text-muted))" }}
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
                                aria-current={isActive ? "page" : undefined}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1 p-2 transition-all duration-300",
                                    isActive
                                        ? "text-[rgb(var(--color-primary-strong))]"
                                        : "text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text))]"
                                )}
                                prefetch={false}
                            >
                                <Icon className={cn(
                                    "h-6 w-6 transition-transform duration-300",
                                    isActive && "fill-[rgb(var(--color-primary))]/10 scale-110"
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
