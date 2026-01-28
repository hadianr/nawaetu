"use client";

import { useState } from "react";
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
import { Check, Lock, BookOpen, Info, ChevronRight, ChevronLeft } from "lucide-react";
import { Mission, ValidationType } from "@/data/missions-data";
import { MISSION_CONTENTS, MissionContent } from "@/data/mission-content";
import { cn } from "@/lib/utils";

interface MissionDetailDialogProps {
    mission: Mission;
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
    isCompleted: boolean;
    isLocked: boolean;
    lockReason?: string;
}

export default function MissionDetailDialog({
    mission,
    isOpen,
    onClose,
    onComplete,
    isCompleted,
    isLocked,
    lockReason
}: MissionDetailDialogProps) {
    const content = MISSION_CONTENTS[mission.id];
    const [readingIndex, setReadingIndex] = useState(0);

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
            <DialogContent className="bg-[#0a0a0a] border-white/10 text-white max-w-md max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
                <DialogHeader className="p-6 pb-2">
                    <div className="flex items-center gap-3">
                        <div className="text-3xl bg-white/5 w-12 h-12 rounded-xl flex items-center justify-center border border-white/10">
                            {mission.icon}
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold">{mission.title}</DialogTitle>
                            <p className="text-xs text-white/50 mt-1">{mission.description}</p>
                        </div>
                        <div className="ml-auto flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-full border border-amber-500/20">
                            <span className="text-xs font-bold text-amber-500">+{mission.xpReward} XP</span>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col">
                    {content ? (
                        <Tabs defaultValue="guide" className="flex-1 flex flex-col">
                            <div className="px-6 border-b border-white/10">
                                <TabsList className="w-full bg-transparent p-0 h-auto justify-start gap-6">
                                    <TabsTrigger
                                        value="guide"
                                        className="bg-transparent p-0 pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-white/40 data-[state=active]:text-emerald-500 text-sm font-medium"
                                    >
                                        Panduan
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="info"
                                        className="bg-transparent p-0 pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-white/40 data-[state=active]:text-emerald-500 text-sm font-medium"
                                    >
                                        Info & Dalil
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

                                        {/* If Readings Exist (Dzikir/Doa) */}
                                        {content.readings && content.readings.length > 0 && (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between text-xs text-white/40 uppercase tracking-widest font-bold">
                                                    <span>Bacaan {readingIndex + 1} dari {content.readings.length}</span>
                                                    {currentReading?.note && (
                                                        <span className="text-emerald-400">{currentReading.note}</span>
                                                    )}
                                                </div>

                                                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-4 relative min-h-[300px] flex flex-col justify-center">
                                                    <div>
                                                        {currentReading?.title && (
                                                            <h4 className="text-sm font-bold text-emerald-400 mb-2">{currentReading.title}</h4>
                                                        )}
                                                        <p className="text-xl md:text-2xl font-serif leading-loose text-right text-white">
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
                                                        <ChevronLeft className="w-4 h-4 mr-1" /> Sebelumnya
                                                    </Button>
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={handleNextReading}
                                                        disabled={readingIndex === (content.readings.length - 1)}
                                                        className="bg-white/10 hover:bg-white/20 text-white border border-white/10"
                                                    >
                                                        Selanjutnya <ChevronRight className="w-4 h-4 ml-1" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {/* If Steps/Guides Exist (Sholat) */}
                                        {content.guides && (
                                            <div className="space-y-3">
                                                <h3 className="text-sm font-bold text-white mb-2">Langkah-langkah:</h3>
                                                <div className="space-y-3">
                                                    {content.guides.map((step, idx) => (
                                                        <div key={idx} className="flex gap-3 text-sm">
                                                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
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
                                                <h3 className="flex items-center gap-2 text-sm font-bold text-amber-400">
                                                    <SparklesIcon className="w-4 h-4" /> Keutamaan (Fadhilah)
                                                </h3>
                                                <ul className="space-y-2">
                                                    {content.fadhilah.map((item, idx) => (
                                                        <li key={idx} className="flex gap-2 text-sm text-white/80 bg-white/5 p-3 rounded-lg border border-white/5">
                                                            <span className="text-amber-500">•</span>
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {mission.dalil && (
                                            <div className="space-y-2">
                                                <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                                                    <BookOpen className="w-4 h-4" /> Sumber Dalil
                                                </h3>
                                                <div className="bg-emerald-950/30 p-4 rounded-xl border border-emerald-500/20">
                                                    <p className="text-sm text-white/90 italic">"{mission.dalil}"</p>
                                                    {content.source && (
                                                        <p className="text-xs text-emerald-400 mt-2 font-medium">Ref: {content.source}</p>
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
                                Belum ada detail konten untuk misi ini. Lakukan sesuai instruksi singkat di atas.
                            </p>
                            {mission.dalil && (
                                <div className="mt-4 bg-white/5 p-4 rounded-xl border border-white/10 w-full">
                                    <p className="text-xs text-emerald-400 font-bold mb-1">Dalil:</p>
                                    <p className="text-sm italic text-white/80">{mission.dalil}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-white/10 bg-[#0F0F0F]">
                    {isCompleted ? (
                        <div className="flex flex-col gap-2">
                            <Button className="w-full bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/10 border border-emerald-500/20 cursor-default" disabled>
                                <Check className="w-4 h-4 mr-2" /> Misi Sudah Selesai
                            </Button>
                        </div>
                    ) : isLocked ? (
                        <Button className="w-full bg-white/5 text-white/40 hover:bg-white/5 border border-white/10" disabled>
                            <Lock className="w-4 h-4 mr-2" /> {lockReason || "Terkunci"}
                        </Button>
                    ) : (
                        <Button
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-6 text-base"
                            onClick={onComplete}
                        >
                            <Check className="w-4 h-4 mr-2" /> Selesaikan Misi (+{mission.xpReward} XP)
                        </Button>
                    )}
                </div>
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
