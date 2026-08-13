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
                    isDaylight ? "bg-white border-emerald-100 text-slate-900" : "bg-slate-900 border-white/10 text-white"
                )}
            >
                <div className="flex items-center justify-between border-b pb-3 mb-4 border-emerald-500/20">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-bold text-base leading-tight">{surahName}</h3>
                            <p className="text-xs text-emerald-500 font-medium">Ayat {refData.verses}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 opacity-60 hover:opacity-100" />
                    </button>
                </div>

                <div className="space-y-4 py-2">
                    <div className={cn("p-4 rounded-xl text-sm leading-relaxed", isDaylight ? "bg-emerald-50/60 text-slate-800" : "bg-emerald-950/30 text-emerald-100/90")}>
                        <p className="font-semibold text-xs text-emerald-600 dark:text-emerald-400 mb-1">📖 Asbabun Nuzul / Konteks Sejarah:</p>
                        <p className="text-xs">{refData.label || `Ayat ini diturunkan berkaitan dengan peristiwa sejarah Sirah Nabawiyah yang Anda baca.`}</p>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-medium rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        >
                            Tutup
                        </button>
                        <Link
                            href={`/quran/${refData.surah}`}
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
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
