"use client";

import { useState, useEffect, memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Compass, Settings, Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/context/LocaleContext";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";

// Moon icon for Ramadhan
const MoonStarIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        <path d="M20 3v4M22 5h-4" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" />
    </svg>
);

const BottomNav = memo(function BottomNav() {
    const pathname = usePathname();
    const { t } = useLocale();
    const [mounted, setMounted] = useState(false);
    const { data } = usePrayerTimes();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Detect Ramadhan from hijriMonth returned by usePrayerTimes
    const hijriMonth = data?.hijriMonth ?? "";
    const isRamadhan = hijriMonth.toLowerCase().includes("ramadan") || hijriMonth.toLowerCase().includes("ramadhan");

    // Seasonal nav: during Ramadhan, replace Tasbih (center) with Ramadhan Hub
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
            { href: "/dhikr", label: t.navTasbih, icon: Fingerprint, special: false },
            { href: "/qibla", label: t.navQibla, icon: Compass, special: false },
            { href: "/settings", label: t.navSettings, icon: Settings, special: false },
        ];

    if (!mounted || pathname === "/mentor-ai") return null;

    return (
        <nav
            className="fixed bottom-0 left-0 z-50 w-full border-t border-white/10 bg-black/80 backdrop-blur-xl pb-safe"
        >
            <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2 relative">
                {mounted &&
                    navItems.map(({ href, label, icon: Icon, special }) => {
                        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

                        if (special) {
                            // Special Ramadhan center button — elevated pill with amber glow
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className="relative flex flex-col items-center justify-center gap-1 min-w-[64px]"
                                >
                                    {/* Elevated Button Container */}
                                    <div className="relative -mt-6 mb-1">
                                        {/* Outer glow ring */}
                                        <span
                                            className={cn(
                                                "absolute inset-0 rounded-full blur-md transition-opacity duration-500",
                                                isActive ? "opacity-60" : "opacity-30"
                                            )}
                                            style={{ transform: "scale(1.3)", backgroundColor: "rgb(var(--color-primary-light))" }}
                                        />
                                        {/* Button pill */}
                                        <span
                                            className={cn(
                                                "relative flex h-14 w-14 items-center justify-center rounded-full border-2 shadow-lg transition-all duration-300",
                                            )}
                                            style={isActive ? {
                                                borderColor: "rgb(var(--color-primary-light))",
                                                background: `linear-gradient(to bottom, rgb(var(--color-primary)), rgb(var(--color-primary-dark)))`,
                                                boxShadow: `0 4px 20px rgba(var(--color-primary), 0.4)`
                                            } : {
                                                borderColor: "rgba(var(--color-primary), 0.6)",
                                                background: `linear-gradient(to bottom, rgba(var(--color-primary), 0.8), rgba(var(--color-primary-dark), 0.8))`,
                                            }}
                                        >
                                            <Icon
                                                className={cn(
                                                    "h-7 w-7 transition-all duration-300",
                                                    isActive ? "text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]" : "text-white/80"
                                                )}
                                            />
                                        </span>
                                    </div>
                                    <span
                                        className={cn(
                                            "text-[10px] font-bold tracking-tight",
                                        )}
                                        style={{ color: isActive ? `rgb(var(--color-primary-light))` : `rgba(var(--color-primary-light), 0.7)` }}
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
                                        ? "text-[rgb(var(--color-primary-light))] drop-shadow-[0_0_8px_rgba(var(--color-primary),0.5)]"
                                        : "text-slate-400 hover:text-white/90"
                                )}
                                prefetch={true}
                            >
                                <Icon className={cn("h-6 w-6", isActive && "fill-[rgb(var(--color-primary-light))]/20")} />
                                <span className="text-[10px] font-medium">{label}</span>
                            </Link>
                        );
                    })}
            </div>
        </nav>
    );
});

export default BottomNav;
