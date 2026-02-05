
"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bookmark, saveBookmark, removeBookmark } from "@/lib/bookmark-storage";
import { Trash2, Bookmark as BookmarkIcon } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

interface BookmarkEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    bookmark: Bookmark | null;
    onSave?: () => void;
    onDelete?: () => void;
}

export default function BookmarkEditDialog({
    open,
    onOpenChange,
    bookmark,
    onSave,
    onDelete
}: BookmarkEditDialogProps) {
    const { t } = useLocale();
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
            storage.set(STORAGE_KEYS.QURAN_LAST_READ as any, JSON.stringify(lastReadData));
        }

        onOpenChange(false);
        onSave?.();
    };

    const handleDelete = () => {
        if (!bookmark) return;
        removeBookmark(bookmark.id);
        onOpenChange(false);
        onDelete?.();
    };

    if (!bookmark) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm w-[90%] rounded-[2rem] border border-white/5 bg-[#0f172a] p-0 overflow-hidden shadow-2xl [&>button]:z-50">
                {/* Decorative Header Background */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[rgb(var(--color-primary))]/20 to-transparent pointer-events-none" />

                <DialogHeader className="px-6 pt-6 pb-2 relative z-10 flex flex-row items-center justify-between">
                    <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-white">
                        <BookmarkIcon className="w-5 h-5 text-[rgb(var(--color-primary-light))]" />
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
                        <p className="text-2xl font-amiri text-right leading-[2.2] text-white dir-rtl">
                            {bookmark.verseText}
                        </p>
                    </div>

                    {/* Note Input - Minimalist */}
                    <div className="space-y-2 group">
                        <textarea
                            id="note"
                            placeholder={t.bookmarksNotePlaceholder}
                            className="flex w-full rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm ring-offset-background placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgb(var(--color-primary))]/50 focus-visible:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-50 resize-none min-h-[100px] transition-all text-slate-200"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>

                    {/* Last Read Toggle */}
                    <div
                        onClick={() => setIsLastRead(!isLastRead)}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isLastRead
                            ? 'bg-[rgb(var(--color-accent))]/10 border-[rgb(var(--color-accent))]/30'
                            : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                    >
                        <div className={`h-5 w-5 rounded-full border flex items-center justify-center transition-colors ${isLastRead
                            ? 'bg-[rgb(var(--color-accent))] border-[rgb(var(--color-accent))] text-black'
                            : 'border-slate-500 text-transparent'
                            }`}>
                            <BookmarkIcon className="w-3 h-3 fill-current" />
                        </div>
                        <div className="flex-1">
                            <p className={`text-sm font-medium ${isLastRead ? 'text-[rgb(var(--color-accent-light))]' : 'text-slate-300'}`}>
                                {t.bookmarksMarkAsLastRead}
                            </p>
                            <p className="text-[10px] text-slate-500">
                                {t.bookmarksUpdateProgress}
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-6 pb-6 pt-2 flex flex-row items-center justify-between gap-4 mt-2">
                    <Button
                        variant="ghost"
                        onClick={handleDelete}
                        className="h-12 px-4 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                        <Trash2 className="w-5 h-5" />
                        <span className="sr-only sm:not-sr-only sm:ml-2">{t.bookmarksDelete}</span>
                    </Button>

                    <Button
                        onClick={handleSave}
                        className="h-12 flex-1 rounded-xl bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/90 text-[rgb(var(--color-primary-foreground))] font-semibold shadow-lg shadow-[rgb(var(--color-primary))]/25 transition-all active:scale-[0.98]"
                    >
                        {t.bookmarksSave}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
