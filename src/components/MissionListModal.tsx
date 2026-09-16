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
import type { Mission } from "@/data/missions";
import { cn } from "@/lib/utils";
import { Check, Sparkles, AlertCircle, X, ExternalLink } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { getRulingLabel, type ValidationResult } from "@/lib/habits/mission-utils";
import { THEMES, useTheme } from "@/context/ThemeContext";
import { resolveReferenceForMission } from "@/lib/hadith/reference-matcher";

interface MissionListModalProps {
    missions: Mission[];
    completed: { [id: string]: { date: string } };
    onMissionClick: (mission: Mission) => void;
    checkValidation: (mission: Mission) => ValidationResult;
    isMissionCompleted: (id: string, type: Mission['type']) => boolean;
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
    onMissionClick,
    checkValidation,
    isMissionCompleted,
    children,
    isOpen,
    onOpenChange,
    initialTab
}: MissionListModalProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState(initialTab || "all");
    const { t } = useLocale();
    const { currentTheme } = useTheme();
    const isDaylight = THEMES[currentTheme].mode === "light";

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
                                    ? (isDaylight ? "bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))] opacity-70" : "bg-black/20 border-white/5 opacity-60")
                                        : (isDaylight ? "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-primary))]/5" : "bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10")
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
                                        isCompleted ? "text-[rgb(var(--color-text-muted))] line-through" : isSpecial ? (isDaylight ? "text-[rgb(var(--color-accent-foreground))]" : "text-amber-200") : (isDaylight ? "text-[rgb(var(--color-text-strong))]" : "text-white")
                                    )}>
                                        {mission.title}
                                    </p>
                                    <div className="flex gap-1">
                                        <span className={cn(
                                            "text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border",
                                            mission.ruling === 'obligatory'
                                                ? "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary-strong))] border-[rgb(var(--color-primary-light))]"
                                                : "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary-strong))] border-[rgb(var(--color-primary-light))]"
                                        )}>
                                            {getRulingLabel(mission.ruling, t)}
                                        </span>
                                    </div>
                                </div>

                                <p className={cn("text-xs truncate mb-1", isDaylight ? "text-[rgb(var(--color-text-muted))]" : "text-white/50")}>{mission.description}</p>

                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className={cn("text-[10px] font-mono", isDaylight ? "text-[rgb(var(--color-accent))]" : "text-amber-400")}>+{mission.hasanahReward} Hasanah</span>

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
                                        <span className={cn("text-[9px] flex items-center gap-0.5 px-1.5 py-0.5 rounded border", isDaylight ? "text-[rgb(var(--color-text-muted))] bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))]" : "text-white/30 bg-white/5 border-white/5")}>
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
                                    ? "bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))] shadow-[0_0_10px_rgb(var(--color-primary)/0.35)]"
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
                className={cn("mission-list-modal w-[95%] max-w-md h-auto max-h-[85vh] p-0 overflow-hidden rounded-[32px] flex flex-col", isDaylight ? "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))] text-[rgb(var(--color-text-strong))] shadow-[var(--shadow-floating)]" : "bg-black/40 backdrop-blur-xl border border-white/10 text-white shadow-2xl")}
                onOpenAutoFocus={() => {
                    if (initialTab) setActiveTab(initialTab);
                }}
            >
                <DialogHeader className={cn("p-5 pb-3 border-b relative", isDaylight ? "border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))]" : "border-white/5 bg-white/[0.02]")}>
                    <button
                        onClick={() => finalOnOpenChange?.(false)}
                        className={cn("absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full transition-colors z-20", isDaylight ? "bg-[rgb(var(--color-primary))]/10 hover:bg-[rgb(var(--color-primary))]/20" : "bg-white/5 hover:bg-white/10")}
                    >
                        <X className={cn("w-4 h-4", isDaylight ? "text-[rgb(var(--color-text-muted))]" : "text-white/70")} />
                    </button>
                    <DialogTitle className="text-lg font-bold flex items-center gap-2">
                        {t.home_mission_list_title}
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col overflow-hidden">
                    <div className={cn(
                        "px-5 py-4 border-b overflow-x-auto scrollbar-hide mission-tabs-container",
                        isDaylight ? "bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))]" : "bg-black/20 border-white/5"
                    )}>
                        <TabsList className="bg-transparent h-auto p-0 gap-3 flex flex-nowrap w-max justify-start items-center border-none shadow-none ring-0 mission-tabs-list">
                            {tabs.map(tab => (
                                <TabsTrigger
                                    key={tab.id}
                                    value={tab.id}
                                    className={cn(
                                        "rounded-full border text-xs px-4 py-2 h-auto transition-all flex-none mission-tab-trigger",
                                        isDaylight
                                            ? "border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-primary))]/10 data-[state=active]:bg-[rgb(var(--color-primary))] data-[state=active]:text-[rgb(var(--color-primary-foreground))] data-[state=active]:border-[rgb(var(--color-primary))] shadow-sm"
                                            : `border-white/10 bg-white/5 text-white/60 hover:bg-white/10 ${tab.activeColorClass}`
                                    )}
                                >
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    <div className={cn("px-4 pt-3 pb-5 flex-1 overflow-hidden", isDaylight ? "bg-[rgb(var(--color-surface))]" : "bg-gradient-to-b from-white/[0.02] to-transparent")}>
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
