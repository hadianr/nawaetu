"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { DalilData } from "@/data/ramadhan-data";
import { useLocale } from "@/context/LocaleContext";

interface DalilBadgeProps {
    dalil: DalilData;
    variant?: "inline" | "pill";
}

export default function DalilBadge({ dalil, variant = "inline" }: DalilBadgeProps) {
    const [showDetail, setShowDetail] = useState(false);
    const { t, locale } = useLocale();

    // Localized fields with fallback
    const localizedShortRef = locale === 'en' && dalil.shortRef_en ? dalil.shortRef_en : dalil.shortRef;
    const localizedTranslation = locale === 'en' && dalil.translation_en ? dalil.translation_en : dalil.translation;
    const localizedSource = locale === 'en' && dalil.source_en ? dalil.source_en : dalil.source;

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setShowDetail(true);
    };

    return (
        <>
            {/* Badge trigger */}
            <button
                type="button"
                onClick={handleClick}
                className={`
          flex items-center gap-1 sm:gap-1.5 transition-all duration-300 active:scale-95 group/dalil
          ${variant === "pill"
                        ? "rounded-full border-[0.5px] border-white/10 bg-white/5 px-2 py-1 sm:px-3 sm:py-1.5 backdrop-blur-sm hover:bg-white/10 active:opacity-80"
                        : "text-left hover:opacity-80"
                    }
        `}
                style={variant === "pill" ? {
                    borderColor: "rgba(var(--color-primary), 0.2)",
                    background: "rgba(var(--color-primary), 0.1)"
                } : undefined}
                title={t.dalilViewFull}
            >
                <span className="text-[10px] sm:text-xs group-hover/dalil:scale-110 transition-transform">📜</span>
                <span
                    className={`text-[10px] sm:text-xs font-bold tracking-tight transition-colors ${variant === "pill" ? "text-white/70 group-hover/dalil:text-white" : "underline decoration-dotted underline-offset-2"}`}
                    style={variant !== "pill" ? { color: "rgb(var(--color-primary-light))" } : undefined}
                >
                    {localizedShortRef}
                </span>
                {variant === "pill" && (
                    <span className="text-[10px] sm:text-xs text-white/30 group-hover/dalil:text-white/60 group-hover/dalil:translate-x-0.5 transition-all">→</span>
                )}
            </button>

            {/* Detail bottom sheet / modal - Using Portal to render outside parent */}
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
                        {/* Handle bar for mobile swipe */}
                        <div className="sticky top-0 pt-3 pb-1 flex justify-center sm:hidden">
                            <div className="h-1 w-10 rounded-full bg-white/20" />
                        </div>

                        {/* Header */}
                        <div className="sticky top-0 bg-gradient-to-b from-black/95 to-black/80 backdrop-blur-md pt-5 px-6 pb-4 border-b border-white/5 z-20 shadow-lg">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="font-bold text-white text-base tracking-tight leading-tight">
                                        {localizedShortRef}
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowDetail(false)}
                                    className="shrink-0 rounded-full bg-white/10 p-1.5 text-white/60 hover:text-white hover:bg-white/20 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
                            <div className="space-y-6 pb-28">
                                {/* Arabic text */}
                                {dalil.arabic && (
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
                                            {dalil.arabic}
                                        </p>
                                    </div>
                                )}

                                {/* Latin */}
                                {dalil.latin && (
                                    <div className="relative pl-4 pr-2">
                                        <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full bg-white/20" />
                                        <p className="text-sm italic text-white/80 leading-relaxed font-normal" style={{
                                            textShadow: "0 1px 8px rgba(0,0,0,0.4)"
                                        }}>
                                            &ldquo;{dalil.latin}&rdquo;
                                        </p>
                                    </div>
                                )}

                                {/* Translation */}
                                <div className="rounded-2xl border p-4 backdrop-blur-sm shadow-lg" style={{
                                    background: "rgba(0, 0, 0, 0.2)",
                                    borderColor: "rgba(255, 255, 255, 0.1)"
                                }}>
                                    <p className="text-[10px] font-bold uppercase tracking-wider mb-2.5 text-white/50">
                                        {t.dalilTranslation}
                                    </p>
                                    <p className="text-sm text-white leading-relaxed font-normal" style={{
                                        textShadow: "0 1px 8px rgba(0,0,0,0.4)",
                                        lineHeight: "1.7"
                                    }}>
                                        &ldquo;{localizedTranslation}&rdquo;
                                    </p>
                                </div>

                                {/* Source */}
                                <div className="flex items-center gap-2 px-1">
                                    <span className="h-1 w-1 rounded-full bg-white/20" />
                                    <p className="text-[10px] font-medium text-white/30 uppercase tracking-widest leading-relaxed">
                                        {localizedSource}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
