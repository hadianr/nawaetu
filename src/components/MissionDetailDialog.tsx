"use client";

import { useState, ReactNode } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Lock, BookOpen, Info, ChevronRight, ChevronLeft, AlertCircle, Sparkles, X } from "lucide-react";
import { Mission, ValidationType } from "@/data/missions-data";
import { MISSION_CONTENTS, MissionContent } from "@/data/mission-content";
import { cn } from "@/lib/utils";
import { useLocale } from "@/context/LocaleContext";
import { getHukumLabel } from "@/lib/mission-utils";

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
    const { t } = useLocale();
    const content = MISSION_CONTENTS[mission.id];
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
            <DialogContent showCloseButton={false} className="bg-[rgb(var(--color-background))]/90 backdrop-blur-3xl border-white/10 text-white max-w-md max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 shadow-2xl">
                <DialogHeader className="p-6 pb-2 relative">
                    {/* Custom Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors z-20"
                    >
                        <X className="w-4 h-4 text-white/70" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="text-3xl bg-white/5 w-12 h-12 rounded-xl flex items-center justify-center border border-white/10">
                            {mission.icon}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <DialogTitle className="text-xl font-bold">{mission.title}</DialogTitle>
                                <span className={cn(
                                    "text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0",
                                    mission.hukum === 'obligatory'
                                        ? "bg-[rgb(var(--color-primary))]/20 text-[rgb(var(--color-primary-light))] border border-[rgb(var(--color-primary))]/30"
                                        : "bg-[rgb(var(--color-primary))]/20 text-[rgb(var(--color-primary-light))] border border-[rgb(var(--color-primary))]/30"
                                )}>
                                    {getHukumLabel(mission.hukum, t)}
                                </span>
                            </div>
                            <p className="text-xs text-white/50 mt-1">{mission.description}</p>
                        </div>
                        <div className="ml-auto flex items-center gap-1 bg-[rgb(var(--color-accent))]/10 px-2 py-1 rounded-full border border-[rgb(var(--color-accent))]/20">
                            <span className="text-xs font-bold text-[rgb(var(--color-accent))]">+{mission.xpReward} XP</span>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col">
                    {customContent ? (
                        <ScrollArea className="flex-1">
                            {customContent}
                        </ScrollArea>
                    ) : content ? (
                        <Tabs defaultValue="guide" className="flex-1 flex flex-col">
                            <div className="px-6 border-b border-white/10">
                                <TabsList variant="line" className="w-full bg-transparent p-0 h-12 justify-start gap-8 border-none">
                                    <TabsTrigger
                                        value="guide"
                                        className="bg-transparent h-full px-0 rounded-none border-none shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none text-white/50 hover:text-white data-[state=active]:text-[rgb(var(--color-primary-light))] text-sm font-bold transition-all relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[rgb(var(--color-primary))] after:opacity-0 data-[state=active]:after:opacity-100 focus-visible:ring-0 focus-visible:outline-none"
                                    >
                                        {t.mission_dialog_guide}
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="info"
                                        className="bg-transparent h-full px-0 rounded-none border-none shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none text-white/50 hover:text-white data-[state=active]:text-[rgb(var(--color-primary-light))] text-sm font-bold transition-all relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[rgb(var(--color-primary))] after:opacity-0 data-[state=active]:after:opacity-100 focus-visible:ring-0 focus-visible:outline-none"
                                    >
                                        {t.mission_dialog_info}
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="guide" className="flex-1 overflow-hidden m-0 p-0 relative">
                                <ScrollArea className="h-[300px] sm:h-[400px]">
                                    <div className="p-6 space-y-6 pb-8">
                                        {content.intro && (
                                            <p className="text-sm text-white/70 italic bg-white/5 p-3 rounded-lg border border-white/10">
                                                "{content.intro}"
                                            </p>
                                        )}

                                        {/* LAFADZ NIAT IMPLEMENTATION */}
                                        {content.niat && (
                                            <div className="space-y-3">
                                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--color-primary))]" />
                                                    {mission.category === 'prayer' ? t.mission_dialog_niat_sholat : mission.category === 'fasting' ? t.mission_dialog_niat_puasa : t.mission_dialog_niat_general}
                                                </h3>

                                                {/* CONDITIONAL RENDERING: Tabs only if Munfarid AND Makmum exist */}
                                                {content.niat.makmum ? (
                                                    <Tabs defaultValue="sendiri" className="w-full">
                                                        <TabsList className="bg-white/5 border border-white/10 w-full justify-start h-8 p-1 mb-2">
                                                            <TabsTrigger value="sendiri" className="text-xs h-6 px-3 data-[state=active]:bg-white/10 data-[state=active]:text-[rgb(var(--color-primary-light))] text-white/50">{t.mission_dialog_sholat_sendiri}</TabsTrigger>
                                                            <TabsTrigger value="makmum" className="text-xs h-6 px-3 data-[state=active]:bg-white/10 data-[state=active]:text-[rgb(var(--color-primary-light))] text-white/50">{t.mission_dialog_sholat_makmum}</TabsTrigger>
                                                        </TabsList>
                                                        <TabsContent value="sendiri" className="mt-0">
                                                            <div className="bg-[rgb(var(--color-primary-dark))]/10 p-4 rounded-xl border border-[rgb(var(--color-primary))]/10">
                                                                <p className="text-lg md:text-xl font-serif text-right text-white mb-2 leading-relaxed">
                                                                    {content.niat.munfarid.arabic}
                                                                </p>
                                                                <p className="text-xs text-[rgb(var(--color-primary-light))]/70 italic mb-1">
                                                                    {content.niat.munfarid.latin}
                                                                </p>
                                                                <p className="text-[10px] text-white/50">
                                                                    {content.niat.munfarid.translation}
                                                                </p>
                                                            </div>
                                                        </TabsContent>
                                                        <TabsContent value="makmum" className="mt-0">
                                                            <div className="bg-emerald-900/10 p-4 rounded-xl border border-emerald-500/10">
                                                                <p className="text-lg md:text-xl font-serif text-right text-white mb-2 leading-relaxed">
                                                                    {content.niat.makmum.arabic}
                                                                </p>
                                                                <p className="text-xs text-emerald-100/70 italic mb-1">
                                                                    {content.niat.makmum.latin}
                                                                </p>
                                                                <p className="text-[10px] text-white/50">
                                                                    {content.niat.makmum.translation}
                                                                </p>
                                                            </div>
                                                        </TabsContent>
                                                    </Tabs>
                                                ) : (
                                                    // SINGLE VIEW (No Tabs) - For Puasa/General
                                                    <div className="bg-emerald-900/10 p-4 rounded-xl border border-emerald-500/10">
                                                        <p className="text-lg md:text-xl font-serif text-right text-white mb-2 leading-relaxed">
                                                            {content.niat.munfarid.arabic}
                                                        </p>
                                                        <p className="text-xs text-emerald-100/70 italic mb-1">
                                                            {content.niat.munfarid.latin}
                                                        </p>
                                                        <p className="text-[10px] text-white/50">
                                                            {content.niat.munfarid.translation}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* If Readings Exist (Dzikir/Doa) */}
                                        {content.readings && content.readings.length > 0 && (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between text-xs text-white/40 uppercase tracking-widest font-bold">
                                                    <span>{(t as any).mission_dialog_reading_of.replace('{current}', String(readingIndex + 1)).replace('{total}', String(content.readings.length))}</span>
                                                    {currentReading?.note && (
                                                        <span className="text-emerald-400">{currentReading.note}</span>
                                                    )}
                                                </div>

                                                <div className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-4 relative min-h-[220px] flex flex-col justify-center">
                                                    <div>
                                                        {currentReading?.title && (
                                                            <h4 className="text-sm font-bold text-[rgb(var(--color-primary-light))] mb-2">{currentReading.title}</h4>
                                                        )}
                                                        <p className="text-xl md:text-2xl font-serif leading-relaxed text-right text-white">
                                                            {currentReading?.arabic}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="text-sm text-emerald-100/70 italic">
                                                            {currentReading?.latin}
                                                        </p>
                                                        <p className="text-xs text-white/50">
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
                                                        className="text-white/60 hover:text-white hover:bg-white/10"
                                                    >
                                                        <ChevronLeft className="w-4 h-4 mr-1" /> {t.mission_dialog_prev}
                                                    </Button>
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={handleNextReading}
                                                        disabled={readingIndex === (content.readings.length - 1)}
                                                        className="bg-white/10 hover:bg-white/20 text-white border border-white/10"
                                                    >
                                                        {t.mission_dialog_next} <ChevronRight className="w-4 h-4 ml-1" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {/* If Steps/Guides Exist (Sholat) */}
                                        {content.guides && (
                                            <div className="space-y-3">
                                                <h3 className="text-sm font-bold text-white mb-2">{t.mission_dialog_steps}</h3>
                                                <div className="space-y-3">
                                                    {content.guides.map((step, idx) => (
                                                        <div key={idx} className="flex gap-3 text-sm">
                                                            <div className="w-6 h-6 rounded-full bg-[rgb(var(--color-primary))]/20 text-[rgb(var(--color-primary-light))] flex items-center justify-center text-xs font-bold shrink-0">
                                                                {idx + 1}
                                                            </div>
                                                            <p className="text-white/80 pt-0.5">{step}</p>
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
                                                    {content.fadhilah.map((item, idx) => (
                                                        <li key={idx} className="flex gap-2 text-sm text-white/80 bg-white/5 p-3 rounded-lg border border-white/5">
                                                            <span className="text-[rgb(var(--color-accent))]">•</span>
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {mission.dalil && (
                                            <div className="space-y-2">
                                                <h3 className="flex items-center gap-2 text-sm font-bold text-[rgb(var(--color-primary-light))]">
                                                    <BookOpen className="w-4 h-4" /> {t.mission_dialog_dalil_source}
                                                </h3>
                                                <div className="bg-[rgb(var(--color-primary-dark))]/30 p-4 rounded-xl border border-[rgb(var(--color-primary))]/20">
                                                    <p className="text-sm text-white/90 italic">"{mission.dalil}"</p>
                                                    {content.source && (
                                                        <p className="text-xs text-[rgb(var(--color-primary-light))] mt-2 font-medium">Ref: {content.source}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </TabsContent>
                        </Tabs>
                    ) : (
                        // Fallback purely for missions without extended content
                        <div className="p-6 flex flex-col items-center justify-center flex-1 text-center space-y-4">
                            <Info className="w-12 h-12 text-white/20" />
                            <p className="text-white/60 text-sm max-w-[200px]">
                                {t.mission_dialog_no_content}
                            </p>
                            {mission.dalil && (
                                <div className="mt-4 bg-white/5 p-4 rounded-xl border border-white/10 w-full">
                                    <p className="text-xs text-emerald-400 font-bold mb-1">{t.mission_dialog_dalil_label}</p>
                                    <p className="text-sm italic text-white/80">{mission.dalil}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {(!customContent || isCompleted) && (
                    <div className="p-4 border-t border-white/10 bg-[#0F0F0F]">
                        {/* LATE WARNING (Lalai) - Only for Fardhu Sholat (Punya afterPrayer config) */}
                        {isLate && !isCompleted && !isLocked && mission.category === 'prayer' && mission.validationConfig?.afterPrayer && (
                            <div className="mb-3 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                                    <p className="text-xs font-bold text-red-400">{t.homeMissionLatePrayerTitle}</p>
                                </div>
                                <p className="text-[10px] text-red-200/80 leading-tight italic">
                                    {t.homeMissionLateWarningQuote}
                                </p>
                                <p className="text-[10px] text-zinc-400 mt-1">
                                    {t.homeMissionLateWarningDesc}
                                </p>
                            </div>
                        )}

                        {/* LATE NOTICE (Generic) - For non-Prayer (e.g. Dhikr) OR Sunnah Prayer (e.g. Dhuha) */}
                        {isLate && !isCompleted && !isLocked && (mission.category !== 'prayer' || !mission.validationConfig?.afterPrayer) && (
                            <div className="mb-3 px-3 py-2 bg-[rgb(var(--color-accent))]/10 border border-[rgb(var(--color-accent))]/20 rounded-lg flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-[rgb(var(--color-accent))] shrink-0" />
                                <p className="text-[10px] text-[rgb(var(--color-accent))]/80 leading-tight">
                                    {t.homeMissionLateNotice}
                                </p>
                            </div>
                        )}

                        {/* EARLY PRAISE (Awal Waktu) - Only for Prayer */}
                        {isEarly && !isCompleted && !isLocked && mission.category === 'prayer' && (
                            <div className="mb-3 px-3 py-2 bg-[rgb(var(--color-primary))]/10 border border-[rgb(var(--color-primary))]/20 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <Sparkles className="w-4 h-4 text-[rgb(var(--color-primary-light))] shrink-0" />
                                    <p className="text-xs font-bold text-[rgb(var(--color-primary-light))]">{t.homeMissionEarlyPrayerTitle}</p>
                                </div>
                                <p className="text-[10px] text-[rgb(var(--color-primary-light))]/80 leading-tight italic">
                                    {t.homeMissionEarlyPraiseQuote}
                                </p>
                            </div>
                        )}

                        {isCompleted ? (
                            <div className="flex flex-col gap-2">
                                <Button className="w-full bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/10 border border-[rgb(var(--color-primary))]/20 cursor-default" disabled>
                                    <Check className="w-4 h-4 mr-2" /> {t.homeMissionCompletedLabel}
                                </Button>

                                {isConfirmingReset ? (
                                    <div className="flex items-center gap-2 mt-2">
                                        <Button
                                            variant="destructive"
                                            className="flex-1 py-5 text-xs font-bold"
                                            onClick={() => {
                                                onReset();
                                                setIsConfirmingReset(false);
                                            }}
                                        >
                                            {t.homeMissionUndoConfirm} (-{mission.xpReward} XP)
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="flex-1 py-5 text-xs font-bold text-white/60"
                                            onClick={() => setIsConfirmingReset(false)}
                                        >
                                            {t.homeMissionUndoCancel}
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        variant="ghost"
                                        className="w-full text-white/30 hover:text-red-400 hover:bg-red-400/10 text-[10px] mt-1"
                                        onClick={() => setIsConfirmingReset(true)}
                                    >
                                        {t.homeMissionUndoPrompt}
                                    </Button>
                                )}
                            </div>
                        ) : isLocked ? (
                            <Button className="w-full bg-white/5 text-white/40 hover:bg-white/5 border border-white/10" disabled>
                                <Lock className="w-4 h-4 mr-2" /> {lockReason || t.homeMissionLockedFallback}
                            </Button>
                        ) : mission.completionOptions ? (
                            <div className="flex gap-2">
                                {mission.completionOptions.map((option, idx) => (
                                    <Button
                                        key={idx}
                                        className={cn(
                                            "flex-1 font-bold py-6 text-sm relative overflow-hidden group",
                                            option.xpReward > 50
                                                ? "bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-light))] text-white" // High reward (Berjamaah)
                                                : "bg-white/10 hover:bg-white/20 text-white/80"    // Low reward (Sendiri)
                                        )}
                                        onClick={() => onComplete(option.xpReward)}
                                    >
                                        {/* Highlight effect for high reward */}
                                        {option.xpReward > 50 && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-[rgb(var(--color-primary-light))]/0 via-white/10 to-[rgb(var(--color-primary-light))]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                        )}

                                        <div className="flex flex-col items-center gap-0.5 z-10">
                                            <span className="flex items-center gap-1.5">
                                                {option.icon && <span>{option.icon}</span>}
                                                {option.label}
                                            </span>
                                            <span className="text-[10px] opacity-80">+{option.xpReward} XP</span>
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        ) : (
                            <Button
                                className={cn(
                                    "w-full font-bold py-6 text-base transition-all",
                                    isLate
                                        ? "bg-[rgb(var(--color-accent))] hover:bg-[rgb(var(--color-accent))] text-white"
                                        : "bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-light))] text-white"
                                )}
                                onClick={() => onComplete(mission.xpReward)}
                            >
                                {isLate ? <Check className="w-4 h-4 mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                                {isLate ? t.homeMissionCompleteLate : t.homeMissionComplete} (+{mission.xpReward} XP)
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
