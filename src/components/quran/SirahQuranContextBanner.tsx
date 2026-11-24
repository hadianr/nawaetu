"use client";

/**
 * Nawaetu - Sirah Quran Context Banner
 * Copyright (C) 2026 Hadian Rahmat
 */

import Link from "next/link";
import { BookOpen, ChevronRight } from "@/components/ui/icons";
import { AppIcon } from "@/components/ui/AppIcon";
import { cn } from "@/lib/utils";
import { useLocale } from "@/context/LocaleContext";

interface SirahContextInfo {
    chapterSlug: string;
    description: { id: string; en: string };
}

// Nawaetu's own summaries; the slug is the sirah route and keeps its historical spelling.
const SURAH_SIRAH_MAPPINGS: Record<number, SirahContextInfo> = {
    3: {
        chapterSlug: "perang-uhud",
        description: {
            id: "Ayat-ayat dalam Surah Ali 'Imran (121-180) membahas iktibar dan hikmah peristiwa Perang Uhud.",
            en: "Surah Ali 'Imran (verses 121-180) draws lessons and wisdom from the Battle of Uhud.",
        },
    },
    8: {
        chapterSlug: "perang-badr-kubra",
        description: {
            id: "Surah Al-Anfal diturunkan berkenaan dengan hukum dan peristiwa Perang Badr Kubra (2 H).",
            en: "Surah Al-Anfal was revealed about the rulings and events of the Battle of Badr (2 AH).",
        },
    },
    9: {
        chapterSlug: "perang-tabuk",
        description: {
            id: "Surah At-Taubah diturunkan berkenaan dengan peristiwa Perang Tabuk dan keberangkatan pasukan Muslimin.",
            en: "Surah At-Taubah was revealed about the Battle of Tabuk and the march of the Muslim army.",
        },
    },
    17: {
        chapterSlug: "isra-dan-miraj",
        description: {
            id: "Surah Al-Isra' mengabadikan mukjizat Isra' dan Mi'raj Nabi Muhammad SAW.",
            en: "Surah Al-Isra' records the miracle of the Night Journey and Ascension of Prophet Muhammad SAW.",
        },
    },
    33: {
        chapterSlug: "perang-ahzab-atau-khandaq",
        description: {
            id: "Surah Al-Ahzab mengisahkan strategi parit dalam Perang Ahzab dan peristiwa Bani Quraizhah.",
            en: "Surah Al-Ahzab recounts the trench strategy in the Battle of the Confederates and the events of Banu Qurayzah.",
        },
    },
    48: {
        chapterSlug: "perjanjian-hubaidiyah",
        description: {
            id: "Surah Al-Fath diturunkan sebagai kabar gembira kemenangan setelah Perjanjian Hudaibiyah.",
            en: "Surah Al-Fath was revealed as glad tidings of victory after the Treaty of Hudaybiyyah.",
        },
    },
    105: {
        chapterSlug: "kelahiran-dan-empat-puluh-tahun-sebelum-nubuwah",
        description: {
            id: "Surah Al-Fil mengisahkan pasukan gajah yang hendak menghancurkan Ka'bah, pada tahun kelahiran Nabi Muhammad SAW.",
            en: "Surah Al-Fil tells of the elephant army that set out to destroy the Ka'bah, in the year Prophet Muhammad SAW was born.",
        },
    },
};

export function SirahQuranContextBanner({ surahId }: { surahId: number }) {
    const { t, locale } = useLocale();
    const info = SURAH_SIRAH_MAPPINGS[surahId];

    if (!info) return null;

    return (
        <div
            className={cn(
                "w-full p-4 rounded-2xl border transition-all mb-4 flex items-center justify-between gap-3",
                "bg-gradient-to-r from-[rgb(var(--color-primary))]/10 to-[rgb(var(--color-primary))]/5 border-[rgb(var(--color-primary))]/25 text-[rgb(var(--color-text))] shadow-[var(--shadow-card)]"
            )}
        >
            <div className="flex items-center gap-3 min-w-0">
                <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                    "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary-strong))]"
                )}>
                    <BookOpen className="w-4 h-4" aria-hidden="true" />
                </div>
                <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                        <span className={cn(
                            "text-xs font-extrabold",
                            "text-[rgb(var(--color-primary-strong))]"
                        )}>
                            <span className="inline-flex items-center gap-1"><AppIcon name="scroll" size="xs" tone="primary" /> {t.quranSirahContextLabel}</span>
                        </span>
                    </div>
                    <p className="text-xs font-semibold leading-snug truncate">
                        {locale === "en" ? info.description.en : info.description.id}
                    </p>
                </div>
            </div>

            <Link
                href={`/sirah/${info.chapterSlug}`}
                className={cn(
                    "px-3 py-1.5 rounded-xl text-[rgb(var(--color-primary-foreground))] text-xs font-bold transition-all shrink-0 flex items-center gap-1 shadow-[var(--shadow-card)] cursor-pointer bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-strong))]"
                )}
            >
                <span>{t.quranSirahContextRead}</span>
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
        </div>
    );
}
