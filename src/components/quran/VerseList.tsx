"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Play, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, CornerDownRight, Hash, Lightbulb } from 'lucide-react';
import dynamic from "next/dynamic";

// Types & Utils
import { Verse, Chapter } from '@/types/quran';
import { useLocale } from "@/context/LocaleContext";
import { surahNames } from "@/lib/surahData";
import { useBookmarks } from "@/hooks/useBookmarks";
import { type Bookmark as BookmarkType } from "@/lib/bookmark-storage";
import { syncQueue } from "@/lib/sync-queue";
import { formatFootnotes } from "./utils";

// Components
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import TajweedLegend from "./TajweedLegend";

// New Hooks & Components
import { useQuranAudio } from "./hooks/useQuranAudio";
import { useQuranSettings } from "./hooks/useQuranSettings";
import { useTafsir } from "./hooks/useTafsir";
import SettingsDialog from "./SettingsDialog";
import VerseItem from "./VerseItem";
import MushafView from "./MushafView";
import AudioPlayer from "./AudioPlayer";

const VerseShareDialog = dynamic(() => import("./VerseShareDialog"), { ssr: false });
const BookmarkEditDialog = dynamic(() => import("./BookmarkEditDialog"), { ssr: false });

interface VerseListProps {
    chapter: Chapter;
    verses: Verse[];
    audioUrl?: string; // Full Surah Audio
    currentPage: number;
    totalPages: number;
    currentReciterId?: number;
    currentLocale?: string;
}

