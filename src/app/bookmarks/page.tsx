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
import { ChevronLeft, ChevronRight, Bookmark as BookmarkIcon, Trash2, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/hooks/useBookmarks";
import { removeBookmark } from "@/lib/bookmark-storage";
import { useState, useEffect } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { toast } from "sonner";

const storage = getStorageService();

export default function BookmarksPage() {
    const { bookmarks, refresh } = useBookmarks();
    const { t } = useLocale();
    const { currentTheme } = useTheme();
    const isDaylight = currentTheme === "daylight";
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
            toast.success((t as any).bookmarksDeleted || "Tanda baca dihapus");
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
        storage.set(STORAGE_KEYS.QURAN_LAST_READ as any, lastReadData);
        setLastRead(lastReadData);

        // Show feedback
        toast.success(t.bookmarksMarkedAsLastRead || "Ditandai sebagai Terakhir Baca 📖");
    };

    if (!mounted) return null;

    return (
        <div className={cn(
            "flex min-h-screen flex-col items-center px-4 pt-8 pb-nav font-sans sm:px-6 transition-colors",
            isDaylight
                ? "bg-[rgb(var(--color-background))]"
                : "bg-[rgb(var(--color-background))] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(var(--color-primary),0.15),rgba(255,255,255,0))] text-white"
        )}>
            <div className="w-full max-w-2xl space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className={cn(
                        "rounded-full transition-colors",
                        isDaylight ? "text-slate-400 hover:bg-slate-100" : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}>
                        <Link href="/quran">
                            <ChevronLeft className="h-6 w-6" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className={cn(
                            "text-3xl font-bold tracking-tight",
                            isDaylight ? "text-slate-900" : "text-[rgb(var(--color-primary-light))]"
                        )}>{t.bookmarksTitle}</h1>
                        <p className={cn("text-sm", isDaylight ? "text-slate-500" : "text-white/60")}>{t.bookmarksSubtitle}</p>
                    </div>
                </div>

                {/* List */}
                <div className="space-y-6">
                    {bookmarks.length === 0 ? (
                        <div className={cn(
                            "text-center py-24 rounded-[2.5rem] border transition-all",
                            isDaylight ? "bg-white border-slate-100 shadow-sm" : "bg-white/5 border-white/5"
                        )}>
                            <div className={cn(
                                "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-all",
                                isDaylight ? "bg-emerald-50 text-emerald-500" : "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))]"
                            )}>
                                <BookmarkIcon className="w-10 h-10" />
                            </div>
                            <h3 className={cn("text-xl font-bold mb-2", isDaylight ? "text-slate-900" : "text-white")}>{t.bookmarksEmptyTitle}</h3>
                            <p className={cn("max-w-xs mx-auto mb-8 leading-relaxed", isDaylight ? "text-slate-500" : "text-white/40")}>
                                {t.bookmarksEmptyDesc}
                            </p>
                            <Button asChild className={cn(
                                "h-12 px-8 rounded-full font-semibold shadow-xl transition-all",
                                isDaylight
                                    ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200"
                                    : "bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/90 text-[rgb(var(--color-primary-foreground))] shadow-[rgb(var(--color-primary))]/20"
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
                                            ? isDaylight
                                                ? "bg-emerald-50 border-emerald-200 shadow-xl shadow-emerald-500/10 hover:border-emerald-300 hover:bg-emerald-100/50"
                                                : "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/50 hover:border-[rgb(var(--color-primary))] shadow-[0_0_20px_rgba(var(--color-primary),0.1)]"
                                            : isDaylight
                                                ? "bg-white border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 shadow-sm hover:shadow-md transition-shadow"
                                                : "bg-[#0f172a]/40 border-white/5 hover:border-white/10 hover:bg-[#0f172a]/60"
                                    )}
                                >
                                    {/* Active Indicator Strip */}
                                    {isCurrentLastRead && (
                                        <div className={cn(
                                            "absolute left-0 top-0 bottom-0 w-1.5 transition-colors",
                                            isDaylight ? "bg-emerald-500" : "bg-[rgb(var(--color-primary))]"
                                        )} />
                                    )}

                                    <div className="p-6 sm:p-7">
                                        <div className="flex justify-between items-start gap-4 mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "h-10 px-4 rounded-full flex items-center justify-center text-xs font-bold tracking-wide transition-all border",
                                                    isCurrentLastRead
                                                        ? isDaylight
                                                            ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                                                            : "bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))] border-transparent"
                                                        : isDaylight
                                                            ? "bg-slate-50 text-slate-400 border-slate-100 group-hover:bg-white group-hover:border-slate-200"
                                                            : "bg-white/5 text-slate-400 border-white/5"
                                                )}>
                                                    QS. {bookmark.surahName} : {bookmark.verseId}
                                                </div>
                                                {isCurrentLastRead && (
                                                    <span className="text-[10px] font-bold text-[rgb(var(--color-primary-light))] uppercase tracking-widest hidden sm:block">
                                                        {t.bookmarksLastReadLabel}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500 bg-black/20 px-2.5 py-1.5 rounded-lg border border-white/5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(bookmark.updatedAt || bookmark.createdAt || Date.now()).toLocaleString('id-ID', {
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
                                            isDaylight ? "text-slate-900" : "text-white/95"
                                        )}>
                                            {bookmark.verseText}
                                        </p>

                                        {bookmark.translationText && (
                                            <p className={cn(
                                                "text-sm leading-relaxed mb-6 line-clamp-3 transition-colors",
                                                isDaylight
                                                    ? "text-slate-600 border-l-2 border-emerald-200 pl-4"
                                                    : "text-slate-400 border-l-2 border-[rgb(var(--color-primary))]/30 pl-4"
                                            )}>
                                                {bookmark.translationText}
                                            </p>
                                        )}

                                        {bookmark.note ? (
                                            <div className={cn(
                                                "relative rounded-2xl p-4 border transition-all",
                                                isDaylight ? "bg-slate-50 border-slate-100" : "bg-black/20 border-white/5"
                                            )}>
                                                <FileText className={cn(
                                                    "absolute top-4 left-4 w-4 h-4 transition-colors",
                                                    isDaylight ? "text-emerald-500/60" : "text-[rgb(var(--color-primary))]/60"
                                                )} />
                                                <p className={cn("text-sm pl-7 italic leading-relaxed", isDaylight ? "text-slate-600" : "text-slate-300")}>
                                                    "{bookmark.note}"
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="h-2" />
                                        )}

                                        <div className={cn(
                                            "flex items-center justify-between mt-6 pt-6 border-t",
                                            isDaylight ? "border-slate-100" : "border-white/5"
                                        )}>
                                            <button
                                                onClick={(e) => handleSetLastRead(bookmark, e)}
                                                disabled={isCurrentLastRead}
                                                className={cn(
                                                    "text-xs font-bold px-4 py-2 rounded-xl transition-all border",
                                                    isCurrentLastRead
                                                        ? isDaylight
                                                            ? "bg-emerald-50 border-emerald-100 text-emerald-600 cursor-default"
                                                            : "text-[rgb(var(--color-primary-light))] border-transparent opacity-50 cursor-default"
                                                        : isDaylight
                                                            ? "bg-white border-slate-200 text-slate-600 hover:bg-emerald-500 hover:border-emerald-500 hover:text-white shadow-sm"
                                                            : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-[rgb(var(--color-primary))]/20 hover:border-[rgb(var(--color-primary))]/30"
                                                )}
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
