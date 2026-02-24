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
import { useTheme } from "@/context/ThemeContext";
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
    const { currentTheme } = useTheme();
    const isDaylight = currentTheme === "daylight";
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
            <DialogContent
                showCloseButton={false}
                className={cn(
                    "max-w-md max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 shadow-2xl transition-colors duration-500",
                    isDaylight ? "bg-white border-slate-200 text-slate-900" : "bg-[rgb(var(--color-background))]/90 backdrop-blur-3xl border-white/10 text-white"
                )}
            >
                <DialogHeader className="p-6 pb-2 relative">
                    {/* Custom Close Button */}
                    <button
                        onClick={onClose}
                        className={cn(
                            "absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full transition-colors z-20",
                            isDaylight ? "bg-slate-100 hover:bg-slate-200" : "bg-white/5 hover:bg-white/10"
                        )}
                    >
                        <X className={cn("w-4 h-4", isDaylight ? "text-slate-400" : "text-white/70")} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "text-3xl w-12 h-12 rounded-xl flex items-center justify-center border transition-colors",
                            isDaylight ? "bg-emerald-50/50 border-emerald-100" : "bg-white/5 border-white/10"
                        )}>
                            {mission.icon}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <DialogTitle className={cn("text-xl font-bold font-sans", isDaylight ? "text-slate-900" : "text-white")}>{mission.title}</DialogTitle>
                                <span className={cn(
                                    "text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-widest shrink-0 border",
                                    isDaylight
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : "bg-[rgb(var(--color-primary))]/20 text-[rgb(var(--color-primary-light))] border-[rgb(var(--color-primary))]/30"
                                )}>
                                    {getHukumLabel(mission.hukum, t)}
                                </span>
                            </div>
                            <p className={cn("text-xs mt-1", isDaylight ? "text-slate-500 font-medium" : "text-white/50")}>{mission.description}</p>
                        </div>
                        <div className={cn(
                            "ml-auto flex items-center gap-1 px-2 py-1 rounded-full border transition-colors",
                            isDaylight ? "bg-orange-50 border-orange-100" : "bg-[rgb(var(--color-accent))]/10 border-[rgb(var(--color-accent))]/20"
                        )}>
                            <span className={cn("text-xs font-black", isDaylight ? "text-orange-600" : "text-[rgb(var(--color-accent)) ]")}>+{mission.xpReward} XP</span>
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
                            <div className={cn(
                                "px-6 border-b",
                                isDaylight ? "border-slate-100 bg-slate-50/50" : "border-white/10"
                            )}>
                                <TabsList variant="line" className="w-full bg-transparent p-0 h-12 justify-start gap-8 border-none">
                                    <TabsTrigger
                                        value="guide"
                                        className={cn(
                                            "bg-transparent h-full px-0 rounded-none border-none shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm font-bold transition-all relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 focus-visible:ring-0 focus-visible:outline-none",
                                            isDaylight
                                                ? "text-slate-400 hover:text-slate-600 data-[state=active]:text-emerald-700 after:bg-emerald-600 after:opacity-0 data-[state=active]:after:opacity-100"
                                                : "text-white/50 hover:text-white data-[state=active]:text-[rgb(var(--color-primary-light))] after:bg-[rgb(var(--color-primary))] after:opacity-0 data-[state=active]:after:opacity-100"
                                        )}
                                    >
                                        {t.mission_dialog_guide}
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="info"
                                        className={cn(
                                            "bg-transparent h-full px-0 rounded-none border-none shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm font-bold transition-all relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 focus-visible:ring-0 focus-visible:outline-none",
                                            isDaylight
                                                ? "text-slate-400 hover:text-slate-600 data-[state=active]:text-emerald-700 after:bg-emerald-600 after:opacity-0 data-[state=active]:after:opacity-100"
                                                : "text-white/50 hover:text-white data-[state=active]:text-[rgb(var(--color-primary-light))] after:bg-[rgb(var(--color-primary))] after:opacity-0 data-[state=active]:after:opacity-100"
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
                                                isDaylight ? "bg-slate-50 border-slate-100 text-slate-600" : "text-white/70 bg-white/5 border-white/10"
                                            )}>
                                                "{content.intro}"
                                            </p>
                                        )}

                                        {/* LAFADZ NIAT IMPLEMENTATION */}
                                        {content.niat && (
                                            <div className="space-y-3">
                                                <h3 className={cn("text-sm font-bold flex items-center gap-2", isDaylight ? "text-slate-800" : "text-white")}>
                                                    <span className={cn("w-1.5 h-1.5 rounded-full transition-colors", isDaylight ? "bg-emerald-500" : "bg-[rgb(var(--color-primary))]")} />
                                                    {mission.category === 'prayer' ? t.mission_dialog_niat_sholat : mission.category === 'fasting' ? t.mission_dialog_niat_puasa : t.mission_dialog_niat_general}
                                                </h3>

                                                {/* CONDITIONAL RENDERING: Tabs only if Munfarid AND Makmum exist */}
                                                {content.niat.makmum ? (
                                                    <Tabs defaultValue="sendiri" className="w-full">
                                                        <TabsList className={cn(
                                                            "border w-full justify-start h-8 p-1 mb-2",
                                                            isDaylight ? "bg-slate-100 border-slate-200" : "bg-white/5 border-white/10"
                                                        )}>
                                                            <TabsTrigger value="sendiri" className={cn(
                                                                "text-xs h-6 px-3 transition-colors",
                                                                isDaylight
                                                                    ? "data-[state=active]:bg-white data-[state=active]:text-emerald-700 text-slate-500"
                                                                    : "data-[state=active]:bg-white/10 data-[state=active]:text-[rgb(var(--color-primary-light))] text-white/50"
                                                            )}>{t.mission_dialog_sholat_sendiri}</TabsTrigger>
                                                            <TabsTrigger value="makmum" className={cn(
                                                                "text-xs h-6 px-3 transition-colors",
                                                                isDaylight
                                                                    ? "data-[state=active]:bg-white data-[state=active]:text-emerald-700 text-slate-500"
                                                                    : "data-[state=active]:bg-white/10 data-[state=active]:text-[rgb(var(--color-primary-light))] text-white/50"
                                                            )}>{t.mission_dialog_sholat_makmum}</TabsTrigger>
                                                        </TabsList>
                                                        <TabsContent value="sendiri" className="mt-0">
                                                            <div className={cn(
                                                                "p-4 rounded-xl border transition-colors",
                                                                isDaylight ? "bg-emerald-50 border-emerald-100" : "bg-[rgb(var(--color-primary-dark))]/10 border border-[rgb(var(--color-primary))]/10"
                                                            )}>
                                                                <p className={cn("text-lg md:text-xl font-serif text-right mb-2 leading-relaxed transition-colors", isDaylight ? "text-slate-900" : "text-white")}>
                                                                    {content.niat.munfarid.arabic}
                                                                </p>
                                                                <p className={cn("text-xs italic mb-1 transition-colors", isDaylight ? "text-emerald-700/80 font-medium" : "text-[rgb(var(--color-primary-light))]/70")}>
                                                                    {content.niat.munfarid.latin}
                                                                </p>
                                                                <p className={cn("text-[10px] transition-colors", isDaylight ? "text-slate-500" : "text-white/50")}>
                                                                    {content.niat.munfarid.translation}
                                                                </p>
                                                            </div>
                                                        </TabsContent>
                                                        <TabsContent value="makmum" className="mt-0">
                                                            <div className={cn(
                                                                "p-4 rounded-xl border transition-colors",
                                                                isDaylight ? "bg-blue-50 border-blue-100" : "bg-emerald-900/10 border border-emerald-500/10"
                                                            )}>
                                                                <p className={cn("text-lg md:text-xl font-serif text-right mb-2 leading-relaxed", isDaylight ? "text-slate-900" : "text-white")}>
                                                                    {content.niat.makmum.arabic}
                                                                </p>
                                                                <p className={cn("text-xs italic mb-1", isDaylight ? "text-blue-700/80 font-medium" : "text-emerald-100/70")}>
                                                                    {content.niat.makmum.latin}
                                                                </p>
                                                                <p className={cn("text-[10px]", isDaylight ? "text-slate-500" : "text-white/50")}>
                                                                    {content.niat.makmum.translation}
                                                                </p>
                                                            </div>
                                                        </TabsContent>
                                                    </Tabs>
                                                ) : (
                                                    // SINGLE VIEW (No Tabs) - For Puasa/General
                                                    <div className={cn(
                                                        "p-4 rounded-xl border transition-colors",
                                                        isDaylight ? "bg-emerald-50 border-emerald-100" : "bg-emerald-900/10 border border-emerald-500/10"
                                                    )}>
                                                        <p className={cn("text-lg md:text-xl font-serif text-right mb-2 leading-relaxed", isDaylight ? "text-slate-900" : "text-white")}>
                                                            {content.niat.munfarid.arabic}
                                                        </p>
                                                        <p className={cn("text-xs italic mb-1", isDaylight ? "text-emerald-700/80 font-medium" : "text-emerald-100/70")}>
                                                            {content.niat.munfarid.latin}
                                                        </p>
                                                        <p className={cn("text-[10px]", isDaylight ? "text-slate-500" : "text-white/50")}>
                                                            {content.niat.munfarid.translation}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* If Readings Exist (Dzikir/Doa) */}
                                        {content.readings && content.readings.length > 0 && (
                                            <div className="space-y-4">
                                                <div className={cn("flex items-center justify-between text-xs uppercase tracking-widest font-black", isDaylight ? "text-slate-400" : "text-white/40")}>
                                                    <span>{(t as any).mission_dialog_reading_of.replace('{current}', String(readingIndex + 1)).replace('{total}', String(content.readings.length))}</span>
                                                    {currentReading?.note && (
                                                        <span className={cn("font-bold transition-colors", isDaylight ? "text-emerald-600" : "text-emerald-400")}>{currentReading.note}</span>
                                                    )}
                                                </div>

                                                <div className={cn(
                                                    "rounded-2xl p-5 border space-y-4 relative min-h-[220px] flex flex-col justify-center transition-colors",
                                                    isDaylight ? "bg-slate-50/50 border-slate-100 shadow-sm" : "bg-white/5 border-white/10"
                                                )}>
                                                    <div>
                                                        {currentReading?.title && (
                                                            <h4 className={cn("text-sm font-bold mb-2 transition-colors", isDaylight ? "text-emerald-700" : "text-[rgb(var(--color-primary-light))]")}>{currentReading.title}</h4>
                                                        )}
                                                        <p className={cn("text-xl md:text-2xl font-serif leading-[1.8] text-right transition-colors", isDaylight ? "text-slate-900" : "text-white")}>
                                                            {currentReading?.arabic}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className={cn("text-sm italic transition-colors", isDaylight ? "text-emerald-700/80 font-medium" : "text-emerald-100/70")}>
                                                            {currentReading?.latin}
                                                        </p>
                                                        <p className={cn("text-xs transition-colors", isDaylight ? "text-slate-500" : "text-white/50")}>
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
                                                        className={cn("transition-colors", isDaylight ? "text-slate-400 hover:text-slate-600 hover:bg-slate-50" : "text-white/60 hover:text-white hover:bg-white/10")}
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
                                                            isDaylight
                                                                ? "bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-100"
                                                                : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
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
                                                <h3 className={cn("text-sm font-bold mb-2 transition-colors", isDaylight ? "text-slate-800" : "text-white")}>{t.mission_dialog_steps}</h3>
                                                <div className="space-y-3">
                                                    {content.guides.map((step, idx) => (
                                                        <div key={idx} className="flex gap-3 text-sm">
                                                            <div className={cn(
                                                                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors border",
                                                                isDaylight
                                                                    ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                                                                    : "bg-[rgb(var(--color-primary))]/20 text-[rgb(var(--color-primary-light))] border-[rgb(var(--color-primary))]/30"
                                                            )}>
                                                                {idx + 1}
                                                            </div>
                                                            <p className={cn("pt-0.5 transition-colors", isDaylight ? "text-slate-600 font-medium" : "text-white/80")}>{step}</p>
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
                                                <h3 className={cn("flex items-center gap-2 text-sm font-bold transition-colors", isDaylight ? "text-orange-600" : "text-[rgb(var(--color-accent))]")}>
                                                    <SparklesIcon className="w-4 h-4" /> {t.mission_dialog_fadhilah}
                                                </h3>
                                                <ul className="space-y-2">
                                                    {content.fadhilah.map((item, idx) => (
                                                        <li key={idx} className={cn(
                                                            "flex gap-2 text-sm p-3 rounded-lg border transition-colors",
                                                            isDaylight ? "bg-orange-50/50 border-orange-100 text-slate-600" : "text-white/80 bg-white/5 border-white/5"
                                                        )}>
                                                            <span className={isDaylight ? "text-orange-500" : "text-[rgb(var(--color-accent))] "}>•</span>
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {mission.dalil && (
                                            <div className="space-y-2">
                                                <h3 className={cn("flex items-center gap-2 text-sm font-bold transition-colors", isDaylight ? "text-emerald-700" : "text-[rgb(var(--color-primary-light))]")}>
                                                    <BookOpen className="w-4 h-4" /> {t.mission_dialog_dalil_source}
                                                </h3>
                                                <div className={cn(
                                                    "p-4 rounded-xl border transition-colors",
                                                    isDaylight ? "bg-slate-50 border-slate-100" : "bg-[rgb(var(--color-primary-dark))]/30 border border-[rgb(var(--color-primary))]/20"
                                                )}>
                                                    <p className={cn("text-sm italic transition-colors", isDaylight ? "text-slate-600" : "text-white/90")}>"{mission.dalil}"</p>
                                                    {content.source && (
                                                        <p className={cn("text-xs mt-2 font-medium transition-colors", isDaylight ? "text-emerald-600" : "text-[rgb(var(--color-primary-light))]")}>Ref: {content.source}</p>
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
                            <Info className={cn("w-12 h-12", isDaylight ? "text-slate-200" : "text-white/20")} />
                            <p className={cn("text-sm max-w-[200px]", isDaylight ? "text-slate-400" : "text-white/60")}>
                                {t.mission_dialog_no_content}
                            </p>
                            {mission.dalil && (
                                <div className={cn(
                                    "mt-4 p-4 rounded-xl border w-full",
                                    isDaylight ? "bg-slate-50 border-slate-100" : "bg-white/5 border-white/10"
                                )}>
                                    <p className={cn("text-xs font-bold mb-1", isDaylight ? "text-emerald-600" : "text-emerald-400")}>{t.mission_dialog_dalil_label}</p>
                                    <p className={cn("text-sm italic", isDaylight ? "text-slate-600" : "text-white/80")}>{mission.dalil}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {(!customContent || isCompleted) && (
                    <div className={cn(
                        "p-4 border-t transition-colors",
                        isDaylight ? "border-slate-100 bg-slate-50/50" : "border-white/10 bg-[#0F0F0F]"
                    )}>
                        {/* LATE WARNING (Lalai) - Only for Fardhu Sholat (Punya afterPrayer config) */}
                        {isLate && !isCompleted && !isLocked && mission.category === 'prayer' && mission.validationConfig?.afterPrayer && (
                            <div className={cn(
                                "mb-3 px-3 py-2 rounded-lg border transition-colors",
                                isDaylight ? "bg-red-50 border-red-100" : "bg-red-500/10 border-red-500/20"
                            )}>
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertCircle className={cn("w-4 h-4 shrink-0", isDaylight ? "text-red-500" : "text-red-500")} />
                                    <p className={cn("text-xs font-bold", isDaylight ? "text-red-700" : "text-red-400")}>{t.homeMissionLatePrayerTitle}</p>
                                </div>
                                <p className={cn("text-[10px] leading-tight italic", isDaylight ? "text-red-600/80" : "text-red-200/80")}>
                                    {t.homeMissionLateWarningQuote}
                                </p>
                                <p className={cn("text-[10px] mt-1 font-medium", isDaylight ? "text-red-400" : "text-zinc-400")}>
                                    {t.homeMissionLateWarningDesc}
                                </p>
                            </div>
                        )}

                        {/* LATE NOTICE (Generic) - For non-Prayer (e.g. Dhikr) OR Sunnah Prayer (e.g. Dhuha) */}
                        {isLate && !isCompleted && !isLocked && (mission.category !== 'prayer' || !mission.validationConfig?.afterPrayer) && (
                            <div className={cn(
                                "mb-3 px-3 py-2 rounded-lg flex items-center gap-2 border transition-colors",
                                isDaylight ? "bg-orange-50 border-orange-100" : "bg-[rgb(var(--color-accent))]/10 border-[rgb(var(--color-accent))]/20"
                            )}>
                                <AlertCircle className={cn("w-4 h-4 shrink-0", isDaylight ? "text-orange-500" : "text-[rgb(var(--color-accent))]")} />
                                <p className={cn("text-[10px] leading-tight font-medium", isDaylight ? "text-orange-700" : "text-[rgb(var(--color-accent))]/80")}>
                                    {t.homeMissionLateNotice}
                                </p>
                            </div>
                        )}

                        {/* EARLY PRAISE (Awal Waktu) - Only for Prayer */}
                        {isEarly && !isCompleted && !isLocked && mission.category === 'prayer' && (
                            <div className={cn(
                                "mb-3 px-3 py-2 rounded-lg border transition-colors",
                                isDaylight ? "bg-emerald-50 border-emerald-100" : "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/20"
                            )}>
                                <div className="flex items-center gap-2 mb-1">
                                    <Sparkles className={cn("w-4 h-4 shrink-0", isDaylight ? "text-emerald-500" : "text-[rgb(var(--color-primary-light)) ]")} />
                                    <p className={cn("text-xs font-bold", isDaylight ? "text-emerald-700" : "text-[rgb(var(--color-primary-light))]")}>{t.homeMissionEarlyPrayerTitle}</p>
                                </div>
                                <p className={cn("text-[10px] leading-tight italic font-medium", isDaylight ? "text-emerald-600/80" : "text-[rgb(var(--color-primary-light))]/80")}>
                                    {t.homeMissionEarlyPraiseQuote}
                                </p>
                            </div>
                        )}

                        {isCompleted ? (
                            <div className="flex flex-col gap-2">
                                <Button className={cn(
                                    "w-full border cursor-default transition-all shadow-sm",
                                    isDaylight
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50"
                                        : "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/10 border border-[rgb(var(--color-primary))]/20"
                                )} disabled>
                                    <Check className="w-4 h-4 mr-2" /> {t.homeMissionCompletedLabel}
                                </Button>

                                {isConfirmingReset ? (
                                    <div className="flex items-center gap-2 mt-2">
                                        <Button
                                            variant="destructive"
                                            className={cn(
                                                "flex-1 py-5 text-xs font-black uppercase tracking-wider transition-all",
                                                isDaylight ? "bg-red-500 hover:bg-red-400 text-white shadow-sm" : ""
                                            )}
                                            onClick={() => {
                                                onReset();
                                                setIsConfirmingReset(false);
                                            }}
                                        >
                                            {t.homeMissionUndoConfirm} (-{mission.xpReward} XP)
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className={cn(
                                                "flex-1 py-5 text-xs font-bold transition-colors",
                                                isDaylight ? "text-slate-400 hover:text-slate-600 hover:bg-slate-50" : "text-white/60"
                                            )}
                                            onClick={() => setIsConfirmingReset(false)}
                                        >
                                            {t.homeMissionUndoCancel}
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        variant="ghost"
                                        className={cn(
                                            "w-full text-[10px] mt-1 transition-colors",
                                            isDaylight ? "text-slate-300 hover:text-red-500 hover:bg-red-50" : "text-white/30 hover:text-red-400 hover:bg-red-400/10"
                                        )}
                                        onClick={() => setIsConfirmingReset(true)}
                                    >
                                        {t.homeMissionUndoPrompt}
                                    </Button>
                                )}
                            </div>
                        ) : isLocked ? (
                            <Button className={cn(
                                "w-full border transition-colors",
                                isDaylight ? "bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-50" : "bg-white/5 text-white/40 hover:bg-white/5 border border-white/10"
                            )} disabled>
                                <Lock className="w-4 h-4 mr-2" /> {lockReason || t.homeMissionLockedFallback}
                            </Button>
                        ) : mission.completionOptions ? (
                            <div className="flex gap-2">
                                {mission.completionOptions.map((option, idx) => {
                                    const isHighReward = option.xpReward > 50;
                                    return (
                                        <Button
                                            key={idx}
                                            className={cn(
                                                "flex-1 font-black py-7 text-sm relative overflow-hidden group shadow-md transition-all",
                                                isHighReward
                                                    ? isDaylight
                                                        ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-200"
                                                        : "bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-light))] text-white"
                                                    : isDaylight
                                                        ? "bg-slate-100/80 hover:bg-slate-200 text-slate-600 border border-slate-200"
                                                        : "bg-white/10 hover:bg-white/20 text-white/80"
                                            )}
                                            onClick={() => onComplete(option.xpReward)}
                                        >
                                            {/* Highlight effect for high reward */}
                                            {isHighReward && (
                                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                            )}

                                            <div className="flex flex-col items-center gap-0.5 z-10">
                                                <span className="flex items-center gap-1.5 uppercase tracking-wide">
                                                    {option.icon && <span>{option.icon}</span>}
                                                    {option.label}
                                                </span>
                                                <span className={cn("text-[10px] font-bold opacity-80", isHighReward ? (isDaylight ? "text-emerald-100" : "text-[rgb(var(--color-primary-light))]") : (isDaylight ? "text-slate-400" : "text-white/40"))}>+{option.xpReward} XP</span>
                                            </div>
                                        </Button>
                                    );
                                })}
                            </div>
                        ) : (
                            <Button
                                className={cn(
                                    "w-full font-black py-7 text-lg transition-all shadow-lg",
                                    isLate
                                        ? isDaylight
                                            ? "bg-orange-600 hover:bg-orange-500 text-white shadow-orange-200"
                                            : "bg-[rgb(var(--color-accent))] hover:bg-[rgb(var(--color-accent))] text-white"
                                        : isDaylight
                                            ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-200"
                                            : "bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-light))] text-white"
                                )}
                                onClick={() => onComplete(mission.xpReward)}
                            >
                                {isLate ? <Check className="w-5 h-5 mr-2" /> : <Check className="w-5 h-5 mr-2" />}
                                <span className="uppercase tracking-widest">
                                    {isLate ? t.homeMissionCompleteLate : t.homeMissionComplete} (+{mission.xpReward} XP)
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
