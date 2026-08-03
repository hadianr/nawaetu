"use client";

/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * Dedicated Dua & Supplications Page (Bilingual EN/ID, High Performance, Auto-Highlight, Story Sharing)
 */

import { useState, useMemo, useEffect, Suspense, memo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { BookOpen, Quote, Sparkles, Copy, Check, ChevronDown, ChevronUp, Search, HeartHandshake, Play, Share2, User, ChevronDown as MoreIcon } from "lucide-react";
import { DUA_LIBRARY, DuaItem, DUA_OCCASIONS } from "@/data/duas";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import { PresetGuard } from "@/components/PresetGuard";
import Link from "next/link";
import { ShareableCardData } from "@/lib/share/story-card-renderer";

const StoryShareModal = dynamic(
    () => import("@/components/StoryShareModal").then(mod => mod.StoryShareModal),
    { ssr: false }
);

const INITIAL_BATCH = 25;

const DuaCard = memo(function DuaCard({
    item,
    t,
    locale,
    isDaylight,
    isHighlighted,
    onShare,
}: {
    item: DuaItem;
    t: any;
    locale: string;
    isDaylight: boolean;
    isHighlighted: boolean;
    onShare: (item: DuaItem) => void;
}) {
    const [expanded, setExpanded] = useState(isHighlighted);
    const [copied, setCopied] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (isHighlighted) {
            setExpanded(true);
            const scrollTarget = () => {
                const el = document.getElementById(`dua-${item.id}`);
                if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            };

            const timer1 = setTimeout(scrollTarget, 100);
            const timer2 = setTimeout(scrollTarget, 400);

            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
            };
        }
    }, [isHighlighted, item.id]);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        const title = (locale === "en" && item.titleEn) ? item.titleEn : item.title;
        const trans = (locale === "en" && item.translationEn) ? item.translationEn : item.translation;
        const sourcePrefix = locale === "en" ? "Source" : "Sumber";
        const text = `${title}\n\n${item.arabic}\n${item.latin}\n\n"${trans}"\n\n${sourcePrefix}: ${item.source.referenceText}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLaunchCounter = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/dhikr?preset=${item.id}`);
    };

    const translation = (locale === "en" && item.translationEn) ? item.translationEn : item.translation;
    const title = (locale === "en" && item.titleEn) ? item.titleEn : item.title;
    const virtueText = (locale === "en" && item.virtueEn) ? item.virtueEn : item.virtue;
    const reciteCountText = item.recommendedCount ? (t.duaReciteCount || (locale === "en" ? "Recite {count}x" : "Dibaca {count}x")).replace("{count}", String(item.recommendedCount)) : null;

    return (
        <div
            id={`dua-${item.id}`}
            className={cn(
                "rounded-2xl border transition-all duration-500 overflow-hidden select-text [content-visibility:auto] [contain-intrinsic-size:1px_140px]",
                isHighlighted
                    ? isDaylight
                        ? "bg-amber-50 border-amber-400 ring-4 ring-amber-400/40 shadow-xl scale-[1.01]"
                        : "bg-amber-500/15 border-amber-400 ring-4 ring-amber-500/30 shadow-2xl scale-[1.01]"
                    : isDaylight
                        ? "bg-white border-slate-200/60 shadow-sm hover:border-amber-200/60"
                        : "bg-white/[0.03] border-white/8 backdrop-blur-sm hover:bg-white/[0.05] hover:border-white/10"
            )}
        >
            {/* Ultra-Clean & Spacious Card Header */}
            <div className="px-3.5 py-3 sm:px-4 sm:py-3.5 space-y-1.5">
                {/* Top Row: Badges on Left, Single Lightweight Chevron on Right */}
                <div className="flex items-center justify-between gap-2">
                    {/* Badges Container (100% Full Top-Left Width) */}
                    <div className="flex items-center gap-1.5 min-w-0 overflow-x-auto no-scrollbar whitespace-nowrap">
                        <span className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full font-bold font-mono border whitespace-nowrap flex-shrink-0",
                            isHighlighted
                                ? "bg-amber-500 text-white border-amber-400"
                                : isDaylight
                                    ? "bg-amber-100/80 text-amber-800 border-amber-200"
                                    : "bg-amber-500/15 text-amber-300 border-amber-500/20"
                        )}>
                            {item.source.referenceText}
                        </span>

                        {reciteCountText && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap flex-shrink-0">
                                {reciteCountText}
                            </span>
                        )}
                    </div>

                    {/* Ultra-Compact Micro Chevron Toggle Button */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setExpanded(!expanded);
                        }}
                        className={cn(
                            "w-6 h-6 sm:w-7 sm:h-7 rounded-lg border transition-all cursor-pointer flex items-center justify-center flex-shrink-0 active:scale-95",
                            isDaylight
                                ? "bg-slate-100/90 border-slate-200/60 text-slate-500 hover:bg-slate-200/80 hover:text-slate-700"
                                : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80"
                        )}
                        title={expanded ? "Ciutkan Detail" : "Buka Detail"}
                    >
                        {expanded ? (
                            <ChevronUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500" />
                        ) : (
                            <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        )}
                    </button>
                </div>

                {/* Bottom Row: Icon + Title & Translation Preview */}
                <div className="flex items-start gap-2 sm:gap-2.5">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setExpanded(!expanded);
                        }}
                        className={cn(
                            "flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center border cursor-pointer transition-colors mt-0.5",
                            isHighlighted
                                ? isDaylight
                                    ? "bg-amber-500 text-white border-amber-600"
                                    : "bg-amber-500 text-white border-amber-400"
                                : isDaylight
                                    ? "bg-amber-50 border-amber-100 text-amber-600 hover:bg-amber-100"
                                    : "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
                        )}
                        title={expanded ? "Ciutkan Detail" : "Buka Detail"}
                    >
                        <HeartHandshake className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>

                    <div className="flex-1 min-w-0 select-text">
                        <p className={cn(
                            "text-xs font-semibold line-clamp-1 leading-snug",
                            isDaylight ? "text-slate-800" : "text-white/90"
                        )}>
                            {title}
                        </p>

                        <p className={cn(
                            "text-[11px] line-clamp-1 mt-0.5",
                            isDaylight ? "text-slate-500" : "text-white/50"
                        )}>
                            "{translation}"
                        </p>
                    </div>
                </div>
            </div>

            {/* Expanded content */}
            {expanded && (
                <div className={cn(
                    "px-4 pb-4 space-y-3 border-t pt-3 animate-in slide-in-from-top-1 duration-200",
                    isDaylight ? "border-slate-100 bg-slate-50/40" : "border-white/5 bg-black/10"
                )}>
                    {(item as any).source.narrator && (
                        <p className={cn("text-[11px] font-medium flex items-center gap-1.5", isDaylight ? "text-slate-500" : "text-white/40")}>
                            <User className="w-3 h-3 text-amber-500" />
                            <span>Perawi: {(item as any).source.narrator}</span>
                        </p>
                    )}

                    {/* Arabic */}
                    <p
                        dir="rtl"
                        className={cn(
                            "text-right text-xl font-arabic leading-[2.0] tracking-wide py-1",
                            isDaylight ? "text-slate-900" : "text-slate-50"
                        )}
                    >
                        {item.arabic}
                    </p>

                    {/* Latin + Translation */}
                    <div className="relative space-y-2 pl-3">
                        <div className={cn(
                            "absolute left-0 top-0 bottom-0 w-0.5 rounded-full",
                            isDaylight ? "bg-amber-500" : "bg-gradient-to-b from-amber-400 to-transparent"
                        )} />
                        {item.latin && (
                            <p className={cn("text-[11px] italic leading-relaxed font-serif", isDaylight ? "text-slate-500" : "text-slate-400")}>
                                {item.latin}
                            </p>
                        )}
                        <p className={cn("text-xs font-medium leading-relaxed", isDaylight ? "text-slate-700" : "text-slate-100/90")}>
                            "{translation}"
                        </p>
                    </div>

                    {/* Fadhilah / Benefit if available */}
                    {(item as any).fadhilah && (
                        <div className={cn(
                            "p-2.5 rounded-xl text-xs space-y-1 border",
                            isDaylight ? "bg-amber-50/60 border-amber-100 text-slate-700" : "bg-white/[0.02] border-white/5 text-white/70"
                        )}>
                            <p className="font-bold flex items-center gap-1 text-[10px] uppercase tracking-wider text-amber-500">
                                <Sparkles className="w-3 h-3" /> Keutamaan Doa
                            </p>
                            <p className="text-[11px] leading-relaxed">{(item as any).fadhilah}</p>
                        </div>
                    )}

                    {/* Expanded Action Toolbar Row (Bagikan ke Story & Salin) */}
                    <div className={cn(
                        "pt-2.5 mt-2 flex items-center gap-2 border-t",
                        isDaylight ? "border-slate-200/60" : "border-white/10"
                    )}>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onShare(item);
                            }}
                            className={cn(
                                "flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer shadow-xs",
                                isDaylight
                                    ? "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                                    : "bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25"
                            )}
                        >
                            <Share2 className="w-3.5 h-3.5 text-amber-500" />
                            <span>Bagikan ke Story</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleCopy}
                            className={cn(
                                "py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer",
                                isDaylight
                                    ? "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                                    : "bg-white/5 text-white/80 border-white/10 hover:bg-white/10"
                            )}
                        >
                            {copied ? (
                                <>
                                    <Check className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Tersalin</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Salin</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Action: Launch Tasbih Counter */}
                    <button
                        onClick={handleLaunchCounter}
                        className={cn(
                            "w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border shadow-sm cursor-pointer",
                            isDaylight
                                ? "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800"
                                : "bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/30 text-amber-300"
                        )}
                    >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{t.duaLaunchCounter || "Mulai Dzikir dengan Tasbih Counter"}</span>
                    </button>
                </div>
            )}
        </div>
    );
});

