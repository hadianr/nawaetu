/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * IslamicSearchInput — shared search field for Hadith and Dua pages.
 * Theme-aware styling, consistent focus ring color per accent.
 */

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface IslamicSearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
}

export function IslamicSearchInput({
    value,
    onChange,
    placeholder,
}: IslamicSearchInputProps) {
    return (
        <div className="relative mb-3">
            <Search
                className={cn(
                    "w-4 h-4 absolute left-3.5 top-3",
                    "text-[rgb(var(--color-text-muted))]"
                )}
            />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                autoCapitalize="none"
                autoCorrect="off"
                placeholder={placeholder}
                className={cn(
                    "w-full pl-10 pr-4 py-2.5 rounded-2xl text-[16px] sm:text-xs border transition-all outline-none",
                    "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))] text-[rgb(var(--color-text-strong))] placeholder:text-[rgb(var(--color-text-muted))] focus:border-[rgb(var(--color-primary))] focus:ring-2 focus:ring-[rgb(var(--color-ring))]"
                )}
            />
        </div>
    );
}
