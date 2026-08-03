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
    accentColor: "emerald" | "amber";
    isDaylight: boolean;
}

export function IslamicSearchInput({
    value,
    onChange,
    placeholder,
    accentColor,
    isDaylight,
}: IslamicSearchInputProps) {
    const focusBorder =
        accentColor === "emerald"
            ? "focus:border-emerald-300"
            : "focus:border-amber-300";

    const focusBorderDark =
        accentColor === "emerald"
            ? "focus:border-emerald-500/50"
            : "focus:border-amber-500/50";

    return (
        <div className="relative mb-3">
            <Search
                className={cn(
                    "w-4 h-4 absolute left-3.5 top-3",
                    isDaylight ? "text-slate-400" : "text-white/30"
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
                    isDaylight
                        ? `bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 ${focusBorder}`
                        : `bg-white/5 border-white/10 text-white placeholder:text-white/30 ${focusBorderDark}`
                )}
            />
        </div>
    );
}
