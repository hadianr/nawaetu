"use client";

import { useState, useEffect } from "react";
import { getDailyMissions, getSeasonalMissions, getWeeklyMissions, Mission, Gender, getLocalizedMission } from "@/data/missions";
import { filterMissionsByArchetype, checkMissionValidation } from "@/lib/mission-utils";
import { usePrayerTimesContext } from "@/context/PrayerTimesContext";
import { useLocale } from "@/context/LocaleContext";
import { useSession } from "next-auth/react";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

export function useWidgetMissions(completedMissions: { id: string; completedAt: string }[]) {
    const { data: session } = useSession();
    const { locale } = useLocale();
    const { data: prayerData } = usePrayerTimesContext();

    const [gender, setGender] = useState<Gender>(null);
    const [missions, setMissions] = useState<Mission[]>([]);

    const loadData = () => {
        const storage = getStorageService();
        const savedGender = (session?.user?.gender || storage.getOptional(STORAGE_KEYS.USER_GENDER)) as Gender;
        const savedArchetype = (session?.user?.archetype || storage.getOptional(STORAGE_KEYS.USER_ARCHETYPE)) as string | null;

        setGender(savedGender);

        const daily = getDailyMissions(savedGender);
        const weekly = getWeeklyMissions(savedGender);
        const seasonal = getSeasonalMissions(prayerData?.hijriDate);

        const isRamadhan = prayerData?.hijriMonth?.includes('Ramadan');

        let allMissions = [...seasonal, ...weekly, ...daily];

        if (isRamadhan) {
            allMissions = allMissions.filter(m =>
                m.id !== 'puasa_sunnah' &&
                m.id !== 'qadha_puasa' &&
                m.id !== 'qadha_puasa_tracker' &&
                m.id !== 'puasa_sunnah_ramadhan_prep'
            );
        }

        const filteredMissions = filterMissionsByArchetype(allMissions, savedArchetype);
        const localizedMissions = filteredMissions.map(mission => getLocalizedMission(mission, locale));
        setMissions(localizedMissions);
    };

    useEffect(() => {
        loadData();
        const handleUpdate = () => loadData();
        window.addEventListener('profile_updated', handleUpdate);
        window.addEventListener('storage', handleUpdate);

        return () => {
            window.removeEventListener('profile_updated', handleUpdate);
            window.removeEventListener('storage', handleUpdate);
        };
    }, [prayerData?.hijriDate, locale, session]);

    const isMissionCompleted = (missionId: string, type: Mission['type']) => {
        const todayStr = new Date().toISOString().split('T')[0];

        if (type === 'daily' || type === 'weekly' || !type) {
            return completedMissions.some(m => {
                if (m.id !== missionId) return false;
                const completedDate = m.completedAt.split('T')[0];
                return completedDate === todayStr;
            });
        }

        if (type === 'tracker') {
            return completedMissions.some(m => m.id === missionId);
        }

        return false;
    };

    const isRamadhan = prayerData?.hijriMonth?.includes('Ramadan');

    const widgetMissions = [...missions]
        .filter(m => {
            if (m.id === 'niat_harian' || m.id === 'muhasabah') return false;
            if (isRamadhan) return m.phase !== 'ramadhan_prep';
            return m.phase !== 'ramadhan_during';
        })
        .sort((a, b) => {
            const aCompleted = isMissionCompleted(a.id, a.type);
            const bCompleted = isMissionCompleted(b.id, b.type);

            if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;

            const aVal = checkMissionValidation(a, prayerData);
            const bVal = checkMissionValidation(b, prayerData);

            const getPriorityScore = (m: Mission, val: any) => {
                if (val.locked) return -20;
                if (val.isLate) return -10;

                if (isRamadhan && m.phase === 'ramadhan_during') return 200;

                if (m.category === 'prayer' && m.hukum === 'obligatory') return 100;
                if (m.id === 'qadha_puasa' || (m.phase === 'ramadhan_prep' && m.hukum === 'obligatory')) return 90;
                if (m.category === 'prayer') return 80;
                if (m.category === 'dhikr') return 70;
                if (m.phase === 'ramadhan_prep') return 60;

                return 0;
            };

            const scoreA = getPriorityScore(a, aVal);
            const scoreB = getPriorityScore(b, bVal);

            if (scoreA !== scoreB) return scoreB - scoreA;

            if (a.hukum === 'obligatory' && b.hukum !== 'obligatory') return -1;
            if (b.hukum === 'obligatory' && a.hukum !== 'obligatory') return 1;

            return 0;
        });

    return {
        missions,
        widgetMissions,
        gender,
        isMissionCompleted,
        checkValidation: (mission: Mission) => checkMissionValidation(mission, prayerData),
    };
}
