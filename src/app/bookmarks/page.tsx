
"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Bookmark as BookmarkIcon, Trash2, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/hooks/useBookmarks";
import { removeBookmark } from "@/lib/bookmark-storage";
import { useState, useEffect } from "react";

export default function BookmarksPage() {
    const { bookmarks, refresh } = useBookmarks();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm("Hapus tanda baca ini?")) {
            removeBookmark(id);
            refresh();
        }
    };

    if (!mounted) return null;

    return (
        <div className="flex min-h-screen flex-col items-center bg-[rgb(var(--color-background))] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(var(--color-primary),0.15),rgba(255,255,255,0))] px-4 pt-8 pb-32 text-white font-sans sm:px-6">
            <div className="w-full max-w-2xl space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full text-white/70 hover:bg-white/10 hover:text-white">
                        <Link href="/quran">
                            <ChevronLeft className="h-6 w-6" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-[rgb(var(--color-primary-light))]">Tanda Baca</h1>
                        <p className="text-sm text-white/60">Ayat-ayat yang Anda simpan</p>
                    </div>
                </div>

                {/* List */}
                <div className="space-y-4">
                    {bookmarks.length === 0 ? (
                        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                            <BookmarkIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-300">Belum ada tanda baca</h3>
                            <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
                                Tandai ayat saat membaca Al-Quran untuk menyimpannya di sini.
                            </p>
                            <Button asChild className="mt-6 bg-[rgb(var(--color-primary))]/20 text-[rgb(var(--color-primary-light))] hover:bg-[rgb(var(--color-primary))]/30">
                                <Link href="/quran">Mulai Membaca</Link>
                            </Button>
                        </div>
                    ) : (
                        bookmarks.map((bookmark) => (
                            <Link
                                href={`/quran/${bookmark.surahId}#${bookmark.id}`}
                                key={bookmark.id}
                                className="block group relative overflow-hidden rounded-2xl bg-black/20 border border-white/10 p-5 hover:bg-black/30 hover:border-white/20 transition-all active:scale-[0.99]"
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-2 flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center justify-center h-8 px-3 rounded-full bg-[rgb(var(--color-primary))]/10 border border-[rgb(var(--color-primary))]/20 text-[rgb(var(--color-primary-light))] text-xs font-bold">
                                                QS. {bookmark.surahName} : {bookmark.verseId}
                                            </span>
                                            <span className="flex items-center gap-1 text-[10px] text-slate-500">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(bookmark.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>

                                        <p className="font-amiri text-xl text-white/90 leading-loose line-clamp-2 text-right dir-rtl py-1">
                                            {bookmark.verseText}
                                        </p>

                                        {bookmark.note && (
                                            <div className="flex items-start gap-2 pt-2 border-t border-white/5 mt-2">
                                                <FileText className="w-3 h-3 text-slate-500 mt-1 shrink-0" />
                                                <p className="text-xs text-slate-400 italic line-clamp-2">
                                                    "{bookmark.note}"
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2 items-end">
                                        <button
                                            onClick={(e) => handleDelete(bookmark.id, e)}
                                            className="p-2 rounded-full text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-colors z-10"
                                            title="Hapus"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-[rgb(var(--color-primary-light))] transition-colors mt-auto" />
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
