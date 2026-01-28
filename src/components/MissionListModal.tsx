"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mission, Gender } from "@/data/missions-data";
import { cn } from "@/lib/utils";
import { Check, CheckCircle2, Sparkles, AlertCircle } from "lucide-react";
import MissionDetailDialog from "./MissionDetailDialog";

interface MissionListModalProps {
    missions: Mission[];
    completed: { [id: string]: { date: string } };
    onMissionClick: (mission: Mission) => void;
    checkValidation: (mission: Mission) => any;
    isMissionCompleted: (id: string, type: any) => boolean;
    children?: React.ReactNode;
}

export default function MissionListModal({
    missions,
    completed,
    onMissionClick,
    checkValidation,
    isMissionCompleted,
    children
}: MissionListModalProps) {
    const [activeTab, setActiveTab] = useState("all");

    // Filter Logic
    const dailyMissions = missions.filter(m => m.phase === 'all_year' || !m.phase);
    const prepMissions = missions.filter(m => m.phase === 'ramadhan_prep');
    const ramadhanMissions = missions.filter(m => m.phase === 'ramadhan_during');

    const renderMissionList = (list: Mission[]) => {
        if (list.length === 0) {
            return (
                <div className="text-center py-8 text-white/40 text-sm">
                    Belum ada misi di kategori ini.
                </div>
            );
        }

        return (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {list.map((mission) => {
                    const isCompleted = isMissionCompleted(mission.id, mission.type);
                    const validation = checkValidation(mission);
                    const isLocked = !isCompleted && validation.locked;
                    const isSpecial = mission.phase === 'ramadhan_prep' || mission.phase === 'ramadhan_during';

                    return (
                        <button
                            key={mission.id}
                            onClick={() => onMissionClick(mission)}
                            className={cn(
                                "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group border",
                                isCompleted
                                    ? "bg-emerald-500/10 border-emerald-500/20"
                                    : isLocked
                                        ? "bg-white/[0.02] border-white/5 opacity-60"
                                        : isSpecial
                                            ? "bg-amber-900/10 border-amber-500/30 hover:bg-amber-900/20"
                                            : "bg-white/5 border-white/10 hover:bg-white/10"
                            )}
                        >
                            <span className={cn(
                                "text-2xl transition-all p-2 rounded-lg bg-black/20",
                                isCompleted && "grayscale opacity-50"
                            )}>
                                {mission.icon}
                            </span>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <p className={cn(
                                        "text-sm font-semibold truncate pr-2",
                                        isCompleted ? "text-emerald-400 line-through" : isSpecial ? "text-amber-200" : "text-white"
                                    )}>
                                        {mission.title}
                                    </p>
                                    <div className="flex gap-1">
                                        <span className={cn(
                                            "text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider",
                                            mission.hukum === 'wajib'
                                                ? "bg-blue-500/20 text-blue-400"
                                                : "bg-emerald-500/20 text-emerald-400"
                                        )}>
                                            {mission.hukum}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-xs text-white/50 truncate mb-1">{mission.description}</p>

                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-amber-400 font-mono">+{mission.xpReward} XP</span>

                                    {isLocked && (
                                        <span className="text-[9px] text-red-400 flex items-center gap-0.5">
                                            <AlertCircle className="w-3 h-3" /> {validation.reason}
                                        </span>
                                    )}
                                    {!isLocked && validation.isEarly && (
                                        <span className="text-[9px] text-emerald-400 flex items-center gap-0.5">
                                            <Sparkles className="w-3 h-3" /> Awal Waktu
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                                isCompleted
                                    ? "bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                    : "border-2 border-white/10 group-hover:border-white/30"
                            )}>
                                {isCompleted && <Check className="w-4 h-4" />}
                            </div>
                        </button>
                    );
                })}
            </div>
        );
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="w-[95%] max-w-md max-h-[90vh] bg-black/95 backdrop-blur-xl border-white/10 text-white p-0 overflow-hidden rounded-[24px]">
                <DialogHeader className="p-4 pb-2 border-b border-white/10 bg-white/5">
                    <DialogTitle className="text-lg font-bold flex items-center gap-2">
                        🎯 Daftar Misi Lengkap
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col h-full">
                    <div className="px-4 py-2 bg-black/20 scrollbar-hide overflow-x-auto">
                        <TabsList className="bg-transparent h-auto p-0 gap-2 flex w-max">
                            <TabsTrigger
                                value="all"
                                className="rounded-full bg-white/5 data-[state=active]:bg-white data-[state=active]:text-black text-xs px-4 py-2 h-auto"
                            >
                                Semua
                            </TabsTrigger>
                            <TabsTrigger
                                value="daily"
                                className="rounded-full bg-white/5 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-xs px-4 py-2 h-auto"
                            >
                                📋 Harian
                            </TabsTrigger>
                            <TabsTrigger
                                value="prep"
                                className="rounded-full bg-white/5 data-[state=active]:bg-amber-500 data-[state=active]:text-black text-xs px-4 py-2 h-auto flex items-center gap-1"
                            >
                                <Sparkles className="w-3 h-3" /> Persiapan
                            </TabsTrigger>
                            <TabsTrigger
                                value="ramadhan"
                                className="rounded-full bg-white/5 data-[state=active]:bg-emerald-500 data-[state=active]:text-black text-xs px-4 py-2 h-auto"
                            >
                                🌙 Ramadhan
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="p-4 bg-gradient-to-b from-transparent to-black/50 flex-1 overflow-hidden">
                        <TabsContent value="all" className="mt-0 h-full">{renderMissionList(missions)}</TabsContent>
                        <TabsContent value="daily" className="mt-0 h-full">{renderMissionList(dailyMissions)}</TabsContent>
                        <TabsContent value="prep" className="mt-0 h-full">{renderMissionList(prepMissions)}</TabsContent>
                        <TabsContent value="ramadhan" className="mt-0 h-full">{renderMissionList(ramadhanMissions)}</TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
