import { Verse } from "./VerseList";
import { AyahMarker } from "./AyahMarker";
import { Play, Bookmark, Share2, Lightbulb, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type TafsirContent } from "@/lib/tafsir-api";
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
    activeTafsirVerse: string | null;
    isLoadingTafsir: boolean;
    tafsirData?: TafsirContent;
    locale: string;
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
    activeTafsirVerse,
    isLoadingTafsir,
    tafsirData,
    locale,
    onPlay,
    onBookmarkToggle,
    onShareClick,
    onTafsirToggle,
    onReadFullTafsir,
    prefetchShareDialog
}: VerseCardProps) {
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
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onTafsirToggle(verse.verse_key)}
                        className={`h-8 w-8 rounded-full ${activeTafsirVerse === verse.verse_key ? 'text-amber-400' : 'text-slate-400 hover:text-amber-400'}`}
                    >
                        <Lightbulb className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div dir="rtl" className={`w-full ${getVerseFontClass(scriptType, fontSize)} text-right mb-6 text-slate-200`}>
                {scriptType === 'tajweed' && verse.text_uthmani_tajweed ? (
                    <span dangerouslySetInnerHTML={{ __html: sanitizeTajweedText(verse.text_uthmani_tajweed) }} />
                ) : (
                    <span>{verse.text_indopak ? cleanIndopakText(verse.text_indopak) : verse.text_uthmani}</span>
                )}
            </div>
            <div className="space-y-3">
                {showTransliteration && verse.transliteration && (
                    <p className="text-[rgb(var(--color-primary-light))] text-sm md:text-base font-medium leading-relaxed">{verse.transliteration}</p>
                )}
                <p className="text-slate-400 text-sm md:text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: cleanTranslation(verse.translations[0]?.text || "") }} />

                <div className={activeTafsirVerse === verse.verse_key ? 'mt-6 p-5 rounded-2xl bg-gradient-to-br from-[rgb(var(--color-primary))]/5 to-slate-900 border border-[rgb(var(--color-primary))]/20 animate-in slide-in-from-top-2' : 'hidden'}>
                    <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="h-4 w-4 text-[rgb(var(--color-primary))]" />
                        <h3 className="text-sm font-bold text-white">{locale === "en" ? "Brief Explanation" : "Tafsir Ringkas"}</h3>
                    </div>

                    <div className={`flex items-center gap-2 text-slate-500 py-4 ${isLoadingTafsir ? '' : 'hidden'}`}>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-xs">{locale === "en" ? "Loading..." : "Memuat..."}</span>
                    </div>

                    <div className={isLoadingTafsir ? 'hidden' : 'space-y-3'}>
                        <div
                            className="prose prose-invert prose-sm text-slate-300"
                            dangerouslySetInnerHTML={{ __html: formatFootnotes(tafsirData?.short || (locale === "en" ? "Tafsir not available." : "Tafsir tidak tersedia.")) }}
                        />
                        <button
                            onClick={() => {
                                if (tafsirData) {
                                    onReadFullTafsir(verse.verse_key, tafsirData);
                                }
                            }}
                            className={`text-xs font-semibold mt-2 transition-colors ${tafsirData?.long && tafsirData?.long !== tafsirData?.short ? 'text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary))]/80' : 'hidden'}`}
                        >
                            {locale === "en" ? "Read Full Explanation →" : "Baca Penjelasan Lengkap →"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
