"use client";

import { useState, useEffect } from "react";
import { Check, ChevronRight, Sparkles, AlertCircle } from "lucide-react";
import { getDailyMissions, getRamadhanMissions, Mission, Gender } from "@/data/missions-data";
import { addXP } from "@/lib/leveling";
import { updateStreak } from "@/lib/streak-utils";
import { cn } from "@/lib/utils";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import MissionDetailDialog from "./MissionDetailDialog";
import MissionListModal from "./MissionListModal";
import { checkMissionValidation } from "@/lib/mission-utils";

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

        // Merge Missions: Daily + Ramadhan
        const daily = getDailyMissions(savedGender);
        const ramadhan = getRamadhanMissions();
        setMissions([...ramadhan, ...daily]);

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

    const isMissionCompleted = (missionId: string, type: Mission['type']) => {
        const record = completed[missionId];
        if (!record) return false;

        // If it's a daily mission (or undefined), it must match today's date
        if (type === 'daily' || !type) {
            return record.date === today;
        }

        // If it's a tracker (one-time) or weekly (handled elsewhere but let's say tracker), it's done forever
        if (type === 'tracker') {
            return true;
        }

        return false;
    };

    // --- Validation Logic ---
    const checkValidation = (mission: Mission) => {
        return checkMissionValidation(mission, prayerData);
    };

    const handleMissionClick = (mission: Mission) => {
        // Always open dialog for details/guide/validation check
        setSelectedMission(mission);
        setIsDialogOpen(true);
    };

    const handleCompleteMission = (xpAmount?: number) => {
        if (!selectedMission) return;

        const mission = selectedMission;
        const reward = xpAmount || mission.xpReward; // Use passed amount or default
        addXP(reward);
        window.dispatchEvent(new CustomEvent("xp_updated"));

        // Update streak (only on first mission of the day)
        const completedCountToday = Object.values(completed).filter(c => c.date === today).length;
        if (completedCountToday === 0) {
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

    const handleResetMission = () => {
        if (!selectedMission) return;

        const mission = selectedMission;
        // Subtract XP
        addXP(-mission.xpReward);
        window.dispatchEvent(new CustomEvent("xp_updated"));

        // Remove from completed
        const newCompleted = { ...completed };
        delete newCompleted[mission.id];

        setCompleted(newCompleted);
        localStorage.setItem("completed_missions", JSON.stringify(newCompleted));

        setIsDialogOpen(false);
    };

    // Count completed today (for progress bar) - Widget Header
    const completedCount = missions.filter(m => isMissionCompleted(m.id, m.type)).length;

    // Sorting for WIDGET (Top Priority)
    // Priority Score System:
    // ... (Scores as defined) ...
    // NOTE: We MUST hide 'ramadhan_during' missions from the Widget if it's not Ramadhan.
    // Assuming we are in 'Prep' phase, 'ramadhan_during' should be hidden.
    const widgetMissions = [...missions]
        .filter(m => m.phase !== 'ramadhan_during') // Hide Tarawih, Bukber, etc. from Widget
        .sort((a, b) => {
            const aCompleted = isMissionCompleted(a.id, a.type);
            const bCompleted = isMissionCompleted(b.id, b.type);

            // 1. Completed always last
            if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;

            const aVal = checkValidation(a);
            const bVal = checkValidation(b);

            // Helper to get score
            const getPriorityScore = (m: Mission, val: any) => {
                if (val.locked) return -20;
                if (val.isLate) return -10;

                // Wajib Priorities
                if (m.category === 'sholat' && m.hukum === 'wajib') return 100;

                // Qadha Puasa is Special Wajib
                if (m.id === 'qadha_puasa' || (m.phase === 'ramadhan_prep' && m.hukum === 'wajib')) return 90;

                // Active Sunnah Priorities
                if (m.category === 'sholat') return 80; // Sunnah Prayer
                if (m.category === 'dzikir') return 70;

                // Special Context (Ramadhan Prep - Sunnah)
                if (m.phase === 'ramadhan_prep') return 60;

                return 0;
            };

            const scoreA = getPriorityScore(a, aVal);
            const scoreB = getPriorityScore(b, bVal);

            if (scoreA !== scoreB) return scoreB - scoreA; // Descending (Higher first)

            // Tie-breaker: Wajib > Sunnah
            if (a.hukum === 'wajib' && b.hukum !== 'wajib') return -1;
            if (b.hukum === 'wajib' && a.hukum !== 'wajib') return 1;

            return 0;
        });

    // Show top 2 only
    const displayMissions = widgetMissions.slice(0, 2);

    return (
        <div className={cn(
            "bg-white/[0.02] border rounded-2xl p-4 relative overflow-hidden transition-all hover:bg-white/[0.04]",
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
                    <span className="text-lg">{gender === 'female' ? '💜' : gender === 'male' ? '💙' : '🤲'}</span>
                    <h3 className="text-sm font-bold text-white">Fokus Ibadah</h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-bold",
                        gender === 'female' ? "text-pink-400 bg-pink-500/10" :
                            gender === 'male' ? "text-blue-400 bg-blue-500/10" :
                                "text-emerald-400 bg-emerald-500/10"
                    )}>
                        {completedCount} Selesai
                    </span>
                </div>
            </div>

            {/* Mission List */}
            <div className="space-y-2 relative z-10">
                {displayMissions.map((mission) => {
                    const isCompleted = isMissionCompleted(mission.id, mission.type);
                    const validation = checkValidation(mission);
                    const isLocked = !isCompleted && validation.locked;
                    const isSpecial = mission.phase === 'ramadhan_prep';

                    // Dynamic Urgency Logic for Sholat
                    let urgencyNode = null;
                    if (mission.category === 'sholat' && !isCompleted && !isLocked && !validation.isLate && prayerData?.prayerTimes) {
                        // Determine current prayer key based on ID (e.g. sholat_ashar -> Asr)
                        // Helper map
                        const idToKey: { [key: string]: string } = {
                            'sholat_subuh': 'Fajr',
                            'sholat_dzuhur': 'Dhuhr',
                            'sholat_ashar': 'Asr',
                            'sholat_maghrib': 'Maghrib',
                            'sholat_isya': 'Isha'
                        };
                        const prayerKey = idToKey[mission.id];

                        if (prayerKey) {
                            // Get time window
                            const pTime = prayerData.prayerTimes[prayerKey]; // Start
                            // Next prayer is simple approximation for now (Window End)
                            // Order: Fajr -> Sunrise(Special) -> Dhuhr -> Asr -> Maghrib -> Isha -> Midnight

                            // We need "End Time" to calculate "Last 30 mins"
                            let endTimeStr = null;
                            if (prayerKey === 'Fajr') endTimeStr = prayerData.prayerTimes['Sunrise']; // Assuming Sunrise is in data
                            else if (prayerKey === 'Dhuhr') endTimeStr = prayerData.prayerTimes['Asr'];
                            else if (prayerKey === 'Asr') endTimeStr = prayerData.prayerTimes['Maghrib'];
                            else if (prayerKey === 'Maghrib') endTimeStr = prayerData.prayerTimes['Isha'];
                            // Isha end is tricky, let's ignore or use fixed offset.

                            if (pTime && endTimeStr) {
                                const now = new Date();
                                const [sH, sM] = pTime.split(':').map(Number);
                                const [eH, eM] = endTimeStr.split(':').map(Number);

                                const startDate = new Date(); startDate.setHours(sH, sM, 0, 0);
                                const endDate = new Date(); endDate.setHours(eH, eM, 0, 0);

                                const diffMs = now.getTime() - startDate.getTime();
                                const remainingMs = endDate.getTime() - now.getTime();

                                const minsSinceStart = diffMs / (1000 * 60);
                                const minsRemaining = remainingMs / (1000 * 60);

                                if (minsSinceStart <= 60 && minsSinceStart >= 0) {
                                    // Early: < 60 mins passed
                                    urgencyNode = (
                                        <div className="mt-1.5 flex items-start gap-1.5 p-1.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                                            <Sparkles className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-[10px] font-bold text-emerald-400 leading-tight">Keutamaan Awal Waktu</p>
                                                <p className="text-[9px] text-emerald-400/70 leading-tight italic">"Amalan terbaik: Shalat di awal waktu." (HR. Tirmidzi)</p>
                                            </div>
                                        </div>
                                    );
                                } else if (minsRemaining <= 30 && minsRemaining > 0) {
                                    // Critical: < 30 mins left
                                    urgencyNode = (
                                        <div className="mt-1.5 flex items-start gap-1.5 p-1.5 rounded bg-amber-500/10 border border-amber-500/20">
                                            <AlertCircle className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-[10px] font-bold text-amber-500 leading-tight">Waktu Hampir Habis! ({Math.floor(minsRemaining)} menit)</p>
                                                <p className="text-[9px] text-amber-500/70 leading-tight italic">"Janganlah kalian lalai terhadap shalat." (QS. Al-Ma'un: 5)</p>
                                            </div>
                                        </div>
                                    );
                                }
                            }
                        }
                    }

                    return (
                        <button
                            key={mission.id}
                            onClick={() => handleMissionClick(mission)}
                            className={cn(
                                "w-full flex flex-col gap-2 p-3 rounded-xl transition-all text-left group", // Changed to flex-col for nicer layout with alert
                                isCompleted
                                    ? gender === 'female' ? "bg-pink-500/10 border border-pink-500/20" :
                                        gender === 'male' ? "bg-blue-500/10 border border-blue-500/20" :
                                            "bg-emerald-500/10 border border-emerald-500/20"
                                    : isLocked
                                        ? "bg-white/[0.02] border border-white/5 opacity-60 cursor-not-allowed"
                                        : isSpecial
                                            ? "bg-amber-900/10 border border-amber-500/30 hover:bg-amber-900/20"
                                            : "bg-white/5 border border-white/5 hover:border-white/20"
                            )}
                        >
                            <div className="flex items-center gap-3 w-full">
                                <span className={cn(
                                    "text-xl transition-all",
                                    isCompleted && "grayscale",
                                    isLocked && "opacity-50 grayscale"
                                )}>
                                    {mission.icon}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <p className={cn(
                                            "text-xs font-semibold truncate pr-2",
                                            isCompleted
                                                ? gender === 'female' ? "text-pink-400 line-through" :
                                                    gender === 'male' ? "text-blue-400 line-through" :
                                                        "text-emerald-400 line-through"
                                                : isSpecial ? "text-amber-200" : "text-white"
                                        )}>
                                            {mission.title}
                                        </p>
                                        {isSpecial && !isCompleted && !isLocked && (
                                            <span className="text-[8px] px-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                                Special
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "text-[7px] px-1 py-0.5 rounded font-bold uppercase tracking-wider shrink-0",
                                            mission.hukum === 'wajib'
                                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                        )}>
                                            {mission.hukum}
                                        </span>
                                        <p className="text-[10px] text-white/40 truncate">
                                            +{mission.xpReward} XP
                                        </p>
                                        {isLocked ? (
                                            <span className="text-[9px] text-amber-500/70 flex items-center gap-0.5">
                                                <AlertCircle className="w-2.5 h-2.5" /> {validation.reason || "Terkunci"}
                                            </span>
                                        ) : validation.isLate ? (
                                            <span className="text-[9px] text-amber-500/70 flex items-center gap-0.5">
                                                <AlertCircle className="w-2.5 h-2.5" /> {validation.reason}
                                            </span>
                                        ) : null}
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
                                    <div className={cn(
                                        "w-5 h-5 rounded-full border transition-colors",
                                        isSpecial ? "border-amber-500/40 group-hover:border-amber-400/60" : "border-white/20 group-hover:border-white/40"
                                    )} />
                                )}
                            </div>

                            {/* Urgency Badge */}
                            {!isCompleted && !isLocked && urgencyNode}
                        </button>
                    );
                })}
            </div>

            {/* "Lihat Semua" Modal Trigger */}
            <div className="mt-3">
                <MissionListModal
                    missions={missions}
                    completed={completed}
                    onMissionClick={handleMissionClick}
                    checkValidation={checkValidation}
                    isMissionCompleted={isMissionCompleted}
                >
                    <button
                        className={cn(
                            "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all",
                            "bg-white/5 hover:bg-white/10 active:scale-95 border border-white/5 text-white/70 hover:text-white"
                        )}
                    >
                        <span>Lihat Semua Misi ({missions.length})</span>
                        <ChevronRight className="w-3 h-3" />
                    </button>
                </MissionListModal>
            </div>

            {/* No gender selected prompt */}
            {!gender && (
                <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-[10px] text-amber-400 text-center">
                        💡 Pilih jenis kelamin di Profil untuk misi yang lebih personal
                    </p>
                </div>
            )}

            {selectedMission && (
                (() => {
                    const validation = checkValidation(selectedMission);
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
                        />
                    );
                })()
            )}
        </div>
    );
}
