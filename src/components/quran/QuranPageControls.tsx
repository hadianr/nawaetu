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
"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, CornerDownRight, Hash } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Chapter } from "./SurahList";
import { surahNames } from "@/lib/surahData";

interface PageJumpDialogProps {
    chapter: Chapter;
    isSearchOpen: boolean;
    setIsSearchOpen: (open: boolean) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    handleSearchSubmit: (e: React.FormEvent) => void;
    t: any;
}

export function PageJumpDialog({
    chapter,
    isSearchOpen,
    setIsSearchOpen,
    searchQuery,
    setSearchQuery,
    handleSearchSubmit,
    t
}: PageJumpDialogProps) {
    return (
        <Tooltip>
            <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <button className="h-9 w-9 p-0 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-300 transition-colors shrink-0" aria-label={t.quranJumpToVerse}>
                            <CornerDownRight className="h-5 w-5" />
                        </button>
                    </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">{t.quranJumpToVerse}</TooltipContent>
                <DialogContent className="sm:max-w-xs bg-[#0F172A] backdrop-blur-xl border-white/10 p-6 gap-6 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-center text-xl font-bold">{t.quranJumpToVerseTitle}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4">
                        <div className="relative flex items-center justify-center">
                            <div className="absolute left-4 text-slate-500">
                                <Hash className="h-5 w-5" />
                            </div>
                            <Input
                                autoFocus
                                type="tel"
                                placeholder="1"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-16 text-center text-3xl font-bold tracking-widest bg-white/5 border-white/10 focus-visible:ring-[rgb(var(--color-primary))] focus-visible:border-[rgb(var(--color-primary))] rounded-2xl placeholder:opacity-20"
                            />
                        </div>
                        <p className="text-xs text-center text-slate-400 font-medium uppercase tracking-wider">
                            {chapter.name_simple} • 1 - {chapter.verses_count || 286}
                        </p>
                        <Button type="submit" className="w-full h-12 bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-dark))] text-white font-bold rounded-xl shadow-lg shadow-[rgb(var(--color-primary))]/20 transition-all active:scale-95">
                            {t.quranGoToVerse}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </Tooltip>
    );
}

interface SurahNavigationCardsProps {
    chapter: Chapter;
    t: any;
}

export function SurahNavigationCards({ chapter, t }: SurahNavigationCardsProps) {
    return (
        <div className="grid grid-cols-2 gap-2 mt-2 pt-4 border-t border-white/5 px-1 md:px-0">
            {chapter.id > 1 ? (
                <Link href={`/quran/${chapter.id - 1}`} className="group flex flex-col p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[rgb(var(--color-primary))]/30 transition-all duration-300">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 group-hover:text-[rgb(var(--color-primary))]">{t.quranPrevious}</span>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0 pr-1">
                            <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-[rgb(var(--color-primary))]/20 transition-colors">
                                <ArrowLeft className="h-3 w-3 text-slate-400 group-hover:text-[rgb(var(--color-primary))]" />
                            </div>
                            <span className="text-xs font-bold text-white group-hover:text-[rgb(var(--color-primary))] transition-colors truncate">{surahNames[chapter.id - 1]}</span>
                        </div>
                        <span className="text-lg font-amiri opacity-20 group-hover:opacity-100 transition-opacity text-white flex-shrink-0">
                            {chapter.id - 1}
                        </span>
                    </div>
                </Link>
            ) : <div />}

            {chapter.id < 114 ? (
                <Link href={`/quran/${chapter.id + 1}`} className="group flex flex-col p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[rgb(var(--color-primary))]/30 transition-all duration-300 text-right">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 group-hover:text-[rgb(var(--color-primary))]">{t.quranNext}</span>
                    <div className="flex items-center justify-between flex-row-reverse">
                        <div className="flex items-center gap-1.5 flex-row-reverse min-w-0 pl-1">
                            <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-[rgb(var(--color-primary))]/20 transition-colors">
                                <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-[rgb(var(--color-primary))]" />
                            </div>
                            <span className="text-xs font-bold text-white group-hover:text-[rgb(var(--color-primary))] transition-colors truncate">{surahNames[chapter.id + 1]}</span>
                        </div>
                        <span className="text-lg font-amiri opacity-20 group-hover:opacity-100 transition-opacity text-white flex-shrink-0">
                            {chapter.id + 1}
                        </span>
                    </div>
                </Link>
            ) : <div />}
        </div>
    );
}
