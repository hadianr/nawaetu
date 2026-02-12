"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Check, Sparkles, Trophy, AlertCircle } from "lucide-react";
import { getMissionsForGender, Mission, Gender, getLocalizedMission } from "@/data/missions-data";
import { addXP } from "@/lib/leveling";
import { updateStreak } from "@/lib/streak-utils";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import MissionDetailDialog from "@/components/MissionDetailDialog";
import { checkMissionValidation } from "@/lib/mission-utils";
import { useLocale } from "@/context/LocaleContext";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { Metadata } from "next";

// Note: Metadata export cannot be used in client components
// SEO metadata is handled in layout.tsx for this page

const storage = getStorageService();

interface CompletedMissions {
    [missionId: string]: {
        completedAt: string;
        date: string;
    };
}

export default function MisiPage() {
    const { t, locale } = useLocale();
    const [gender, setGender] = useState<Gender>(null);

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
    const [missions, setMissions] = useState<Mission[]>([]);
    const [completed, setCompleted] = useState<CompletedMissions>({});
    const [today, setToday] = useState<string>("");

    // Dialog State
    const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data: prayerData } = usePrayerTimes();

    const loadData = () => {
        const [savedGender, savedCompleted] = storage.getMany([
            STORAGE_KEYS.USER_GENDER,
            STORAGE_KEYS.COMPLETED_MISSIONS
        ]).values();


        const allMissions = getMissionsForGender(savedGender as Gender);
        const localizedMissions = allMissions.map(mission => getLocalizedMission(mission, locale));
        setMissions(localizedMissions);

        if (savedCompleted) {
            try {
                setCompleted(typeof savedCompleted === 'string' ? JSON.parse(savedCompleted) : savedCompleted);
            } catch (e) { }
        }
    };

    useEffect(() => {
        setToday(new Date().toISOString().split('T')[0]);

        // Initial load
        loadData();

        // Listen for updates from Onboarding or Settings
        const handleStorageUpdate = () => loadData();

        window.addEventListener('storage', handleStorageUpdate);
        window.addEventListener('profile_updated', handleStorageUpdate);

        return () => {
            window.removeEventListener('storage', handleStorageUpdate);
            window.removeEventListener('profile_updated', handleStorageUpdate);
        };
    }, [locale]);

    const isMissionCompletedToday = (missionId: string) => {
        return completed[missionId]?.date === today;
    };

    // --- Validation Logic ---
    const checkValidation = (mission: Mission) => {
        return checkMissionValidation(mission, prayerData);
    };

    const handleMissionClick = (mission: Mission) => {
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
        storage.set(STORAGE_KEYS.COMPLETED_MISSIONS as any, JSON.stringify(newCompleted));

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
        storage.set(STORAGE_KEYS.COMPLETED_MISSIONS as any, JSON.stringify(newCompleted));

        setIsDialogOpen(false);
    };

    const completedCount = missions.filter(m => isMissionCompletedToday(m.id)).length;

    // Theme colors based on gender
    const theme = gender === 'female'
        ? { accent: 'pink', color: 'pink-400', bg: 'pink-500/10', border: 'pink-500/20', icon: '👩' }
        : gender === 'male'
            ? { accent: 'blue', color: 'blue-400', bg: 'blue-500/10', border: 'blue-500/20', icon: '👨' }
            : { accent: 'emerald', color: 'emerald-400', bg: 'emerald-500/10', border: 'emerald-500/20', icon: '🎯' };

    // Group missions by type
    const dailyMissions = missions.filter(m => m.type === 'daily');
    const weeklyMissions = missions.filter(m => m.type === 'weekly');
    const trackerMissions = missions.filter(m => m.type === 'tracker');

    const renderMission = (mission: Mission) => {
        const isCompleted = isMissionCompletedToday(mission.id);
        const isGenderSpecific = mission.gender !== null;
        const validation = checkValidation(mission);
        const isLocked = !isCompleted && validation.locked;

        return (
            <button
                key={mission.id}
                onClick={() => handleMissionClick(mission)}
                className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                    isCompleted
                        ? `bg-${theme.accent}-500/10 border-${theme.accent}-500/20`
                        : isLocked
                            ? "bg-white/[0.02] border border-white/5 opacity-60 cursor-not-allowed"
                            : "bg-white/5 border-white/10 hover:border-white/20"
                )}
                style={isCompleted ? {
                    backgroundColor: gender === 'female' ? 'rgba(236,72,153,0.1)' : gender === 'male' ? 'rgba(59,130,246,0.1)' : 'rgba(16,185,129,0.1)',
                    borderColor: gender === 'female' ? 'rgba(236,72,153,0.2)' : gender === 'male' ? 'rgba(59,130,246,0.2)' : 'rgba(16,185,129,0.2)'
                } : {}}
            >
                <span className={cn("text-2xl", isCompleted && "grayscale", isLocked && "opacity-50 grayscale")}>
                    {mission.icon}
                </span>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <p className={cn(
                                "text-sm font-semibold",
                                isCompleted ? `text-${theme.color} line-through` : "text-white"
                            )}
                                style={isCompleted ? {
                                    color: gender === 'female' ? '#f472b6' : gender === 'male' ? '#60a5fa' : '#34d399'
                                } : {}}
                            >
                                {mission.title}
                            </p>
                            <span className={cn(
                                "text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider",
                                mission.hukum === 'wajib'
                                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            )}>
                                {getHukumLabel(mission.hukum)}
                            </span>
                        </div>
                        {isGenderSpecific && (
                            <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-white/50">
                                {mission.gender === 'female' ? '👩' : '👨'}
                            </span>
                        )}
                    </div>
                    {isLocked ? (
                        <div className="flex items-center gap-1 mt-1 text-amber-500/70">
                            <AlertCircle className="w-3 h-3" />
                            <p className="text-[10px] font-medium">{validation.reason}</p>
                        </div>
                    ) : validation.isLate ? (
                        <div className="flex items-center gap-1 mt-1 text-red-400/70">
                            <AlertCircle className="w-3 h-3" />
                            <p className="text-[10px] font-medium">{validation.reason}</p>
                        </div>
                    ) : validation.isEarly ? (
                        <div className="flex items-center gap-1 mt-1 text-emerald-400/80">
                            <Sparkles className="w-3 h-3" />
                            <p className="text-[10px] font-medium">Awal Waktu (+XP Bonus)</p>
                        </div>
                    ) : (
                        <p className="text-[10px] text-white/40">{mission.description}</p>
                    )}
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full",
                        `text-${theme.color} bg-${theme.bg}`
                    )}
                        style={{
                            color: gender === 'female' ? '#f472b6' : gender === 'male' ? '#60a5fa' : '#34d399',
                            backgroundColor: gender === 'female' ? 'rgba(236,72,153,0.1)' : gender === 'male' ? 'rgba(59,130,246,0.1)' : 'rgba(16,185,129,0.1)'
                        }}
                    >
                        +{mission.xpReward} XP
                    </span>
                    {isCompleted ? (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center"
                            style={{
                                backgroundColor: gender === 'female' ? '#ec4899' : gender === 'male' ? '#3b82f6' : '#10b981'
                            }}
                        >
                            <Check className="w-3 h-3 text-white" />
                        </div>
                    ) : (
                        <div className="w-5 h-5 rounded-full border border-white/20" />
                    )}
                </div>
            </button>
        );
    };

    return (
        <div className="flex min-h-screen flex-col items-center bg-[#0a0a0a] px-4 py-6 font-sans sm:px-6 pb-nav">
            <div className="w-full max-w-md space-y-6">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-white">Misi Harian</h1>
                        <p className="text-xs text-white/50">Raih XP dengan menyelesaikan misi</p>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-full"
                        style={{
                            backgroundColor: gender === 'female' ? 'rgba(236,72,153,0.1)' : gender === 'male' ? 'rgba(59,130,246,0.1)' : 'rgba(16,185,129,0.1)'
                        }}
                    >
                        <Trophy className="w-4 h-4"
                            style={{ color: gender === 'female' ? '#f472b6' : gender === 'male' ? '#60a5fa' : '#34d399' }}
                        />
                        <span className="text-sm font-bold"
                            style={{ color: gender === 'female' ? '#f472b6' : gender === 'male' ? '#60a5fa' : '#34d399' }}
                        >
                            {completedCount}/{missions.length}
                        </span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full transition-all duration-500"
                        style={{
                            width: `${(completedCount / missions.length) * 100}%`,
                            backgroundColor: gender === 'female' ? '#ec4899' : gender === 'male' ? '#3b82f6' : '#10b981'
                        }}
                    />
                </div>

                {/* Daily Missions */}
                {dailyMissions.length > 0 && (
                    <div className="space-y-3">
                        <h2 className="text-xs font-bold text-white/50 uppercase tracking-wider">📅 Misi Harian</h2>
                        <div className="space-y-2">
                            {dailyMissions.map(renderMission)}
                        </div>
                    </div>
                )}

                {/* Weekly Missions */}
                {weeklyMissions.length > 0 && (
                    <div className="space-y-3">
                        <h2 className="text-xs font-bold text-white/50 uppercase tracking-wider">📆 Misi Mingguan</h2>
                        <div className="space-y-2">
                            {weeklyMissions.map(renderMission)}
                        </div>
                    </div>
                )}

                {/* Tracker Missions */}
                {trackerMissions.length > 0 && (
                    <div className="space-y-3">
                        <h2 className="text-xs font-bold text-white/50 uppercase tracking-wider">📊 Tracker</h2>
                        <div className="space-y-2">
                            {trackerMissions.map(renderMission)}
                        </div>
                    </div>
                )}

                {/* Gender Prompt */}
                {!gender && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
                        <p className="text-sm text-amber-400">
                            💡 Pilih jenis kelamin di <Link href="/atur" className="underline">Pengaturan</Link> untuk misi yang lebih personal
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
                        isLate={checkValidation(selectedMission).isLate}
                        isEarly={checkValidation(selectedMission).isEarly}
                        onComplete={handleCompleteMission}
                        onReset={handleResetMission}
                    />
                )}

            </div>
        </div>
    );
}
