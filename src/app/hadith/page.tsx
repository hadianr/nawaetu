"use client";

/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * Dedicated Hadith Library Page (Narrator-Focused, High Performance, Auto-Highlight, Story Sharing)
 */

import { useState, useMemo, useEffect, Suspense, memo } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { BookOpen, Quote, Sparkles, Copy, Check, ChevronDown, ChevronUp, ShieldCheck, User, Share2, ChevronDown as MoreIcon } from "lucide-react";
import { HADITH_LIBRARY, HadithItem, HADITH_TOPIC_DEFINITIONS, HadithTopic } from "@/data/hadiths";
import { useLocale } from "@/context/LocaleContext";
import { cn } from "@/lib/utils";
import { useIslamicContentFilter } from "@/hooks/useIslamicContentFilter";
import { ShareableCardData } from "@/lib/share/story-card-renderer";
import { mapHadithToShareData } from "@/lib/share/share-mappers";
import type { TranslationTree } from "@/context/LocaleContext";
import { IslamicSubTabBar } from "@/components/islamic-content/IslamicSubTabBar";
import { IslamicSearchInput } from "@/components/islamic-content/IslamicSearchInput";
import { IslamicFilterChips } from "@/components/islamic-content/IslamicFilterChips";

const StoryShareModal = dynamic(
    () => import("@/components/StoryShareModal").then(mod => mod.StoryShareModal),
    { ssr: false }
);

