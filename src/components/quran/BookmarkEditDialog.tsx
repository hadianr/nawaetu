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

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bookmark, saveBookmark, removeBookmark } from "@/lib/bookmark-storage";
import { Trash2, Bookmark as BookmarkIcon } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

interface BookmarkEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    bookmark: Bookmark | null;
    isDraft?: boolean;
    onSave?: (bookmark: Bookmark) => void;
    onDelete?: (bookmark: Bookmark) => void;
}

export default function BookmarkEditDialog({
    open,
    onOpenChange,
    bookmark,
    isDraft = false,
    onSave,
    onDelete
}: BookmarkEditDialogProps) {
    const { t } = useLocale();
    const { currentTheme } = useTheme();
    const isDaylight = currentTheme === "daylight";
    const [note, setNote] = useState("");
    const [isLastRead, setIsLastRead] = useState(false);

    useEffect(() => {
        if (open && bookmark) {
            setNote(bookmark.note || "");

            // Check if this is the last read verse
            const storage = getStorageService();
            const lastRead = storage.getOptional(STORAGE_KEYS.QURAN_LAST_READ) as string | null;
            if (lastRead) {
                try {
                    const parsed = JSON.parse(lastRead);
                    if (parsed.surahId === bookmark.surahId && parsed.verseId === bookmark.verseId) {
                        setIsLastRead(true);
                    }
                } catch (e) { }
            }
        } else if (!open) {
            setNote("");
            setIsLastRead(false);
        }
    }, [open, bookmark]);

    const handleSave = () => {
        if (!bookmark) return;

        saveBookmark({
            surahId: bookmark.surahId,
            surahName: bookmark.surahName,
            verseId: bookmark.verseId,
            verseText: bookmark.verseText,
            note: note
        });

        // Handle Last Read
        if (isLastRead) {
            const storage = getStorageService();
            const lastReadData = {
                surahId: bookmark.surahId,
                surahName: bookmark.surahName,
                verseId: bookmark.verseId,
                timestamp: Date.now()
            };
            storage.set(STORAGE_KEYS.QURAN_LAST_READ as any, lastReadData);
        }

        onOpenChange(false);
        onSave?.({
            ...bookmark,
            note,
            updatedAt: Date.now()
        });
    };

    const handleDelete = () => {
        if (!bookmark || isDraft) return;
        removeBookmark(bookmark.id);
        onOpenChange(false);
        onDelete?.(bookmark);
    };

    if (!bookmark) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn(
                "max-w-sm w-[90%] rounded-[2rem] border overflow-hidden shadow-2xl [&>button]:z-50 p-0",
                isDaylight
                    ? "bg-white border-slate-200 text-slate-900"
                    : "bg-[#0F172A] border-white/5 text-white"
            )}>
                {/* Decorative Header Background */}
                <div className={cn(
                    "absolute top-0 left-0 w-full h-32 pointer-events-none",
                    isDaylight
                        ? "bg-gradient-to-b from-emerald-500/10 to-transparent"
                        : "bg-gradient-to-b from-[rgb(var(--color-primary))]/20 to-transparent"
                )} />

                <DialogHeader className="px-6 pt-6 pb-2 relative z-10 flex flex-row items-center justify-between">
                    <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                        <BookmarkIcon className={cn(
                            "w-5 h-5",
                            isDaylight ? "text-emerald-600" : "text-[rgb(var(--color-primary-light))]"
                        )} />
                        {t.bookmarksEditTitle}
                    </DialogTitle>
                </DialogHeader>

                <div className="px-6 space-y-6 py-2 relative z-10">
                    {/* Verse Preview - Clean & Spacious */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="h-1 w-1 rounded-full bg-[rgb(var(--color-primary))]" />
                            <span className="text-xs font-medium tracking-widest text-[rgb(var(--color-primary-light))] uppercase">
                                QS. {bookmark.surahName}: {bookmark.verseId}
                            </span>
                        </div>
                        <p className="text-2xl font-amiri text-right leading-[2.2] dir-rtl">
                            {bookmark.verseText}
                        </p>
                    </div>

                    {/* Note Input - Minimalist */}
                    <div className="space-y-2 group">
                        <textarea
                            id="note"
                            placeholder={t.bookmarksNotePlaceholder}
                            className={cn(
                                "flex w-full rounded-2xl border px-4 py-3 text-sm ring-offset-background resize-none min-h-[100px] transition-all",
                                isDaylight
                                    ? "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-emerald-500/30 focus-visible:bg-white"
                                    : "bg-white/[0.03] border-white/10 text-white placeholder:opacity-30 focus-visible:ring-[rgb(var(--color-primary))]/50 focus-visible:bg-white/[0.05]"
                            )}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>

                    {/* Last Read Toggle */}
                    <div
                        onClick={() => setIsLastRead(!isLastRead)}
                        className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                            isLastRead
                                ? isDaylight
                                    ? 'bg-emerald-50 border-emerald-200'
                                    : 'bg-[rgb(var(--color-accent))]/10 border-[rgb(var(--color-accent))]/30'
                                : isDaylight
                                    ? 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                        )}
                    >
                        <div className={cn(
                            "h-5 w-5 rounded-full border flex items-center justify-center transition-colors",
                            isLastRead
                                ? isDaylight
                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                                    : 'bg-[rgb(var(--color-accent))] border-[rgb(var(--color-accent))] text-black'
                                : isDaylight
                                    ? 'border-slate-300 text-transparent'
                                    : 'border-current opacity-30 text-transparent'
                        )}>
                            <BookmarkIcon className="w-3 h-3 fill-current" />
                        </div>
                        <div className="flex-1">
                            <p className={cn(
                                "text-sm font-medium",
                                isLastRead
                                    ? isDaylight ? 'text-emerald-700' : 'text-[rgb(var(--color-accent-light))]'
                                    : isDaylight ? 'text-slate-700' : 'opacity-80'
                            )}>
                                {t.bookmarksMarkAsLastRead}
                            </p>
                            <p className={cn(
                                "text-[10px]",
                                isDaylight ? 'text-slate-400' : 'opacity-40'
                            )}>
                                {t.bookmarksUpdateProgress}
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-6 pb-6 pt-2 flex flex-row items-center justify-between gap-4 mt-2">
                    {!isDraft && (
                        <Button
                            variant="ghost"
                            onClick={handleDelete}
                            className="h-12 px-4 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-colors"
                        >
                            <Trash2 className="w-5 h-5" />
                            <span className="sr-only sm:not-sr-only sm:ml-2">{t.bookmarksDelete}</span>
                        </Button>
                    )}

                    <Button
                        onClick={handleSave}
                        className={cn(
                            "h-12 flex-1 rounded-xl font-semibold shadow-lg transition-all active:scale-[0.98]",
                            isDaylight
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200"
                                : "bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/90 text-[rgb(var(--color-primary-foreground))] shadow-[rgb(var(--color-primary))]/25"
                        )}
                    >
                        {t.bookmarksSave}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
