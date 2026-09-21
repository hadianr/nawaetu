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
import { ChevronLeft, Bookmark as BookmarkIcon, Trash2, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/hooks/useBookmarks";
import type { Bookmark } from "@/lib/quran/bookmark-storage";
import { removeBookmark } from "@/lib/quran/bookmark-storage";
import { useState, useEffect } from "react";
import { useLocale, type TranslationTree } from "@/context/LocaleContext";
import { cn } from "@/lib/utils";
import { getStorageService } from "@/core/infrastructure/storage";

const getCurrentTimestamp = () => Date.now();
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { toast } from "sonner";
import { trackFeatureUse } from "@/lib/analytics/analytics";

const storage = getStorageService();

export default function BookmarksPage() {
    const { bookmarks, refresh } = useBookmarks();
    const { t } = useLocale();

    useEffect(() => {
        trackFeatureUse("bookmarks_view");
    }, []);
    const [mounted, setMounted] = useState(false);

    const [lastRead, setLastRead] = useState<{ surahId: number; verseId: number } | null>(null);

    useEffect(() => {
        queueMicrotask(() => setMounted(true));
        // Check current last read
        const saved = storage.getOptional<{ surahId: number; verseId: number } | string>(STORAGE_KEYS.QURAN_LAST_READ);
        if (saved) {
            try {
                queueMicrotask(() => setLastRead(typeof saved === 'string' ? JSON.parse(saved) : saved));
            } catch { }
        }
    }, []);

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm(t.bookmarksDeleteConfirm)) {
            removeBookmark(id);
            refresh();
            toast.success((t as TranslationTree).bookmarksDeleted || "Tanda baca dihapus");
        }
    };

    const handleSetLastRead = (bookmark: Pick<Bookmark, "surahId" | "surahName" | "verseId">, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const lastReadData = {
            surahId: bookmark.surahId,
            surahName: bookmark.surahName,
            verseId: bookmark.verseId,
            timestamp: getCurrentTimestamp()
        };
        storage.set(STORAGE_KEYS.QURAN_LAST_READ, lastReadData);
        window.dispatchEvent(new CustomEvent('nawaetu_storage_change', { detail: { key: STORAGE_KEYS.QURAN_LAST_READ } }));
        setLastRead(lastReadData);

        // Show feedback
        toast.success(t.bookmarksMarkedAsLastRead || "Ditandai sebagai Terakhir Baca");
    };

    if (!mounted) return null;

    return (
        <div className={cn(
            "bookmarks-page flex min-h-screen flex-col items-center px-4 pt-8 pb-nav font-sans sm:px-6 transition-colors",
            "bg-[rgb(var(--color-background))] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(var(--color-primary),0.15),rgba(var(--color-background),0))] text-[rgb(var(--color-text))]"
        )}>
            <div className="w-full max-w-none space-y-8 xl:max-w-2xl">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className={cn(
                        "rounded-full transition-colors",
                        "text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-surface-subtle))] hover:text-[rgb(var(--color-text-strong))]"
                    )}>
                        <Link href="/quran">
                            <ChevronLeft className="h-6 w-6" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className={cn(
                            "text-3xl font-bold tracking-tight",
                            "text-[rgb(var(--color-text-strong))]"
                        )}>{t.bookmarksTitle}</h1>
                        <p className="text-sm text-[rgb(var(--color-text-muted))]">{t.bookmarksSubtitle}</p>
                    </div>
                </div>

                {/* List */}
                <div className="space-y-6">
                    {bookmarks.length === 0 ? (
                        <div className={cn(
                            "text-center py-24 rounded-[2.5rem] border transition-all",
                            "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))] shadow-[var(--shadow-card)]"
                        )}>
                            <div className={cn(
                                "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-all",
                                "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))]"
                            )}>
                                <BookmarkIcon className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-[rgb(var(--color-text-strong))]">{t.bookmarksEmptyTitle}</h3>
                            <p className="max-w-xs mx-auto mb-8 leading-relaxed text-[rgb(var(--color-text-muted))]">
                                {t.bookmarksEmptyDesc}
                            </p>
                            <Button asChild className={cn(
                                "h-12 px-8 rounded-full font-semibold shadow-xl transition-all",
                                "bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-strong))] text-[rgb(var(--color-primary-foreground))] shadow-[var(--shadow-card)]"
                            )}>
                                <Link href="/quran">{t.bookmarksStartReading}</Link>
                            </Button>
                        </div>
                    ) : (
                        bookmarks.map((bookmark) => {
                            const isCurrentLastRead = lastRead?.surahId === bookmark.surahId && lastRead?.verseId === bookmark.verseId;
                            const bookmarkKey = bookmark.id || `${bookmark.surahId}:${bookmark.verseId}`;

                            const targetPage = Math.ceil(bookmark.verseId / 20);
                            return (
                                <Link
                                    href={`/quran/${bookmark.surahId}?page=${targetPage}#verse-${bookmark.verseId}`}
                                    key={bookmarkKey}
                                    className={cn(
                                        "block group relative overflow-hidden rounded-[2rem] border transition-all duration-500",
                                        isCurrentLastRead
                                            ? "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/50 hover:border-[rgb(var(--color-primary))] shadow-[var(--shadow-card)]"
                                            : "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-primary))]/40 hover:bg-[rgb(var(--color-primary))]/5 shadow-[var(--shadow-card)]"
                                    )}
                                >
                                    {/* Active Indicator Strip */}
                                    {isCurrentLastRead && (
                                        <div className={cn(
                                            "absolute left-0 top-0 bottom-0 w-1.5 transition-colors",
                                            "bg-[rgb(var(--color-primary))]"
                                        )} />
                                    )}

                                    <div className="p-6 sm:p-7">
                                        <div className="flex justify-between items-start gap-4 mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "h-10 px-4 rounded-full flex items-center justify-center text-xs font-bold tracking-wide transition-all border",
                                                    isCurrentLastRead
                                                        ? "bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))] border-transparent"
                                                        : "bg-[rgb(var(--color-surface-subtle))] text-[rgb(var(--color-text-muted))] border-[rgb(var(--color-border))] group-hover:bg-[rgb(var(--color-surface))]"
                                                )}>
                                                    QS. {bookmark.surahName} : {bookmark.verseId}
                                                </div>
                                                {isCurrentLastRead && (
                                                    <span className="text-[10px] font-bold text-[rgb(var(--color-primary-light))] uppercase tracking-widest hidden sm:block">
                                                        {t.bookmarksLastReadLabel}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1.5 text-[10px] font-medium text-[rgb(var(--color-text-muted))] bg-[rgb(var(--color-surface-subtle))] px-2.5 py-1.5 rounded-lg border border-[rgb(var(--color-border))]">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(bookmark.updatedAt || bookmark.createdAt || getCurrentTimestamp()).toLocaleString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: false
                                                })}
                                            </div>
                                        </div>

                                        <p className={cn(
                                            "font-amiri text-2xl sm:text-3xl leading-[2.2] text-right dir-rtl mb-4 transition-colors",
                                            "text-[rgb(var(--color-text-strong))]"
                                        )}>
                                            {bookmark.verseText}
                                        </p>

                                        {bookmark.translationText && (
                                            <p className={cn(
                                                "text-sm leading-relaxed mb-6 line-clamp-3 transition-colors",
                                                "text-[rgb(var(--color-text-muted))] border-l-2 border-[rgb(var(--color-primary))]/30 pl-4"
                                            )}>
                                                {bookmark.translationText}
                                            </p>
                                        )}

                                        {bookmark.note ? (
                                            <div className={cn(
                                                "relative rounded-2xl p-4 border transition-all",
                                                "bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))]"
                                            )}>
                                                <FileText className={cn(
                                                    "absolute top-4 left-4 w-4 h-4 transition-colors",
                                                    "text-[rgb(var(--color-primary))]/60"
                                                )} />
                                                <p className="text-sm pl-7 italic leading-relaxed text-[rgb(var(--color-text-muted))]">
                                                    &quot;{bookmark.note}&quot;
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="h-2" />
                                        )}

                                        <div className={cn(
                                            "flex items-center justify-between mt-6 pt-6 border-t",
                                            "border-[rgb(var(--color-border))]"
                                        )}>
                                            <button
                                                onClick={(e) => handleSetLastRead(bookmark, e)}
                                                disabled={isCurrentLastRead}
                                                className={cn(
                                                    "text-xs font-bold px-4 py-2 rounded-xl transition-all border",
                                                    isCurrentLastRead
                                                        ? "bg-[rgb(var(--color-success))]/10 border-[rgb(var(--color-success))]/25 text-[rgb(var(--color-success))] cursor-default"
                                                        : "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))] text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-primary))] hover:border-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary-foreground))] shadow-[var(--shadow-card)]"
                                                )}
                                            >
                                                {isCurrentLastRead ? t.bookmarksCurrentlyReading : t.bookmarksSetLastRead}
                                            </button>

                                            <button
                                                onClick={(e) => handleDelete(bookmark.id, e)}
                                                className="group/del flex items-center gap-2 px-4 py-2 rounded-full text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-danger))] hover:bg-[rgb(var(--color-danger))]/10 transition-colors"
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