function DuaContent() {
    const { t, locale } = useLocale();
    const { currentTheme } = useTheme();
    const searchParams = useSearchParams();
    const isDaylight = currentTheme === "daylight";

    const targetId = searchParams?.get("id") || searchParams?.get("highlight") || "";

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedOccasion, setSelectedOccasion] = useState<string>("all");
    const [visibleCount, setVisibleCount] = useState<number>(INITIAL_BATCH);
    const [shareItem, setShareItem] = useState<DuaItem | null>(null);

    // If query parameter targets a specific Dua, reset filters and render all so target is immediately available
    useEffect(() => {
        if (targetId) {
            setSelectedOccasion("all");
            setSearchQuery("");
            setVisibleCount(DUA_LIBRARY.length);
        } else {
            setVisibleCount(INITIAL_BATCH);
        }
    }, [targetId, selectedOccasion, searchQuery]);

    const filtered = useMemo(() => {
        return DUA_LIBRARY.filter(item => {
            const matchesOccasion = selectedOccasion === "all" || item.occasion === selectedOccasion;

            if (!matchesOccasion) return false;

            if (!searchQuery.trim()) return true;

            const q = searchQuery.toLowerCase();
            const itemTitle = (locale === "en" && item.titleEn) ? item.titleEn : item.title;
            const itemTrans = (locale === "en" && item.translationEn) ? item.translationEn : item.translation;
            const itemVirtue = (locale === "en" && item.virtueEn) ? item.virtueEn : item.virtue;

            return (
                itemTitle.toLowerCase().includes(q) ||
                itemTrans.toLowerCase().includes(q) ||
                (itemVirtue && itemVirtue.toLowerCase().includes(q)) ||
                item.source.referenceText.toLowerCase().includes(q)
            );
        });
    }, [selectedOccasion, searchQuery, locale]);

    const visibleItems = useMemo(() => {
        if (targetId) return filtered;
        return filtered.slice(0, visibleCount);
    }, [filtered, visibleCount, targetId]);

    const handleLoadMore = () => {
        setVisibleCount(prev => Math.min(prev + 25, filtered.length));
    };

    const activeShareData: ShareableCardData | null = useMemo(() => {
        if (!shareItem) return null;
        return {
            id: shareItem.id,
            title: (locale === "en" && shareItem.titleEn) ? shareItem.titleEn : shareItem.title,
            arabic: shareItem.arabic,
            latin: shareItem.latin,
            translation: (locale === "en" && shareItem.translationEn) ? shareItem.translationEn : shareItem.translation,
            explanation: (locale === "en" && shareItem.virtueEn) ? shareItem.virtueEn : shareItem.virtue,
            sourceText: shareItem.source.referenceText,
        };
    }, [shareItem, locale]);

    return (
        <PresetGuard requiredFeature="showHadith" redirectTo="/">
            <div className={cn(
                "flex min-h-screen flex-col items-center px-2 sm:px-4 py-4 font-sans transition-colors duration-500",
                isDaylight
                    ? "bg-[#f8fafc] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.1),transparent)]"
                    : "bg-[rgb(var(--color-background))] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(var(--color-accent),0.1),transparent)]"
            )}>
                <main className="flex w-full max-w-md flex-col pb-nav">
                    {/* Header */}
                    <div className="px-2 mb-3">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "p-2 rounded-xl border transition-colors",
                                    isDaylight ? "bg-amber-50 border-amber-100" : "bg-[rgb(var(--color-accent))]/10 border-[rgb(var(--color-accent))]/20"
                                )}>
                                    <BookOpen className={cn("w-5 h-5", isDaylight ? "text-amber-600" : "text-[rgb(var(--color-accent))]")} />
                                </div>
                                <div>
                                    <h1 className={cn("text-lg font-black tracking-tight", isDaylight ? "text-slate-900" : "text-white")}>
                                        {t.duaLibraryTitle || "Kumpulan Doa & Dzikir"}
                                    </h1>
                                    <p className={cn("text-[11px]", isDaylight ? "text-slate-400" : "text-white/40")}>
                                        {(t.duaLibrarySubtitle || "{count} Doa Pilihan dari Al-Qur'an & Sunnah").replace("{count}", String(DUA_LIBRARY.length))}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Top Sub-Tab Navigation Switcher */}
                        <div className="grid grid-cols-2 p-1 rounded-2xl bg-black/10 backdrop-blur-md border border-white/10 mb-3">
                            <Link
                                href="/hadith"
                                className={cn(
                                    "py-2 rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5",
                                    isDaylight ? "text-slate-600 hover:text-slate-900" : "text-white/60 hover:text-white"
                                )}
                            >
                                <Quote className="w-3.5 h-3.5" />
                                <span>{t.hadithTabHadith || "Hadits Nabi"}</span>
                            </Link>
                            <Link
                                href="/dua"
                                className="py-2 rounded-xl text-xs font-bold text-center transition-all bg-amber-500 text-white shadow-md flex items-center justify-center gap-1.5"
                            >
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>{t.hadithTabDua || "Kumpulan Doa"}</span>
                            </Link>
                        </div>

                        {/* Search Input */}
                        <div className="relative mb-3">
                            <Search className={cn("w-4 h-4 absolute left-3.5 top-3", isDaylight ? "text-slate-400" : "text-white/30")} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoCapitalize="none"
                                autoCorrect="off"
                                placeholder={t.duaSearchPlaceholder || "Cari doa harian, perlindungan, kata kunci..."}
                                className={cn(
                                    "w-full pl-10 pr-4 py-2.5 rounded-2xl text-[16px] sm:text-xs border transition-all outline-none",
                                    isDaylight
                                        ? "bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-amber-300"
                                        : "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-amber-500/50"
                                )}
                            />
                        </div>
                    </div>

                    {/* Occasion Filter Chips */}
                    <div className="flex gap-2 overflow-x-auto pb-3 px-1 no-scrollbar mb-3">
                        <button
                            onClick={() => setSelectedOccasion("all")}
                            className={cn(
                                "flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border",
                                selectedOccasion === "all"
                                    ? isDaylight
                                        ? "bg-amber-100/80 border-amber-200 text-amber-800 shadow-sm"
                                        : "bg-amber-500 text-white border-transparent shadow-lg shadow-amber-500/30"
                                    : isDaylight
                                        ? "bg-white border-slate-100 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                                        : "bg-white/5 border-white/8 text-white/50 hover:bg-white/10 hover:text-white/70"
                            )}
                        >
                            {t.duaAllOccasions || "Semua Doa"}
                        </button>
                        {DUA_OCCASIONS.map(occ => (
                            <button
                                key={occ.key}
                                onClick={() => setSelectedOccasion(occ.key)}
                                className={cn(
                                    "flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border",
                                    selectedOccasion === occ.key
                                        ? isDaylight
                                            ? "bg-amber-100/80 border-amber-200 text-amber-800 shadow-sm"
                                            : "bg-amber-500 text-white border-transparent shadow-lg shadow-amber-500/30"
                                        : isDaylight
                                            ? "bg-white border-slate-100 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                                            : "bg-white/5 border-white/8 text-white/50 hover:bg-white/10 hover:text-white/70"
                                )}
                            >
                                {locale === "en" ? occ.labelEn : occ.labelId}
                            </button>
                        ))}
                    </div>

                    {/* Filter count indicator */}
                    {(selectedOccasion !== "all" || searchQuery) && (
                        <p className={cn("text-[11px] px-2 mb-2", isDaylight ? "text-slate-400" : "text-white/40")}>
                            {(t.duaShowingCount || "Menampilkan {count} doa").replace("{count}", String(filtered.length))}
                        </p>
                    )}

                    {/* Dua List */}
                    <div className="flex flex-col gap-2.5">
                        {visibleItems.map((item) => (
                            <DuaCard
                                key={item.id}
                                item={item}
                                t={t}
                                locale={locale}
                                isDaylight={isDaylight}
                                isHighlighted={item.id === targetId}
                                onShare={(d) => setShareItem(d)}
                            />
                        ))}
                    </div>

                    {/* Load More Button for Batch Virtualization */}
                    {!targetId && visibleItems.length < filtered.length && (
                        <div className="text-center pt-4 pb-2">
                            <button
                                onClick={handleLoadMore}
                                className={cn(
                                    "px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border inline-flex items-center gap-1.5 shadow-sm cursor-pointer",
                                    isDaylight
                                        ? "bg-white border-slate-200 text-amber-700 hover:bg-amber-50 hover:border-amber-200"
                                        : "bg-white/5 border-white/10 text-amber-400 hover:bg-white/10 hover:border-amber-500/30"
                                )}
                            >
                                <MoreIcon className="w-3.5 h-3.5" />
                                <span>Tampilkan Lebih Banyak ({filtered.length - visibleItems.length} Doa Lagi)</span>
                            </button>
                        </div>
                    )}

                    {filtered.length === 0 && (
                        <div className={cn("text-center py-12", isDaylight ? "text-slate-300" : "text-white/30")}>
                            <Quote className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">{t.duaEmptyState || "Tidak ada doa yang sesuai kriteria pencarian."}</p>
                        </div>
                    )}
                </main>
            </div>

            {/* Story Share Modal */}
            {activeShareData && (
                <StoryShareModal
                    item={activeShareData}
                    onClose={() => setShareItem(null)}
                    isDaylight={isDaylight}
                />
            )}
        </PresetGuard>
    );
}

export default function DuaPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white/50 text-sm">Loading...</div>}>
            <DuaContent />
        </Suspense>
    );
}
