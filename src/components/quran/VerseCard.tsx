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

import { Verse } from "./VerseList";
import { AyahMarker } from "./AyahMarker";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Link2, MoreVertical, Play, Pause, Bookmark, Info, Check, EyeOff, Eye, Share2, Lightbulb, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type TafsirContent } from "@/lib/tafsir-api";
import { useLocale } from "@/context/LocaleContext";
import {
    toArabicNumber,
    cleanTranslation,
    cleanIndopakText,
    getVerseFontClass,
    formatFootnotes
} from "@/lib/quran-utils";

interface VerseCardProps {
    verse: Verse;
    verseNum: number;
    isPlayingVerse: boolean;
    isPlaying: boolean;
    isBookmarked: boolean;
    isDaylight: boolean;
    scriptType: 'tajweed' | 'indopak';
    fontSize: 'small' | 'medium' | 'large';
    showTransliteration: boolean;
    showWordByWord: boolean;
    activeTafsirVerse: string | null;
    isLoadingTafsir: boolean;
    tafsirData?: TafsirContent;
    locale: string;
    activeWordIdx?: number;  // Karaoke Mode — active word index for audio sync highlight
    onPlay: (verse: Verse, continuous: boolean) => void;
    onBookmarkToggle: (verse: Verse) => void;
    onShareClick: (verse: Verse) => void;
    onTafsirToggle: (verseKey: string) => void;
    onReadFullTafsir: (verseKey: string, tafsir: TafsirContent) => void;
    prefetchShareDialog: () => void;
}

// In quran-utils, cleanTajweedText wasn't exported.
// Note: We need to export cleanTajweedText from sanitize or rename if needed.
// Wait, cleanTajweedText is imported from sanitize in VerseList.
import { cleanTajweedText as sanitizeTajweedText } from "@/lib/sanitize";
import { useState } from "react";

