"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Compass, Settings, Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomNav() {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const navItems = [
        { href: "/", label: "Beranda", icon: Home },
        { href: "/quran", label: "Al-Qur'an", icon: BookOpen },
        { href: "/tasbih", label: "Tasbih", icon: Fingerprint },
        { href: "/kiblat", label: "Kiblat", icon: Compass },
        { href: "/atur", label: "Atur", icon: Settings },
    ];

    if (!mounted || pathname === "/tanya-ustadz") return null;

    return (
        <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-white/10 bg-black/80 backdrop-blur-xl pb-safe">
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
                        >
                            <Icon className={cn("h-6 w-6", isActive && "fill-[rgb(var(--color-primary-light))]/20")} />
                            <span className="text-[10px] font-medium">{label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
