import { Button } from "@/components/ui/button";
import { Play, Bookmark, Share2, Lightbulb, Loader2 } from 'lucide-react';
import { Verse } from '@/types/quran';
import { toArabicNumber, cleanTranslation, cleanIndopakText, getVerseFontClass, formatFootnotes } from './utils';
import { cleanTajweedText } from "@/lib/sanitize";
import { AyahMarker } from "./AyahMarker";
import { TafsirContent } from "@/lib/tafsir-api";
import { ScriptType, FontSize } from "./hooks/useQuranSettings";

interface VerseItemProps {
    verse: Verse;
    settings: {
        fontSize: FontSize;
        scriptType: ScriptType;
        showTransliteration: boolean;
        locale: string;
    };
    playback: {
        isPlayingVerse: boolean;
        isPlaying: boolean;
        onPlay: (verse: Verse) => void;
    };
    bookmark: {
        isBookmarked: boolean;
        onBookmark: (verse: Verse) => void;
    };
    share: {
        onShare: (verse: Verse) => void;
    };
    tafsir: {
        activeTafsirVerse: string | null;
        loadingTafsir: Set<string>;
        tafsirCache: Map<string, { data: TafsirContent }>;
        toggleTafsir: (key: string) => void;
        openModal: (key: string, tafsir: TafsirContent) => void;
    };
}

export default function VerseItem({
    verse,
    settings,
    playback,
    bookmark,
    share,
    tafsir
}: VerseItemProps) {
    const verseNum = parseInt(verse.verse_key.split(':')[1]);
    const { isPlayingVerse, isPlaying, onPlay } = playback;
    const { isBookmarked, onBookmark } = bookmark;
    const { onShare } = share;
    const { activeTafsirVerse, loadingTafsir, tafsirCache, toggleTafsir, openModal } = tafsir;
    const { fontSize, scriptType, showTransliteration, locale } = settings;

    return (
        <div
            id={`verse-${verseNum}`}
            className={`group relative py-8 px-4 md:px-6 border-b border-white/5 transition-colors duration-500 ${isPlayingVerse ? 'bg-[rgb(var(--color-primary))]/5' : 'hover:bg-white/[0.02]'}`}
        >
            {/* Action Bar */}
            <div className="flex items-center justify-between mb-6">
                <AyahMarker number={toArabicNumber(verseNum)} size={fontSize} />
                <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onPlay(verse)}
                        className={`h-8 w-8 rounded-full ${isPlayingVerse && isPlaying ? 'opacity-0 pointer-events-none' : ''} ${isPlayingVerse ? 'bg-[rgb(var(--color-primary))] text-white' : 'text-slate-400 hover:text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/10'}`}
                    >
                        <Play className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onBookmark(verse)} className={`h-8 w-8 rounded-full ${isBookmarked ? 'text-[rgb(var(--color-primary))]' : 'text-slate-400 hover:text-[rgb(var(--color-primary))]'}`}>
                        <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onShare(verse)}
                        className="h-8 w-8 rounded-full text-slate-400 hover:text-[rgb(var(--color-primary))]"
                    >
                        <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => toggleTafsir(verse.verse_key)} className={`h-8 w-8 rounded-full ${activeTafsirVerse === verse.verse_key ? 'text-amber-400' : 'text-slate-400 hover:text-amber-400'}`}><Lightbulb className="h-4 w-4" /></Button>
                </div>
            </div>

            {/* Content */}
            <div dir="rtl" className={`w-full ${getVerseFontClass(scriptType, fontSize)} text-right mb-6 text-slate-200`}>
                {scriptType === 'tajweed' && verse.text_uthmani_tajweed ? (
                    <span dangerouslySetInnerHTML={{ __html: cleanTajweedText(verse.text_uthmani_tajweed) }} />
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
                    <div className="flex items-center gap-2 mb-3"><Lightbulb className="h-4 w-4 text-[rgb(var(--color-primary))]" /><h3 className="text-sm font-bold text-white">{locale === "en" ? "Brief Explanation" : "Tafsir Ringkas"}</h3></div>
                    <div className={`flex items-center gap-2 text-slate-500 py-4 ${loadingTafsir.has(verse.verse_key) ? '' : 'hidden'}`}>
                        <Loader2 className="h-4 w-4 animate-spin" /><span className="text-xs">{locale === "en" ? "Loading..." : "Memuat..."}</span>
                    </div>
                    <div className={loadingTafsir.has(verse.verse_key) ? 'hidden' : 'space-y-3'}>
                        <div
                            className="prose prose-invert prose-sm text-slate-300"
                            dangerouslySetInnerHTML={{ __html: formatFootnotes(tafsirCache.get(verse.verse_key)?.data.short || (locale === "en" ? "Tafsir not available." : "Tafsir tidak tersedia.")) }}
                        />
                        <button
                            onClick={() => {
                                const tafsir = tafsirCache.get(verse.verse_key)?.data;
                                if (tafsir) {
                                    openModal(verse.verse_key, tafsir);
                                }
                            }}
                            className={`text-xs font-semibold mt-2 transition-colors ${tafsirCache.get(verse.verse_key)?.data.long && tafsirCache.get(verse.verse_key)?.data.long !== tafsirCache.get(verse.verse_key)?.data.short ? 'text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary))]/80' : 'hidden'}`}
                        >
                            {locale === "en" ? "Read Full Explanation →" : "Baca Penjelasan Lengkap →"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
