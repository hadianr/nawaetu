"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mission, Gender, getLocalizedMission } from "@/data/missions-data";
import { cn } from "@/lib/utils";
import { Check, CheckCircle2, Sparkles, AlertCircle } from "lucide-react";
import MissionDetailDialog from "./MissionDetailDialog";
import { useLocale } from "@/context/LocaleContext";

interface MissionListModalProps {
    missions: Mission[];
    completed: { [id: string]: { date: string } };
    onMissionClick: (mission: Mission) => void;
    checkValidation: (mission: Mission) => any;
    isMissionCompleted: (id: string, type: any) => boolean;
    children?: React.ReactNode;
    hijriDate?: string;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    initialTab?: string;
}

export default function MissionListModal({
    missions,
    completed,
    onMissionClick,
    checkValidation,
    isMissionCompleted,
    children,
    hijriDate,
    isOpen,
    onOpenChange,
    initialTab
}: MissionListModalProps) {
    const [activeTab, setActiveTab] = useState(initialTab || "all");
    const { t } = useLocale();

    const getHukumLabel = (hukum: string) => {
        const labels: Record<string, keyof typeof t> = {
            'wajib': 'hukumWajib',
            'sunnah': 'hukumSunnah',
            'mubah': 'hukumMubah',
            'makruh': 'hukumMakruh',
            'harram': 'hukumHaram'
        };
        return t[labels[hukum]] || hukum;
    };

    // Sync active tab if initialTab changes (re-opening logic)
    // Note: In a real app we might want a useEffect on open.
    // However, Shadcn Dialog remounts content? No.
    // Let's use a key or effect.

    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = isOpen !== undefined;

    const finalOpen = isControlled ? isOpen : internalOpen;
    const finalOnOpenChange = isControlled ? onOpenChange : setInternalOpen;

    // Reset tab when opening if initialTab is provided
    // Simple approach: When finalOpen becomes true, set tab.
    // But we can't detect change easily without effect.

    // Dynamic Tab Logic
    const isRamadhan = hijriDate?.toLowerCase().includes("ramadhan") || hijriDate?.toLowerCase().includes("ramadan");
    const isSyaban = hijriDate?.toLowerCase().includes("sha'ban") ||
        hijriDate?.toLowerCase().includes("syaban") ||
        hijriDate?.toLowerCase().includes("sya'ban") ||
        hijriDate?.toLowerCase().includes("shaban") ||
        hijriDate?.toLowerCase().includes("sha’ban") ||
        hijriDate?.toLowerCase().includes("shaʿbān");

    // Filtering
    const dailyMissions = missions.filter(m => m.type === 'daily' && (m.phase === 'all_year' || !m.phase));
    const weeklyMissions = missions.filter(m => m.type === 'weekly');
    // const prepMissions = missions.filter(m => m.phase === 'ramadhan_prep');

    const seasonalMissions = isRamadhan
        ? missions.filter(m => m.phase === 'ramadhan_during')
        : missions.filter(m => m.phase === 'ramadhan_prep');

    const sortMissions = (list: Mission[]) => {
        return [...list].sort((a, b) => {
            const aCompleted = isMissionCompleted(a.id, a.type);
            const bCompleted = isMissionCompleted(b.id, b.type);

            if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;
            if (a.hukum === 'wajib' && b.hukum !== 'wajib') return -1;
            if (b.hukum === 'wajib' && a.hukum !== 'wajib') return 1;

            return 0;
        });
    };

    const renderMissionList = (list: Mission[]) => {
        const sortedList = sortMissions(list);

        if (sortedList.length === 0) {
            return (
                <div className="text-center py-8 text-white/40 text-sm">
                    {t.missionEmptyCategory}
                </div>
            );
        }

        return (
            <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1 pb-20 custom-scrollbar">
                {sortedList.map((mission) => {
                    const isCompleted = isMissionCompleted(mission.id, mission.type);
                    const validation = checkValidation(mission);
                    const isLocked = !isCompleted && validation.locked;
                    const isSpecial = mission.phase === 'ramadhan_prep' || mission.phase === 'ramadhan_during';

                    return (
                        <button
                            key={mission.id}
                            onClick={() => onMissionClick(mission)}
                            className={cn(
                                "w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all text-left group relative overflow-hidden",
                                "border backdrop-blur-sm",
                                isCompleted
                                    ? "bg-black/20 border-white/5 opacity-60"
                                    : "bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10"
                            )}
                        >
                            {!isCompleted && !isLocked && (
                                <div className={cn(
                                    "absolute left-0 top-0 bottom-0 w-1 opacity-80",
                                    mission.hukum === 'wajib' ? "bg-blue-500" : "bg-emerald-500/50"
                                )} />
                            )}

                            <span className={cn(
                                "text-2xl transition-all p-2 rounded-xl bg-black/20",
                                isCompleted && "grayscale opacity-50"
                            )}>
                                {mission.icon}
                            </span>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <p className={cn(
                                        "text-sm font-semibold truncate pr-2",
                                        isCompleted ? "text-emerald-400/50 line-through" : isSpecial ? "text-amber-200" : "text-white"
                                    )}>
                                        {mission.title}
                                    </p>
                                    <div className="flex gap-1">
                                        <span className={cn(
                                            "text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border",
                                            mission.hukum === 'wajib'
                                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                        )}>
                                            {getHukumLabel(mission.hukum)}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-xs text-white/50 truncate mb-1">{mission.description}</p>

                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-amber-400 font-mono">+{mission.xpReward} XP</span>

                                    {isLocked && (
                                        <span className="text-[9px] text-white/30 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
                                            {t.homeMissionLocked}
                                        </span>
                                    )}
                                    {!isLocked && validation.isLate && (
                                        <span className="text-[9px] text-red-400 flex items-center gap-1 font-bold bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                                            <AlertCircle className="w-3 h-3" /> {t.homeMissionLate}
                                        </span>
                                    )}
                                    {!isLocked && validation.isEarly && (
                                        <span className="text-[9px] text-emerald-400 flex items-center gap-1 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                            <Sparkles className="w-3 h-3" /> {t.homeMissionEarly}
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
        <Dialog open={finalOpen} onOpenChange={finalOnOpenChange}>
            {children && (
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>
            )}
            <DialogContent
                className="w-[95%] max-w-md h-auto max-h-[85vh] bg-black/40 backdrop-blur-xl border border-white/10 text-white p-0 overflow-hidden rounded-[32px] shadow-2xl flex flex-col"
                onOpenAutoFocus={(e) => {
                    // Update tab when opened if initialTab is set
                    if (initialTab) setActiveTab(initialTab);
                }}
            >
                <DialogHeader className="p-5 pb-3 border-b border-white/5 bg-white/[0.02]">
                    <DialogTitle className="text-lg font-bold flex items-center gap-2">
                        {t.homeMissionListTitle}
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col overflow-hidden">
                    <div className="px-5 py-4 bg-black/20 border-b border-white/5 overflow-x-auto scrollbar-hide">
                        <TabsList className="bg-transparent h-auto p-0 gap-3 flex flex-nowrap w-max justify-start items-center border-none shadow-none ring-0">
                            <TabsTrigger
                                value="all"
                                className="rounded-full border border-white/5 bg-white/5 hover:bg-white/10 hover:text-white data-[state=active]:bg-white data-[state=active]:text-black text-xs px-4 py-2 h-auto text-white/60 transition-all flex-none"
                            >
                                {t.missionTabAll}
                            </TabsTrigger>
                            <TabsTrigger
                                value="daily"
                                className="rounded-full border border-white/5 bg-white/5 hover:bg-white/10 hover:text-white data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:border-blue-500/50 text-xs px-4 py-2 h-auto text-white/60 transition-all flex-none"
                            >
                                {t.missionTabDaily}
                            </TabsTrigger>

                            <TabsTrigger
                                value="weekly"
                                className="rounded-full border border-white/5 bg-white/5 hover:bg-white/10 hover:text-white data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:border-purple-500/50 text-xs px-4 py-2 h-auto text-white/60 transition-all flex-none"
                            >
                                {t.missionTabWeekly}
                            </TabsTrigger>

                            <TabsTrigger
                                value="seasonal"
                                className={cn(
                                    "rounded-full border border-white/5 bg-white/5 hover:bg-white/10 hover:text-white text-xs px-4 py-2 h-auto text-white/60 transition-all flex items-center gap-1 flex-none",
                                    isRamadhan
                                        ? "data-[state=active]:bg-emerald-500 data-[state=active]:text-black"
                                        : "data-[state=active]:bg-amber-500 data-[state=active]:text-black"
                                )}
                            >
                                {isRamadhan ? t.missionTabRamadhan : isSyaban ? t.missionTabSyaban : t.missionTabSeasonal}
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="p-5 bg-gradient-to-b from-white/[0.02] to-transparent flex-1 overflow-hidden">
                        <TabsContent value="all" className="mt-0 h-full">{renderMissionList(missions)}</TabsContent>
                        <TabsContent value="daily" className="mt-0 h-full">{renderMissionList(dailyMissions)}</TabsContent>
                        <TabsContent value="weekly" className="mt-0 h-full">{renderMissionList(weeklyMissions)}</TabsContent>

                        <TabsContent value="seasonal" className="mt-0 h-full">
                            {seasonalMissions.length > 0 ? renderMissionList(seasonalMissions) : (
                                <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                                    <Sparkles className="w-8 h-8 text-white/20 mb-3" />
                                    <p className="text-sm font-medium text-white/60">{t.missionEmptySeasonalTitle}</p>
                                    <p className="text-xs text-white/40 mt-1">{t.missionEmptySeasonalDesc}</p>
                                </div>
                            )}
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
