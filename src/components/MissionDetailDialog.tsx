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

import { useState, ReactNode } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Check, Lock, BookOpen, Info, ChevronRight, ChevronLeft, AlertCircle, Sparkles, X, ExternalLink } from "lucide-react";
import { Mission } from "@/data/missions";
import { getLocalizedMissionContent } from "@/data/missions";
import { cn } from "@/lib/utils";
import { useLocale, type TranslationTree } from "@/context/LocaleContext";
import { getRulingLabel } from "@/lib/habits/mission-utils";
import { parseQuranReference } from "@/lib/quran/reference-parser";
import { resolveReferenceByText, resolveReferenceForMission } from "@/lib/hadith/reference-matcher";
import { AppIcon, resolveAppIconName } from "@/components/ui/AppIcon";

interface MissionDetailDialogProps {
    mission: Mission;
    isOpen: boolean;
    onClose: () => void;
    onComplete: (xpAmount?: number) => void; // Updated signature
    onReset: () => void; // Add this
    isCompleted: boolean;
    isLocked: boolean;
    lockReason?: string;
    isLate?: boolean;
    isEarly?: boolean;
    customContent?: ReactNode;
}

export default function MissionDetailDialog({
    mission,
    isOpen,
    onClose,
    onComplete,
    isCompleted,
    isLocked,
    lockReason,
    isLate,
    isEarly,
    onReset,
    customContent,
}: MissionDetailDialogProps) {
    const { t, locale } = useLocale();
    const surface = "border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text))]";
    const muted = "text-[rgb(var(--color-text-muted))]";
    const content = getLocalizedMissionContent(mission.id, locale);
    const [readingIndex, setReadingIndex] = useState(0);
    const [isConfirmingReset, setIsConfirmingReset] = useState(false); // Add this

    const handleNextReading = () => {
        if (content && content.readings && readingIndex < content.readings.length - 1) {
            setReadingIndex(prev => prev + 1);
        }
    };

    const handlePrevReading = () => {
        if (readingIndex > 0) {
            setReadingIndex(prev => prev - 1);
        }
    };

    const currentReading = content?.readings?.[readingIndex];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                showCloseButton={false}
                className={cn(
                    "max-w-md max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 shadow-2xl transition-colors duration-500",
                    surface,
                    "backdrop-blur-3xl"
                )}
            >
                <DialogHeader className="p-6 pb-2 relative">
                    {/* Custom Close Button */}
                    <button
                        onClick={onClose}
                        className={cn(
                            "absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full transition-colors z-20",
                            "bg-[rgb(var(--color-surface-subtle))] hover:bg-[rgb(var(--color-primary))]/10"
                        )}
                    >
                        <X className={cn("w-4 h-4", muted)} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "text-3xl w-12 h-12 rounded-xl flex items-center justify-center border transition-colors",
                            "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-border))]"
                        )}>
                            <AppIcon name={mission.iconKey ?? resolveAppIconName(mission.icon)} size="xl" tone="primary" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <DialogTitle className="text-xl font-bold font-sans">{mission.title}</DialogTitle>
                                <span className={cn(
                                    "text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-widest shrink-0 border",
                                    "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] border-[rgb(var(--color-primary))]/30"
                                )}>
                                    {getRulingLabel(mission.ruling, t)}
                                </span>
                            </div>
                            <p className={cn("text-xs mt-1 font-medium", muted)}>{mission.description}</p>
                        </div>
                        <div className={cn(
                            "ml-auto flex items-center gap-1 px-2 py-1 rounded-full border transition-colors",
                            "bg-[rgb(var(--color-accent))]/10 border-[rgb(var(--color-accent))]/20"
                        )}>
                            <span className="text-xs font-black text-[rgb(var(--color-accent))]">+{mission.hasanahReward} Hasanah</span>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col pt-0">
                    {customContent ? (
                        <ScrollArea className="flex-1">
                            {customContent}
                        </ScrollArea>
                    ) : content ? (
                        <Tabs defaultValue="guide" className="flex-1 flex flex-col">
                            <div className={cn(
                                "px-6 border-b",
                                "border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))]/50"
                            )}>
                                <TabsList variant="line" className="w-full bg-transparent p-0 h-12 justify-start gap-8 border-none">
                                    <TabsTrigger
                                        value="guide"
                                        className={cn(
                                            "bg-transparent h-full px-0 rounded-none border-none shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm font-bold transition-all relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 focus-visible:ring-0 focus-visible:outline-none",
                                            `${muted} hover:text-[rgb(var(--color-text-strong))] data-[state=active]:text-[rgb(var(--color-primary))] after:bg-[rgb(var(--color-primary))] after:opacity-0 data-[state=active]:after:opacity-100`
                                        )}
                                    >
                                        {t.mission_dialog_guide}
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="info"
                                        className={cn(
                                            "bg-transparent h-full px-0 rounded-none border-none shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm font-bold transition-all relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 focus-visible:ring-0 focus-visible:outline-none",
                                            `${muted} hover:text-[rgb(var(--color-text-strong))] data-[state=active]:text-[rgb(var(--color-primary))] after:bg-[rgb(var(--color-primary))] after:opacity-0 data-[state=active]:after:opacity-100`
                                        )}
                                    >
                                        {t.mission_dialog_info}
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="guide" className="flex-1 overflow-hidden m-0 p-0 relative">
                                <ScrollArea className="h-[300px] sm:h-[400px]">
                                    <div className="p-6 space-y-6 pb-8">
                                        {content.intro && (
                                            <p className={cn(
                                                "text-sm italic p-3 rounded-lg border transition-colors",
                                                "bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))] text-[rgb(var(--color-text-muted))]"
                                            )}>
                            &quot;{content.intro}&quot;
                                            </p>
                                        )}

                                        {/* LAFADZ NIAT IMPLEMENTATION */}
                                        {content.niat && (
                                            <div className="space-y-3">
                                                <h3 className="text-sm font-bold flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--color-primary))]" />
                                                    {mission.category === 'prayer' ? t.mission_dialog_intention_sholat : mission.category === 'fasting' ? t.mission_dialog_intention_puasa : t.mission_dialog_intention_general}
                                                </h3>

                                                {/* CONDITIONAL RENDERING: Tabs only if Munfarid AND Makmum exist */}
                                                {content.niat.makmum ? (
                                                    <Tabs defaultValue="sendiri" className="w-full">
                                                        <TabsList className={cn(
                                                            "border w-full justify-start h-8 p-1 mb-2",
                                                            "bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))]"
                                                        )}>
                                                            <TabsTrigger value="sendiri" className={cn(
                                                                "text-xs h-6 px-3 transition-colors",
                                                                "data-[state=active]:bg-[rgb(var(--color-surface))] data-[state=active]:text-[rgb(var(--color-primary))] text-[rgb(var(--color-text-muted))]"
                                                            )}>{t.mission_dialog_sholat_sendiri}</TabsTrigger>
                                                            <TabsTrigger value="makmum" className={cn(
                                                                "text-xs h-6 px-3 transition-colors",
                                                                "data-[state=active]:bg-[rgb(var(--color-surface))] data-[state=active]:text-[rgb(var(--color-primary))] text-[rgb(var(--color-text-muted))]"
                                                            )}>{t.mission_dialog_sholat_makmum}</TabsTrigger>
                                                        </TabsList>
                                                        <TabsContent value="sendiri" className="mt-0">
                                                            <div className={cn(
                                                                "p-3 rounded-lg border transition-colors",
                                                                "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/20"
                                                            )}>
                                                                <p className="text-base md:text-lg font-serif text-right mb-1.5 leading-relaxed">
                                                                    {content.niat.munfarid.arabic}
                                                                </p>
                                                                <p className="text-[11px] md:text-xs italic mb-1 text-[rgb(var(--color-primary))] font-medium">
                                                                    {content.niat.munfarid.latin}
                                                                </p>
                                                                <p className="text-[9px] md:text-[10px] leading-tight text-[rgb(var(--color-text-muted))]">
                                                                    {content.niat.munfarid.translation}
                                                                </p>
                                                            </div>
                                                        </TabsContent>
                                                        <TabsContent value="makmum" className="mt-0">
                                                            <div className={cn(
                                                                "p-3 rounded-lg border transition-colors",
                                                                "bg-[rgb(var(--color-accent))]/10 border-[rgb(var(--color-accent))]/20"
                                                            )}>
                                                                <p className="text-base md:text-lg font-serif text-right mb-1.5 leading-relaxed">
                                                                    {content.niat.makmum.arabic}
                                                                </p>
                                                                <p className="text-[11px] md:text-xs italic mb-1 text-[rgb(var(--color-accent))] font-medium">
                                                                    {content.niat.makmum.latin}
                                                                </p>
                                                                <p className="text-[9px] md:text-[10px] leading-tight text-[rgb(var(--color-text-muted))]">
                                                                    {content.niat.makmum.translation}
                                                                </p>
                                                            </div>
                                                        </TabsContent>
                                                    </Tabs>
                                                ) : (
                                                    // SINGLE VIEW (No Tabs) - For Puasa/General
                                                    <div className={cn(
                                                        "p-4 rounded-xl border transition-colors",
                                                        "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/20"
                                                    )}>
                                                        <p className="text-lg md:text-xl font-serif text-right mb-2 leading-relaxed">
                                                            {content.niat.munfarid.arabic}
                                                        </p>
                                                        <p className="text-xs italic mb-1 text-[rgb(var(--color-primary))] font-medium">
                                                            {content.niat.munfarid.latin}
                                                        </p>
                                                        <p className="text-[10px] text-[rgb(var(--color-text-muted))]">
                                                            {content.niat.munfarid.translation}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* If Readings Exist (Dzikir/Doa) */}
                                        {content.readings && content.readings.length > 0 && (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between text-xs uppercase tracking-widest font-black text-[rgb(var(--color-text-muted))]">
                                                    <span>{(t as TranslationTree).mission_dialog_reading_of.replace('{current}', String(readingIndex + 1)).replace('{total}', String(content.readings.length))}</span>
                                                    {currentReading?.note && (
                                                        <span className="font-bold text-[rgb(var(--color-primary))]">{currentReading.note}</span>
                                                    )}
                                                </div>

                                                <div className={cn(
                                                    "rounded-2xl p-5 border space-y-4 relative min-h-[220px] flex flex-col justify-center transition-colors",
                                                    "bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))] shadow-sm"
                                                )}>
                                                    <div>
                                                        {currentReading?.title && (
                                                            <h4 className="text-sm font-bold mb-2 text-[rgb(var(--color-primary))]">{currentReading.title}</h4>
                                                        )}
                                                        <p className="text-xl md:text-2xl font-serif leading-[1.8] text-right">
                                                            {currentReading?.arabic}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="text-sm italic text-[rgb(var(--color-primary))] font-medium">
                                                            {currentReading?.latin}
                                                        </p>
                                                        <p className="text-xs text-[rgb(var(--color-text-muted))]">
                                                            {currentReading?.translation}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between gap-2 mt-4">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={handlePrevReading}
                                                        disabled={readingIndex === 0}
                                                        className="text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-primary))]/10 transition-colors"
                                                    >
                                                        <ChevronLeft className="w-4 h-4 mr-1" /> {t.mission_dialog_prev}
                                                    </Button>
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={handleNextReading}
                                                        disabled={readingIndex === (content.readings.length - 1)}
                                                        className={cn(
                                                            "transition-colors shadow-sm",
                                                            "bg-[rgb(var(--color-surface))] hover:bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] border border-[rgb(var(--color-border))]"
                                                        )}
                                                    >
                                                        {t.mission_dialog_next} <ChevronRight className="w-4 h-4 ml-1" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {/* If Steps/Guides Exist (Sholat) */}
                                        {content.guides && (
                                            <div className="space-y-3">
                                                <h3 className="text-sm font-bold mb-2">{t.mission_dialog_steps}</h3>
                                                <div className="space-y-3">
                                                    {content.guides.map((step: string, idx: number) => (
                                                        <div key={idx} className="flex gap-3 text-sm">
                                                            <div className={cn(
                                                                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors border",
                                                                "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/30 text-[rgb(var(--color-primary))]"
                                                            )}>
                                                                {idx + 1}
                                                            </div>
                                                            <p className="pt-0.5 text-[rgb(var(--color-text-muted))] font-medium">{step}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </TabsContent>

                            <TabsContent value="info" className="flex-1 overflow-hidden m-0 p-0">
                                <ScrollArea className="h-[300px] sm:h-[400px]">
                                    <div className="p-6 space-y-6">
                                        {content.fadhilah && (
                                            <div className="space-y-3">
                                                <h3 className="flex items-center gap-2 text-sm font-bold text-[rgb(var(--color-accent))]">
                                                    <SparklesIcon className="w-4 h-4" /> {t.mission_dialog_fadhilah}
                                                </h3>
                                                <ul className="space-y-2">
                                                    {content.fadhilah.map((item: string, idx: number) => (
                                                        <li key={idx} className={cn(
                                                            "flex gap-2 text-sm p-3 rounded-lg border transition-colors",
                                                            "bg-[rgb(var(--color-accent))]/10 border-[rgb(var(--color-accent))]/20 text-[rgb(var(--color-text-muted))]"
                                                        )}>
                                                            <span className="text-[rgb(var(--color-accent))]">|</span>
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {mission.dalil && (() => {
                                            const dalilTokens = mission.dalil
                                                .split(/[\|\n;&]/)
                                                .map(s => s.trim())
                                                .filter(Boolean);

                                            if (dalilTokens.length === 0) return null;

                                            return (
                                                <div className="space-y-2">
                                                    <h3 className="flex items-center gap-2 text-sm font-bold text-[rgb(var(--color-primary))]">
                                                        <BookOpen className="w-4 h-4" /> {t.mission_dialog_dalil_source}
                                                    </h3>
                                                    <div className={cn(
                                                        "p-3 px-3.5 rounded-lg border transition-colors space-y-2.5",
                                                        "bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))]"
                                                    )}>
                                                        {dalilTokens.map((token, idx) => {
                                                            const parsedQuran = parseQuranReference(token);
                                                            const resolvedSpiritual = resolveReferenceByText(token) || resolveReferenceForMission(mission);

                                                            const isQuran = parsedQuran.isQuranRef;
                                                            const isHadith = !isQuran && (resolvedSpiritual?.type === "hadith" || /^hr\./i.test(token));
                                                            const isDua = !isQuran && (resolvedSpiritual?.type === "dua" || /doa/i.test(token));

                                                            const targetUrl = isQuran
                                                                ? parsedQuran.targetUrl
                                                                : resolvedSpiritual?.targetUrl;

                                                            return (
                                                                <div
                                                                    key={idx}
                                                                    className={cn(
                                                                        "flex items-center gap-2.5 min-h-[24px]",
                                                                        idx > 0 && "pt-2 border-t",
                                                                        idx > 0 && "border-[rgb(var(--color-border))]"
                                                                    )}
                                                                >
                                                                    <span className={cn(
                                                                        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shrink-0 transition-colors inline-flex items-center justify-center leading-none",
                                                                        isQuran
                                                                            ? "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))]"
                                                                            : isHadith
                                                                            ? "bg-[rgb(var(--color-accent))]/10 text-[rgb(var(--color-accent))]"
                                                                            : "bg-[rgb(var(--color-info))]/10 text-[rgb(var(--color-info))]"
                                                                    )}>
                                                                        {isQuran
                                                                            ? (locale === 'en' ? 'Quran' : 'Al-Qur\'an')
                                                                            : isHadith
                                                                            ? (locale === 'en' ? 'Hadith' : 'Hadits')
                                                                            : isDua
                                                                            ? (locale === 'en' ? 'Dua' : 'Doa')
                                                                            : (locale === 'en' ? 'Reference' : 'Rujukan')}
                                                                    </span>

                                                                    {targetUrl ? (
                                                                        <Link
                                                                            href={targetUrl}
                                                                            onClick={() => onClose()}
                                                                            className={cn(
                                                                                "inline-flex items-center gap-1.5 text-xs font-semibold leading-none transition-all hover:underline group",
                                                                                isQuran
                                                                                    ? "text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary-strong))]"
                                                                                    : isHadith
                                                                                    ? "text-[rgb(var(--color-accent))] hover:text-[rgb(var(--color-accent))]"
                                                                                    : "text-[rgb(var(--color-info))] hover:text-[rgb(var(--color-info))]"
                                                                            )}
                                                                        >
                                                                            <span className="leading-none">{token}</span>
                                                                            <ExternalLink className="w-3 h-3 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                                                        </Link>
                                                                    ) : (
                                                                        <p className="text-xs font-semibold leading-none inline-flex items-center text-[rgb(var(--color-text))]">
                                                                            {token}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </ScrollArea>
                            </TabsContent>
                        </Tabs>
                    ) : (
                        // Fallback purely for missions without extended content
                        <div className="p-6 flex flex-col items-center justify-center flex-1 text-center space-y-4">
                            <Info className="w-12 h-12 text-[rgb(var(--color-text-muted))]" />
                            <p className="text-sm max-w-[200px] text-[rgb(var(--color-text-muted))]">
                                {t.mission_dialog_no_content}
                            </p>
                            {mission.dalil && (() => {
                                const resolvedSpiritual = resolveReferenceForMission(mission);
                                const targetUrl = resolvedSpiritual?.targetUrl;
                                return (
                                    <div className={cn(
                                        "mt-4 p-4 rounded-xl border w-full text-center",
                                        "bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))]"
                                    )}>
                                        <p className="text-xs font-bold mb-1 text-[rgb(var(--color-primary))]">{t.mission_dialog_dalil_label}</p>
                                        {targetUrl ? (
                                            <Link
                                                href={targetUrl}
                                                onClick={() => onClose()}
                                                className={cn(
                                                    "inline-flex items-center justify-center gap-1.5 text-sm italic font-semibold leading-none transition-all hover:underline group",
                                                    "text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary-strong))]"
                                                )}
                                            >
                                                <span>{mission.dalil}</span>
                                                <ExternalLink className="w-3.5 h-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                            </Link>
                                        ) : (
                                            <p className="text-sm italic text-[rgb(var(--color-text-muted))]">{mission.dalil}</p>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                </div>

                {(!customContent || isCompleted) && (
                    <div className={cn(
                        "p-4 border-t transition-colors",
                        "border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))]/50"
                    )}>
                        {/* LATE WARNING (Lalai) - Only for Fardhu Sholat (Punya afterPrayer config) */}
                        {isLate && !isCompleted && !isLocked && mission.category === 'prayer' && mission.validationConfig?.afterPrayer && (
                            <div className={cn(
                                "mb-3 px-3 py-2 rounded-lg border transition-colors",
                                "bg-[rgb(var(--color-danger))]/10 border-[rgb(var(--color-danger))]/20"
                            )}>
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertCircle className="w-4 h-4 shrink-0 text-[rgb(var(--color-danger))]" />
                                    <p className="text-xs font-bold text-[rgb(var(--color-danger))]">{t.home_mission_late_prayer_title}</p>
                                </div>
                                <p className="text-[10px] leading-tight italic text-[rgb(var(--color-danger))]/80">
                                    {t.home_mission_late_warning_quote}
                                </p>
                                <p className="text-[10px] mt-1 font-medium text-[rgb(var(--color-text-muted))]">
                                    {t.home_mission_late_warning_desc}
                                </p>
                            </div>
                        )}

                        {/* LATE NOTICE (Generic) - For non-Prayer (e.g. Dhikr) OR Sunnah Prayer (e.g. Dhuha) */}
                        {isLate && !isCompleted && !isLocked && (mission.category !== 'prayer' || !mission.validationConfig?.afterPrayer) && (
                            <div className={cn(
                                "mb-3 px-3 py-2 rounded-lg flex items-center gap-2 border transition-colors",
                                "bg-[rgb(var(--color-accent))]/10 border-[rgb(var(--color-accent))]/20"
                            )}>
                                <AlertCircle className="w-4 h-4 shrink-0 text-[rgb(var(--color-accent))]" />
                                <p className="text-[10px] leading-tight font-medium text-[rgb(var(--color-accent))]/80">
                                    {t.home_mission_late_notice}
                                </p>
                            </div>
                        )}

                        {/* EARLY PRAISE (Awal Waktu) - Only for Prayer */}
                        {isEarly && !isCompleted && !isLocked && mission.category === 'prayer' && (
                            <div className={cn(
                                "mb-3 px-3 py-2 rounded-lg border transition-colors",
                                "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/20"
                            )}>
                                <div className="flex items-center gap-2 mb-1">
                                    <Sparkles className="w-4 h-4 shrink-0 text-[rgb(var(--color-primary))]" />
                                    <p className="text-xs font-bold text-[rgb(var(--color-primary))]">{t.home_mission_early_prayer_title}</p>
                                </div>
                                <p className="text-[10px] leading-tight italic font-medium text-[rgb(var(--color-primary))]/80">
                                    {t.home_mission_early_praise_quote}
                                </p>
                            </div>
                        )}

                        {isCompleted ? (
                            <div className="flex flex-col gap-2">
                                <Button className={cn(
                                    "w-full border cursor-default transition-all shadow-sm",
                                    "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/15 border border-[rgb(var(--color-primary))]/20"
                                )} disabled>
                                    <Check className="w-4 h-4 mr-2" /> {t.home_mission_completed_label}
                                </Button>

                                {isConfirmingReset ? (
                                    <div className="flex items-center gap-2 mt-2">
                                        <Button
                                            variant="destructive"
                                            className={cn(
                                                "flex-1 py-5 text-xs font-black uppercase tracking-wider transition-all",
                                                "bg-[rgb(var(--color-danger))] hover:bg-[rgb(var(--color-danger))]/90 text-[rgb(var(--color-primary-foreground))] shadow-sm"
                                            )}
                                            onClick={() => {
                                                onReset();
                                                setIsConfirmingReset(false);
                                            }}
                                        >
                                            {t.home_mission_undo_confirm} (-{mission.hasanahReward} Hasanah)
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className={cn(
                                                "flex-1 py-5 text-xs font-bold transition-colors",
                                                "text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-primary))]/10"
                                            )}
                                            onClick={() => setIsConfirmingReset(false)}
                                        >
                                            {t.home_mission_undo_cancel}
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        variant="ghost"
                                        className={cn(
                                            "w-full text-[10px] mt-1 transition-colors",
                                            "text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-danger))] hover:bg-[rgb(var(--color-danger))]/10"
                                        )}
                                        onClick={() => setIsConfirmingReset(true)}
                                    >
                                        {t.home_mission_undo_prompt}
                                    </Button>
                                )}
                            </div>
                        ) : isLocked ? (
                            <Button className={cn(
                                "w-full border transition-colors",
                                "bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))] text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-primary))]/10"
                            )} disabled>
                                <Lock className="w-4 h-4 mr-2" /> {lockReason || t.home_mission_locked_fallback}
                            </Button>
                        ) : mission.completionOptions ? (
                            <div className="flex gap-2">
                                {mission.completionOptions.map((option, idx) => {
                                    const isHighReward = option.hasanahReward > 50;
                                    return (
                                        <Button
                                            key={idx}
                                            className={cn(
                                                "flex-1 font-black py-4 md:py-5 text-[11px] md:text-sm relative overflow-hidden group shadow-md transition-all",
                                                isHighReward
                                                    ? "bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-strong))] text-[rgb(var(--color-primary-foreground))]"
                                                    : "bg-[rgb(var(--color-surface-subtle))] hover:bg-[rgb(var(--color-primary))]/15 text-[rgb(var(--color-text))] border border-[rgb(var(--color-border))]"
                                            )}
                                            onClick={() => onComplete(option.hasanahReward)}
                                        >
                                            {/* Highlight effect for high reward */}
                                            {isHighReward && (
                                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                            )}

                                            <div className="flex flex-col items-center gap-0.5 z-10">
                                                <span className="flex items-center gap-1.5 uppercase tracking-wide">
                                                    {option.iconKey && <AppIcon name={option.iconKey} size="sm" tone={isHighReward ? "default" : "primary"} />}
                                                    {option.label}
                                                </span>
                                                <span className="text-[10px] font-bold opacity-80 text-[rgb(var(--color-primary-foreground))]">+{option.hasanahReward} Hasanah</span>
                                            </div>
                                        </Button>
                                    );
                                })}
                            </div>
                        ) : (
                            <Button
                                className={cn(
                                    "w-full font-black py-4 md:py-5 text-xs md:text-sm transition-all shadow-lg",
                                    isLate
                                        ? "bg-[rgb(var(--color-accent))] hover:bg-[rgb(var(--color-accent))]/90 text-[rgb(var(--color-primary-foreground))]"
                                        : "bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-strong))] text-[rgb(var(--color-primary-foreground))]"
                                )}
                                onClick={() => onComplete(mission.hasanahReward)}
                            >
                                {isLate ? <Check className="w-5 h-5 mr-2" /> : <Check className="w-5 h-5 mr-2" />}
                                <span className="uppercase tracking-widest">
                                    {isLate ? t.home_mission_complete_late : t.home_mission_complete} (+{mission.hasanahReward} Hasanah)
                                </span>
                            </Button>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

function SparklesIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
    )
}