export default function VerseCard({
    verse,
    verseNum,
    isPlayingVerse,
    isPlaying,
    isBookmarked,
    isDaylight,
    scriptType,
    fontSize,
    showTransliteration,
    showWordByWord,
    activeTafsirVerse,
    isLoadingTafsir,
    tafsirData,
    locale,
    onPlay,
    onBookmarkToggle,
    onShareClick,
    onTafsirToggle,
    onReadFullTafsir,
    prefetchShareDialog,
    activeWordIdx,
}: VerseCardProps) {
    const { t } = useLocale();
    const [isMasked, setIsMasked] = useState(false);

    return (
        <div
            id={`verse-${verseNum}`}
            data-verse-key={verse.verse_key}
            className={cn(
                "group relative py-8 px-4 md:px-6 border-b border-white/5 transition-all duration-500",
                isPlayingVerse
                    ? isDaylight
                        ? "bg-emerald-100/90 border-emerald-200 shadow-sm"
                        : "bg-[rgb(var(--color-primary))]/5 border-[rgb(var(--color-primary))]/20"
                    : "hover:bg-white/[0.02]"
            )}
        >
            {/* Action Bar */}
            <div className="flex items-center justify-between mb-6">
                <AyahMarker number={toArabicNumber(verseNum)} size={fontSize} />
                <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsMasked(!isMasked)}
                                className={cn(
                                    "h-8 w-8 md:h-9 md:w-9 rounded-full transition-colors",
                                    isMasked ? "text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20" : "text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10"
                                )}
                            >
                                {isMasked ? <Eye className="h-4 w-4 md:h-5 md:w-5" /> : <EyeOff className="h-4 w-4 md:h-5 md:w-5" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            {isMasked ? (t.quranHafizModeOn || "Buka Ayat (Mode Hafalan)") : (t.quranHafizModeOff || "Tutup Ayat (Mode Hafalan)")}
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onPlay(verse, false)}
                                className={cn(
                                    "h-8 w-8 rounded-full transition-all duration-300",
                                    isPlayingVerse && isPlaying ? "opacity-0 scale-50 pointer-events-none" : "opacity-100 scale-100",
                                    isPlayingVerse
                                        ? isDaylight
                                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                                            : "bg-[rgb(var(--color-primary))] text-white shadow-lg shadow-[rgb(var(--color-primary))]/20"
                                        : isDaylight
                                            ? "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                                            : "text-slate-400 hover:text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/10"
                                )}
                            >
                                <Play className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            {t.quranPlayVerse || "Putar Ayat"}
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onBookmarkToggle(verse)}
                                className={cn(
                                    "h-8 w-8 rounded-full transition-colors",
                                    isBookmarked
                                        ? isDaylight ? "text-emerald-500" : "text-[rgb(var(--color-primary))]"
                                        : isDaylight ? "text-slate-300 hover:text-emerald-500 hover:bg-emerald-50" : "text-slate-400 hover:text-[rgb(var(--color-primary))]"
                                )}
                            >
                                <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            {isBookmarked ? (t.quranRemoveBookmark || "Hapus Penanda") : (t.quranAddBookmark || "Tandai Ayat")}
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onMouseEnter={prefetchShareDialog}
                                onFocus={prefetchShareDialog}
                                onClick={() => onShareClick(verse)}
                                className="h-8 w-8 rounded-full text-slate-400 hover:text-[rgb(var(--color-primary))]"
                            >
                                <Share2 className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            {t.quranShareVerse || "Bagikan Ayat"}
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onTafsirToggle(verse.verse_key)}
                                className={`h-8 w-8 rounded-full ${activeTafsirVerse === verse.verse_key ? 'text-amber-400' : 'text-slate-400 hover:text-amber-400'}`}
                            >
                                <Lightbulb className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            {activeTafsirVerse === verse.verse_key ? (t.quranCloseTafsir || "Tutup Tafsir") : (t.quranShowTafsir || "Lihat Tafsir")}
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>

            {/* Content */}
            <div
                dir="rtl"
                onClick={() => isMasked && setIsMasked(false)}
                className={cn(
                    "w-full text-right mb-6 transition-all duration-300 relative",
                    getVerseFontClass(scriptType, fontSize),
                    isMasked ? "blur-md opacity-40 hover:opacity-60 cursor-pointer select-none" : "text-slate-200"
                )}
            >
                {showWordByWord && verse.words && verse.words.length > 0 ? (
                    <div className="flex flex-wrap gap-x-4 md:gap-x-6 gap-y-6 md:gap-y-8 justify-start">
                        {verse.words.filter((w: any) => w.char_type_name !== 'end').map((word: any, index: number) => {
                            // Extract raw text and remove waqf (pause) symbols that render as boxes in isolated word fonts
                            // \u06D6-\u06DC = Arabic waqf marks (used in Uthmani)
                            // \u200B-\u200F = Zero-width spaces and formatting characters (often injected by formatting)
                            // \uE000-\uF8FF = Private Use Area (PUA) where Indopak API encodes proprietary waqf font icons
                            const rawText = scriptType === 'indopak'
                                ? (word.text_indopak || word.text_uthmani || word.text || '')
                                : (word.text_uthmani || word.text || '');
                            const cleanedText = rawText.replace(/[\u06D6-\u06DC\u200B-\u200F\uE000-\uF8FF]/g, '').trim();

                            return (
                                <div key={`word-${index}`} className="flex flex-col items-center justify-start group min-w-[2rem]">
                                    {/* Arabic word — highlighted when this is the active karaoke word */}
                                    <span className={cn(
                                        "mb-2 cursor-pointer transition-colors duration-100",
                                        isPlayingVerse && word.position === activeWordIdx
                                            ? isDaylight
                                                ? "text-emerald-600 font-bold scale-105"
                                                : "text-[rgb(var(--color-primary))] font-bold"
                                            : "hover:text-[rgb(var(--color-primary))]"
                                    )}>
                                        {cleanedText}
                                    </span>
                                    <div className="flex flex-col items-center font-sans tracking-normal">
                                        {showTransliteration && word.transliteration?.text && (
                                            <span className="text-[10px] md:text-xs text-[rgb(var(--color-primary-light))] text-center leading-tight mb-1 opacity-80 group-hover:opacity-100">
                                                {word.transliteration.text}
                                            </span>
                                        )}
                                        {word.translation?.text && (
                                            <span className="text-[9px] md:text-[10px] text-slate-400 text-center leading-tight max-w-[90px] group-hover:text-slate-200 line-clamp-2" title={word.translation.text.replace(/<[^>]*>?/gm, '')}>
                                                {word.translation.text.replace(/<[^>]*>?/gm, '')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : scriptType === 'tajweed' && verse.text_uthmani_tajweed ? (
                    <span dangerouslySetInnerHTML={{ __html: sanitizeTajweedText(verse.text_uthmani_tajweed) }} />
                ) : (
                    <span>{verse.text_indopak ? cleanIndopakText(verse.text_indopak) : verse.text_uthmani}</span>
                )}
            </div>
            <div className="space-y-3">
                {(!showWordByWord || !verse.words || verse.words.length === 0) && (
                    <>
                        {showTransliteration && verse.transliteration && (
                            <p
                                onClick={() => isMasked && setIsMasked(false)}
                                className={cn(
                                    "text-[rgb(var(--color-primary-light))] text-sm md:text-base font-medium leading-relaxed transition-all duration-300",
                                    isMasked && "blur-sm opacity-40 hover:opacity-60 cursor-pointer select-none"
                                )}
                            >
                                {verse.transliteration}
                            </p>
                        )}
                        <div
                            onClick={() => isMasked && setIsMasked(false)}
                            className={cn(
                                "transition-all duration-300",
                                isMasked && "blur-sm opacity-40 hover:opacity-60 cursor-pointer select-none"
                            )}
                        >
                            <p
                                className="text-sm md:text-base leading-relaxed text-slate-400"
                                dangerouslySetInnerHTML={{ __html: cleanTranslation(verse.translations[0]?.text || "") }}
                            />
                        </div>
                    </>
                )}

                <div className={activeTafsirVerse === verse.verse_key ? 'mt-6 p-5 rounded-2xl bg-gradient-to-br from-[rgb(var(--color-primary))]/5 to-slate-900 border border-[rgb(var(--color-primary))]/20 animate-in slide-in-from-top-2' : 'hidden'}>
                    <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="h-4 w-4 text-[rgb(var(--color-primary))]" />
                        <h3 className="text-sm font-bold text-white">{t.quranBriefTafsir || "Brief Explanation"}</h3>
                    </div>

                    <div className={`flex items-center gap-2 text-slate-500 py-4 ${isLoadingTafsir ? '' : 'hidden'}`}>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-xs">{t.quranLoading || "Loading..."}</span>
                    </div>

                    <div className={isLoadingTafsir ? 'hidden' : 'space-y-3'}>
                        <div
                            className="prose prose-invert prose-sm text-slate-300"
                            dangerouslySetInnerHTML={{ __html: formatFootnotes(tafsirData?.short || (t.quranTafsirNotAvailable || "Tafsir not available.")) }}
                        />
                        <button
                            onClick={() => {
                                if (tafsirData) {
                                    onReadFullTafsir(verse.verse_key, tafsirData);
                                }
                            }}
                            className={`text-xs font-semibold mt-2 transition-colors ${tafsirData?.long && tafsirData?.long !== tafsirData?.short ? 'text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary))]/80' : 'hidden'}`}
                        >
                            {t.quranReadFullTafsir || "Read Full Explanation →"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
