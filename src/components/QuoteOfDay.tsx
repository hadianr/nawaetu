"use client";

import { useState, useEffect } from "react";
import { Quote } from "lucide-react";

interface QuoteData {
    text: string;
    source: string;
}

const QUOTES: QuoteData[] = [
    { text: "Maka sesungguhnya bersama kesulitan ada kemudahan.", source: "QS. Al-Insyirah: 5" },
    { text: "Dan berikanlah berita gembira kepada orang-orang yang sabar.", source: "QS. Al-Baqarah: 155" },
    { text: "Allah tidak membebani seseorang melainkan sesuai dengan kesanggupannya.", source: "QS. Al-Baqarah: 286" },
    { text: "Barangsiapa bertakwa kepada Allah niscaya Dia akan mengadakan baginya jalan keluar.", source: "QS. At-Talaq: 2" },
    { text: "Dan Dia memberinya rezeki dari arah yang tiada disangka-sangkanya.", source: "QS. At-Talaq: 3" },
    { text: "Ingatlah, hanya dengan mengingati Allah-lah hati menjadi tenteram.", source: "QS. Ar-Ra'd: 28" },
    { text: "Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia.", source: "HR. Ahmad" },
    { text: "Senyummu di hadapan saudaramu adalah sedekah.", source: "HR. Tirmidzi" },
    { text: "Janganlah kamu marah, maka bagimu surga.", source: "HR. Thabrani" },
    { text: "Sholat itu adalah tiang agama.", source: "HR. Tirmidzi" }
];

export default function QuoteOfDay() {
    const [quote, setQuote] = useState<QuoteData | null>(null);

    useEffect(() => {
        // Simple daily rotation based on day of year
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
        const index = dayOfYear % QUOTES.length;
        setQuote(QUOTES[index]);
    }, []);

    if (!quote) return null;

    return (
        <div className="w-full max-w-md mt-6 mb-2 animate-in slide-in-from-bottom-4 duration-1000 delay-300">
            <div className="relative rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-sm">
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
