/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * IslamicFilterChips — generic horizontally-scrollable filter chip row.
 * Used by both the Hadith page (narrator filter) and Dua page (occasion filter).
 */

import { cn } from "@/lib/utils";
import { AppIcon } from "@/components/ui/AppIcon";
import type { AppIconName } from "@/lib/icon-names";

export interface FilterChipItem {
    key: string;
    label: string;
    icon?: AppIconName;
}

interface IslamicFilterChipsProps {
    items: FilterChipItem[];
    selected: string;
    onSelect: (key: string) => void;
    allLabel: string;
}

export function IslamicFilterChips({
    items,
    selected,
    onSelect,
    allLabel,
}: IslamicFilterChipsProps) {
    const activeStyles = "bg-[rgb(var(--color-primary))] border-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))] shadow-[var(--shadow-card)]";

    const inactiveStyles = "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))] text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-surface-subtle))] hover:text-[rgb(var(--color-text-strong))]";

    const chipClass = (isActive: boolean) =>
        cn(
            "flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border",
            isActive ? activeStyles : inactiveStyles
        );

    return (
        <div className="flex gap-2 overflow-x-auto pb-3 px-1 themed-scrollbar mb-3">
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
                    {item.icon && <AppIcon name={item.icon} size="xs" tone={selected === item.key ? "default" : "muted"} />}
                    {item.label}
                </button>
            ))}
        </div>
    );
}
