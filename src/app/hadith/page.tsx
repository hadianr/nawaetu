"use client";

import { useState, useMemo } from "react";
import { BookOpen, Quote, Sparkles, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { SPIRITUAL_CONTENT, SPIRITUAL_CATEGORIES, getLocalizedContent } from "@/data/spiritual-content";
import { useLocale } from "@/context/LocaleContext";

function HadithCard({ item, t, locale }: { item: typeof SPIRITUAL_CONTENT[0]; t: any; locale: string }) {
    const [expanded, setExpanded] = useState(false);
    const [copied, setCopied] = useState(false);

    const isHadith = item.type === "hadith";

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        const loc = getLocalizedContent(item.content, locale);
        const text = `${loc.title || item.content.title}\n\n${item.content.arabic}\n${item.content.latin}\n\n"${loc.translation}"\n\n${t.spiritualSource}: ${item.content.source}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div
            className="rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm overflow-hidden transition-all duration-200 hover:bg-white/[0.05] hover:border-white/10"
            onClick={() => setExpanded(!expanded)}
        >
            {/* Compact row */}
            <div className="flex items-center gap-3 px-4 py-3 cursor-pointer">
                {/* Icon */}
                <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-[rgb(var(--color-primary))]/10 border border-[rgb(var(--color-primary))]/15 flex items-center justify-center">
                    {isHadith ? (
                        <Quote className="w-3.5 h-3.5 text-[rgb(var(--color-primary-light))]/70" />
                    ) : (
                        <BookOpen className="w-3.5 h-3.5 text-[rgb(var(--color-primary-light))]/70" />
                    )}
                </div>

                {/* Translation preview */}
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white/70 line-clamp-2 leading-relaxed">
                        {getLocalizedContent(item.content, locale).translation}
                    </p>
                    <p className="text-[10px] text-white/30 mt-0.5 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-amber-400/40" />
                        {item.content.source}
                    </p>
                </div>

                {/* Expand / Copy controls */}
                <div className="flex-shrink-0 flex items-center gap-1.5 ml-1">
                    <button
                        onClick={handleCopy}
                        className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-white/20 hover:text-white/50"
                        title={t.spiritualCopyContent}
                    >
                        {copied ? (
                            <Check className="w-3 h-3 text-green-400" />
                        ) : (
                            <Copy className="w-3 h-3" />
                        )}
                    </button>
                    <div className="text-white/20">
                        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </div>
                </div>
            </div>

            {/* Expanded content */}
            {expanded && (
                <div className="px-4 pb-4 space-y-2.5 border-t border-white/5 pt-3 animate-in slide-in-from-top-1 duration-200">
                    {/* Arabic */}
                    <p
                        dir="rtl"
                        className="text-right text-xl font-arabic leading-[1.8] text-slate-50/90"
                    >
                        {item.content.arabic}
                    </p>

                    {/* Latin + Translation */}
                    <div className="relative space-y-1.5 pl-3">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[rgb(var(--color-primary))]/40 to-transparent rounded-full" />
                        <p className="text-[10px] italic text-slate-400/70 leading-relaxed">{item.content.latin}</p>
                        <p className="text-sm font-medium text-slate-100/90 leading-relaxed">
                            "{getLocalizedContent(item.content, locale).translation}"
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function HadithPage() {
    const { t, locale } = useLocale();
    const [activeCategory, setActiveCategory] = useState("all");

    const filtered = useMemo(() => {
        if (activeCategory === "all") return SPIRITUAL_CONTENT;
        return SPIRITUAL_CONTENT.filter(item => item.category === activeCategory);
    }, [activeCategory]);

    const hadithCount = SPIRITUAL_CONTENT.filter(i => i.type === "hadith").length;
    const duaCount = SPIRITUAL_CONTENT.filter(i => i.type === "dua").length;

    return (
        <div className="flex min-h-screen flex-col items-center bg-[rgb(var(--color-background))] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(var(--color-primary),0.1),rgba(255,255,255,0))] px-2 sm:px-3 py-4 font-sans">
            <main className="flex w-full max-w-md flex-col pb-nav">

                {/* Header */}
                <div className="px-2 mb-4">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-2 rounded-xl bg-[rgb(var(--color-primary))]/10 border border-[rgb(var(--color-primary))]/20">
                            <Quote className="w-4 h-4 text-[rgb(var(--color-primary-light))]" />
                        </div>
                        <h1 className="text-lg font-black text-white tracking-tight">
                            {(t as any).hadithPageTitle}
                        </h1>
                    </div>
                    <p className="text-xs text-white/40 pl-1">
                        {hadithCount} {locale === "en" ? "hadith" : "hadits"} · {duaCount} {locale === "en" ? "duas" : "doa"}
                    </p>
                </div>

                {/* Category Filter Chips */}
                <div className="flex gap-2 overflow-x-auto pb-3 px-0.5 no-scrollbar mb-3">
                    {SPIRITUAL_CATEGORIES.map((cat) => {
                        const isActive = activeCategory === cat.key;
                        // Use translation system for category labels
                        const label = cat.key === "all"
                            ? (t as any).hadithFilterAll
                            : (t as any)[cat.key] || (locale === "en" ? cat.labelEn : cat.labelId);
                        return (
                            <button
                                key={cat.key}
                                onClick={() => setActiveCategory(cat.key)}
                                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${isActive
                                    ? "bg-[rgb(var(--color-primary))] text-white shadow-lg shadow-[rgba(var(--color-primary),0.3)]"
                                    : "bg-white/5 border border-white/8 text-white/50 hover:bg-white/10 hover:text-white/70"
                                    }`}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>

                {/* Content Count */}
                {activeCategory !== "all" && (
                    <p className="text-[10px] text-white/30 px-1 mb-2">
                        {filtered.length} {(t as any).hadithFoundCount}
                    </p>
                )}

                {/* Hadith List */}
                <div className="flex flex-col gap-2">
                    {filtered.map((item) => (
                        <HadithCard key={item.id} item={item} t={t} locale={locale} />
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-12 text-white/30">
                        <Quote className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">{(t as any).hadithEmptyState}</p>
                    </div>
                )}
            </main>
        </div>
    );
}