const HadithCard = memo(function HadithCard({
    item,
    t,
    locale,
    isHighlighted,
    onShare,
}: {
    item: HadithItem;
    t: TranslationTree;
    locale: string;
    isHighlighted: boolean;
    onShare: (item: HadithItem) => void;
}) {
    const [expanded, setExpanded] = useState(isHighlighted);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        queueMicrotask(() => setExpanded(isHighlighted));
        if (isHighlighted) {
            const scrollTarget = () => {
                const el = document.getElementById(`hadith-${item.id}`);
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
        const narratorPrefix = locale === "en" ? "Narrator" : "Perawi";
        const text = `${title}\n\n${item.arabic}\n${item.latin}\n\n"${trans}"\n\n${sourcePrefix}: HR. ${item.collection} No. ${item.hadithNumber} (${item.authenticity})${item.narrator ? `\n${narratorPrefix}: ${item.narrator}` : ""}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const translation = (locale === "en" && item.translationEn) ? item.translationEn : item.translation;
    const title = (locale === "en" && item.titleEn) ? item.titleEn : item.title;
    const narratorText = item.narrator ? (t.hadithNarratorBy || "Dari {narrator}").replace("{narrator}", item.narrator) : null;

    return (
        <div
            id={`hadith-${item.id}`}
            className={cn(
                "rounded-2xl border transition-all duration-500 overflow-hidden select-text [content-visibility:auto] [contain-intrinsic-size:1px_140px]",
                isHighlighted
                    ? "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))] ring-4 ring-[rgb(var(--color-ring))] shadow-[var(--shadow-floating)] scale-[1.01]"
                    : "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))] shadow-[var(--shadow-card)] hover:border-[rgb(var(--color-primary))]/50 hover:bg-[rgb(var(--color-surface-subtle))]"
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
                                ? "bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))] border-[rgb(var(--color-primary))]"
                                : "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary-strong))] border-[rgb(var(--color-primary))]/25"
                        )}>
                            {locale === "en" ? `${item.collection} No. ${item.hadithNumber}` : `HR. ${item.collection} No. ${item.hadithNumber}`}
                        </span>
                        <span className={cn(
                            "text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider border flex items-center gap-0.5 whitespace-nowrap flex-shrink-0",
                            item.authenticity === "Muttafaq 'Alaih"
                                ? "bg-[rgb(var(--color-info))]/10 text-[rgb(var(--color-info))] border-[rgb(var(--color-info))]/25"
                                : "bg-[rgb(var(--color-warning))]/10 text-[rgb(var(--color-warning))] border-[rgb(var(--color-warning))]/25"
                        )}>
                            <ShieldCheck className="w-2.5 h-2.5" />
                            {item.authenticity}
                        </span>
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
                            "bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))] text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-surface))] hover:text-[rgb(var(--color-text-strong))]"
                        )}
                        title={expanded ? "Ciutkan Detail" : "Buka Detail"}
                    >
                        {expanded ? (
                            <ChevronUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[rgb(var(--color-primary))]" />
                        ) : (
                            <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        )}
                    </button>
                </div>

                {/* Bottom Row: Quote Icon + Title & Translation Preview */}
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
                                ? "bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))] border-[rgb(var(--color-primary))]"
                                : "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/20 text-[rgb(var(--color-primary-strong))] hover:bg-[rgb(var(--color-primary))]/20"
                        )}
                        title={expanded ? "Ciutkan Detail" : "Buka Detail"}
                    >
                        <Quote className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>

                    <div className="flex-1 min-w-0 select-text">
                        <p className={cn(
                            "text-xs font-semibold line-clamp-1 leading-snug",
                            "text-[rgb(var(--color-text-strong))]"
                        )}>
                            {title}
                        </p>

                        <p className={cn(
                            "text-[11px] line-clamp-1 mt-0.5",
                            "text-[rgb(var(--color-text-muted))]"
                        )}>
                            &quot;{translation}&quot;
                        </p>
                    </div>
                </div>
            </div>

            {/* Expanded content */}
            {expanded && (
                <div className={cn(
                    "px-4 pb-4 space-y-3 border-t pt-3 animate-in slide-in-from-top-1 duration-200",
                    "border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))]"
                )}>
                    {narratorText && (
                        <p className="text-[11px] font-medium flex items-center gap-1.5 text-[rgb(var(--color-text-muted))]">
                            <User className="w-3 h-3 text-[rgb(var(--color-primary))]" />
                            <span>{narratorText}</span>
                        </p>
                    )}

                    {/* Arabic */}
                    <p
                        dir="rtl"
                        className={cn(
                            "text-right text-xl font-arabic leading-[2.0] tracking-wide py-1",
                            "text-[rgb(var(--color-text-strong))]"
                        )}
                    >
                        {item.arabic}
                    </p>

                    {/* Latin + Translation */}
                    <div className="relative space-y-2 pl-3">
                        <div className={cn(
                            "absolute left-0 top-0 bottom-0 w-0.5 rounded-full",
                            "bg-gradient-to-b from-[rgb(var(--color-primary))] to-transparent"
                        )} />
                        <p className="text-[11px] italic leading-relaxed font-serif text-[rgb(var(--color-text-muted))]">
                            {item.latin}
                        </p>
                        <p className="text-xs font-medium leading-relaxed text-[rgb(var(--color-text))]">
                            &quot;{translation}&quot;
                        </p>
                    </div>

                    {/* Tadabbur / Commentary if available */}
                    {((locale === "en" && item.explanationEn) || item.explanation) && (
                        <div className={cn(
                            "p-2.5 rounded-xl text-xs space-y-1 border",
                            "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/20 text-[rgb(var(--color-text))]"
                        )}>
                            <p className="font-bold flex items-center gap-1 text-[10px] uppercase tracking-wider text-[rgb(var(--color-primary))]">
                                <Sparkles className="w-3 h-3" /> {t.hadithTadabburTitle || "Tadabbur Hadits"}
                            </p>
                            <p className="text-[11px] leading-relaxed">{(locale === "en" && item.explanationEn) ? item.explanationEn : item.explanation}</p>
                        </div>
                    )}

                    {/* Expanded Action Toolbar Row (Bagikan ke Story & Salin) */}
                    <div className={cn(
                        "pt-2.5 mt-2 flex items-center gap-2 border-t",
                        "border-[rgb(var(--color-border))]"
                    )}>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onShare(item);
                            }}
                            className={cn(
                                "flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer shadow-xs",
                                "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary-strong))] border-[rgb(var(--color-primary))]/25 hover:bg-[rgb(var(--color-primary))]/20"
                            )}
                        >
                            <Share2 className="w-3.5 h-3.5 text-[rgb(var(--color-primary))]" />
                            <span>{t.shareToStory || "Bagikan ke Story"}</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleCopy}
                            className={cn(
                                "py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer",
                                "bg-[rgb(var(--color-surface-subtle))] text-[rgb(var(--color-text))] border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-surface))]"
                            )}
                        >
                            {copied ? (
                                <>
                                    <Check className="w-3.5 h-3.5 text-[rgb(var(--color-success))]" />
                                    <span>{t.copied || "Tersalin"}</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-3.5 h-3.5 text-[rgb(var(--color-text-muted))]" />
                                    <span>{t.copy || "Salin"}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
});

function HadithContent() {
    const { t, locale } = useLocale();
    const searchParams = useSearchParams();

    const targetId = searchParams?.get("id") || searchParams?.get("highlight") || "";

    const [shareItem, setShareItem] = useState<HadithItem | null>(null);

    const {
        filtered,
        visibleItems,
        searchQuery,
        setSearchQuery,
        selectedFilter: selectedTopic,
        setSelectedFilter: setSelectedTopic,
        handleLoadMore,
        hasMore,
        activeTargetId,
    } = useIslamicContentFilter<HadithItem>({
        library: HADITH_LIBRARY,
        searchFields: (item: HadithItem) => [
            (locale === "en" && item.titleEn) ? item.titleEn : item.title,
            (locale === "en" && item.translationEn) ? item.translationEn : item.translation,
            String(item.hadithNumber),
            item.collection,
            item.narrator || "",
            item.arabic,
            item.latin,
            ...(item.searchTerms || []),
        ],
        filterMatch: (item: HadithItem, key: string) => item.topics?.includes(key as HadithTopic) ?? false,
        targetId,
        locale,
    });

    const activeShareData: ShareableCardData | null = useMemo(() => {
        if (!shareItem) return null;
        return mapHadithToShareData(shareItem, locale);
    }, [shareItem, locale]);

    return (
        <>
            <div className={cn(
                "hadith-page flex min-h-screen flex-col items-center px-2 sm:px-4 py-4 font-sans transition-colors duration-500 bg-[rgb(var(--color-background))] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgb(var(--color-primary)/0.1),transparent)]"
            )}>
                <main className="flex w-full max-w-md flex-col pb-nav">
                    {/* Header */}
                    <div className="px-2 mb-3">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "p-2 rounded-xl border transition-colors",
                                    "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/20"
                                )}>
                                    <BookOpen className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-black tracking-tight text-[rgb(var(--color-text-strong))]">
                                        {t.hadithLibraryTitle || "Perpustakaan Hadits"}
                                    </h1>
                                    <p className="text-[11px] text-[rgb(var(--color-text-muted))]">
                                        {(t.hadithLibrarySubtitle || "{count} Hadits Shahih & Hasan Pilihan").replace("{count}", String(HADITH_LIBRARY.length))}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <IslamicSubTabBar activeTab="hadith" t={t} />

                        <IslamicSearchInput value={searchQuery} onChange={setSearchQuery} placeholder={t.hadithSearchPlaceholder || "Cari hadits, nomor (e.g. 6094), perawi, kata kunci..."} />
                    </div>

                    <IslamicFilterChips
                        items={HADITH_TOPIC_DEFINITIONS.map((topic) => ({ key: topic.key, label: locale === "en" ? topic.labelEn : topic.labelId }))}
                        selected={selectedTopic}
                        onSelect={setSelectedTopic}
                        allLabel={locale === "en" ? "All Topics" : "Semua Topik"}
                    />

                    {/* Filter count indicator */}
                    {(selectedTopic !== "all" || searchQuery) && (
                        <p className="text-[11px] px-2 mb-2 text-[rgb(var(--color-text-muted))]">
                            {(t.hadithShowingCount || "Menampilkan {count} hadits").replace("{count}", String(filtered.length))}
                        </p>
                    )}

                    {/* Hadith List */}
                    <div className="flex flex-col gap-2.5">
                        {visibleItems.map((item) => (
                            <HadithCard
                                key={item.id}
                                item={item}
                                t={t}
                                locale={locale}
                                isHighlighted={item.id === activeTargetId}
                                onShare={(h) => setShareItem(h)}
                            />
                        ))}
                    </div>

                    {/* Load More Button for Batch Virtualization */}
                    {hasMore && (
                        <div className="text-center pt-4 pb-2">
                            <button
                                onClick={handleLoadMore}
                                className={cn(
                                    "px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border inline-flex items-center gap-1.5 shadow-sm cursor-pointer",
                                    "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))] text-[rgb(var(--color-primary-strong))] hover:bg-[rgb(var(--color-surface-subtle))] hover:border-[rgb(var(--color-primary))]/30"
                                )}
                            >
                                <MoreIcon className="w-3.5 h-3.5" />
                                <span>Tampilkan Lebih Banyak ({filtered.length - visibleItems.length} Hadits Lagi)</span>
                            </button>
                        </div>
                    )}

                    {filtered.length === 0 && (
                        <div className="text-center py-12 text-[rgb(var(--color-text-muted))]">
                            <Quote className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">{t.hadithEmptyState || "Tidak ada hadits yang sesuai kriteria pencarian."}</p>
                        </div>
                    )}
                </main>
            </div>

            {/* Story Share Modal */}
            {activeShareData && (
                <StoryShareModal
                    item={activeShareData}
                    onClose={() => setShareItem(null)}
                />
            )}
        </>
    );
}

export default function HadithPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[rgb(var(--color-text-muted))] text-sm">Loading...</div>}>
            <HadithContent />
        </Suspense>
    );
}
