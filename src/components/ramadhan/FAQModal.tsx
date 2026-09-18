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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/context/LocaleContext";
import { FAQ_DATA } from "@/data/ramadhan";
import DalilBadge from "./DalilBadge";
import { AppIcon } from "@/components/ui/AppIcon";

interface FAQModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function FAQModal({ open, onOpenChange }: FAQModalProps) {
    const [expandedItem, setExpandedItem] = useState<string | null>(null);
    const { t, locale } = useLocale();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] sm:max-w-lg md:max-w-2xl bg-[rgb(var(--color-surface))]/95 backdrop-blur-xl border-[rgb(var(--color-border))] text-[rgb(var(--color-text-strong))] p-0 overflow-hidden gap-0 shadow-[var(--shadow-floating)]">
                <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] relative">
                    <DialogTitle className="text-left flex items-center gap-2">
                        <AppIcon name="help" size="md" tone="primary" />
                        <span>{t.faqModalTitle || "FAQ Puasa"}</span>
                    </DialogTitle>
                    <p className="text-xs text-[rgb(var(--color-text-muted))] mt-1">
                        {t.faqModalSubtitle || "Pertanyaan yang sering ditanyakan seputar puasa"}
                    </p>
                </DialogHeader>

                {/* Content */}
                <ScrollArea className="h-[60vh] max-h-[500px]">
                    <div className="px-4 sm:px-6 py-4">
                        <div className="space-y-2">
                            {FAQ_DATA.map((faq, index) => (
                                <div
                                    key={faq.id}
                                    className="border border-[rgb(var(--color-border))] rounded-xl bg-[rgb(var(--color-surface-subtle))] overflow-hidden"
                                >
                                    <button
                                        onClick={() => setExpandedItem(expandedItem === faq.id ? null : faq.id)}
                                        className="w-full px-4 py-3 hover:bg-[rgb(var(--color-surface))] transition-colors text-left"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3 flex-1">
                                                <span className="text-xs font-mono text-[rgb(var(--color-text-muted))] mt-0.5 flex-shrink-0">
                                                    {String(index + 1).padStart(2, '0')}
                                                </span>
                                                <span className="font-semibold text-sm text-[rgb(var(--color-text-strong))] leading-snug">
                                                    {locale === 'en' ? faq.question_en : faq.question}
                                                </span>
                                            </div>
                                            <ChevronDown
                                                className={cn(
                                                    "w-4 h-4 text-[rgb(var(--color-text-muted))] transition-transform flex-shrink-0",
                                                    expandedItem === faq.id && "rotate-180"
                                                )}
                                            />
                                        </div>
                                    </button>
                                    {expandedItem === faq.id && (
                                        <div className="px-4 pb-4 pt-2 animate-in slide-in-from-top-2 duration-200">
                                            <div className="space-y-3 border-t border-[rgb(var(--color-border))] pt-3 ml-6">
                                                {/* Answer */}
                                                <div className="space-y-2">
                                                    <p className="text-sm text-[rgb(var(--color-text))] leading-relaxed whitespace-pre-line">
                                                        {locale === 'en' ? faq.answer_en : faq.answer}
                                                    </p>
                                                </div>

                                                {/* Dalil if exists */}
                                                {faq.dalil && (
                                                    <div className="pt-2">
                                                        <div className="text-xs font-semibold text-[rgb(var(--color-text-muted))] mb-2 uppercase tracking-wide">
                                                            {t.faqEvidenceLabel || "Dalil"}
                                                        </div>
                                                        <DalilBadge dalil={faq.dalil} variant="inline" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Footer info */}
                        <div className="mt-6 p-4 rounded-xl bg-[rgb(var(--color-surface-subtle))] border border-[rgb(var(--color-border))]">
                            <p className="text-xs text-[rgb(var(--color-text-muted))] leading-relaxed text-center">
                                <span className="block mb-1 font-semibold text-[rgb(var(--color-text))]">
                                    <AppIcon name="warning" size="sm" tone="warning" /> {t.faqDisclaimerTitle || "Catatan Penting"}
                                </span>
                                {t.faqDisclaimer || "Untuk masalah fiqih yang kompleks atau kondisi khusus, silakan konsultasi dengan ustadz atau ulama terpercaya di daerah Anda."}
                            </p>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
