"use client";

import { useEffect, useState } from "react";
import { BookOpen, Sparkles, Quote, Copy, Check } from "lucide-react";
import { getSpiritualItemOfDay, SpiritualItem } from "@/data/spiritual-content";
import { useLocale } from "@/context/LocaleContext";

export default function DailySpiritWidget() {
    const { locale } = useLocale();
    const [item, setItem] = useState<SpiritualItem | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        setItem(getSpiritualItemOfDay());
    }, []);

    const handleCopy = () => {
        if (!item) return;
        const textToCopy = `${item.content.title}\n\n${item.content.arabic}\n${item.content.latin}\n\n"${item.content.translation}"\n\nSumber: ${item.content.source}\nShared via Nawaetu`;
        navigator.clipboard.writeText(textToCopy);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    if (!item) return null;

    const isHadith = item.type === "hadith";

    return (
        <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 p-6 backdrop-blur-xl shadow-2xl">
                {/* Decorative Elements */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[rgb(var(--color-primary))]/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[rgb(var(--color-primary-dark))]/10 rounded-full blur-3xl pointer-events-none" />

                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-[rgb(var(--color-primary))]/10 border border-[rgb(var(--color-primary))]/20">
                            {isHadith ? (
                                <Quote className="w-4 h-4 text-[rgb(var(--color-primary-light))]" />
                            ) : (
                                <BookOpen className="w-4 h-4 text-[rgb(var(--color-primary-light))]" />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[rgb(var(--color-primary-light))]/60 leading-none">
                                {isHadith ? "Hadits Tematis" : "Doa Hari Ini"}
                            </span>
                            <span className="text-xs font-medium text-white/50">{item.category}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleCopy}
                        className="p-2 rounded-full hover:bg-white/5 active:scale-90 transition-all text-white/40 hover:text-white/80"
                        title="Salin Konten"
                    >
                        {isCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                </div>

                {/* Content Area */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white/90 leading-tight">
                        {item.content.title}
                    </h3>

                    {/* Arabic Text */}
                    <div
                        dir="rtl"
                        className="text-right text-xl md:text-2xl font-arabic leading-loose text-slate-100 py-2 border-y border-white/5"
                    >
                        {item.content.arabic}
                    </div>

                    {/* Transliteration & Translation */}
                    <div className="space-y-2">
                        <p className="text-[11px] italic text-slate-400 leading-relaxed">
                            {item.content.latin}
                        </p>
                        <p className="text-sm text-slate-200 leading-relaxed">
                            "{item.content.translation}"
                        </p>
                    </div>

                    {/* Footer / Source */}
                    <div className="flex items-center gap-2 pt-2">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        <span className="text-[10px] font-medium text-white/30 uppercase tracking-widest whitespace-nowrap">
                            {item.content.source}
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    </div>
                </div>

                {/* Premium Shine Effect */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.01] to-white/[0.03] opacity-50" />
                </div>
            </div>
        </div>
    );
}
