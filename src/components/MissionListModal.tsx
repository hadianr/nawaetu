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

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mission } from "@/data/missions";
import { cn } from "@/lib/utils";
import { Check, Sparkles, AlertCircle, X, ExternalLink, BookOpen } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { getRulingLabel } from "@/lib/habits/mission-utils";
import { useTheme } from "@/context/ThemeContext";
import { resolveReferenceForMission } from "@/lib/hadith/reference-matcher";

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

/**
 * Worship filter tab configuration (All, Obligatory, Sunnah Prayer, Dhikr, Fasting, Quran, Recommended).
 */
type MissionTabType = 'all' | 'obligatory' | 'sunnah_prayer' | 'dhikr' | 'fasting' | 'quran' | 'recommended';

interface TabDefinition {
    id: MissionTabType;
    label: string;
    activeColorClass: string;
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
    const router = useRouter();
    const [activeTab, setActiveTab] = useState(initialTab || "all");
    const { t } = useLocale();
    const { currentTheme } = useTheme();
    const isDaylight = currentTheme === "daylight";

    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = isOpen !== undefined;

    const finalOpen = isControlled ? isOpen : internalOpen;
    const finalOnOpenChange = isControlled ? onOpenChange : setInternalOpen;

    // Worship filter tabs list
    const tabs: TabDefinition[] = useMemo(() => [
        { id: 'all', label: t.missionTabAll || "All", activeColorClass: "data-[state=active]:bg-white data-[state=active]:text-black" },
        { id: 'obligatory', label: t.missionTabObligatory || "⭐ Obligatory", activeColorClass: "data-[state=active]:bg-blue-500 data-[state=active]:text-white" },
        { id: 'sunnah_prayer', label: t.missionTabSunnahPrayer || "🕌 Sunnah Prayer", activeColorClass: "data-[state=active]:bg-purple-500 data-[state=active]:text-white" },
        { id: 'dhikr', label: t.missionTabDhikr || "📿 Dhikr", activeColorClass: "data-[state=active]:bg-amber-500 data-[state=active]:text-black" },
        { id: 'fasting', label: t.missionTabFasting || "🌙 Fasting", activeColorClass: "data-[state=active]:bg-indigo-500 data-[state=active]:text-white" },
        { id: 'quran', label: t.missionTabQuran || "📖 Quran", activeColorClass: "data-[state=active]:bg-teal-500 data-[state=active]:text-white" },
        { id: 'recommended', label: t.missionTabRecommended || "✨ Recommended", activeColorClass: "data-[state=active]:bg-emerald-500 data-[state=active]:text-black" }
    ], [t]);

    // Grouping & Sorting Missions with useMemo for performance optimization
    const sortedMissionsMap = useMemo(() => {
        const filterByTab = (type: MissionTabType) => {
            if (type === 'obligatory') {
                return missions.filter(m => m.ruling === 'obligatory');
            }
            if (type === 'sunnah_prayer') {
                return missions.filter(m => m.category === 'prayer' && m.ruling !== 'obligatory');
            }
            if (type === 'dhikr') {
                return missions.filter(m => m.category === 'dhikr');
            }
            if (type === 'fasting') {
                return missions.filter(m => m.category === 'fasting');
            }
            if (type === 'quran') {
                return missions.filter(m => m.category === 'quran');
            }
            if (type === 'recommended') {
                return missions.filter(m => m.ruling === 'sunnah' || m.ruling === 'permissible');
            }
            return missions;
        };

        const sortList = (list: Mission[]) => {
            return [...list].sort((a, b) => {
                const aCompleted = isMissionCompleted(a.id, a.type);
                const bCompleted = isMissionCompleted(b.id, b.type);

                if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;
                if (a.ruling === 'obligatory' && b.ruling !== 'obligatory') return -1;
                if (b.ruling === 'obligatory' && a.ruling !== 'obligatory') return 1;

                return 0;
            });
        };

        return {
            all: sortList(filterByTab('all')),
            obligatory: sortList(filterByTab('obligatory')),
            sunnah_prayer: sortList(filterByTab('sunnah_prayer')),
            dhikr: sortList(filterByTab('dhikr')),
            fasting: sortList(filterByTab('fasting')),
            quran: sortList(filterByTab('quran')),
            recommended: sortList(filterByTab('recommended'))
        };
    }, [missions, isMissionCompleted]);

