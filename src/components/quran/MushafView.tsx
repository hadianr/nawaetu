import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react';
import { Verse, Chapter } from '@/types/quran';
import { toArabicNumber, cleanIndopakText, cleanTajweedText, getVerseFontClass } from './utils';
import { AyahMarker } from "./AyahMarker";
import TajweedLegend from "./TajweedLegend";
import { ScriptType, FontSize } from "./hooks/useQuranSettings";
import { cn } from "@/lib/utils";

interface MushafViewProps {
    verses: Verse[];
    scriptType: ScriptType;
    fontSize: FontSize;
    playingVerseKey: string | null;
    onPlay: (verse: Verse, continuous?: boolean) => void;
    totalPages: number;
    currentPage: number;
    chapter: Chapter;
    handlePageChange: (page: number) => void;
    surahNames: string[];
    t: Record<string, string>;
}

export default function MushafView({
    verses,
    scriptType,
    fontSize,
    playingVerseKey,
    onPlay,
    totalPages,
    currentPage,
    chapter,
    handlePageChange,
    surahNames,
    t
}: MushafViewProps) {
    return (
        <div className="px-4 py-6 md:px-8">
            <div key="tajweed-legend-mushaf" className={scriptType === 'tajweed' ? '' : 'hidden'}>
                <TajweedLegend />
            </div>
            <div className={`text-right ${getVerseFontClass(scriptType, fontSize)} text-slate-200`} dir="rtl">
                {verses.map((verse) => (
                    <span key={`mushaf-${verse.verse_key}`} className="inline relative" id={`verse-${parseInt(verse.verse_key.split(':')[1])}`}>
                        <span className={cn(
                            "hover:bg-[rgb(var(--color-primary))]/10 transition-colors rounded px-1 cursor-pointer",
                            playingVerseKey === verse.verse_key && "bg-[rgb(var(--color-primary))]/20"
                        )}
                            onClick={() => onPlay(verse, false)}
                        >
                            {scriptType === 'tajweed' && verse.text_uthmani_tajweed ? (
                                <span dangerouslySetInnerHTML={{ __html: cleanTajweedText(verse.text_uthmani_tajweed) }} />
                            ) : (
                                verse.text_indopak ? cleanIndopakText(verse.text_indopak) : verse.text_uthmani
                            )}
                        </span>
                        <AyahMarker number={toArabicNumber(parseInt(verse.verse_key.split(':')[1]))} size={fontSize} />
                    </span>
                ))}
            </div>
            {/* Pagination Controls (Mushaf Mode) */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between py-6 mt-4 border-t border-white/5" dir="ltr">
                    <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 h-8 px-2 md:px-4"
                    >
                        <ChevronLeft className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">{t.quranPrevious}</span>
                    </Button>
                    <span className="text-xs md:text-sm font-medium text-slate-400">
                        <span className="hidden md:inline">{t.quranPage} </span>{currentPage}{t.quranOf}{totalPages}
                    </span>
                    <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 h-8 px-2 md:px-4"
                    >
                        <span className="hidden md:inline">{t.quranNext}</span>
                        <ChevronRight className="h-4 w-4 md:ml-2" />
                    </Button>
                </div>
            )}

            {/* Surah Navigation Cards (Mushaf Mode - Compact) */}
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
        </div>
    );
}
