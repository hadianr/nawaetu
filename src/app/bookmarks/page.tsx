
"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Bookmark as BookmarkIcon, Trash2, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/hooks/useBookmarks";
import { removeBookmark } from "@/lib/bookmark-storage";
import { useState, useEffect } from "react";
import { useLocale } from "@/context/LocaleContext";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

const storage = getStorageService();

export default function BookmarksPage() {
    const { bookmarks, refresh } = useBookmarks();
    const { t } = useLocale();
    const [mounted, setMounted] = useState(false);

    const [lastRead, setLastRead] = useState<{ surahId: number; verseId: number } | null>(null);

    useEffect(() => {
        setMounted(true);
        // Check current last read
        const saved = storage.getOptional<any>(STORAGE_KEYS.QURAN_LAST_READ as any);
        if (saved) {
            try {
                setLastRead(typeof saved === 'string' ? JSON.parse(saved) : saved);
            } catch (e) { }
        }
    }, []);

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm(t.bookmarksDeleteConfirm)) {
            removeBookmark(id);
            refresh();
        }
    };

    const handleSetLastRead = (bookmark: any, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const lastReadData = {
            surahId: bookmark.surahId,
            surahName: bookmark.surahName,
            verseId: bookmark.verseId,
            timestamp: Date.now()
        };
        storage.set(STORAGE_KEYS.QURAN_LAST_READ as any, JSON.stringify(lastReadData));
        setLastRead(lastReadData);

        // Show feedback (could be better with toast)
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))] px-4 py-2 rounded-full text-sm font-medium z-50 animate-in fade-in slide-in-from-bottom-2 shadow-lg shadow-[rgb(var(--color-primary))]/20';
        toast.innerText = t.bookmarksMarkedAsLastRead;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    };

    if (!mounted) return null;

    return (
        <div className="flex min-h-screen flex-col items-center bg-[rgb(var(--color-background))] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(var(--color-primary),0.15),rgba(255,255,255,0))] px-4 pt-8 pb-nav text-white font-sans sm:px-6">
            <div className="w-full max-w-2xl space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full text-white/70 hover:bg-white/10 hover:text-white transition-colors">
                        <Link href="/quran">
                            <ChevronLeft className="h-6 w-6" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-[rgb(var(--color-primary-light))]">{t.bookmarksTitle}</h1>
                        <p className="text-sm text-white/60">{t.bookmarksSubtitle}</p>
                    </div>
                </div>

                {/* List */}
                <div className="space-y-6">
                    {bookmarks.length === 0 ? (
                        <div className="text-center py-24 bg-white/5 rounded-[2.5rem] border border-white/5">
                            <div className="bg-[rgb(var(--color-primary))]/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <BookmarkIcon className="w-10 h-10 text-[rgb(var(--color-primary))]" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{t.bookmarksEmptyTitle}</h3>
                            <p className="text-white/40 max-w-xs mx-auto mb-8 leading-relaxed">
                                {t.bookmarksEmptyDesc}
                            </p>
                            <Button asChild className="h-12 px-8 rounded-full bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/90 text-[rgb(var(--color-primary-foreground))] font-semibold shadow-xl shadow-[rgb(var(--color-primary))]/20">
                                <Link href="/quran">{t.bookmarksStartReading}</Link>
                            </Button>
                        </div>
                    ) : (
                        bookmarks.map((bookmark) => {
                            const isCurrentLastRead = lastRead?.surahId === bookmark.surahId && lastRead?.verseId === bookmark.verseId;
                            const bookmarkKey = bookmark.id || `${bookmark.surahId}:${bookmark.verseId}`;

                            return (
                                <Link
                                    href={`/quran/${bookmark.surahId}#${bookmark.surahId}:${bookmark.verseId}`}
                                    key={bookmarkKey}
                                    className={`block group relative overflow-hidden rounded-[2rem] border transition-all duration-300 ${isCurrentLastRead
                                        ? 'bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/50 hover:border-[rgb(var(--color-primary))] shadow-[0_0_20px_rgba(var(--color-primary),0.1)]'
                                        : 'bg-[#0f172a]/40 border-white/5 hover:border-white/10 hover:bg-[#0f172a]/60'
                                        }`}
                                >
                                    {/* Active Indicator Strip */}
                                    {isCurrentLastRead && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[rgb(var(--color-primary))]" />
                                    )}

                                    <div className="p-6 sm:p-7">
                                        <div className="flex justify-between items-start gap-4 mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-10 px-4 rounded-full flex items-center justify-center text-xs font-bold tracking-wide uppercase transition-colors ${isCurrentLastRead
                                                    ? 'bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))]'
                                                    : 'bg-white/5 text-slate-400 border border-white/5'
                                                    }`}>
                                                    QS. {bookmark.surahName} : {bookmark.verseId}
                                                </div>
                                                {isCurrentLastRead && (
                                                    <span className="text-[10px] font-bold text-[rgb(var(--color-primary-light))] uppercase tracking-widest hidden sm:block">
                                                        {t.bookmarksLastReadLabel}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-black/20 px-2 py-1 rounded-lg">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(bookmark.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                            </div>
                                        </div>

                                        <p className="font-amiri text-2xl sm:text-3xl text-white/95 leading-[2.2] text-right dir-rtl mb-6">
                                            {bookmark.verseText}
                                        </p>

                                        {bookmark.note ? (
                                            <div className="relative bg-black/20 rounded-2xl p-4 border border-white/5">
                                                <FileText className="absolute top-4 left-4 w-4 h-4 text-[rgb(var(--color-primary))]/60" />
                                                <p className="text-sm text-slate-300 pl-7 italic leading-relaxed">
                                                    "{bookmark.note}"
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="h-2" />
                                        )}

                                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
                                            <button
                                                onClick={(e) => handleSetLastRead(bookmark, e)}
                                                disabled={isCurrentLastRead}
                                                className={`text-xs font-medium px-4 py-2 rounded-full transition-all ${isCurrentLastRead
                                                    ? 'text-[rgb(var(--color-primary-light))] opacity-50 cursor-default'
                                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                                    }`}
                                            >
                                                {isCurrentLastRead ? t.bookmarksCurrentlyReading : t.bookmarksSetLastRead}
                                            </button>

                                            <button
                                                onClick={(e) => handleDelete(bookmark.id, e)}
                                                className="group/del flex items-center gap-2 px-4 py-2 rounded-full text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span className="text-xs group-hover/del:underline">{t.bookmarksDelete}</span>
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
