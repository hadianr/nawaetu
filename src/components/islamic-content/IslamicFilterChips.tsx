/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * IslamicFilterChips — generic horizontally-scrollable filter chip row.
 * Used by both the Hadith page (narrator filter) and Dua page (occasion filter).
 */

import { cn } from "@/lib/utils";

export interface FilterChipItem {
    key: string;
    label: string;
}

interface IslamicFilterChipsProps {
    items: FilterChipItem[];
    selected: string;
    onSelect: (key: string) => void;
    allLabel: string;
    accentColor: "emerald" | "amber";
    isDaylight: boolean;
}

export function IslamicFilterChips({
    items,
    selected,
    onSelect,
    allLabel,
    accentColor,
    isDaylight,
}: IslamicFilterChipsProps) {
    const activeStyles =
        accentColor === "emerald"
            ? isDaylight
                ? "bg-emerald-100/80 border-emerald-200 text-emerald-700 shadow-sm"
                : "bg-[rgb(var(--color-primary))] text-white border-transparent shadow-lg shadow-[rgba(var(--color-primary),0.3)]"
            : isDaylight
                ? "bg-amber-100/80 border-amber-200 text-amber-800 shadow-sm"
                : "bg-amber-500 text-white border-transparent shadow-lg shadow-amber-500/30";

    const inactiveStyles = isDaylight
        ? "bg-white border-slate-100 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
        : "bg-white/5 border-white/8 text-white/50 hover:bg-white/10 hover:text-white/70";

    const chipClass = (isActive: boolean) =>
        cn(
            "flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border",
            isActive ? activeStyles : inactiveStyles
        );

    return (
        <div className="flex gap-2 overflow-x-auto pb-3 px-1 no-scrollbar mb-3">
            {/* All */}
            <button
                type="button"
                onClick={() => onSelect("all")}
                className={chipClass(selected === "all")}
            >
                {allLabel}
            </button>

            {/* Category chips */}
            {items.map((item) => (
                <button
                    key={item.key}
                    type="button"
                    onClick={() => onSelect(item.key)}
                    className={chipClass(selected === item.key)}
                >
                    {item.label}
                </button>
            ))}
        </div>
    );
}
