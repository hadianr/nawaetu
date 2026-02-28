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

/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 */

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Mission } from "@/data/missions";
import { addXP } from "@/lib/leveling";
import { updateStreak } from "@/lib/streak-utils";
import { cn } from "@/lib/utils";
import { usePrayerTimesContext } from "@/context/PrayerTimesContext";
import { useMissions } from "@/hooks/useMissions";
import MissionDetailDialog from "./MissionDetailDialog";
import MissionListModal from "./MissionListModal";
import { getRulingLabel } from "@/lib/mission-utils";
import MissionSkeleton from "@/components/skeleton/MissionSkeleton";
import { useLocale } from "@/context/LocaleContext";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import IntentionInputForm from "./intentions/IntentionInputForm";
import ReflectionInputForm from "./intentions/ReflectionInputForm";
import IntentionPrompt from "./intentions/IntentionPrompt";
import DailyMissionCard from "./missions/DailyMissionCard";
import { useWidgetMissions } from "@/hooks/useWidgetMissions";

export default function MissionsWidget() {
    const { data: session } = useSession();
    const { t } = useLocale();
    const { completedMissions, completeMission, undoCompleteMission } = useMissions();

    // Extracted Custom Hook for Missions Logic
    const { missions, widgetMissions, gender, isMissionCompleted, checkValidation } = useWidgetMissions(completedMissions as any);

    const [mounted, setMounted] = useState(false);
    const [userToken, setUserToken] = useState<string | null>(null);
    const [todayIntention, setTodayIntention] = useState<{
        id: string;
        text: string;
        reflection?: { rating: number; text: string } | null;
    } | null>(null);

    // Dialog State
    const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Intention Prompt State
    const [showIntentionPrompt, setShowIntentionPrompt] = useState(false);

    const { data: prayerData } = usePrayerTimesContext();

    // Convert completedMissions array to object for MissionListModal compatibility
    const completedMissionsMap = Array.isArray(completedMissions)
        ? completedMissions.reduce((acc, m) => {
            const completedDate = new Date(m.completedAt).toISOString().split('T')[0];
            acc[m.id] = { date: completedDate };
            return acc;
        }, {} as Record<string, { date: string }>)
        : {};

    useEffect(() => {
        setMounted(true);
        let token = localStorage.getItem("user_token");
        if (!token) {
            try {
                token = crypto.randomUUID();
            } catch (e) {
                token = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            }
            localStorage.setItem("user_token", token);
        }
        setUserToken(token);
    }, []);

    // Fetch Today's Intention
    useEffect(() => {
        if (!userToken) return;
        const fetchIntention = async () => {
            try {
                const res = await fetch(`/api/intentions/today`, {
                    headers: { 'Authorization': `Bearer ${userToken}` }
                });
                const data = await res.json();
                if (data.success && data.data.has_intention) {
                    setTodayIntention({
                        id: data.data.intention.id,
                        text: data.data.intention.intention_text,
                        reflection: data.data.has_reflection ? data.data.reflection : null
                    });
                }
            } catch (error) {
            }
        };
        fetchIntention();
    }, [userToken]);

    const handleMissionClick = (mission: Mission) => {
        setSelectedMission(mission);
        setIsDialogOpen(true);
    };

    const handleCompleteMission = (xpAmount?: number) => {
        if (!selectedMission) return;
        const reward = xpAmount || selectedMission.xpReward;
        addXP(reward);
        window.dispatchEvent(new CustomEvent("xp_updated"));

        const todayStr = new Date().toISOString().split('T')[0];
        const completedCountToday = completedMissions.filter(m => {
            const completedDate = m.completedAt.split('T')[0];
            return completedDate === todayStr;
        }).length;
        if (completedCountToday === 0) {
            updateStreak();
        }

        completeMission(selectedMission.id, reward);
        window.dispatchEvent(new CustomEvent("mission_storage_updated"));

        const messages = [
            t.toastMissionMsg1,
            t.toastMissionMsg2,
            t.toastMissionMsg3,
            t.toastMissionMsg4
        ];
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];

        toast.success(t.toastMissionComplete, {
            description: `${randomMsg} (+${reward} XP)`,
            duration: 3000,
            icon: "🎉"
        });
        setIsDialogOpen(false);
    };

    const handleResetMission = () => {
        if (!selectedMission) return;
        addXP(-selectedMission.xpReward);
        window.dispatchEvent(new CustomEvent("xp_updated"));
        undoCompleteMission(selectedMission.id);

        toast.info((t as any).mission_dialog_undo_title, {
            description: `${selectedMission.title} ${(t as any).mission_dialog_undo_desc} (-${selectedMission.xpReward} XP)`,
            duration: 3000,
            icon: "🔄"
        });
        setIsDialogOpen(false);
    };

    const handleIntentionSubmit = async (text: string) => {
        if (!userToken) return;
        try {
            const response = await fetch("/api/intentions/daily", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_token: userToken, intention_text: text }),
            });
            const data = await response.json();
            if (data.success) {
                const mission = missions.find(m => m.id === 'daily_intention');
                if (mission) {
                    addXP(mission.xpReward);
                    window.dispatchEvent(new CustomEvent("xp_updated"));
                    const todayStr = new Date().toISOString().split('T')[0];
                    const completedCountToday = completedMissions.filter(m => {
                        const completedDate = m.completedAt.split('T')[0];
                        return completedDate === todayStr;
                    }).length;
                    if (completedCountToday === 0) updateStreak();
                    completeMission(mission.id, mission.xpReward);
                    window.dispatchEvent(new CustomEvent("mission_storage_updated"));
                    setTodayIntention({ id: data.data.id, text: text, reflection: null });
                    toast.success(t.toastMissionComplete, {
                        description: `${t.intention_success_title} (+${mission.xpReward} XP)`,
                        duration: 3000,
                        icon: "🎉"
                    });
                }
                setShowIntentionPrompt(false);
            } else toast.error(t.intention_error_fail_save_niat);
        } catch {
            toast.error(t.intention_error_generic);
        }
    };

    // Modal Control State
    const [showMissionModal, setShowMissionModal] = useState(false);
    const [initialModalTab, setInitialModalTab] = useState("all");

    useEffect(() => {
        const handleOpenModal = (e: any) => {
            if (e.detail?.tab) setInitialModalTab(e.detail.tab);
            setShowMissionModal(true);
        };
        window.addEventListener("open_mission_modal", handleOpenModal);
        return () => window.removeEventListener("open_mission_modal", handleOpenModal);
    }, []);

    const completedCount = missions.filter(m => isMissionCompleted(m.id, m.type)).length;
    const displayMissions = widgetMissions.slice(0, 2);

    if (!mounted) return <MissionSkeleton />;

    return (
        <div className={cn(
            "relative overflow-hidden rounded-3xl p-4 sm:p-5 transition-all group",
            "bg-black/20 backdrop-blur-md border border-white/10 hover:bg-black/30 hover:border-white/20"
        )}>
            <div className={cn(
                "absolute top-0 right-0 w-32 h-32 rounded-full blur-[50px] pointer-events-none opacity-20 transition-colors",
                gender === 'female' ? "bg-pink-500" : gender === 'male' ? "bg-blue-500" : "bg-[rgb(var(--color-primary))]"
            )} />

            <div className="flex items-center justify-between mb-4 relative z-10 w-full">
                <div className="flex items-center gap-2.5">
                    <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm ring-1 ring-inset",
                        gender === 'female' ? "bg-pink-500/10 text-pink-400 ring-pink-500/20" :
                            gender === 'male' ? "bg-blue-500/10 text-blue-400 ring-blue-500/20" :
                                "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary-light))] ring-[rgb(var(--color-primary))]/20"
                    )}>
                        {gender === 'female' ? '🌸' : gender === 'male' ? '💠' : '✨'}
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white leading-none">{t.home_mission_focus_title}</h2>
                        <p className="text-[10px] text-white/90 mt-0.5">{t.home_mission_daily_target}</p>
                    </div>
                </div>

                <div className={cn(
                    "text-[10px] px-3 py-1 rounded-full font-medium border backdrop-blur-sm",
                    completedCount === missions.length
                        ? "bg-gradient-to-r from-[rgb(var(--color-primary))]/20 to-[rgb(var(--color-primary-dark))]/20 border-[rgb(var(--color-primary))]/30 text-[rgb(var(--color-primary-light))]"
                        : "bg-white/5 border-white/10 text-white/80"
                )}>
                    {completedCount}/{missions.length} {t.home_mission_completed}
                </div>
            </div>

            <div className="space-y-2 relative z-10">
                {displayMissions.map((mission) => {
                    const validation = checkValidation(mission);
                    return (
                        <DailyMissionCard
                            key={mission.id}
                            mission={mission}
                            isCompleted={isMissionCompleted(mission.id, mission.type)}
                            isLocked={!isMissionCompleted(mission.id, mission.type) && validation.locked}
                            isSpecial={mission.phase === 'ramadhan_prep'}
                            validation={validation}
                            prayerData={prayerData}
                            gender={gender}
                            t={t}
                            getRulingLabel={getRulingLabel}
                            onClick={handleMissionClick}
                        />
                    );
                })}
            </div>

            <div className="mt-3">
                <MissionListModal
                    missions={missions}
                    completed={completedMissionsMap}
                    onMissionClick={handleMissionClick}
                    checkValidation={checkValidation}
                    isMissionCompleted={isMissionCompleted}
                    hijriDate={prayerData?.hijriDate}
                    isOpen={showMissionModal}
                    onOpenChange={setShowMissionModal}
                    initialTab={initialModalTab}
                >
                    <button
                        className={cn(
                            "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all",
                            "bg-white/5 hover:bg-white/10 active:scale-95 border border-white/5 text-white/70 hover:text-white"
                        )}
                        onClick={() => setShowMissionModal(true)}
                    >
                        <span>{t.home_mission_view_all} ({missions.length})</span>
                        <ChevronRight className="w-3 h-3" />
                    </button>
                </MissionListModal>
            </div>

            {!gender && (
                <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-[10px] text-amber-400 text-center">
                        {t.home_mission_select_gender_hint}
                    </p>
                </div>
            )}

            {selectedMission && (
                (() => {
                    const validation = checkValidation(selectedMission);
                    let customContent = null;
                    if (selectedMission.id === 'daily_intention' && userToken) {
                        if (todayIntention) {
                            customContent = (
                                <ReflectionInputForm
                                    userToken={userToken}
                                    intentionId={todayIntention.id}
                                    intentionText={todayIntention.text}
                                    onComplete={() => {
                                        setTodayIntention(prev => prev ? { ...prev, reflection: { rating: 5, text: "Done" } } : null);
                                        const muhasabah = missions.find(m => m.id === 'muhasabah');
                                        if (muhasabah) handleCompleteMission(muhasabah.xpReward);
                                    }}
                                />
                            );
                        } else {
                            customContent = (
                                <IntentionInputForm
                                    userToken={userToken}
                                    onComplete={() => handleCompleteMission(selectedMission.xpReward)}
                                />
                            );
                        }
                    } else if (selectedMission.id === 'muhasabah' && userToken) {
                        customContent = (
                            <ReflectionInputForm
                                userToken={userToken}
                                intentionId={todayIntention?.id}
                                intentionText={todayIntention?.text}
                                onComplete={() => handleCompleteMission(selectedMission.xpReward)}
                            />
                        );
                    }

                    return (
                        <MissionDetailDialog
                            mission={selectedMission}
                            isOpen={isDialogOpen}
                            onClose={() => setIsDialogOpen(false)}
                            isCompleted={isMissionCompleted(selectedMission.id, selectedMission.type)}
                            isLocked={validation.locked}
                            lockReason={validation.reason}
                            isLate={validation.isLate}
                            isEarly={validation.isEarly}
                            onComplete={handleCompleteMission}
                            onReset={handleResetMission}
                            customContent={customContent}
                        />
                    );
                })()
            )}

            <AnimatePresence>
                {showIntentionPrompt && (
                    <IntentionPrompt
                        onSubmit={handleIntentionSubmit}
                        currentStreak={0}
                        onClose={() => setShowIntentionPrompt(false)}
                    />
                )}
            </AnimatePresence>
        </div >
    );
}
