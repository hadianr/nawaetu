"use client";

import { useState, useEffect } from "react";
import { Quote } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

interface QuoteData {
    text: string;
    source: string;
}

export default function QuoteOfDay() {
    const { t } = useLocale();
    const [quoteIndex, setQuoteIndex] = useState<number>(0);

    const QUOTES: QuoteData[] = [
        { text: t.quoteText1, source: t.quoteSource1 },
        { text: t.quoteText2, source: t.quoteSource2 },
        { text: t.quoteText3, source: t.quoteSource3 },
        { text: t.quoteText4, source: t.quoteSource4 },
        { text: t.quoteText5, source: t.quoteSource5 },
        { text: t.quoteText6, source: t.quoteSource6 },
        { text: t.quoteText7, source: t.quoteSource7 },
        { text: t.quoteText8, source: t.quoteSource8 },
        { text: t.quoteText9, source: t.quoteSource9 },
        { text: t.quoteText10, source: t.quoteSource10 },
    ];

    useEffect(() => {
        // Simple daily rotation based on day of year
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
        const index = dayOfYear % QUOTES.length;
        setQuoteIndex(index);
    }, []);

    const quote = QUOTES[quoteIndex];

    return (
        <div className="w-full max-w-md mt-6 mb-2 animate-in slide-in-from-bottom-4 duration-1000 delay-300">
            <div className="relative rounded-3xl bg-black/20 border border-white/5 p-6 backdrop-blur-md">
                <Quote className="absolute top-4 left-4 h-6 w-6 text-emerald-500/20 rotate-180" />

                <div className="relative z-10 flex flex-col items-center text-center space-y-3 px-2">
                    <p className="text-white/90 font-medium italic text-sm md:text-base leading-relaxed">
                        "{quote.text}"
                    </p>
                    <div className="h-px w-10 bg-emerald-500/30"></div>
                    <p className="text-emerald-400/80 text-xs tracking-wider uppercase font-semibold">
                        {quote.source}
                    </p>
                </div>
            </div>
        </div>
    );
}
