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

import { useState, useEffect, useMemo } from "react";
import { Quote } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

interface QuoteData {
    text: string;
    source: string;
}

export default function QuoteOfDay() {
    const { t } = useLocale();
    const [quoteIndex, setQuoteIndex] = useState<number>(0);

    const QUOTES: QuoteData[] = useMemo(() => [
        { text: (t as any).quoteText1, source: (t as any).quoteSource1 },
        { text: (t as any).quoteText2, source: (t as any).quoteSource2 },
        { text: (t as any).quoteText3, source: (t as any).quoteSource3 },
        { text: (t as any).quoteText4, source: (t as any).quoteSource4 },
        { text: (t as any).quoteText5, source: (t as any).quoteSource5 },
        { text: (t as any).quoteText6, source: (t as any).quoteSource6 },
        { text: (t as any).quoteText7, source: (t as any).quoteSource7 },
        { text: (t as any).quoteText8, source: (t as any).quoteSource8 },
        { text: (t as any).quoteText9, source: (t as any).quoteSource9 },
        { text: (t as any).quoteText10, source: (t as any).quoteSource10 },
    ], [t]);

    useEffect(() => {
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
        const index = dayOfYear % QUOTES.length;
        setQuoteIndex(index);
    }, [QUOTES.length]);

    const quote = QUOTES[quoteIndex];

    if (!quote?.text) return null;

    return (
        <div className="w-full max-w-md mx-auto mt-2 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-1000">
            <div className="group relative rounded-[2rem] bg-white/[0.02] border border-white/5 p-6 backdrop-blur-sm transition-colors hover:bg-white/[0.04] quote-card">
                <Quote className="absolute top-6 left-6 h-5 w-5 text-[rgb(var(--color-primary))]/10 rotate-180 group-hover:text-[rgb(var(--color-primary))]/20 transition-colors" />
                <div className="absolute top-6 right-6 text-[8px] font-black uppercase tracking-[0.2em] text-white/20 group-hover:text-white/30 transition-colors">
                    {t.spiritualQuoteTitle}
                </div>

                <div className="relative z-10 flex flex-col items-center text-center space-y-4 px-4 pt-4">
                    <p className="text-white/70 font-medium italic text-sm leading-relaxed max-w-[280px]">
                        "{quote.text}"
                    </p>
                    <div className="flex items-center gap-3 w-full max-w-[120px]">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
                        <span className="text-[10px] font-bold text-[rgb(var(--color-primary-light))]/40 tracking-wider uppercase">
                            {quote.source}
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
                    </div>
                </div>
            </div>
        </div>
    );
}
