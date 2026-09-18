"use client";

/**
 * Nawaetu - Sirah Nabawiyah Quran Bridge Modal
 * Copyright (C) 2026 Hadian Rahmat
 */

import { X, BookOpen, ExternalLink } from "lucide-react";
import { surahNames } from "@/lib/quran/surahData";
import type { SirahQuranRef } from "@/data/sirah";
import Link from "next/link";
import { AppIcon } from "@/components/ui/AppIcon";

interface SirahQuranBridgeModalProps {
    refData: SirahQuranRef | null;
    onClose: () => void;
}

export function SirahQuranBridgeModal({ refData, onClose }: SirahQuranBridgeModalProps) {
    if (!refData) return null;

    const surahName = surahNames[refData.surah] || `Surah ${refData.surah}`;

    return (
        <div className="sirah-quran-bridge-modal fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgb(var(--color-text-strong))]/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-2xl border border-[rgb(var(--color-border))] p-5 shadow-[var(--shadow-floating)] transition-all bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text))]">
                <div className="flex items-center justify-between border-b border-[rgb(var(--color-border))] pb-3 mb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))]">
                            <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-bold text-base leading-tight">{surahName}</h3>
                            <p className="text-xs font-medium text-[rgb(var(--color-primary-strong))]">Ayat {refData.verses}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-[rgb(var(--color-surface-subtle))] transition-colors cursor-pointer"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 opacity-60 hover:opacity-100" />
                    </button>
                </div>

                <div className="space-y-4 py-2">
                    <div className="p-4 rounded-xl text-sm leading-relaxed border bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/20 text-[rgb(var(--color-text))]">
                        <p className="font-semibold text-xs mb-1 text-[rgb(var(--color-primary-strong))] flex items-center gap-1.5"><AppIcon name="book" size="xs" tone="primary" /> Asbabun Nuzul / Konteks Sejarah:</p>
                        <p className="text-xs">{refData.label || `Ayat ini diturunkan berkaitan dengan peristiwa sejarah Sirah Nabawiyah yang Anda baca.`}</p>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-medium rounded-xl hover:bg-[rgb(var(--color-surface-subtle))] transition-colors cursor-pointer"
                        >
                            Tutup
                        </button>
                        <Link
                            href={`/quran/${refData.surah}`}
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold text-[rgb(var(--color-primary-foreground))] rounded-xl transition-all flex items-center gap-1.5 shadow-[var(--shadow-card)] bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-strong))]"
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
