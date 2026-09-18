"use client";

/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * Dua & Supplications Library Page
 * — Bilingual EN/ID (all strings via t.* keys)
 * — Theme-aware (daylight / dark / per-gender accent)
 * — Batch-virtualized for 50+ items via useIslamicContentFilter
 * — Shared components: IslamicSubTabBar, IslamicSearchInput, IslamicFilterChips
 * — Fixes: "Semua" / "All" duplicate tab, hardcoded copy/share strings, dark-mode tab bug
 */

import { useState, useMemo, useEffect, Suspense, memo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
    BookOpen,
    Quote,
    Sparkles,
    Copy,
    Check,
    ChevronDown,
    ChevronUp,
    HeartHandshake,
    Play,
    Share2,
    ChevronDown as MoreIcon,
} from "lucide-react";
import { DUA_LIBRARY, DuaItem, DUA_OCCASIONS } from "@/data/duas";
import { getTranslationText, useLocale, type TranslationTree } from "@/context/LocaleContext";
import { cn } from "@/lib/utils";
import { IslamicSubTabBar } from "@/components/islamic-content/IslamicSubTabBar";
import { IslamicSearchInput } from "@/components/islamic-content/IslamicSearchInput";
import { IslamicFilterChips, FilterChipItem } from "@/components/islamic-content/IslamicFilterChips";
import { useIslamicContentFilter } from "@/hooks/useIslamicContentFilter";
import { ShareableCardData } from "@/lib/share/story-card-renderer";
import { mapDuaToShareData } from "@/lib/share/share-mappers";

const StoryShareModal = dynamic(
    () => import("@/components/StoryShareModal").then(mod => mod.StoryShareModal),
    { ssr: false }
);

// ─────────────────────────────────────────────────────────────────────────────
//  DuaCard — individual dua card (bilingual, theme-aware, memo-ised)
// ─────────────────────────────────────────────────────────────────────────────

