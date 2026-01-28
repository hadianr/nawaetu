"use client";

import { useState, useEffect } from "react";
import { Check, ChevronRight, Sparkles, AlertCircle } from "lucide-react";
import { getDailyMissions, Mission, Gender } from "@/data/missions-data";
import { MissionContent, MISSION_CONTENTS } from "@/data/mission-content";
import { addXP } from "@/lib/leveling";
import { updateStreak } from "@/lib/streak-utils";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import MissionDetailDialog from "./MissionDetailDialog";

interface CompletedMissions {
    [missionId: string]: {
        completedAt: string;
        date: string; // YYYY-MM-DD format for daily reset
    };
}

export default function MissionsWidget() {
    const [gender, setGender] = useState<Gender>(null);
    const [missions, setMissions] = useState<Mission[]>([]);
    const [completed, setCompleted] = useState<CompletedMissions>({});
    const [today, setToday] = useState<string>("");

    // Dialog State
    const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data: prayerData } = usePrayerTimes();

    useEffect(() => {
        // Set today's date on client-side only
        setToday(new Date().toISOString().split('T')[0]);

        // Load gender from localStorage
        const savedGender = localStorage.getItem("user_gender") as Gender;
        setGender(savedGender);
        setMissions(getDailyMissions(savedGender));

        // Load completed missions
        const savedCompleted = localStorage.getItem("completed_missions");
        if (savedCompleted) {
            try {
                setCompleted(JSON.parse(savedCompleted));
            } catch (e) {
                console.error("Failed to parse completed missions");
            }
        }
    }, []);

    const isMissionCompletedToday = (missionId: string) => {
        const mission = completed[missionId];
        return mission?.date === today;
    };

    // --- Validation Logic ---
    const checkValidation = (mission: Mission): { locked: boolean; reason?: string } => {
        if (!mission.validationType || mission.validationType === 'manual' || mission.validationType === 'auto') {
            return { locked: false };
        }

        if (mission.validationType === 'time' && mission.validationConfig?.afterPrayer && prayerData?.prayerTimes) {
            // Convert prayer time to Date object
            const prayerTimeStr = prayerData.prayerTimes[mission.validationConfig.afterPrayer]; // "04:30"
            if (!prayerTimeStr) return { locked: true, reason: "Waktu belum tersedia" };

            const now = new Date();
            const [pHours, pMinutes] = prayerTimeStr.split(':').map(Number);
            const prayerDate = new Date();
            prayerDate.setHours(pHours, pMinutes, 0, 0);

            if (now < prayerDate) {
                return { locked: true, reason: `Belum masuk waktu ${mission.validationConfig.afterPrayer}` };
            }
        }

        if (mission.validationType === 'time' && mission.validationConfig?.timeWindow) {
            const nowHour = new Date().getHours();
            const { start, end } = mission.validationConfig.timeWindow;
            if (nowHour < start || nowHour >= end) {
                return { locked: true, reason: `Hanya tersedia jam ${start}:00 - ${end}:00` };
            }
        }

        if (mission.validationType === 'day' && mission.validationConfig?.allowedDays) {
            const currentDay = new Date().getDay(); // 0=Sun, 1=Mon...
            if (!mission.validationConfig.allowedDays.includes(currentDay)) {
                return { locked: true, reason: "Bukan hari jadwalnya" };
            }
        }

        return { locked: false };
    };

    const handleMissionClick = (mission: Mission) => {
        const isCompleted = isMissionCompletedToday(mission.id);
        const validation = checkValidation(mission);

        // Always open dialog for details/guide/validation check
        setSelectedMission(mission);
        setIsDialogOpen(true);
    };

    const handleCompleteMission = () => {
        if (!selectedMission) return;

        const mission = selectedMission;
        addXP(mission.xpReward);
        window.dispatchEvent(new CustomEvent("xp_updated"));

        // Update streak (only on first mission of the day)
        const completedToday = Object.values(completed).filter(c => c.date === today).length;
        if (completedToday === 0) {
            updateStreak();
        }

        const newCompleted = {
            ...completed,
            [mission.id]: {
                completedAt: new Date().toISOString(),
                date: today
            }
        };
        setCompleted(newCompleted);
        localStorage.setItem("completed_missions", JSON.stringify(newCompleted));

        setIsDialogOpen(false);
    };

    // Count completed today
    const completedToday = missions.filter(m => isMissionCompletedToday(m.id)).length;

    // Show only first 3 missions
    const displayMissions = missions.slice(0, 3);

    return (
        <div className={cn(
            "bg-white/[0.02] border rounded-2xl p-4 relative overflow-hidden",
            gender === 'female' ? "border-pink-500/20" : gender === 'male' ? "border-blue-500/20" : "border-white/10"
        )}>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 p-2 opacity-5">
                <Sparkles className={cn(
                    "w-20 h-20",
                    gender === 'female' ? "text-pink-400" : gender === 'male' ? "text-blue-400" : "text-emerald-400"
                )} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="flex items-center gap-2">
                    <span className="text-lg">{gender === 'female' ? '💜' : gender === 'male' ? '💙' : '🎯'}</span>
                    <h3 className="text-sm font-bold text-white">Misi Harian</h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-bold",
                        gender === 'female' ? "text-pink-400 bg-pink-500/10" :
                            gender === 'male' ? "text-blue-400 bg-blue-500/10" :
                                "text-emerald-400 bg-emerald-500/10"
                    )}>
                        {completedToday}/{missions.length}
                    </span>
                </div>
            </div>

            {/* Mission List */}
            <div className="space-y-2 relative z-10">
                {displayMissions.map((mission) => {
                    const isCompleted = isMissionCompletedToday(mission.id);
                    const validation = checkValidation(mission);
                    const isLocked = !isCompleted && validation.locked;

                    return (
                        <button
                            key={mission.id}
                            onClick={() => handleMissionClick(mission)}
                            className={cn(
                                "w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left group",
                                isCompleted
                                    ? gender === 'female' ? "bg-pink-500/10 border border-pink-500/20" :
                                        gender === 'male' ? "bg-blue-500/10 border border-blue-500/20" :
                                            "bg-emerald-500/10 border border-emerald-500/20"
                                    : isLocked
                                        ? "bg-white/[0.02] border border-white/5 opacity-60 cursor-not-allowed"
                                        : "bg-white/5 border border-white/5 hover:border-white/20"
                            )}
                        >
                            <span className={cn(
                                "text-xl transition-all",
                                isCompleted && "grayscale",
                                isLocked && "opacity-50 grayscale"
                            )}>
                                {mission.icon}
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className={cn(
                                    "text-xs font-semibold truncate",
                                    isCompleted
                                        ? gender === 'female' ? "text-pink-400 line-through" :
                                            gender === 'male' ? "text-blue-400 line-through" :
                                                "text-emerald-400 line-through"
                                        : "text-white"
                                )}>
                                    {mission.title}
                                </p>
                                <div className="flex items-center gap-2">
                                    <p className="text-[10px] text-white/40 truncate">
                                        +{mission.xpReward} XP
                                    </p>
                                    {isLocked && (
                                        <span className="text-[9px] text-amber-500/70 flex items-center gap-0.5">
                                            <AlertCircle className="w-2.5 h-2.5" /> Terkunci
                                        </span>
                                    )}
                                </div>
                            </div>
                            {isCompleted ? (
                                <div className={cn(
                                    "w-5 h-5 rounded-full flex items-center justify-center",
                                    gender === 'female' ? "bg-pink-500" : gender === 'male' ? "bg-blue-500" : "bg-emerald-500"
                                )}>
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                            ) : (
                                <div className="w-5 h-5 rounded-full border border-white/20 group-hover:border-white/40 transition-colors" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* See All Link */}
            {missions.length > 3 && (
                <Link
                    href="/misi"
                    className={cn(
                        "flex items-center justify-center gap-1 mt-3 text-[10px] transition-colors",
                        gender === 'female' ? "text-pink-400 hover:text-pink-300" :
                            gender === 'male' ? "text-blue-400 hover:text-blue-300" :
                                "text-emerald-400 hover:text-emerald-300"
                    )}
                >
                    <span>Lihat Semua Misi</span>
                    <ChevronRight className="w-3 h-3" />
                </Link>
            )}

            {/* No gender selected prompt */}
            {!gender && (
                <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-[10px] text-amber-400 text-center">
                        💡 Pilih jenis kelamin di Profil untuk misi yang lebih personal
                    </p>
                </div>
            )}

            {selectedMission && (
                <MissionDetailDialog
                    mission={selectedMission}
                    isOpen={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)}
                    isCompleted={isMissionCompletedToday(selectedMission.id)}
                    isLocked={checkValidation(selectedMission).locked}
                    lockReason={checkValidation(selectedMission).reason}
                    onComplete={handleCompleteMission}
                />
            )}
        </div>
    );
}
