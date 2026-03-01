"use client";

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

import { useState, useMemo } from "react";
import { BookOpen, Quote, Sparkles, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { SPIRITUAL_CONTENT, SPIRITUAL_CATEGORIES, getLocalizedContent } from "@/data/spiritual-content";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import { PresetGuard } from "@/components/PresetGuard";

function HadithCard({ item, t, locale, isDaylight }: { item: typeof SPIRITUAL_CONTENT[0]; t: any; locale: string; isDaylight: boolean }) {
    const [expanded, setExpanded] = useState(false);
    const [copied, setCopied] = useState(false);

    const isHadith = item.type === "hadith";

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        const loc = getLocalizedContent(item.content, locale);
        const text = `${loc.title || item.content.title}\n\n${item.content.arabic}\n${item.content.latin}\n\n"${loc.translation}"\n\n${t.spiritualSource}: ${item.content.source}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div
            className={cn(
                "rounded-2xl border transition-all duration-200 overflow-hidden",
                isDaylight
                    ? "bg-white border-slate-200/60 shadow-sm hover:border-emerald-200/60"
                    : "bg-white/[0.03] border-white/8 backdrop-blur-sm hover:bg-white/[0.05] hover:border-white/10"
            )}
            onClick={() => setExpanded(!expanded)}
        >
            {/* Compact row */}
            <div className="flex items-center gap-3 px-4 py-3 cursor-pointer">
                {/* Icon */}
                <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border",
                    isDaylight
                        ? "bg-emerald-50 border-emerald-100"
                        : "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/15"
                )}>
                    {isHadith ? (
                        <Quote className={cn("w-3.5 h-3.5", isDaylight ? "text-emerald-500" : "text-[rgb(var(--color-primary-light))]/70")} />
                    ) : (
                        <BookOpen className={cn("w-3.5 h-3.5", isDaylight ? "text-emerald-500" : "text-[rgb(var(--color-primary-light))]/70")} />
                    )}
                </div>

                {/* Translation preview */}
                <div className="flex-1 min-w-0">
                    <p className={cn(
                        "text-xs font-medium line-clamp-2 leading-relaxed",
                        isDaylight ? "text-slate-700 font-semibold" : "text-white/70"
                    )}>
                        {getLocalizedContent(item.content, locale).translation}
                    </p>
                    <p className={cn(
                        "text-[10px] mt-0.5 flex items-center gap-1",
                        isDaylight ? "text-slate-400" : "text-white/30"
                    )}>
                        <Sparkles className={cn("w-2.5 h-2.5", isDaylight ? "text-amber-500/60" : "text-amber-400/40")} />
                        {item.content.source}
                    </p>
                </div>

                {/* Expand / Copy controls */}
                <div className="flex-shrink-0 flex items-center gap-1.5 ml-1">
                    <button
                        onClick={handleCopy}
                        className={cn(
                            "p-1.5 rounded-lg transition-colors",
                            isDaylight ? "bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600" : "hover:bg-white/5 text-white/20 hover:text-white/50"
                        )}
                        title={t.spiritualCopyContent}
                    >
                        {copied ? (
                            <Check className={cn("w-3 h-3", isDaylight ? "text-emerald-500" : "text-green-400")} />
                        ) : (
                            <Copy className="w-3 h-3" />
                        )}
                    </button>
                    <div className={isDaylight ? "text-slate-300" : "text-white/20"}>
                        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </div>
                </div>
            </div>

            {/* Expanded content */}
            {expanded && (
                <div className={cn(
                    "px-4 pb-4 space-y-2.5 border-t pt-3 animate-in slide-in-from-top-1 duration-200",
                    isDaylight ? "border-slate-50 bg-slate-50/30" : "border-white/5"
                )}>
                    {/* Arabic */}
                    <p
                        dir="rtl"
                        className={cn(
                            "text-right text-xl font-arabic leading-[1.8]",
                            isDaylight ? "text-slate-900" : "text-slate-50/90"
                        )}
                    >
                        {item.content.arabic}
                    </p>

                    {/* Latin + Translation */}
                    <div className="relative space-y-1.5 pl-3">
                        <div className={cn(
                            "absolute left-0 top-0 bottom-0 w-0.5 rounded-full",
                            isDaylight ? "bg-emerald-400" : "bg-gradient-to-b from-[rgb(var(--color-primary))]/40 to-transparent"
                        )} />
                        <p className={cn("text-[10px] italic leading-relaxed", isDaylight ? "text-slate-400" : "text-slate-400/70")}>{item.content.latin}</p>
                        <p className={cn("text-sm font-medium leading-relaxed", isDaylight ? "text-slate-700" : "text-slate-100/90")}>
                            "{getLocalizedContent(item.content, locale).translation}"
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function HadithPage() {
    const { t, locale } = useLocale();
    const { currentTheme } = useTheme();
    const isDaylight = currentTheme === "daylight";
    const [activeCategory, setActiveCategory] = useState("all");

    const filtered = useMemo(() => {
        if (activeCategory === "all") return SPIRITUAL_CONTENT;
        return SPIRITUAL_CONTENT.filter(item => item.category === activeCategory);
    }, [activeCategory]);

    const hadithCount = SPIRITUAL_CONTENT.filter(i => i.type === "hadith").length;
    const duaCount = SPIRITUAL_CONTENT.filter(i => i.type === "dua").length;

    return (
        <PresetGuard requiredFeature="showHadith" redirectTo="/">
            <div className={cn(
                "flex min-h-screen flex-col items-center px-2 sm:px-3 py-4 font-sans transition-colors duration-500",
                isDaylight
                    ? "bg-[#f8fafc] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.1),transparent)]"
                    : "bg-[rgb(var(--color-background))] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(var(--color-primary),0.1),transparent)]"
            )}>
                <main className="flex w-full max-w-md flex-col pb-nav">

                    {/* Header */}
                    <div className="px-2 mb-4">
                        <div className="flex items-center gap-2 mb-1">
                            <div className={cn(
                                "p-2 rounded-xl border transition-colors",
                                isDaylight ? "bg-emerald-50 border-emerald-100" : "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/20"
                            )}>
                                <Quote className={cn("w-4 h-4", isDaylight ? "text-emerald-500" : "text-[rgb(var(--color-primary-light))]")} />
                            </div>
                            <h1 className={cn("text-lg font-black tracking-tight", isDaylight ? "text-slate-900" : "text-white")}>
                                {(t as any).hadithPageTitle}
                            </h1>
                        </div>
                        <p className={cn("text-xs pl-1", isDaylight ? "text-slate-400" : "text-white/40")}>
                            {hadithCount} {locale === "en" ? "hadith" : "hadits"} · {duaCount} {locale === "en" ? "duas" : "doa"}
                        </p>
                    </div>

                    {/* Category Filter Chips */}
                    <div className="flex gap-2 overflow-x-auto pb-3 px-0.5 no-scrollbar mb-3">
                        {SPIRITUAL_CATEGORIES.map((cat) => {
                            const isActive = activeCategory === cat.key;
                            const label = cat.key === "all"
                                ? (t as any).hadithFilterAll
                                : (t as any)[cat.key] || (locale === "en" ? cat.labelEn : cat.labelId);
                            return (
                                <button
                                    key={cat.key}
                                    onClick={() => setActiveCategory(cat.key)}
                                    className={cn(
                                        "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border",
                                        isActive
                                            ? isDaylight
                                                ? "bg-emerald-100/80 border-emerald-200 text-emerald-700 shadow-sm"
                                                : "bg-[rgb(var(--color-primary))] text-white border-transparent shadow-lg shadow-[rgba(var(--color-primary),0.3)]"
                                            : isDaylight
                                                ? "bg-white border-slate-100 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                                                : "bg-white/5 border-white/8 text-white/50 hover:bg-white/10 hover:text-white/70"
                                    )}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Content Count */}
                    {activeCategory !== "all" && (
                        <p className={cn("text-[10px] px-1 mb-2", isDaylight ? "text-slate-400" : "text-white/30")}>
                            {filtered.length} {(t as any).hadithFoundCount}
                        </p>
                    )}

                    {/* Hadith List */}
                    <div className="flex flex-col gap-2">
                        {filtered.map((item) => (
                            <HadithCard key={item.id} item={item} t={t} locale={locale} isDaylight={isDaylight} />
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <div className={cn("text-center py-12", isDaylight ? "text-slate-300" : "text-white/30")}>
                            <Quote className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">{(t as any).hadithEmptyState}</p>
                        </div>
                    )}
                </main>
            </div>
        </PresetGuard>
    );
}
