"use client";

import { useState, useEffect, memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Compass, Settings, Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";
import { SETTINGS_TRANSLATIONS } from "@/data/settings-translations";

const BottomNav = memo(function BottomNav() {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [locale, setLocale] = useState("id");

    useEffect(() => {
        setMounted(true);
        // Load locale from localStorage
        const savedLocale = localStorage.getItem("settings_locale") || "id";
        setLocale(savedLocale);
        
        // Listen for locale changes
        const handleStorageChange = () => {
            const newLocale = localStorage.getItem("settings_locale") || "id";
            setLocale(newLocale);
        };
        
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    const t = SETTINGS_TRANSLATIONS[locale as keyof typeof SETTINGS_TRANSLATIONS] || SETTINGS_TRANSLATIONS.id;

    const navItems = [
        { href: "/", label: t.navHome, icon: Home },
        { href: "/quran", label: t.navQuran, icon: BookOpen },
        { href: "/tasbih", label: t.navTasbih, icon: Fingerprint },
        { href: "/kiblat", label: t.navQibla, icon: Compass },
        { href: "/atur", label: t.navSettings, icon: Settings },
    ];

    if (!mounted || pathname === "/tanya-ustadz") return null;

    return (
        <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-white/10 bg-black/80 backdrop-blur-xl pb-safe" style={{ contentVisibility: 'auto' }}>
            <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
                {mounted && navItems.map(({ href, label, icon: Icon }) => {
                    const isActive = href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(href);

                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 p-2 transition-all duration-300",
                                isActive
                                    ? "text-[rgb(var(--color-primary-light))] drop-shadow-[0_0_8px_rgba(var(--color-primary),0.5)]"
                                    : "text-slate-500 hover:text-white/80"
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
