/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * IslamicSubTabBar — shared Hadith ↔ Dua tab switcher.
 * Uses shared semantic theme tokens for both pages and tab states.
 */

import Link from "next/link";
import { Quote, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TranslationTree } from "@/context/LocaleContext";

interface IslamicSubTabBarProps {
    /** Which tab is currently active */
    activeTab: "hadith" | "dua";
    t: TranslationTree;
}

export function IslamicSubTabBar({ activeTab, t }: IslamicSubTabBarProps) {
    return (
        <div className="grid grid-cols-2 p-1 rounded-2xl border mb-3 bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))] backdrop-blur-md">
            <Link
                href="/hadith"
                className={cn(
                    "py-2 rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5",
                    activeTab === "hadith"
                        ? "bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))] shadow-md"
                        : "text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-strong))] hover:bg-[rgb(var(--color-surface))]"
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
                        ? "bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))] shadow-md"
                        : "text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-strong))] hover:bg-[rgb(var(--color-surface))]"
                )}
            >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{t.hadithTabDua || "Kumpulan Doa"}</span>
            </Link>
        </div>
    );
}
