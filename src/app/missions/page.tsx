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

import { useCallback, useState, useEffect } from "react";
import { ArrowLeft, Check, Sparkles, Trophy, AlertCircle } from "lucide-react";
import { getMissionsForGender, Mission, Gender, getLocalizedMission } from "@/data/missions";
import { addHasanah } from "@/lib/habits/leveling";
import { updateStreak } from "@/lib/habits/streak-utils";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePrayerTimesContext } from "@/context/PrayerTimesContext";
import MissionDetailDialog from "@/components/MissionDetailDialog";
import { checkMissionValidation, getRulingLabel } from "@/lib/habits/mission-utils";
import { useLocale, type TranslationTree } from "@/context/LocaleContext";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { toast } from "sonner";
import { AppIcon, resolveAppIconName } from "@/components/ui/AppIcon";
import { useMissions } from "@/hooks/useMissions";
import { useSession } from "next-auth/react";

// Note: Metadata export cannot be used in client components
// SEO metadata is handled in layout.tsx for this page

const storage = getStorageService();

export default function MisiPage() {
    const { data: session } = useSession();
    const { t, locale } = useLocale();
    const translations = t as TranslationTree & { toastMissionReset?: string };
    const { completedMissions, completeMission, undoCompleteMission } = useMissions();
    const [gender, setGender] = useState<Gender>(null);
    const [missions, setMissions] = useState<Mission[]>([]);

    // Dialog State
    const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data: prayerData } = usePrayerTimesContext();

    const loadData = useCallback(() => {
        const savedGender = (storage.getOptional(STORAGE_KEYS.USER_GENDER) || session?.user?.gender) as Gender;
        setGender(savedGender);

        const allMissions = getMissionsForGender(savedGender);
        const localizedMissions = allMissions.map(mission => getLocalizedMission(mission, locale));
        setMissions(localizedMissions);
    }, [locale, session]);

    useEffect(() => {
        // Initial load
        queueMicrotask(loadData);

        // Listen for updates from Onboarding or Settings
        const handleStorageUpdate = () => loadData();

        window.addEventListener('storage', handleStorageUpdate);
        window.addEventListener('profile_updated', handleStorageUpdate);

        return () => {
            window.removeEventListener('storage', handleStorageUpdate);
            window.removeEventListener('profile_updated', handleStorageUpdate);
        };
    }, [loadData]);

    const isMissionCompletedToday = (missionId: string, type: Mission['type']) => {
        const today = new Date().toISOString().split('T')[0];

        // recurring check
        if (type === 'daily' || type === 'weekly' || !type) {
            return completedMissions.some((m) =>
                m.id === missionId && m.completedAt.split('T')[0] === today
            );
        }

        // one-time check
        return completedMissions.some((m) => m.id === missionId);
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
        const reward = xpAmount || mission.hasanahReward;
        addHasanah(reward);
        window.dispatchEvent(new CustomEvent("hasanah_updated"));

        // Update streak (only on first mission of the day)
        const todayStr = new Date().toISOString().split('T')[0];
        const completedCountToday = completedMissions.filter((m) =>
            m.completedAt.split('T')[0] === todayStr
        ).length;

        if (completedCountToday === 0) {
            updateStreak();
        }

        completeMission(mission.id, reward);
        setIsDialogOpen(false);
    };

    const handleResetMission = () => {
        if (!selectedMission) return;
        const mission = selectedMission;
        addHasanah(-mission.hasanahReward);
        window.dispatchEvent(new CustomEvent("hasanah_updated"));

        undoCompleteMission(mission.id);

        toast.info(translations.toastMissionReset || "Misi dibatalkan", {
            description: `${mission.title} telah di-reset. (-${mission.hasanahReward} Hasanah)`,
            duration: 3000,
            icon: <AppIcon name="refresh" size="sm" tone="primary" />
        });

        setIsDialogOpen(false);
    };

    const completedCount = missions.filter(m => isMissionCompletedToday(m.id, m.type)).length;

    // Group missions by type
    const dailyMissions = missions.filter(m => m.type === 'daily');
    const weeklyMissions = missions.filter(m => m.type === 'weekly');
    const trackerMissions = missions.filter(m => m.type === 'tracker');

    const renderMission = (mission: Mission) => {
        const isCompleted = isMissionCompletedToday(mission.id, mission.type);
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
                        ? "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/20"
                        : isLocked
                            ? "bg-[rgb(var(--color-surface-subtle))]/60 border-[rgb(var(--color-border))] opacity-60 cursor-not-allowed"
                            : "bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-primary))]/40"
                )}
            >
                <span className={cn("text-2xl", isCompleted && "grayscale", isLocked && "opacity-50 grayscale")}>
                    <AppIcon name={mission.iconKey ?? resolveAppIconName(mission.icon)} size="lg" tone="primary" />
                </span>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <p className={cn(
                                "text-sm font-semibold",
                                isCompleted ? "text-[rgb(var(--color-primary-light))] line-through" : "text-[rgb(var(--color-text-strong))]"
                            )}
                            >
                                {mission.title}
                            </p>
                            <span className={cn(
                                "text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider",
                                mission.ruling === 'obligatory'
                                    ? "bg-[rgb(var(--color-accent))]/10 text-[rgb(var(--color-accent))] border border-[rgb(var(--color-accent))]/30"
                                    : "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary-light))] border border-[rgb(var(--color-primary))]/30"
                            )}>
                                {getRulingLabel(mission.ruling, t)}
                            </span>
                        </div>
                        {isGenderSpecific && (
                            <span className="text-[9px] bg-[rgb(var(--color-surface))] px-1.5 py-0.5 rounded text-[rgb(var(--color-text-muted))]">
                                <AppIcon name={mission.gender === 'female' ? "heart-handshake" : "hands"} size="xs" tone="muted" />
                            </span>
                        )}
                    </div>
                    {isLocked ? (
                        <div className="flex items-center gap-1 mt-1 text-[rgb(var(--color-warning))]">
                            <AlertCircle className="w-3 h-3" />
                            <p className="text-[10px] font-medium">{validation.reason}</p>
                        </div>
                    ) : validation.isLate ? (
                        <div className="flex items-center gap-1 mt-1 text-[rgb(var(--color-danger))]">
                            <AlertCircle className="w-3 h-3" />
                            <p className="text-[10px] font-medium">{validation.reason}</p>
                        </div>
                    ) : validation.isEarly ? (
                        <div className="flex items-center gap-1 mt-1 text-[rgb(var(--color-primary-light))]">
                            <Sparkles className="w-3 h-3" />
                            <p className="text-[10px] font-medium">{translations.home_mission_early_bonus}</p>
                        </div>
                    ) : (
                        <p className="text-[10px] text-[rgb(var(--color-text-muted))]">{mission.description}</p>
                    )}
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full",
                        "text-[rgb(var(--color-primary-light))] bg-[rgb(var(--color-primary))]/10"
                    )}
                    >
                        +{mission.hasanahReward} Hasanah
                    </span>
                    {isCompleted ? (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[rgb(var(--color-primary))]">
                            <Check className="w-3 h-3 text-[rgb(var(--color-primary-foreground))]" />
                        </div>
                    ) : (
                        <div className="w-5 h-5 rounded-full border border-[rgb(var(--color-border))]" />
                    )}
                </div>
            </button>
        );
    };

    return (
        <div className="flex min-h-screen flex-col items-center bg-[rgb(var(--color-background))] text-[rgb(var(--color-text))] px-4 py-6 font-sans sm:px-6 pb-nav">
            <div className="w-full max-w-md space-y-6">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-[rgb(var(--color-surface-subtle))] transition-colors">
                        <ArrowLeft className="w-6 h-6 text-[rgb(var(--color-text-strong))]" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-[rgb(var(--color-text-strong))]">{t.home_mission_list_title}</h1>
                        <p className="text-xs text-[rgb(var(--color-text-muted))]">{t.home_mission_list_subtitle || "Raih Hasanah dengan menyelesaikan misi"}</p>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary-light))]">
                        <Trophy className="w-4 h-4" />
                        <span className="text-sm font-bold">
                            {completedCount}/{missions.length}
                        </span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-[rgb(var(--color-surface-subtle))] rounded-full overflow-hidden">
                    <div
                        className="h-full transition-all duration-500 bg-[rgb(var(--color-primary))]"
                        style={{ width: `${(completedCount / missions.length) * 100}%` }}
                    />
                </div>

                {/* Daily Missions */}
                {dailyMissions.length > 0 && (
                    <div className="space-y-3">
                        <h2 className="text-xs font-bold text-[rgb(var(--color-text-muted))] uppercase tracking-wider flex items-center gap-1.5"><AppIcon name="calendar" size="xs" tone="muted" /> {t.missionTabDaily}</h2>
                        <div className="space-y-2">
                            {dailyMissions.map(renderMission)}
                        </div>
                    </div>
                )}

                {/* Weekly Missions */}
                {weeklyMissions.length > 0 && (
                    <div className="space-y-3">
                        <h2 className="text-xs font-bold text-[rgb(var(--color-text-muted))] uppercase tracking-wider flex items-center gap-1.5"><AppIcon name="calendar" size="xs" tone="muted" /> {t.missionTabWeekly}</h2>
                        <div className="space-y-2">
                            {weeklyMissions.map(renderMission)}
                        </div>
                    </div>
                )}

                {/* Tracker Missions */}
                {trackerMissions.length > 0 && (
                    <div className="space-y-3">
                        <h2 className="text-xs font-bold text-[rgb(var(--color-text-muted))] uppercase tracking-wider flex items-center gap-1.5"><AppIcon name="target" size="xs" tone="muted" /> {t.missionTabTracker || "Tracker"}</h2>
                        <div className="space-y-2">
                            {trackerMissions.map(renderMission)}
                        </div>
                    </div>
                )}

                {/* Gender Prompt */}
                {!gender && (
                    <div className="p-4 bg-[rgb(var(--color-warning))]/10 border border-[rgb(var(--color-warning))]/20 rounded-xl text-center">
                        <p className="text-sm text-[rgb(var(--color-warning))]">
                            {translations.home_mission_select_gender_hint}
                        </p>
                    </div>
                )}

                {selectedMission && (
                    <MissionDetailDialog
                        mission={selectedMission}
                        isOpen={isDialogOpen}
                        onClose={() => setIsDialogOpen(false)}
                        isCompleted={isMissionCompletedToday(selectedMission.id, selectedMission.type)}
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
