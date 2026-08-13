"use client";

/**
 * Nawaetu - Sirah Quran Context Banner
 * Copyright (C) 2026 Hadian Rahmat
 */

import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

interface SirahContextInfo {
    title: string;
    chapterSlug: string;
    description: string;
}

const SURAH_SIRAH_MAPPINGS: Record<number, SirahContextInfo> = {
    3: {
        title: "Perang Uhud",
        chapterSlug: "perang-uhud",
        description: "Ayat-ayat dalam Surah Ali 'Imran (121-180) membahas iktibar dan hikmah peristiwa Perang Uhud.",
    },
    8: {
        title: "Perang Badr Kubra",
        chapterSlug: "perang-badr-kubra",
        description: "Surah Al-Anfal diturunkan khusus berkenaan hukum & peristiwa Perang Badr Kubra (2 H).",
    },
    9: {
        title: "Perang Tabuk",
        chapterSlug: "perang-tabuk",
        description: "Surah At-Taubah diturunkan berkenaan peristiwa Perang Tabuk & manuver pasukan Muslimin.",
    },
    17: {
        title: "Isra' dan Mi'raj",
        chapterSlug: "isra-dan-miraj",
        description: "Surah Al-Isra' mengabadikan peristiwa mukjizat Isra' & Mi'raj Rasulullah صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ.",
    },
    33: {
        title: "Perang Ahzab / Khandaq",
        chapterSlug: "perang-ahzab-atau-khandaq",
        description: "Surah Al-Ahzab mengisahkan ketegangan strategi parit dalam Perang Ahzab dan Bani Quraizhah.",
    },
    48: {
        title: "Perjanjian Hubaidiyah",
        chapterSlug: "perjanjian-hubaidiyah",
        description: "Surah Al-Fath diturunkan sebagai kabar gembira kemenangan usai Perjanjian Hubaidiyah.",
    },
    105: {
        title: "Tahun Gajah & Kelahiran Nabi",
        chapterSlug: "kelahiran-dan-empat-puluh-tahun-sebelum-nubuwah",
        description: "Surah Al-Fil menceritakan pembinaan Ka'bah & Pasukan Gajah di tahun kelahiran Rasulullah.",
    },
};

export function SirahQuranContextBanner({ surahId }: { surahId: number }) {
    const { currentTheme } = useTheme();
    const isDaylight = currentTheme === "daylight";
    const info = SURAH_SIRAH_MAPPINGS[surahId];

    if (!info) return null;

    return (
        <div
            className={cn(
                "w-full p-4 rounded-2xl border transition-all mb-4 flex items-center justify-between gap-3",
                isDaylight
                    ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-slate-800"
                    : "bg-gradient-to-r from-emerald-950/40 to-teal-950/20 border-emerald-500/30 text-emerald-100"
            )}
        >
            <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-500 shrink-0">
                    <BookOpen className="w-4 h-4" />
                </div>
                <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                            💡 Konteks Sejarah (Sirah Nabawiyah)
                        </span>
                    </div>
                    <p className="text-xs font-semibold leading-snug truncate">
                        {info.description}
                    </p>
                </div>
            </div>

            <Link
                href={`/sirah/${info.chapterSlug}`}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1 shadow-xs"
            >
                <span>Baca Sirah</span>
                <ChevronRight className="w-3.5 h-3.5" />
            </Link>
        </div>
    );
}
