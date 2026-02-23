"use client";

import { useEffect, useState } from "react";
import { BookOpen, Sparkles, Quote, Copy, Check } from "lucide-react";
import { getSpiritualItemOfDay, SpiritualItem } from "@/data/spiritual-content";
import { useLocale } from "@/context/LocaleContext";

export default function DailySpiritWidget() {
    const { t } = useLocale();
    const [item, setItem] = useState<SpiritualItem | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        setItem(getSpiritualItemOfDay());
    }, []);

    const handleCopy = () => {
        if (!item) return;
        const textToCopy = `${item.content.title}\n\n${item.content.arabic}\n${item.content.latin}\n\n"${item.content.translation}"\n\n${t.spiritualSource}: ${item.content.source}\n${t.spiritualSharedVia}`;
        navigator.clipboard.writeText(textToCopy);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    if (!item) return null;

    const isHadith = item.type === "hadith";
    const localizedCategory = (t as any)[item.category] || item.category;

    return (
        <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 p-7 backdrop-blur-2xl shadow-2xl">
                {/* Decorative Elements */}
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-[rgb(var(--color-primary))]/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-[rgb(var(--color-primary-dark))]/5 rounded-full blur-3xl pointer-events-none" />

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-[rgb(var(--color-primary))]/10 border border-[rgb(var(--color-primary))]/20 shadow-inner">
                            {isHadith ? (
                                <Quote className="w-4 h-4 text-[rgb(var(--color-primary-light))]" />
                            ) : (
                                <BookOpen className="w-4 h-4 text-[rgb(var(--color-primary-light))]" />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[rgb(var(--color-primary-light))]/70 leading-none mb-1">
                                {isHadith ? t.spiritualHadithTitle : t.spiritualDuaTitle}
                            </span>
                            <span className="text-xs font-semibold text-white/40">{localizedCategory}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleCopy}
                        className="group relative p-2.5 rounded-full hover:bg-white/5 active:scale-95 transition-all text-white/30 hover:text-[rgb(var(--color-primary-light))]"
                        title={t.spiritualCopyContent}
                    >
                        {isCopied ? (
                            <Check className="w-4 h-4 text-green-400 animate-in zoom-in duration-300" />
                        ) : (
                            <Copy className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        )}
                        {isCopied && (
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-green-500 text-[10px] font-bold text-white px-2 py-1 rounded-md animate-in fade-in slide-in-from-bottom-2">
                                {t.spiritualCopied}
                            </span>
                        )}
                    </button>
                </div>

                {/* Content Area */}
                <div className="space-y-6">
                    {/* Arabic Text */}
                    <div
                        dir="rtl"
                        className="text-right text-2xl md:text-3xl font-arabic leading-[1.8] text-slate-50 drop-shadow-sm py-2"
                    >
                        {item.content.arabic}
                    </div>

                    {/* Transliteration & Translation */}
                    <div className="space-y-3 relative">
                        <div className="absolute -left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-[rgb(var(--color-primary))]/40 to-transparent rounded-full" />
                        <p className="text-[11px] font-medium italic text-slate-400/80 leading-relaxed pl-3">
                            {item.content.latin}
                        </p>
                        <p className="text-[15px] font-medium text-slate-100/95 leading-relaxed pl-3">
                            "{item.content.translation}"
                        </p>
                    </div>

                    {/* Footer / Source */}
                    <div className="flex items-center gap-3 pt-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                            <Sparkles className="w-3 h-3 text-amber-400/50" />
                            <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] whitespace-nowrap">
                                {item.content.source}
                            </span>
                        </div>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    </div>
                </div>

                {/* Premium Shine Effect */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-white/[0.05] opacity-50" />
                </div>
            </div>
        </div>
    );
}