export default function VerseList({ chapter, verses, currentPage, totalPages, currentReciterId, currentLocale = "id" }: VerseListProps) {
    const { t } = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const autoplay = searchParams.get('autoplay') === 'true';

    // --- Hooks ---
    const settings = useQuranSettings(currentLocale);

    // Scroll logic (UI)
    const scrollToVerse = useCallback((verseNum: number) => {
        const element = document.getElementById(`verse-${verseNum}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('bg-[rgb(var(--color-primary))]/20');
            setTimeout(() => {
                element.classList.remove('bg-[rgb(var(--color-primary))]/20');
            }, 2000);
        }
    }, []);

    const audio = useQuranAudio({ verses, autoplay, pathname, scrollToVerse });
    const tafsir = useTafsir(settings.locale);
    const { isBookmarked: checkIsBookmarked, getBookmark } = useBookmarks();

    // --- Local UI State ---
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [activeVerseForShare, setActiveVerseForShare] = useState<Verse | null>(null);
    const [editingBookmarkKey, setEditingBookmarkKey] = useState<string | null>(null); // Use verseKey (e.g., "1:1")
    const [editingBookmarkDraft, setEditingBookmarkDraft] = useState<BookmarkType | null>(null);

    // --- Handlers ---
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const verseNum = parseInt(searchQuery);
        // Validate against total verses in chapter, not just current page
        if (!isNaN(verseNum) && verseNum > 0 && verseNum <= (chapter.verses_count || 286)) {
            const targetPage = Math.ceil(verseNum / settings.perPage);

            if (targetPage === currentPage) {
                scrollToVerse(verseNum);
            } else {
                router.push(`/quran/${chapter.id}?page=${targetPage}#verse-${verseNum}`);
                setIsSearchOpen(false);
            }
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            router.push(`/quran/${chapter.id}?page=${newPage}`);
        }
    };

    const handleBookmarkClick = (verse: Verse) => {
        const isSaved = checkIsBookmarked(verse.verse_key);
        if (isSaved) {
            setEditingBookmarkDraft(null);
            setEditingBookmarkKey(verse.verse_key);
            return;
        }

        const verseNum = parseInt(verse.verse_key.split(':')[1]);
        const draftBookmark: BookmarkType = {
            id: `${chapter.id}:${verseNum}`,
            surahId: chapter.id,
            surahName: chapter.name_simple,
            verseId: verseNum,
            verseText: verse.text_uthmani,
            note: "",
            tags: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        setEditingBookmarkDraft(draftBookmark);
        setEditingBookmarkKey(verse.verse_key);
    };

    // --- Effects ---
    // Prefetch next/prev surah
    useEffect(() => {
        if (!chapter?.id) return;
        if (chapter.id > 1) {
            router.prefetch(`/quran/${chapter.id - 1}`);
        }
        if (chapter.id < 114) {
            router.prefetch(`/quran/${chapter.id + 1}`);
        }
    }, [chapter?.id, router]);

    // Handle hash scrolling on mount/update
    useEffect(() => {
        if (typeof window !== 'undefined' && window.location.hash) {
            const hash = window.location.hash;
            const verseId = hash.substring(1); // remove #
            // Small delay to ensure render
            setTimeout(() => {
                const element = document.getElementById(verseId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.classList.add('bg-[rgb(var(--color-primary))]/20');
                    setTimeout(() => {
                        element.classList.remove('bg-[rgb(var(--color-primary))]/20');
                    }, 2000);
                }
            }, 500);
        }
    }, [verses, currentPage]);

    // --- Computations ---
    const displayedVerses = useMemo(() => {
        const result = !searchQuery || !isNaN(parseInt(searchQuery)) ? verses : verses.filter(v =>
            v.text_uthmani.includes(searchQuery) ||
            v.translations[0]?.text.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return result;
    }, [verses, searchQuery]);

    const activeBookmark = editingBookmarkDraft ?? (editingBookmarkKey ? getBookmark(editingBookmarkKey) : null);
    const currentPlayingIndex = audio.playingVerseKey ? verses.findIndex(v => v.verse_key === audio.playingVerseKey) : -1;

    // Safety check: if no verses, show error
    if (!verses || verses.length === 0) {
        return (
            <div className="relative min-h-screen pb-16 w-full max-w-4xl mx-auto flex items-center justify-center">
                <div className="text-center space-y-4 px-4">
                    <h2 className="text-lg font-bold text-red-500">⚠️ No Verses Found</h2>
                    <p className="text-slate-400 text-sm">Verses data is empty. This might be a loading error.</p>
                    <Link href="/quran" className="inline-block px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors">
                        Kembali ke Daftar Surah
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen pb-16 w-full max-w-4xl mx-auto">

            {/* --- Sticky Header --- */}
            <div className="sticky top-0 z-30 -mx-4 md:mx-0">
                <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/5" />
                <div className="relative px-4 h-16 flex items-center justify-between gap-4">
                    {/* Left: Back & Title */}
                    <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                        <Link href="/quran" className="flex items-center justify-center h-9 w-9 -ml-2 rounded-full hover:bg-white/10 transition-colors text-slate-300 hover:text-white shrink-0 p-0">
                            <ChevronLeft className="h-6 w-6" />
                        </Link>
                        <div className="flex flex-col min-w-0">
                            <h1 className="text-base md:text-lg font-bold text-white truncate leading-tight">
                                {chapter.name_simple}
                            </h1>
                            <p className="text-[9px] md:text-[10px] text-[rgb(var(--color-primary-light))] font-medium truncate uppercase tracking-wider">
                                {chapter.revelation_place === "Makkah" ? t.quranMakkah : t.quranMadinah} • {chapter.verses_count} {t.quranVerseCount}
                            </p>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Play Surah Button */}
                        {!audio.playingVerseKey && (
                            <button
                                onClick={audio.handleSurahPlay}
                                className="flex items-center justify-center gap-1.5 h-9 w-9 md:w-auto md:px-4 rounded-full bg-[rgb(var(--color-primary))]/10 hover:bg-[rgb(var(--color-primary))]/20 text-[rgb(var(--color-primary))] transition-colors border border-[rgb(var(--color-primary))]/20 shrink-0 p-0"
                            >
                                <Play className="h-3.5 w-3.5 fill-current flex-shrink-0" />
                                <span className="hidden md:inline text-xs font-bold leading-none">{t.quranPlaySurah}</span>
                            </button>
                        )}

                        {/* Jump to Verse Button */}
                        <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                            <DialogTrigger asChild>
                                <button className="h-9 w-9 p-0 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-300 transition-colors shrink-0" aria-label={t.quranJumpToVerse}>
                                    <CornerDownRight className="h-5 w-5" />
                                </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-xs bg-[#0f172a]/95 backdrop-blur-xl border-white/10 text-white p-6 gap-6 shadow-2xl">
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
                                            className="h-16 text-center text-3xl font-bold tracking-widest bg-white/5 border-white/10 focus-visible:ring-[rgb(var(--color-primary))] focus-visible:border-[rgb(var(--color-primary))] rounded-2xl placeholder:text-slate-700"
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

                        {/* Settings Button */}
                        {!isSearchOpen && (
                            <SettingsDialog
                                t={t}
                                fontSize={settings.fontSize}
                                setFontSize={settings.setFontSize}
                                showTransliteration={settings.showTransliteration}
                                setShowTransliteration={settings.setShowTransliteration}
                                scriptType={settings.scriptType}
                                setScriptType={settings.setScriptType}
                                viewMode={settings.viewMode}
                                setViewMode={settings.setViewMode}
                                perPage={settings.perPage}
                                handlePerPageChange={settings.handlePerPageChange}
                                currentReciterId={currentReciterId}
                                handleReciterChange={settings.handleReciterChange}
                                isPending={settings.isPending}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* --- Main Content --- */}
            {settings.viewMode === 'mushaf' ? (
                <MushafView
                    verses={verses}
                    scriptType={settings.scriptType}
                    fontSize={settings.fontSize}
                    playingVerseKey={audio.playingVerseKey}
                    onPlay={audio.handleVersePlay}
                    totalPages={totalPages}
                    currentPage={currentPage}
                    chapter={chapter}
                    handlePageChange={handlePageChange}
                    surahNames={surahNames}
                    t={t}
                />
            ) : (
                <div className="space-y-4 px-0 md:px-0">
                    <div key="tajweed-legend" className={`px-4 md:px-0 ${settings.scriptType === 'tajweed' ? '' : 'hidden'}`}>
                        <TajweedLegend />
                    </div>
                    {displayedVerses.map((verse) => (
                        <VerseItem
                            key={`verse-${verse.verse_key}`}
                            verse={verse}
                            settings={{
                                fontSize: settings.fontSize,
                                scriptType: settings.scriptType,
                                showTransliteration: settings.showTransliteration,
                                locale: settings.locale,
                            }}
                            playback={{
                                isPlayingVerse: audio.playingVerseKey === verse.verse_key,
                                isPlaying: audio.isPlaying,
                                onPlay: audio.handleVersePlay,
                            }}
                            bookmark={{
                                isBookmarked: checkIsBookmarked(verse.verse_key),
                                onBookmark: handleBookmarkClick,
                            }}
                            share={{
                                onShare: setActiveVerseForShare,
                            }}
                            tafsir={{
                                activeTafsirVerse: tafsir.activeTafsirVerse,
                                loadingTafsir: tafsir.loadingTafsir,
                                tafsirCache: tafsir.tafsirCache,
                                toggleTafsir: tafsir.toggleTafsir,
                                openModal: (key, tafsirData) => {
                                    tafsir.setTafsirModalContent({ verseKey: key, tafsir: tafsirData });
                                    tafsir.setTafsirModalOpen(true);
                                },
                            }}
                        />
                    ))}
                    {/* Pagination Controls (List Mode) */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between py-6 px-4 mt-4 border-t border-white/5">
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

                    {/* Surah Navigation Cards (List Mode - Compact) */}
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
            )}


            {/* --- Navigation Footer & Player --- */}
            <AudioPlayer
                playingVerseKey={audio.playingVerseKey}
                isPlaying={audio.isPlaying}
                loopMode={audio.loopMode}
                setLoopMode={audio.setLoopMode}
                handlePrevVerse={audio.handlePrevVerse}
                handleNextVerse={audio.handleNextVerse}
                handleStop={audio.handleStop}
                handlePause={audio.handlePause}
                handleResume={audio.handleResume}
                isFirst={currentPlayingIndex <= 0}
                isLast={currentPlayingIndex >= verses.length - 1}
            />

            {/* Hidden Audio Element */}
            <audio ref={audio.audioRef} onEnded={audio.handleAudioEnded} className="hidden" />


            {/* Dialogs */}
            <VerseShareDialog
                open={!!activeVerseForShare}
                onOpenChange={(open) => !open && setActiveVerseForShare(null)}
                verse={activeVerseForShare}
                surahName={chapter.name_simple}
                surahNumber={chapter.id}
            />

            <BookmarkEditDialog
                open={!!editingBookmarkKey}
                isDraft={!!editingBookmarkDraft}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditingBookmarkKey(null);
                        setEditingBookmarkDraft(null);
                    }
                }}
                bookmark={activeBookmark}
                onSave={(bookmark) => {
                    const action = editingBookmarkDraft ? 'create' : 'update';
                    setEditingBookmarkKey(null);
                    setEditingBookmarkDraft(null);
                    if (!session?.user?.id || !bookmark) return;

                    try {
                        syncQueue.addToQueue('bookmark', action, {
                            surahId: bookmark.surahId,
                            surahName: bookmark.surahName,
                            verseId: bookmark.verseId,
                            verseText: bookmark.verseText,
                            note: bookmark.note,
                            tags: bookmark.tags,
                        });
                    } catch {
                        // Ignore error
                    }
                }}
                onDelete={(bookmark) => {
                    if (!session?.user?.id || !bookmark || editingBookmarkDraft) return;

                    try {
                        syncQueue.addToQueue('bookmark', 'delete', {
                            surahId: bookmark.surahId,
                            verseId: bookmark.verseId,
                        });
                    } catch {
                        // Ignore error
                    }
                }}
            />

            {/* Tafsir Modal */}
            <Dialog open={tafsir.tafsirModalOpen} onOpenChange={tafsir.setTafsirModalOpen}>
                <DialogContent className="w-[98vw] max-w-lg sm:max-w-xl max-h-[80vh] sm:max-h-[85vh] rounded-2xl sm:rounded-3xl border border-[rgb(var(--color-primary))]/20 bg-gradient-to-br from-slate-900/50 to-slate-950/40 backdrop-blur-3xl shadow-2xl shadow-black/60 p-0 overflow-hidden">
                    {/* Hidden DialogTitle for accessibility */}
                    <DialogTitle className="sr-only">
                        {settings.locale === "en" ? "Tafsir Full Explanation" : "Penjelasan Lengkap Tafsir"}
                    </DialogTitle>

                    {/* Header */}
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800/50 border-b border-[rgb(var(--color-primary))]/20 px-4 sm:px-6 py-4 sm:py-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[rgb(var(--color-primary))]/40 to-[rgb(var(--color-primary))]/15 border border-[rgb(var(--color-primary))]/50 shadow-lg shadow-[rgb(var(--color-primary))]/20">
                                <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6 text-[rgb(var(--color-primary))]" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                                    {settings.locale === "en" ? "Tafsir" : "Tafsir"}
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                                    {settings.locale === "en" ? "Full Explanation" : "Penjelasan Lengkap"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <ScrollArea className="max-h-[calc(80vh-100px)] sm:max-h-[calc(85vh-120px)]">
                        {tafsir.tafsirModalContent && (
                            <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 text-slate-200">
                                <div
                                    className="text-sm sm:text-base [&>p]:mb-4 sm:[&>p]:mb-5 [&>p]:leading-relaxed sm:[&>p]:leading-loose [&>p]:text-slate-300 [&>p:first-child]:text-base sm:[&>p:first-child]:text-lg [&>p:first-child]:font-medium [&>p:first-child]:text-white/95 [&>h3]:text-base sm:[&>h3]:text-lg [&>h3]:font-bold [&>h3]:text-white [&>h3]:mt-5 sm:[&>h3]:mt-6 [&>h3]:mb-2 sm:[&>h3]:mb-3 [&>ul]:my-3 sm:[&>ul]:my-4 [&>ul]:ml-1 sm:[&>ul]:ml-2 [&>ul]:space-y-2 sm:[&>ul]:space-y-3 [&>ul]:pl-1 sm:[&>ul]:pl-2 [&>ol]:my-3 sm:[&>ol]:my-4 [&>ol]:ml-1 sm:[&>ol]:ml-2 [&>ol]:space-y-2 sm:[&>ol]:space-y-3 [&>ol]:pl-1 sm:[&>ol]:pl-2 [&>ol]:list-decimal [&>ol]:list-outside [&>ul]:list-disc [&>ul]:list-outside [&>li]:leading-relaxed sm:[&>li]:leading-loose [&>li]:pl-2 sm:[&>li]:pl-3 [&>li]:py-1 sm:[&>li]:py-2 [&>li]:px-2 sm:[&>li]:px-3 [&>li]:rounded-md [&>li]:bg-white/4 [&>li]:border [&>li]:border-white/10 [&>li>strong]:text-[rgb(var(--color-primary))]/95 [&>li>strong]:font-semibold [&>ol>li]:marker:text-[rgb(var(--color-primary))] [&>ol>li]:marker:font-bold [&>ul>li]:marker:text-[rgb(var(--color-primary))] [&_sup]:text-[rgb(var(--color-primary))]/85 [&_sup]:font-semibold [&>ol>li>ol]:my-2 sm:[&>ol>li>ol]:my-3 [&>ol>li>ol]:ml-2 sm:[&>ol>li>ol]:ml-3 [&>ol>li>ol]:space-y-1 sm:[&>ol>li>ol]:space-y-2 [&>ol>li>ol]:pl-0 [&>ol>li>ol]:list-lower-alpha [&>ol>li>ol]:list-outside [&>ol>li>ol>li]:bg-white/3 [&>ol>li>ol>li]:border-white/5 [&>ol>li>ol>li]:py-1 sm:[&>ol>li>ol>li]:py-1.5 [&>ol>li>ol>li]:px-2 sm:[&>ol>li>ol>li]:px-2.5 [&>ol>li>ol>li]:pl-1.5 sm:[&>ol>li>ol>li]:pl-2 [&>ol>li>ol>li]:rounded-sm [&>ol>li>ol>li]:marker:text-white/50 [&>ol>li>ol>li]:marker:font-semibold"
                                    dangerouslySetInnerHTML={{ __html: formatFootnotes(tafsir.tafsirModalContent.tafsir.long) }}
                                />
                            </div>
                        )}
                    </ScrollArea>
                </DialogContent>
            </Dialog>        </div>
    );
}
