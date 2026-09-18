"use client";

/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 */

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, Moon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/context/LocaleContext";
import { LAILATUL_QADR_GUIDE_SECTIONS, GuideItem } from "@/data/ramadhan/lailatul-qadr-guide";
import DalilBadge from "./DalilBadge";
import IntentionCard from "./IntentionCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppIcon } from "@/components/ui/AppIcon";

interface LailatulQadrGuideModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function LailatulQadrGuideModal({ open, onOpenChange }: LailatulQadrGuideModalProps) {
    const [expandedItem, setExpandedItem] = useState<string | null>(null);
    const { t, locale } = useLocale();

    const [activeTab, setActiveTab] = useState<string>("itikaf");

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        setExpandedItem(null);
    };

    const handleAccordionToggle = (id: string) => {
        setExpandedItem(expandedItem === id ? null : id);
    };

    const renderGuideItem = (item: GuideItem) => {
        const isExpanded = expandedItem === item.id;
        const localizedTitle = locale === "en" && item.title_en ? item.title_en : item.title;
        const localizedDesc = locale === "en" && item.description_en ? item.description_en : item.description;
        const localizedSteps = locale === "en" && item.steps_en ? item.steps_en : item.steps;

        return (
            <div key={item.id} className="border border-[rgb(var(--color-border))] rounded-xl bg-[rgb(var(--color-surface-subtle))] overflow-hidden transition-all duration-300">
                <button
                    onClick={() => handleAccordionToggle(item.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[rgb(var(--color-surface))] transition-all outline-none"
                >
                    {item.iconKey && <AppIcon name={item.iconKey} size="lg" tone="primary" className="shrink-0" />}
                    <div className="flex-1 min-w-0 pr-2">
                        <p className="font-semibold text-[rgb(var(--color-text-strong))] text-sm">{localizedTitle}</p>
                        {localizedDesc && (
                            <p className="text-[11px] sm:text-xs text-[rgb(var(--color-text-muted))] mt-1 leading-relaxed line-clamp-2">{localizedDesc}</p>
                        )}
                    </div>
                    <ChevronDown className={cn("w-4 h-4 text-[rgb(var(--color-text-muted))] transition-transform flex-shrink-0", isExpanded && "rotate-180")} />
                </button>

                {isExpanded && (
                    <div className="px-4 pb-4 pt-2 space-y-4 animate-in slide-in-from-top-2 fade-in duration-300 border-t border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]">
                        {/* Description Fallback for Full View */}
                        {localizedDesc && (
                            <p className="text-sm text-[rgb(var(--color-text))] italic text-center w-full block mb-3 border-b border-[rgb(var(--color-border))] pb-2">
                                &quot;{localizedDesc}&quot;
                            </p>
                        )}

                        {/* Steps / Tips */}
                        {localizedSteps && localizedSteps.length > 0 && (
                            <div className="rounded-xl bg-[rgb(var(--color-surface-subtle))] border border-[rgb(var(--color-border))] p-4 mt-3 shadow-[var(--shadow-card)]">
                                <p className="text-[10px] font-bold text-[rgb(var(--color-text-muted))] uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5">
                                    <AppIcon name="sparkles" size="xs" tone="primary" /> {t.practicesTipsLabel || "Panduan / Tata Cara"}
                                </p>
                                <ul className="space-y-2">
                                    {localizedSteps.map((step, i) => (
                                        <li key={i} className="flex items-start gap-2 text-xs text-[rgb(var(--color-text))] leading-relaxed">
                                             <span className="shrink-0 mt-0.5 text-[rgb(var(--color-primary-light))]">{i + 1}.</span>
                                            <span>{step}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Intention / Arabic text (Handled via IntentionCard for consistency) */}
                        {item.arabic && (
                            <IntentionCard
                                compact
                                intention={{
                                    id: item.id,
                                    title: localizedTitle,
                                    arabic: item.arabic,
                                    latin: item.latin || "",
                                    translation: locale === 'en' && item.translation_en ? item.translation_en : (item.translation || "")
                                }}
                            />
                        )}

                        {/* Dalil */}
                        {item.dalil && (
                            <div className="pt-2">
                                <div className="text-[10px] font-bold text-[rgb(var(--color-text-muted))] uppercase tracking-[0.2em] mb-2">
                                    <AppIcon name="book" size="xs" tone="muted" /> {t.faqEvidenceLabel || "Dalil"}
                                </div>
                                <DalilBadge dalil={item.dalil} variant="inline" />
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={false} className="max-w-[95vw] sm:max-w-lg md:max-w-2xl bg-[rgb(var(--color-surface))]/95 backdrop-blur-xl border-[rgb(var(--color-border))] text-[rgb(var(--color-text-strong))] p-0 overflow-hidden gap-0 shadow-[var(--shadow-floating)]">
                <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] relative flex flex-row items-start justify-between">
                    <div className="flex-1 min-w-0 pr-2">
                        <DialogTitle className="text-left flex items-start sm:items-center gap-2 font-bold text-base sm:text-lg">
                            <Moon className="w-5 h-5 text-[rgb(var(--color-primary-light))] shrink-0 mt-0.5 sm:mt-0" />
                            <span className="leading-snug">Panduan 10 Malam Terakhir</span>
                        </DialogTitle>
                        <p className="text-[11px] sm:text-xs text-[rgb(var(--color-text-muted))] mt-1.5 leading-relaxed break-words text-left">
                            Saku digital komprehensif untuk I&apos;tikaf, Doa, dan Sholat Sunnah
                        </p>
                    </div>
                    <DialogClose asChild>
                        <button
                            className="p-3 -mr-3 -mt-1 rounded-full text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-surface))] hover:text-[rgb(var(--color-text-strong))] transition-colors outline-none shrink-0 relative z-[60] cursor-pointer active:scale-95"
                            aria-label="Close"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </DialogClose>
                </DialogHeader>

                {/* Body Content with Tabs */}
                <div className="flex flex-col h-[65vh] max-h-[550px]">
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col flex-1 h-full w-full">
                        <div className="px-2 sm:px-6 pt-3 pb-2 border-b border-[rgb(var(--color-border))]">
                            <TabsList className="w-full flex h-auto p-1 bg-[rgb(var(--color-surface-subtle))]">
                                {LAILATUL_QADR_GUIDE_SECTIONS.map((section) => (
                                    <TabsTrigger
                                        key={section.id}
                                        value={section.id}
                                        className="flex-1 text-[10px] sm:text-xs text-center whitespace-normal leading-tight h-auto py-2 text-[rgb(var(--color-text-muted))] data-[state=active]:bg-[rgb(var(--color-primary))] data-[state=active]:text-[rgb(var(--color-primary-foreground))] hover:text-[rgb(var(--color-text))] transition-colors"
                                    >
                                        {locale === "en" && section.title_en ? section.title_en : section.title}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        <div className="flex-1 w-full min-h-[300px]">
                            {LAILATUL_QADR_GUIDE_SECTIONS.map((section) => (
                                <TabsContent
                                    key={section.id}
                                    value={section.id}
                                    className="h-full m-0 outline-none"
                                >
                                    <ScrollArea className="h-[calc(65vh-60px)] max-h-[490px] w-full pb-4">
                                        <div className="px-4 sm:px-6 py-4 space-y-3">
                                            {section.items.map(renderGuideItem)}
                                        </div>
                                    </ScrollArea>
                                </TabsContent>
                            ))}
                        </div>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}
