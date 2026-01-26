"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface DateType {
    hijri: {
        date: string;
        format: string;
        day: string;
        weekday: {
            en: string;
            ar: string;
        };
        month: {
            number: number;
            en: string;
            ar: string;
        };
        year: string;
        designation: {
            abbreviated: string;
            expanded: string;
        };
    };
    gregorian: {
        date: string;
        format: string;
        day: string;
        weekday: {
            en: string;
        };
        month: {
            number: number;
            en: string;
        };
        year: string;
        designation: {
            abbreviated: string;
            expanded: string;
        };
    };
    readable: string;
    timestamp: string;
}

export interface Chapter {
    id: number;
    revelation_place: string;
    revelation_order: number;
    bismillah_pre: boolean;
    name_simple: string;
    name_complex: string;
    name_arabic: string;
    verses_count: number;
    pages: number[];
    translated_name: {
        language_name: string;
        name: string;
    };
}

interface SurahListProps {
    chapters: Chapter[];
}

export default function SurahList({ chapters }: SurahListProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredChapters = chapters.filter((chapter) =>
        chapter.name_simple.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chapter.translated_name.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-full max-w-4xl space-y-6">
            {/* Sticky Search Header */}
            <div className="sticky top-0 z-20 -mx-4 px-4 py-4 backdrop-blur-xl md:static md:mx-0 md:p-0">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                    <Input
                        placeholder="Cari Surat atau Arti..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/40 focus-visible:ring-emerald-500/50"
                    />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredChapters.map((chapter) => (
                    <Link
                        key={chapter.id}
                        href={`/quran/${chapter.id}`}
                        className="group relative flex items-center justify-between overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                    >
                        <div className="flex items-center gap-4">
                            {/* Surah Number Circle */}
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 font-bold text-emerald-400 ring-1 ring-emerald-500/20 transition-all group-hover:bg-emerald-500/20 group-hover:text-emerald-300">
                                {chapter.id}
                            </div>

                            <div className="flex flex-col">
                                <span className="font-bold text-white group-hover:text-emerald-100">
                                    {chapter.name_simple}
                                </span>
                                <span className="text-xs text-emerald-400/80">
                                    {chapter.translated_name.name}
                                </span>
                            </div>
                        </div>

                        <div className="text-right">
                            <span className="font-amiri text-xl text-white/90">
                                {chapter.name_arabic}
                            </span>
                            <p className="mt-1 text-[10px] text-white/40">
                                {chapter.verses_count} Ayat • {chapter.revelation_place === "makkah" ? "Mekah" : "Madinah"}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