    const renderMissionList = (sortedList: Mission[]) => {
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
                                    mission.ruling === 'obligatory' ? "bg-blue-500" : "bg-emerald-500/50"
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
                                            mission.ruling === 'obligatory'
                                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                        )}>
                                            {getRulingLabel(mission.ruling, t)}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-xs text-white/50 truncate mb-1">{mission.description}</p>

                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className="text-[10px] text-amber-400 font-mono">+{mission.hasanahReward} Hasanah</span>

                                    {mission.dalil && (() => {
                                        const ref = resolveReferenceForMission(mission);
                                        return (
                                            <span
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (ref?.targetUrl) {
                                                        finalOnOpenChange?.(false);
                                                        router.push(ref.targetUrl);
                                                    }
                                                }}
                                                className={cn(
                                                    "text-[9px] px-1.5 py-0.5 rounded font-mono flex items-center gap-1 border transition-colors cursor-pointer",
                                                    ref
                                                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20 hover:underline"
                                                        : "bg-white/5 text-white/40 border-white/5"
                                                )}
                                                title={ref ? (ref.type === "hadith" ? (t.dalilViewHadithDetails || "Lihat rincian hadits") : (t.dalilViewDuaDetails || "Lihat rincian doa")) : mission.dalil}
                                            >
                                                <span>📖 {mission.dalil}</span>
                                                {ref && <ExternalLink className="w-2.5 h-2.5" />}
                                            </span>
                                        );
                                    })()}

                                    {isLocked && (
                                        <span className="text-[9px] text-white/30 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
                                            {t.home_mission_locked}
                                        </span>
                                    )}
                                    {!isLocked && validation.isLate && (
                                        <span className="text-[9px] text-red-400 flex items-center gap-1 font-bold bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                                            <AlertCircle className="w-3 h-3" /> {t.home_mission_late}
                                        </span>
                                    )}
                                    {!isLocked && validation.isEarly && (
                                        <span className="text-[9px] text-emerald-400 flex items-center gap-1 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                            <Sparkles className="w-3 h-3" /> {t.home_mission_early}
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
                showCloseButton={false}
                className="w-[95%] max-w-md h-auto max-h-[85vh] bg-black/40 backdrop-blur-xl border border-white/10 text-white p-0 overflow-hidden rounded-[32px] shadow-2xl flex flex-col"
                onOpenAutoFocus={() => {
                    if (initialTab) setActiveTab(initialTab);
                }}
            >
                <DialogHeader className="p-5 pb-3 border-b border-white/5 bg-white/[0.02] relative">
                    <button
                        onClick={() => finalOnOpenChange?.(false)}
                        className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors z-20"
                    >
                        <X className="w-4 h-4 text-white/70" />
                    </button>
                    <DialogTitle className="text-lg font-bold flex items-center gap-2">
                        {t.home_mission_list_title}
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col overflow-hidden">
                    <div className={cn(
                        "px-5 py-4 border-b overflow-x-auto scrollbar-hide mission-tabs-container",
                        isDaylight ? "bg-slate-100/80 border-slate-200" : "bg-black/20 border-white/5"
                    )}>
                        <TabsList className="bg-transparent h-auto p-0 gap-3 flex flex-nowrap w-max justify-start items-center border-none shadow-none ring-0 mission-tabs-list">
                            {tabs.map(tab => (
                                <TabsTrigger
                                    key={tab.id}
                                    value={tab.id}
                                    className={cn(
                                        "rounded-full border text-xs px-4 py-2 h-auto transition-all flex-none mission-tab-trigger",
                                        isDaylight
                                            ? "shadow-sm"
                                            : `border-white/10 bg-white/5 text-white/60 hover:bg-white/10 ${tab.activeColorClass}`
                                    )}
                                >
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    <div className="p-5 bg-gradient-to-b from-white/[0.02] to-transparent flex-1 overflow-hidden">
                        {tabs.map(tab => (
                            <TabsContent key={tab.id} value={tab.id} className="mt-0 h-full">
                                {renderMissionList(sortedMissionsMap[tab.id])}
                            </TabsContent>
                        ))}
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
