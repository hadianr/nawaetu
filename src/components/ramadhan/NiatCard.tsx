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

import { useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { NiatData } from "@/data/ramadhan";
import { useLocale } from "@/context/LocaleContext";

interface NiatCardProps {
    niat: NiatData;
    defaultExpanded?: boolean;
    compact?: boolean;
    variant?: "inline" | "pill";
}

export default function NiatCard({ niat, defaultExpanded = false, compact = false, variant = "pill" }: NiatCardProps) {
    const [showDetail, setShowDetail] = useState(false);
    const { t, locale } = useLocale();

    // Localized fields with fallback
    const localizedTitle = locale === 'en' && niat.title_en ? niat.title_en : niat.title;
    const localizedTranslation = locale === 'en' && niat.translation_en ? niat.translation_en : niat.translation;
    const localizedSource = locale === 'en' && niat.source_en ? niat.source_en : niat.source;

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setShowDetail(true);
    };

    return (
        <>
            {/* Niat Puasa Button */}
            <button
                type="button"
                onClick={handleClick}
                className={`
          flex items-center gap-1.5 sm:gap-2 transition-all duration-300 active:scale-95 group/niat w-full
          ${variant === "pill"
                        ? "rounded-2xl border backdrop-blur-md p-2.5 sm:p-4 hover:bg-white/10 active:opacity-80"
                        : "text-left hover:opacity-80"
                    }
        `}
                style={variant === "pill" ? {
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    background: "rgba(0, 0, 0, 0.2)",
                    backdropFilter: "blur(8px)"
                } : undefined}
                title={t.niatViewFull}
            >
                <span className="text-base sm:text-lg group-hover/niat:scale-110 transition-transform">🤲</span>
                <div className="flex-1 text-left">
                    <p className="text-xs sm:text-sm font-bold text-white group-hover/niat:text-white transition-colors">
                        {localizedTitle}
                    </p>
                    {/* Show recommendation badge if source mentions "Sahih" or "Paling Dianjurkan" */}
                    {(localizedSource?.includes('Sahih') || localizedSource?.includes('Paling Dianjurkan') || localizedSource?.includes('Most Recommended')) && (
                        <span className="inline-block mt-0.5 px-1.5 py-0.5 text-[9px] font-semibold rounded-md" style={{
                            background: "rgba(var(--color-primary), 0.2)",
                            color: "rgb(var(--color-primary-light))",
                            border: "1px solid rgba(var(--color-primary), 0.3)"
                        }}>
                            ⭐ {locale === 'en' ? 'Recommended' : 'Dianjurkan'}
                        </span>
                    )}
                </div>
                {variant === "pill" && (
                    <span className="text-[10px] sm:text-xs text-white/30 group-hover/niat:text-white/60 group-hover/niat:translate-x-0.5 transition-all">→</span>
                )}
            </button>

            {/* Detail modal / bottom sheet - Using Portal to render outside parent */}
            {showDetail && typeof document !== 'undefined' && createPortal(
                <div
                    className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center"
                    onClick={() => setShowDetail(false)}
                >
                    {/* Backdrop - more transparent to see card behind */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />

                    {/* Sheet */}
                    <div
                        className="relative z-10 w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-black/90 backdrop-blur-2xl border-t border-x sm:border border-white/10 overflow-y-auto max-h-[88vh] sm:max-h-[85vh] animate-in slide-in-from-bottom-4 duration-300 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Combined Header & Handle */}
                        <div className="sticky top-0 z-30 bg-black/95 backdrop-blur-md border-b border-white/5 shadow-lg">
                            {/* Handle bar for mobile swipe */}
                            <div className="pt-3 pb-1 flex justify-center sm:hidden">
                                <div className="h-1.5 w-12 rounded-full bg-white/10" />
                            </div>

                            {/* Title & Close */}
                            <div className="flex items-center justify-between gap-3 px-6 py-4">
                                <h3 className="font-bold text-white text-base tracking-tight leading-tight">
                                    {localizedTitle}
                                </h3>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setShowDetail(false);
                                    }}
                                    className="shrink-0 rounded-full bg-white/10 p-2.5 text-white/60 hover:text-white hover:bg-white/20 transition-all active:scale-95 touch-manipulation"
                                    aria-label="Close"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
                            <div className="space-y-6 pb-28">
                                {/* Arabic text */}
                                <div
                                    className="rounded-2xl border p-5 backdrop-blur-md shadow-lg transition-all hover:shadow-xl"
                                    style={{
                                        background: "rgba(0, 0, 0, 0.3)",
                                        borderColor: "rgba(255, 255, 255, 0.1)"
                                    }}
                                >
                                    <p
                                        className="text-right font-arabic leading-loose text-white drop-shadow-lg"
                                        style={{
                                            fontFamily: "var(--font-amiri)",
                                            fontSize: "1.5rem",
                                            fontWeight: "600",
                                            textShadow: "0 2px 12px rgba(0,0,0,0.6)",
                                            lineHeight: "2"
                                        }}
                                        dir="rtl"
                                        lang="ar"
                                    >
                                        {niat.arabic}
                                    </p>
                                </div>

                                {/* Latin transliteration */}
                                <div className="relative pl-4 pr-2">
                                    <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full bg-white/20" />
                                    <p className="text-sm italic text-white/80 leading-relaxed font-normal" style={{
                                        textShadow: "0 1px 8px rgba(0,0,0,0.4)"
                                    }}>
                                        &ldquo;{niat.latin}&rdquo;
                                    </p>
                                </div>

                                {/* Translation */}
                                <div className="rounded-2xl border p-4 backdrop-blur-sm shadow-lg" style={{
                                    background: "rgba(0, 0, 0, 0.2)",
                                    borderColor: "rgba(255, 255, 255, 0.1)"
                                }}>
                                    <p className="text-[10px] font-bold uppercase tracking-wider mb-2.5 text-white/50">
                                        {t.niatTranslation}
                                    </p>
                                    <p className="text-sm text-white leading-relaxed font-normal" style={{
                                        textShadow: "0 1px 8px rgba(0,0,0,0.4)",
                                        lineHeight: "1.7"
                                    }}>
                                        &ldquo;{localizedTranslation}&rdquo;
                                    </p>
                                </div>

                                {/* Source */}
                                {localizedSource && (
                                    <div className="flex items-center gap-2 px-1">
                                        <span className="h-1 w-1 rounded-full bg-white/20" />
                                        <p className="text-[10px] font-medium text-white/30 uppercase tracking-widest leading-relaxed">
                                            {localizedSource}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
