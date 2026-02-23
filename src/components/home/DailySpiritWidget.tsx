"use client";

import { useEffect, useState } from "react";
import { BookOpen, Sparkles, Quote, Copy, Check, ChevronRight } from "lucide-react";
import { getSpiritualItemOfDay, SpiritualItem, getLocalizedContent } from "@/data/spiritual-content";
import { useLocale } from "@/context/LocaleContext";
import Link from "next/link";

export default function DailySpiritWidget() {
    const { t, locale } = useLocale();
    const [item, setItem] = useState<SpiritualItem | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        setItem(getSpiritualItemOfDay());
    }, []);

    const handleCopy = () => {
        if (!item) return;
        const textToCopy = `${localizedContent.title || item.content.title}\n\n${item.content.arabic}\n${item.content.latin}\n\n"${localizedContent.translation}"\n\n${t.spiritualSource}: ${item.content.source}\n${t.spiritualSharedVia}`;
        navigator.clipboard.writeText(textToCopy);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    if (!item) return null;

    const isHadith = item.type === "hadith";
    const localizedCategory = (t as any)[item.category] || item.category;
    const localizedContent = getLocalizedContent(item.content, locale);

    return (
        <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 backdrop-blur-2xl shadow-xl">
                {/* Decorative blur blobs */}
                <div className="absolute -top-8 -right-8 w-28 h-28 bg-[rgb(var(--color-primary))]/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-[rgb(var(--color-primary-dark))]/5 rounded-full blur-2xl pointer-events-none" />

                {/* --- Header --- */}
                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-[rgb(var(--color-primary))]/10 border border-[rgb(var(--color-primary))]/20">
                            {isHadith ? (
                                <Quote className="w-3.5 h-3.5 text-[rgb(var(--color-primary-light))]" />
                            ) : (
                                <BookOpen className="w-3.5 h-3.5 text-[rgb(var(--color-primary-light))]" />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[rgb(var(--color-primary-light))]/70 leading-none">
                                {isHadith ? t.spiritualHadithTitle : t.spiritualDuaTitle}
                            </span>
                            <span className="text-[11px] font-medium text-white/40 mt-0.5">{localizedCategory}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleCopy}
                        className="group relative p-2 rounded-full hover:bg-white/5 active:scale-95 transition-all text-white/30 hover:text-[rgb(var(--color-primary-light))]"
                        title={t.spiritualCopyContent}
                    >
                        {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-green-400 animate-in zoom-in duration-300" />
                        ) : (
                            <Copy className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                        )}
                        {isCopied && (
                            <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-green-500 text-[10px] font-bold text-white px-2 py-0.5 rounded-md animate-in fade-in slide-in-from-bottom-2">
                                {t.spiritualCopied}
                            </span>
                        )}
                    </button>
                </div>

                {/* --- Content --- */}
                <div className="px-4 pb-3 space-y-2.5">
                    {/* Arabic */}
                    <div
                        dir="rtl"
                        className="text-right text-xl font-arabic leading-[1.8] text-slate-50/90 drop-shadow-sm py-1"
                    >
                        {item.content.arabic}
                    </div>

                    {/* Transliteration & Translation */}
                    <div className="relative space-y-1.5">
                        <div className="absolute -left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[rgb(var(--color-primary))]/40 to-transparent rounded-full" />
                        <p className="text-[10px] font-medium italic text-slate-400/70 leading-relaxed pl-3">
                            {item.content.latin}
                        </p>
                        <p className="text-sm font-medium text-slate-100/90 leading-relaxed pl-3">
                            "{localizedContent.translation}"
                        </p>
                    </div>

                    {/* Source row */}
                    <div className="flex items-center gap-3 pt-1">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/5">
                            <Sparkles className="w-2.5 h-2.5 text-amber-400/50" />
                            <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.15em] whitespace-nowrap">
                                {item.content.source}
                            </span>
                        </div>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    </div>
                </div>

                {/* --- Shortcut: Lihat Hadits Lainnya --- */}
                <Link
                    href="/hadith"
                    className="group flex items-center justify-between px-4 py-2.5 border-t border-white/5 hover:bg-white/[0.03] transition-colors"
                >
                    <span className="text-[11px] font-semibold text-white/40 group-hover:text-white/60 transition-colors">
                        {isHadith ? (t as any).hadithExploreLink : (t as any).hadithExploreLinkDua}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-[rgb(var(--color-primary-light))]/60 group-hover:translate-x-0.5 transition-all" />
                </Link>

                {/* Shine overlay */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-white/[0.04] opacity-50" />
                </div>
            </div>
        </div>
    );
}
