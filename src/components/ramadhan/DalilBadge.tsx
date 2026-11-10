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

import { useState } from "react";
import dynamic from "next/dynamic";
import { Copy, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { EvidenceData } from "@/data/ramadhan";
import { useLocale } from "@/context/LocaleContext";
import { AppIcon } from "@/components/ui/AppIcon";
import { mapEvidenceToShareData } from "@/lib/share/share-mappers";

const StoryShareModal = dynamic(
    () => import("@/components/StoryShareModal").then(mod => mod.StoryShareModal),
    { ssr: false },
);

interface DalilBadgeProps {
    dalil: EvidenceData;
    /** "link" is a readable, tappable text link (44px target) for places where the tiny pill is too small. */
    variant?: "inline" | "pill" | "link";
    /** Overrides the visible text of the "link" variant. */
    label?: string;
}

export default function DalilBadge({ dalil, variant = "inline", label }: DalilBadgeProps) {
    const [showDetail, setShowDetail] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const { t, locale } = useLocale();

    // Localized fields with fallback
    const localizedShortRef = locale === 'en' && dalil.shortRef_en ? dalil.shortRef_en : dalil.shortRef;
    const localizedTranslation = locale === 'en' && dalil.translation_en ? dalil.translation_en : dalil.translation;
    const localizedSource = locale === 'en' && dalil.source_en ? dalil.source_en : dalil.source;

    const copy = async () => {
        const text = [dalil.arabic, localizedTranslation, localizedSource].filter(Boolean).join("\n\n");
        try {
            await navigator.clipboard.writeText(text);
            toast.success(String(t.evidenceCopied));
        } catch {
            toast.error(String(t.evidenceCopyFailed));
        }
    };

    // The story modal is not a Radix layer, so close the dalil dialog first (as the streak dialog does) and bring it back after.
    const share = () => {
        setShowDetail(false);
        setShareOpen(true);
    };

    return (
        <>
        <Dialog open={showDetail} onOpenChange={setShowDetail}>
            {/* Badge trigger */}
            <DialogTrigger asChild>
                {variant === "link" ? (
                    <button
                        type="button"
                        className="inline-flex min-h-11 items-center gap-1.5 rounded-md text-left outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]"
                        title={t.evidenceViewFull}
                    >
                        <AppIcon name="scroll" size="sm" tone="primary" />
                        <span className="text-xs font-medium text-[rgb(var(--color-primary-strong))] underline decoration-dotted underline-offset-4">
                            {label ?? localizedShortRef}
                        </span>
                    </button>
                ) : (
                <button
                    type="button"
                    className={`
                      flex items-center gap-0.5 sm:gap-1 transition-all duration-300 active:scale-95 group/dalil outline-none
                      ${variant === "pill"
                            ? "rounded-sm border border-[rgb(var(--color-primary))]/25 bg-[rgb(var(--color-primary))]/10 px-1 py-[0.5px] sm:px-2 sm:py-0.5 backdrop-blur-sm hover:bg-[rgb(var(--color-primary))]/20 active:opacity-80 shadow-[var(--shadow-card)]"
                            : "text-left hover:opacity-80"
                        }
                    `}
                    title={t.evidenceViewFull}
                >
                    <AppIcon name="scroll" size="xs" tone="primary" className="group-hover/dalil:scale-110 transition-transform" />
                    <span
                        className={`text-[7px] sm:text-[8px] leading-none font-bold tracking-tight transition-colors ${variant === "pill" ? "text-[rgb(var(--color-primary-strong))] group-hover/dalil:text-[rgb(var(--color-primary))]" : "text-[rgb(var(--color-primary))] underline decoration-dotted underline-offset-2"}`}
                    >
                        {localizedShortRef}
                    </span>
                    {variant === "pill" && (
                        <AppIcon name="target" size="xs" tone="muted" className="group-hover/dalil:text-[rgb(var(--color-text))] group-hover/dalil:translate-x-0.5 transition-all" />
                    )}
                </button>
                )}
            </DialogTrigger>

            {/* Theme tokens only (no fixed shadows or blurs), so it reads on every theme, light or dark. */}
            <DialogContent
                closeLabel={String(t.evidenceClose)}
                className="z-[120] max-h-[calc(100dvh-7rem)] max-w-[min(28rem,calc(100%-2rem))] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden rounded-2xl border-[rgb(var(--color-primary))]/20 bg-[rgb(var(--color-surface))] p-0 text-[rgb(var(--color-text-strong))] motion-reduce:animate-none"
            >
                <DialogHeader className="flex-row items-center gap-3 border-b border-[rgb(var(--color-border))]/20 py-3 pl-5 pr-16 text-left">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--color-primary))]/10">
                        <AppIcon name="scroll" size="sm" tone="primary" />
                    </span>
                    <div className="min-w-0">
                        <DialogTitle className="truncate text-base font-bold leading-tight">{localizedShortRef}</DialogTitle>
                        <p className="text-xs text-[rgb(var(--color-text-muted))]">
                            {String(/^QS\./.test(dalil.shortRef) ? t.evidenceKindQuran : t.evidenceKindHadith)}
                        </p>
                    </div>
                </DialogHeader>

                <div className="space-y-3 overflow-y-auto p-5">
                    {dalil.arabic && (
                        <div className="rounded-xl border border-[rgb(var(--color-primary))]/15 bg-[rgb(var(--color-primary))]/5 p-4">
                            <p
                                className="text-right text-2xl font-semibold leading-[2] text-[rgb(var(--color-text-strong))]"
                                style={{ fontFamily: "var(--font-amiri)" }}
                                dir="rtl"
                                lang="ar"
                            >
                                {dalil.arabic}
                            </p>
                        </div>
                    )}

                    {dalil.latin && (
                        <p className="border-l-2 border-[rgb(var(--color-primary))]/30 pl-3 text-sm italic leading-relaxed text-[rgb(var(--color-text))]">
                            &ldquo;{dalil.latin}&rdquo;
                        </p>
                    )}

                    <div className="rounded-xl border border-[rgb(var(--color-border))]/20 bg-[rgb(var(--color-surface-subtle))] p-4">
                        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--color-text-muted))]">{String(t.evidenceTranslation)}</p>
                        <DialogDescription className="text-[15px] leading-relaxed text-[rgb(var(--color-text))]">
                            &ldquo;{localizedTranslation}&rdquo;
                        </DialogDescription>
                    </div>

                    <p className="text-[11px] font-medium uppercase leading-relaxed tracking-wider text-[rgb(var(--color-text-muted))]">
                        {localizedSource}
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={copy}
                            className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[rgb(var(--color-primary))]/20 bg-[rgb(var(--color-primary))]/5 px-3 text-sm font-medium text-[rgb(var(--color-text-strong))] outline-none transition-colors hover:bg-[rgb(var(--color-primary))]/10 focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))] motion-reduce:transition-none"
                        >
                            <Copy className="size-4" aria-hidden="true" />
                            {String(t.evidenceCopy)}
                        </button>
                        {/* The story card draws the Arabic text, so a dalil without it is not offered for sharing. */}
                        {dalil.arabic && (
                            <button
                                type="button"
                                onClick={share}
                                className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-[rgb(var(--color-primary))] px-3 text-sm font-semibold text-[rgb(var(--color-primary-foreground))] outline-none transition-colors hover:bg-[rgb(var(--color-primary-light))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--color-surface))] motion-reduce:transition-none"
                            >
                                <Share2 className="size-4" aria-hidden="true" />
                                {String(t.evidenceShareStory)}
                            </button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
        {shareOpen && (
            <StoryShareModal
                item={mapEvidenceToShareData(dalil, locale)}
                onClose={() => {
                    setShareOpen(false);
                    setShowDetail(true);
                }}
            />
        )}
        </>
    );
}
