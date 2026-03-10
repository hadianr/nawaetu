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
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import type { EvidenceData } from "@/data/ramadhan";
import { useLocale } from "@/context/LocaleContext";

interface DalilBadgeProps {
    dalil: EvidenceData;
    variant?: "inline" | "pill";
}

export default function DalilBadge({ dalil, variant = "inline" }: DalilBadgeProps) {
    const [showDetail, setShowDetail] = useState(false);
    const { t, locale } = useLocale();

    // Localized fields with fallback
    const localizedShortRef = locale === 'en' && dalil.shortRef_en ? dalil.shortRef_en : dalil.shortRef;
    const localizedTranslation = locale === 'en' && dalil.translation_en ? dalil.translation_en : dalil.translation;
    const localizedSource = locale === 'en' && dalil.source_en ? dalil.source_en : dalil.source;

    return (
        <Dialog open={showDetail} onOpenChange={setShowDetail}>
            {/* Badge trigger */}
            <DialogTrigger asChild>
                <button
                    type="button"
                    className={`
                      flex items-center gap-0.5 sm:gap-1 transition-all duration-300 active:scale-95 group/dalil outline-none
                      ${variant === "pill"
                            ? "rounded-sm px-1 py-[0.5px] sm:px-2 sm:py-0.5 backdrop-blur-sm hover:brightness-110 active:opacity-80 shadow-sm"
                            : "text-left hover:opacity-80"
                        }
                    `}
                    style={variant === "pill" ? {
                        background: "color-mix(in srgb, var(--color-primary-light) 70%, transparent)",
                        border: "none"
                    } : undefined}
                    title={t.evidenceViewFull}
                >
                    <span className="text-[6.5px] sm:text-[8px] leading-none group-hover/dalil:scale-110 transition-transform">📜</span>
                    <span
                        className={`text-[7px] sm:text-[8px] leading-none font-bold tracking-tight transition-colors ${variant === "pill" ? "text-white group-hover/dalil:text-white" : "underline decoration-dotted underline-offset-2"}`}
                        style={variant !== "pill" ? { color: "rgb(var(--color-primary-light))" } : undefined}
                    >
                        {localizedShortRef}
                    </span>
                    {variant === "pill" && (
                        <span className="text-[6px] sm:text-[8px] leading-none text-white/30 group-hover/dalil:text-white/60 group-hover/dalil:translate-x-0.5 transition-all">→</span>
                    )}
                </button>
            </DialogTrigger>

            <DialogContent showCloseButton={false} className="max-w-[95vw] sm:max-w-lg md:max-w-xl bg-black/90 backdrop-blur-2xl border border-white/10 text-white p-0 overflow-hidden gap-0 shadow-2xl rounded-3xl z-[120]">
                {/* Combined Header & Handle */}
                <DialogHeader className="pointer-events-auto sticky top-0 z-[150] bg-black/95 backdrop-blur-md border-b border-white/5 shadow-lg flex flex-row items-center justify-between gap-3 px-6 py-4 space-y-0 text-left">
                    <DialogTitle className="font-bold text-white text-base tracking-tight leading-tight flex-1">
                        {localizedShortRef}
                    </DialogTitle>
                    <DialogClose asChild>
                        <button
                            type="button"
                            className="pointer-events-auto relative z-[200] shrink-0 rounded-full bg-white/10 p-3 text-white/60 hover:text-white hover:bg-white/20 transition-all active:scale-95 cursor-pointer touch-auto"
                            aria-label="Close"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </DialogClose>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide max-h-[80vh]">
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
                                {t.evidenceTranslation}
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
            </DialogContent>
        </Dialog>
    );
}
