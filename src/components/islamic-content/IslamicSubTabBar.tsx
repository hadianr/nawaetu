/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * IslamicSubTabBar — shared Hadith ↔ Dua tab switcher.
 * Fixes the theme bug (previously hardcoded dark-mode classes) by
 * applying isDaylight-aware styling on both tabs, for both pages.
 */

import Link from "next/link";
import { Quote, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface IslamicSubTabBarProps {
    /** Which tab is currently active */
    activeTab: "hadith" | "dua";
    isDaylight: boolean;
    t: Record<string, string>;
}

export function IslamicSubTabBar({ activeTab, isDaylight, t }: IslamicSubTabBarProps) {
    return (
        <div className={cn(
            "grid grid-cols-2 p-1 rounded-2xl border mb-3",
            isDaylight
                ? "bg-slate-100/70 border-slate-200/60 backdrop-blur-md"
                : "bg-black/10 border-white/10 backdrop-blur-md"
        )}>
            <Link
                href="/hadith"
                className={cn(
                    "py-2 rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5",
                    activeTab === "hadith"
                        ? "bg-emerald-500 text-white shadow-md"
                        : isDaylight
                            ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                )}
            >
                <Quote className="w-3.5 h-3.5" />
                <span>{t.hadithTabHadith || "Hadits Nabi"}</span>
            </Link>
            <Link
                href="/dua"
                className={cn(
                    "py-2 rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5",
                    activeTab === "dua"
                        ? "bg-amber-500 text-white shadow-md"
                        : isDaylight
                            ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                )}
            >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{t.hadithTabDua || "Kumpulan Doa"}</span>
            </Link>
        </div>
    );
}
