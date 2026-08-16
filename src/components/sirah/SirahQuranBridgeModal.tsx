"use client";

/**
 * Nawaetu - Sirah Nabawiyah Quran Bridge Modal
 * Copyright (C) 2026 Hadian Rahmat
 */

import { X, BookOpen, ExternalLink } from "lucide-react";
import { surahNames } from "@/lib/quran/surahData";
import type { SirahQuranRef } from "@/data/sirah";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

interface SirahQuranBridgeModalProps {
    refData: SirahQuranRef | null;
    onClose: () => void;
}

export function SirahQuranBridgeModal({ refData, onClose }: SirahQuranBridgeModalProps) {
    const { currentTheme } = useTheme();
    const isDaylight = currentTheme === "daylight";

    if (!refData) return null;

    const surahName = surahNames[refData.surah] || `Surah ${refData.surah}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div
                className={cn(
                    "w-full max-w-md rounded-2xl border p-5 shadow-2xl transition-all",
                    isDaylight ? "bg-white border-slate-200 text-slate-900" : "bg-slate-900 border-[rgb(var(--color-primary))]/30 text-white"
                )}
            >
                <div className={cn("flex items-center justify-between border-b pb-3 mb-4", isDaylight ? "border-slate-200" : "border-[rgb(var(--color-primary))]/20")}>
                    <div className="flex items-center gap-2.5">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", isDaylight ? "bg-emerald-50 text-emerald-600" : "bg-[rgb(var(--color-primary))]/15 text-[rgb(var(--color-primary-light))]")}>
                            <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-bold text-base leading-tight">{surahName}</h3>
                            <p className={cn("text-xs font-medium", isDaylight ? "text-emerald-700" : "text-[rgb(var(--color-primary-light))]")}>Ayat {refData.verses}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 opacity-60 hover:opacity-100" />
                    </button>
                </div>

                <div className="space-y-4 py-2">
                    <div className={cn("p-4 rounded-xl text-sm leading-relaxed border", isDaylight ? "bg-emerald-50/60 border-emerald-200/60 text-slate-800" : "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/20 text-white/90")}>
                        <p className={cn("font-semibold text-xs mb-1", isDaylight ? "text-emerald-800" : "text-[rgb(var(--color-primary-light))]")}>📖 Asbabun Nuzul / Konteks Sejarah:</p>
                        <p className="text-xs">{refData.label || `Ayat ini diturunkan berkaitan dengan peristiwa sejarah Sirah Nabawiyah yang Anda baca.`}</p>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-medium rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                        >
                            Tutup
                        </button>
                        <Link
                            href={`/quran/${refData.surah}`}
                            onClick={onClose}
                            className={cn(
                                "px-4 py-2 text-xs font-semibold text-white rounded-xl transition-all flex items-center gap-1.5 shadow-md",
                                isDaylight
                                    ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
                                    : "bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/90 shadow-[rgb(var(--color-primary))]/20"
                            )}
                        >
                            <span>Buka Surah Lengkap</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
