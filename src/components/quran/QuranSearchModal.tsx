"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, BookOpen } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { searchQuranAction } from "@/app/actions/quran";
import type { SearchResponse } from "@/lib/kemenag-api";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import DOMPurify from "isomorphic-dompurify";

export default function QuranSearchModal() {
    const { t, locale } = useLocale();
    const { currentTheme } = useTheme();
    const isDaylight = currentTheme === "daylight";

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResponse | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;

        startTransition(async () => {
            try {
                const res = await searchQuranAction(query, 1, locale);
                setResults(res);
            } catch (error) {
                console.error(error);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "h-[44px] px-4 rounded-2xl shadow-lg border transition-all gap-2",
                        isDaylight
                            ? "bg-white border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50"
                            : "bg-[#0f172a]/60 backdrop-blur-xl border-white/10 text-slate-300 hover:text-[rgb(var(--color-primary))] hover:border-[rgb(var(--color-primary))]/30"
                    )}
                >
                    <BookOpen className="h-4 w-4" />
                    <span className="hidden sm:inline">{(t as any).quranSearchVerses}</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl bg-[#0F172A] border-white/10 p-0 overflow-hidden flex flex-col max-h-[85vh]">
                <DialogHeader className="p-4 border-b border-white/5 shrink-0 bg-[#0F172A]/80 backdrop-blur-xl z-10">
                    <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                        <Search className="h-5 w-5 text-[rgb(var(--color-primary-light))]" />
                        {(t as any).quranSearchVerses}
                    </DialogTitle>
                </DialogHeader>

                <div className="p-4 shrink-0 bg-white/5 border-b border-white/5 shadow-sm relative z-0">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <Input
                            autoFocus
                            placeholder={(t as any).quranSearchPlaceholderBody}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="bg-white/5 border-white/10 focus-visible:ring-[rgb(var(--color-primary))] h-12 text-base text-white rounded-xl placeholder:text-slate-500"
                        />
                        <Button type="submit" disabled={isPending || !query.trim()} className="bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-dark))] text-white h-12 px-6 rounded-xl font-bold transition-all shadow-lg shadow-[rgb(var(--color-primary))]/20">
                            {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : (t as any).quranSearchButton}
                        </Button>
                    </form>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {isPending && !results && (
                        <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-50">
                            <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--color-primary))]" />
                            <p className="text-sm font-medium text-slate-400">{(t as any).quranSearchSearching}</p>
                        </div>
                    )}

                    {!isPending && results && results.results.length === 0 && (
                        <div className="text-center py-12 text-slate-400">
                            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>{(t as any).quranSearchNotFound} "{results.query}"</p>
                        </div>
                    )}

                    {!isPending && results && results.results.length > 0 && (
                        <div className="space-y-4">
                            <p className="text-xs font-bold text-[rgb(var(--color-primary-light))] uppercase tracking-wider mb-2">
                                {(t as any).quranSearchFound} {results.total_results} {(t as any).quranSearchAyat}
                            </p>
                            {results.results.map((verse) => (
                                <Link
                                    key={verse.verse_key}
                                    href={`/quran/${verse.verse_key.split(':')[0]}#verse-${verse.verse_key.split(':')[1]}`}
                                    onClick={() => setOpen(false)}
                                    className="block p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-[rgb(var(--color-primary))]/30 hover:bg-white/10 transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-3 gap-4">
                                        <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-[rgb(var(--color-primary))]/20 text-[rgb(var(--color-primary-light))] text-xs font-bold shrink-0">
                                            Surah {verse.verse_key.replace(':', ', Ayat ')}
                                        </span>
                                    </div>
                                    <p className="text-right font-amiri text-2xl text-slate-200 leading-loose mb-3" dir="rtl">
                                        {verse.text_uthmani}
                                    </p>
                                    <p
                                        className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors"
                                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(verse.translation) }}
                                    />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
