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

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { BookOpen, Sparkles, Quote, Copy, Check, ChevronRight, Share2 } from "lucide-react";
import { getSpiritualItemOfDay, SpiritualItem, getLocalizedContent } from "@/data/spiritual-content";
import { useLocale } from "@/context/LocaleContext";
import type { TranslationTree } from "@/context/LocaleContext";
import Link from "next/link";
import { mapDailySpiritToShareData } from "@/lib/share/share-mappers";

const StoryShareModal = dynamic(
    () => import("@/components/StoryShareModal").then(mod => mod.StoryShareModal),
    { ssr: false }
);

export default function DailySpiritWidget() {
    const { t, locale } = useLocale();
    const [item, setItem] = useState<SpiritualItem | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);

    useEffect(() => {
        queueMicrotask(() => setItem(getSpiritualItemOfDay()));
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
    const categoryTranslation = (t as TranslationTree)[item.category as keyof TranslationTree];
    const localizedCategory = typeof categoryTranslation === "string" ? categoryTranslation : item.category;
    const localizedContent = getLocalizedContent(item.content, locale);

    return (
        <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative overflow-hidden rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] backdrop-blur-2xl shadow-[var(--shadow-card)] spiritual-card">
                {/* Decorative blur blobs */}
                <div className="absolute -top-8 -right-8 w-28 h-28 bg-[rgb(var(--color-primary))]/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-[rgb(var(--color-primary))]/5 rounded-full blur-2xl pointer-events-none" />

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
                            <span className="text-[11px] font-medium mt-0.5 text-[rgb(var(--color-text-muted))]">{localizedCategory}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-0.5">
                        <button
                            onClick={() => setShowShareModal(true)}
                            className="group relative p-2 rounded-full active:scale-95 transition-all hover:bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-text-muted))]"
                            title={t.shareToStory || (locale === "en" ? "Share to Story" : "Bagikan ke Story")}
                        >
                            <Share2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                        </button>
                        <button
                            onClick={handleCopy}
                            className="group relative p-2 rounded-full active:scale-95 transition-all hover:bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-text-muted))]"
                            title={t.spiritualCopyContent}
                        >
                            {isCopied ? (
                                <Check className="w-3.5 h-3.5 text-[rgb(var(--color-success))] animate-in zoom-in duration-300" />
                            ) : (
                                <Copy className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                            )}
                            {isCopied && (
                                <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[rgb(var(--color-success))] text-[10px] font-bold text-[rgb(var(--color-primary-foreground))] px-2 py-0.5 rounded-md animate-in fade-in slide-in-from-bottom-2 whitespace-nowrap">
                                    {t.spiritualCopied}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* --- Content --- */}
                <div className="px-4 pb-3 space-y-2.5">
                    {/* Arabic */}
                    <div
                        dir="rtl"
                        className="text-right text-xl font-arabic leading-[1.8] text-[rgb(var(--color-text-strong))] py-1"
                    >
                        {item.content.arabic}
                    </div>

                    {/* Transliteration & Translation */}
                    <div className="relative space-y-1.5">
                        <div className="absolute -left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[rgb(var(--color-primary))]/40 to-transparent rounded-full" />
                        <p className="text-[10px] font-medium italic leading-relaxed pl-3 text-[rgb(var(--color-text-muted))]">
                            {item.content.latin}
                        </p>
                        <p className="text-sm font-medium leading-relaxed pl-3 text-[rgb(var(--color-text))]">
                            &quot;{localizedContent.translation}&quot;
                        </p>
                    </div>

                    {/* Source row */}
                    <div className="flex items-center gap-3 pt-1">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgb(var(--color-border))] to-transparent" />
                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[rgb(var(--color-surface-subtle))] border border-[rgb(var(--color-border))]">
                            <Sparkles className="w-2.5 h-2.5 text-[rgb(var(--color-accent))]" />
                            <span className="text-[9px] font-black uppercase tracking-[0.15em] whitespace-nowrap text-[rgb(var(--color-text-muted))]">
                                {item.content.source}
                            </span>
                        </div>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgb(var(--color-border))] to-transparent" />
                    </div>
                </div>

                {/* --- Shortcut: Lihat Hadits Lainnya --- */}
                <Link
                    href="/hadith"
                    className="group flex items-center justify-between px-4 py-2.5 border-t border-[rgb(var(--color-border))] transition-colors hover:bg-[rgb(var(--color-primary))]/5"
                >
                    <span className="text-[11px] font-semibold transition-colors text-[rgb(var(--color-text-muted))] group-hover:text-[rgb(var(--color-text-strong))]">
                        {isHadith ? t.hadithExploreLink : t.hadithExploreLinkDua}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-[rgb(var(--color-text-muted))] group-hover:text-[rgb(var(--color-primary-light))] group-hover:translate-x-0.5 transition-all" />
                </Link>

                {/* Shine overlay */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-white/[0.04] opacity-50" />
                </div>
            </div>

            {/* --- Story Share Modal --- */}
            {showShareModal && (
                <StoryShareModal
                    item={mapDailySpiritToShareData(
                        item,
                        localizedContent.title || item.content.title || (isHadith ? (t.spiritualHadithTitle || "Hadits Hari Ini") : (t.spiritualDuaTitle || "Doa Hari Ini")),
                        localizedContent.translation || item.content.translation
                    )}
                    onClose={() => setShowShareModal(false)}
                />
            )}
        </div>
    );
}
