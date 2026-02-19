"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/context/LocaleContext";
import { FAQ_DATA } from "@/data/ramadhan-fiqh";
import DalilBadge from "./DalilBadge";

interface FAQModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function FAQModal({ open, onOpenChange }: FAQModalProps) {
    const [expandedItem, setExpandedItem] = useState<string | null>(null);
    const { t, locale } = useLocale();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] sm:max-w-lg md:max-w-2xl bg-black/60 backdrop-blur-xl border-white/10 text-white p-0 overflow-hidden gap-0 shadow-2xl">
                <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 bg-white/5 relative">
                    <DialogTitle className="text-left flex items-center gap-2">
                        <span className="text-lg">❓</span>
                        <span>{t.faqModalTitle || "FAQ Puasa"}</span>
                    </DialogTitle>
                    <p className="text-xs text-white/50 mt-1">
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
                                    className="border border-white/10 rounded-xl bg-white/5 overflow-hidden"
                                >
                                    <button
                                        onClick={() => setExpandedItem(expandedItem === faq.id ? null : faq.id)}
                                        className="w-full px-4 py-3 hover:bg-white/5 transition-colors text-left"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3 flex-1">
                                                <span className="text-xs font-mono text-white/40 mt-0.5 flex-shrink-0">
                                                    {String(index + 1).padStart(2, '0')}
                                                </span>
                                                <span className="font-semibold text-sm text-white leading-snug">
                                                    {locale === 'en' ? faq.question_en : faq.question}
                                                </span>
                                            </div>
                                            <ChevronDown 
                                                className={cn(
                                                    "w-4 h-4 text-white/40 transition-transform flex-shrink-0",
                                                    expandedItem === faq.id && "rotate-180"
                                                )} 
                                            />
                                        </div>
                                    </button>
                                    {expandedItem === faq.id && (
                                        <div className="px-4 pb-4 pt-2 animate-in slide-in-from-top-2 duration-200">
                                            <div className="space-y-3 border-t border-white/5 pt-3 ml-6">
                                                {/* Answer */}
                                                <div className="space-y-2">
                                                    <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">
                                                        {locale === 'en' ? faq.answer_en : faq.answer}
                                                    </p>
                                                </div>
                                                
                                                {/* Dalil if exists */}
                                                {faq.dalil && (
                                                    <div className="pt-2">
                                                        <div className="text-xs font-semibold text-white/50 mb-2 uppercase tracking-wide">
                                                            {t.faqDalilLabel || "Dalil"}
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
                        <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                            <p className="text-xs text-white/60 leading-relaxed text-center">
                                <span className="block mb-1 font-semibold text-white/70">
                                    {t.faqDisclaimerTitle || "⚠️ Catatan Penting"}
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