const DuaCard = memo(function DuaCard({
    item,
    t,
    locale,
    isHighlighted,
    onShare,
}: {
    item: DuaItem;
    t: TranslationTree;
    locale: string;
    isHighlighted: boolean;
    onShare: (item: DuaItem) => void;
}) {
    const [expanded, setExpanded] = useState(isHighlighted);
    const [copied, setCopied] = useState(false);
    const router = useRouter();

    // Auto-scroll to highlighted card and sync expansion with highlight state
    useEffect(() => {
        queueMicrotask(() => setExpanded(isHighlighted));
        if (isHighlighted) {
            const scrollTarget = () => {
                const el = document.getElementById(`dua-${item.id}`);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
            };
            const t1 = setTimeout(scrollTarget, 100);
            const t2 = setTimeout(scrollTarget, 400);
            return () => { clearTimeout(t1); clearTimeout(t2); };
        }
    }, [isHighlighted, item.id]);

    const title = (locale === "en" && item.titleEn) ? item.titleEn : item.title;
    const translation = (locale === "en" && item.translationEn) ? item.translationEn : item.translation;
    const virtueText = (locale === "en" && item.virtueEn) ? item.virtueEn : item.virtue;
    const reciteCountText = item.recommendedCount
        ? (t.duaReciteCount || (locale === "en" ? "Recite {count}x" : "Dibaca {count}x")).replace("{count}", String(item.recommendedCount))
        : null;

    const referenceText = (locale === "en" && item.source.referenceTextEn) ? item.source.referenceTextEn : item.source.referenceText;

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        const sourcePrefix = t.duaSourceLabel || (locale === "en" ? "Source" : "Sumber");
        const text = `${title}\n\n${item.arabic}\n${item.latin}\n\n"${translation}"\n\n${sourcePrefix}: ${referenceText}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLaunchCounter = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/dhikr?preset=${item.id}`);
    };

    const toggleDetail = (e: React.MouseEvent) => {
        e.stopPropagation();
        setExpanded(!expanded);
    };

    return (
        <div
            id={`dua-${item.id}`}
            className={cn(
                "rounded-2xl border transition-all duration-500 overflow-hidden select-text [content-visibility:auto] [contain-intrinsic-size:1px_140px]",
                isHighlighted
                    ? "bg-[rgb(var(--color-accent))]/10 border-[rgb(var(--color-accent))] ring-4 ring-[rgb(var(--color-ring))] shadow-[var(--shadow-floating)] scale-[1.01]"
                    : "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))] shadow-[var(--shadow-card)] hover:border-[rgb(var(--color-accent))]/50 hover:bg-[rgb(var(--color-surface-subtle))]"
            )}
        >
            {/* Card Header */}
            <div className="px-3.5 py-3 sm:px-4 sm:py-3.5 space-y-1.5">
                {/* Top Row: Badges + Chevron */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0 overflow-x-auto no-scrollbar whitespace-nowrap">
                        <span className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full font-bold font-mono border whitespace-nowrap flex-shrink-0",
                            isHighlighted
                                ? "bg-[rgb(var(--color-accent))] text-[rgb(var(--color-accent-foreground))] border-[rgb(var(--color-accent))]"
                                : "bg-[rgb(var(--color-accent))]/10 text-[rgb(var(--color-accent-foreground))] border-[rgb(var(--color-accent))]/25"
                        )}>
                            {referenceText}
                        </span>

                        {reciteCountText && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-[rgb(var(--color-success))]/10 text-[rgb(var(--color-success))] border border-[rgb(var(--color-success))]/25 whitespace-nowrap flex-shrink-0">
                                {reciteCountText}
                            </span>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={toggleDetail}
                        aria-label={expanded ? (t.collapseDetail || "Collapse") : (t.expandDetail || "Expand")}
                        className={cn(
                            "w-6 h-6 sm:w-7 sm:h-7 rounded-lg border transition-all cursor-pointer flex items-center justify-center flex-shrink-0 active:scale-95",
                            "bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))] text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-surface))] hover:text-[rgb(var(--color-text-strong))]"
                        )}
                    >
                        {expanded
                            ? <ChevronUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[rgb(var(--color-accent))]" />
                            : <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        }
                    </button>
                </div>

                {/* Bottom Row: Icon + Title + Translation Preview */}
                <div className="flex items-start gap-2 sm:gap-2.5">
                    <button
                        type="button"
                        onClick={toggleDetail}
                        aria-label={expanded ? (t.collapseDetail || "Collapse") : (t.expandDetail || "Expand")}
                        className={cn(
                            "flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center border cursor-pointer transition-colors mt-0.5",
                            isHighlighted
                                ? "bg-[rgb(var(--color-accent))] text-[rgb(var(--color-accent-foreground))] border-[rgb(var(--color-accent))]"
                                : "bg-[rgb(var(--color-accent))]/10 border-[rgb(var(--color-accent))]/20 text-[rgb(var(--color-accent-foreground))] hover:bg-[rgb(var(--color-accent))]/20"
                        )}
                    >
                        <HeartHandshake className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>

                    <div className="flex-1 min-w-0 select-text">
                        <p className="text-xs font-semibold line-clamp-1 leading-snug text-[rgb(var(--color-text-strong))]">
                            {title}
                        </p>
                        <p className="text-[11px] line-clamp-1 mt-0.5 text-[rgb(var(--color-text-muted))]">
                            &ldquo;{translation}&rdquo;
                        </p>
                    </div>
                </div>
            </div>

            {/* Expanded Detail Section */}
            {expanded && (
                <div className={cn(
                    "px-4 pb-4 space-y-3 border-t pt-3 animate-in slide-in-from-top-1 duration-200",
                    "border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))]"
                )}>
                    {/* Arabic */}
                    <p
                        dir="rtl"
                        className="text-right text-xl font-arabic leading-[2.0] tracking-wide py-1 text-[rgb(var(--color-text-strong))]"
                    >
                        {item.arabic}
                    </p>

                    {/* Latin + Translation */}
                    <div className="relative space-y-2 pl-3">
                        <div className={cn(
                            "absolute left-0 top-0 bottom-0 w-0.5 rounded-full",
                            "bg-gradient-to-b from-[rgb(var(--color-accent))] to-transparent"
                        )} />
                        {item.latin && (
                            <p className="text-[11px] italic leading-relaxed font-serif text-[rgb(var(--color-text-muted))]">
                                {item.latin}
                            </p>
                        )}
                        <p className="text-xs font-medium leading-relaxed text-[rgb(var(--color-text))]">
                            &ldquo;{translation}&rdquo;
                        </p>
                    </div>

                    {/* Virtue / Fadhilah */}
                    {virtueText && (
                        <div className={cn(
                            "p-2.5 rounded-xl text-xs space-y-1 border",
                            "bg-[rgb(var(--color-accent))]/10 border-[rgb(var(--color-accent))]/20 text-[rgb(var(--color-text))]"
                        )}>
                            <p className="font-bold flex items-center gap-1 text-[10px] uppercase tracking-wider text-[rgb(var(--color-accent-foreground))]">
                                <Sparkles className="w-3 h-3" />
                                {t.duaVirtueLabel || "Keutamaan Doa"}
                            </p>
                            <p className="text-[11px] leading-relaxed">{virtueText}</p>
                        </div>
                    )}

                    {/* Action Row */}
                    <div className="pt-2.5 mt-2 flex items-center gap-2 border-t border-[rgb(var(--color-border))]">
                        {/* Share to Story */}
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onShare(item); }}
                            className={cn(
                                "flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer shadow-xs",
                                "bg-[rgb(var(--color-accent))]/10 text-[rgb(var(--color-accent-foreground))] border-[rgb(var(--color-accent))]/25 hover:bg-[rgb(var(--color-accent))]/20"
                            )}
                        >
                            <Share2 className="w-3.5 h-3.5 text-[rgb(var(--color-accent))]" />
                            <span>{t.shareToStory || "Bagikan ke Story"}</span>
                        </button>

                        {/* Copy */}
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

                    {/* Launch Tasbih Counter only for explicitly countable dhikr */}
                    {item.isDhikr && (
                        <button
                            onClick={handleLaunchCounter}
                            className={cn(
                                "w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border shadow-sm cursor-pointer",
                                "bg-[rgb(var(--color-accent))]/10 hover:bg-[rgb(var(--color-accent))]/20 border-[rgb(var(--color-accent))]/25 text-[rgb(var(--color-accent-foreground))]"
                            )}
                        >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>{locale === "en" ? "Count This Dhikr" : "Hitung Dzikir Ini"}</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
});

// ─────────────────────────────────────────────────────────────────────────────
//  DuaContent — inner page (needs Suspense for useSearchParams)
// ─────────────────────────────────────────────────────────────────────────────

function DuaContent() {
    const { t, locale } = useLocale();
    const searchParams = useSearchParams();

    const targetId = searchParams?.get("id") || searchParams?.get("highlight") || "";

    const [shareItem, setShareItem] = useState<DuaItem | null>(null);

    // Build bilingual filter chips from DUA_OCCASIONS (exclude "all" — handled separately)
    const occasionChips: FilterChipItem[] = useMemo(() => {
        // Build a map from occasion key to translation key
        const TAB_KEY: Record<string, string> = {
            morning: "duaTabMorning",
            evening: "duaTabEvening",
            after_prayer: "duaTabAfterPrayer",
            sleeping: "duaTabSleeping",
            protection: "duaTabProtection",
            gratitude: "duaTabGratitude",
            general: "duaTabGeneral",
            social: "duaTabSocial",
        };
        const ICONS = {
            morning: "sun", evening: "moon", after_prayer: "hands", sleeping: "moon",
            protection: "shield-check", gratitude: "heart-handshake", general: "book", social: "heart-handshake",
        } as const;

        return DUA_OCCASIONS
            .filter(occ => occ.key !== "all")
            .map(occ => ({
                key: occ.key,
                icon: ICONS[occ.key as keyof typeof ICONS],
                label: getTranslationText(t, TAB_KEY[occ.key], locale === "en" ? occ.labelEn : occ.labelId),
            }));
    }, [locale, t]);

    const {
        filtered,
        visibleItems,
        searchQuery,
        setSearchQuery,
        selectedFilter: selectedOccasion,
        setSelectedFilter: setSelectedOccasion,
        handleLoadMore,
        hasMore,
        activeTargetId,
    } = useIslamicContentFilter<DuaItem>({
        library: DUA_LIBRARY,
        searchFields: (item) => [
            (locale === "en" && item.titleEn) ? item.titleEn : item.title,
            (locale === "en" && item.translationEn) ? item.translationEn : item.translation,
            (locale === "en" && item.virtueEn) ? item.virtueEn : (item.virtue || ""),
            item.source.referenceText,
            item.source.referenceTextEn || "",
            item.arabic,
            item.latin,
            ...(item.searchTerms || []),
        ],
        filterMatch: (item, key) => item.occasion === key || item.additionalOccasions?.includes(key as DuaItem["occasion"]) === true,
        targetId,
        locale,
    });

    const activeShareData: ShareableCardData | null = useMemo(() => {
        if (!shareItem) return null;
        return mapDuaToShareData(shareItem, locale);
    }, [shareItem, locale]);

    return (
        <>
            <div className={cn(
                "dua-page flex min-h-screen flex-col items-center px-2 sm:px-4 py-4 font-sans transition-colors duration-500 bg-[rgb(var(--color-background))] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgb(var(--color-accent)/0.1),transparent)]"
            )}>
                <main className="flex w-full max-w-md flex-col pb-nav">
                    {/* ── Page Header ── */}
                    <div className="px-2 mb-3">
                        <div className="flex items-center gap-2 mb-3">
                            <div className={cn(
                                "p-2 rounded-xl border transition-colors",
                                "bg-[rgb(var(--color-accent))]/10 border-[rgb(var(--color-accent))]/20"
                            )}>
                                <BookOpen className="w-5 h-5 text-[rgb(var(--color-accent))]" />
                            </div>
                            <div>
                                <h1 className="text-lg font-black tracking-tight text-[rgb(var(--color-text-strong))]">
                                    {t.duaLibraryTitle || "Kumpulan Doa & Dzikir"}
                                </h1>
                                <p className="text-[11px] text-[rgb(var(--color-text-muted))]">
                                    {(t.duaLibrarySubtitle || "{count} Doa Pilihan dari Al-Qur'an & Sunnah").replace("{count}", String(DUA_LIBRARY.length))}
                                </p>
                            </div>
                        </div>

                        {/* Hadith ↔ Dua tab switcher (theme-aware, no hardcoded strings) */}
                        <IslamicSubTabBar activeTab="dua" t={t} />

                        {/* Search */}
                        <IslamicSearchInput
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder={t.duaSearchPlaceholder || "Cari doa, dzikir, kata kunci..."}
                        />
                    </div>

                    {/* ── Occasion Filter Chips ── */}
                    <IslamicFilterChips
                        items={occasionChips}
                        selected={selectedOccasion}
                        onSelect={setSelectedOccasion}
                        allLabel={t.duaAllOccasions || "Semua Doa"}
                    />

                    {/* Filter count */}
                    {(selectedOccasion !== "all" || searchQuery) && (
                        <p className="text-[11px] px-2 mb-2 text-[rgb(var(--color-text-muted))]">
                            {(t.duaShowingCount || "Menampilkan {count} doa").replace("{count}", String(filtered.length))}
                        </p>
                    )}

                    {/* ── Dua List ── */}
                    <div className="flex flex-col gap-2.5">
                        {visibleItems.map((item) => (
                            <DuaCard
                                key={item.id}
                                item={item}
                                t={t}
                                locale={locale}
                                isHighlighted={item.id === activeTargetId}
                                onShare={(d) => setShareItem(d)}
                            />
                        ))}
                    </div>

                    {/* ── Load More ── */}
                    {hasMore && (
                        <div className="text-center pt-4 pb-2">
                            <button
                                onClick={handleLoadMore}
                                className={cn(
                                    "px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border inline-flex items-center gap-1.5 shadow-sm cursor-pointer",
                                    "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))] text-[rgb(var(--color-accent-foreground))] hover:bg-[rgb(var(--color-surface-subtle))] hover:border-[rgb(var(--color-accent))]/30"
                                )}
                            >
                                <MoreIcon className="w-3.5 h-3.5" />
                                <span>
                                    {t.loadMore || "Tampilkan Lebih Banyak"} ({filtered.length - visibleItems.length})
                                </span>
                            </button>
                        </div>
                    )}

                    {/* ── Empty State ── */}
                    {filtered.length === 0 && (
                        <div className="text-center py-12 text-[rgb(var(--color-text-muted))]">
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
                />
            )}
        </>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Page export
// ─────────────────────────────────────────────────────────────────────────────

export default function DuaPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[rgb(var(--color-text-muted))] text-sm">Loading...</div>}>
            <DuaContent />
        </Suspense>
    );
}
