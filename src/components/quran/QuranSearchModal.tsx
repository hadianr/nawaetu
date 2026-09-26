"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, BookOpen } from "lucide-react";
import { useLocale, type TranslationTree } from "@/context/LocaleContext";
import { searchQuranAction } from "@/app/actions/quran";
import type { SearchResponse } from "@/lib/quran/kemenag-api";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { sanitizeRichText } from "@/lib/sanitize";

export default function QuranSearchModal() {
    const { t, locale } = useLocale();
    const translations = t as TranslationTree;

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
                        "h-[44px] px-4 rounded-2xl shadow-[var(--shadow-card)] border transition-all gap-2",
                        "bg-[rgb(var(--color-surface))]/80 border-[rgb(var(--color-border))] text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-surface-subtle))] hover:border-[rgb(var(--color-primary))]/40"
                    )}
                >
                    <BookOpen className="h-4 w-4" />
                    <span className="hidden sm:inline">{translations.quranSearchVerses}</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl p-0 overflow-hidden flex flex-col max-h-[85vh] bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))] text-[rgb(var(--color-text))]">
                <DialogHeader className="p-4 border-b border-[rgb(var(--color-border))] shrink-0 backdrop-blur-xl z-10 bg-[rgb(var(--color-surface))]">
                    <DialogTitle className="text-lg font-bold flex items-center gap-2 text-[rgb(var(--color-text-strong))]">
                        <Search className="h-5 w-5 text-[rgb(var(--color-primary-light))]" />
                        {translations.quranSearchVerses}
                    </DialogTitle>
                </DialogHeader>

                <div className="p-4 shrink-0 border-b border-[rgb(var(--color-border))] shadow-sm relative z-0 bg-[rgb(var(--color-surface-subtle))]">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <Input
                            autoFocus
                            placeholder={translations.quranSearchPlaceholderBody}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="h-12 text-base rounded-xl focus-visible:ring-[rgb(var(--color-primary))] bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))] text-[rgb(var(--color-text-strong))] placeholder:text-[rgb(var(--color-text-muted))]"
                        />
                        <Button type="submit" disabled={isPending || !query.trim()} className="bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-strong))] text-[rgb(var(--color-primary-foreground))] h-12 px-6 rounded-xl font-bold transition-all shadow-[var(--shadow-card)]">
                            {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : translations.quranSearchButton}
                        </Button>
                    </form>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {isPending && !results && (
                        <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-50">
                            <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--color-primary))]" />
                            <p className="text-sm font-medium text-[rgb(var(--color-text-muted))]">{translations.quranSearchSearching}</p>
                        </div>
                    )}

                    {!isPending && results && results.results.length === 0 && (
                        <div className="text-center py-12 text-[rgb(var(--color-text-muted))]">
                            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>{translations.quranSearchNotFound} &quot;{results.query}&quot;</p>
                        </div>
                    )}

                    {!isPending && results && results.results.length > 0 && (
                        <div className="space-y-4">
                            <p className="text-xs font-bold text-[rgb(var(--color-primary-strong))] uppercase tracking-wider mb-2">
                                {translations.quranSearchFound} {results.total_results} {translations.quranSearchAyat}
                            </p>
                            {results.results.map((verse) => (
                                <Link
                                    key={verse.verse_key}
                                    href={`/quran/${verse.verse_key.split(':')[0]}#verse-${verse.verse_key.split(':')[1]}`}
                                    onClick={() => setOpen(false)}
                                    className="block p-4 rounded-2xl bg-[rgb(var(--color-surface-subtle))] border border-[rgb(var(--color-border))]/30 hover:border-[rgb(var(--color-primary))]/40 hover:bg-[rgb(var(--color-surface))] transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-3 gap-4">
                                        <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-[rgb(var(--color-primary))]/20 text-[rgb(var(--color-primary-light))] text-xs font-bold shrink-0">
                                            Surah {verse.verse_key.replace(':', ', Ayat ')}
                                        </span>
                                    </div>
                                    <p className="text-right font-amiri text-2xl text-[rgb(var(--color-text-strong))] leading-loose mb-3" dir="rtl">
                                        {verse.text_uthmani}
                                    </p>
                                    <p
                                        className="text-sm text-[rgb(var(--color-text-muted))] leading-relaxed group-hover:text-[rgb(var(--color-text))] transition-colors"
                                        dangerouslySetInnerHTML={{ __html: sanitizeRichText(verse.translation) }}
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
