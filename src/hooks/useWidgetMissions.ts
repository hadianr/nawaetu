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

import { useEffect, useMemo, useState } from "react";
import { getDailyMissions, getSeasonalMissions, getWeeklyMissions, Mission, Gender, getLocalizedMission } from "@/data/missions";
import { filterMissionsByArchetype, checkMissionValidation } from "@/lib/habits/mission-utils";
import { usePrayerTimesContext } from "@/context/PrayerTimesContext";
import { useLocale } from "@/context/LocaleContext";
import { useSession } from "next-auth/react";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { APP_EVENTS } from "@/lib/constants/events";
import { DateUtils } from "@/lib/utils/date";
import { normalizeMissionId } from "@/lib/mission-resolver";

export function useWidgetMissions(completedMissions: { id: string; completedAt: string }[]) {
    const { data: session } = useSession();
    const { locale } = useLocale();
    const { data: prayerData } = usePrayerTimesContext();

    const [profileRevision, setProfileRevision] = useState(0);

    const { gender, missions } = useMemo(() => {
        void profileRevision;
        const storage = getStorageService();
        const savedGender = (storage.getOptional(STORAGE_KEYS.USER_GENDER) || session?.user?.gender) as Gender;
        const savedArchetype = (storage.getOptional(STORAGE_KEYS.USER_ARCHETYPE) || session?.user?.archetype) as string | null;

        const hijriMonth = prayerData?.hijriMonth;
        const hijriDay = prayerData?.hijriDay;

        const currentDay = new Date().getDay();
        const daily = getDailyMissions(savedGender, hijriMonth, hijriDay, currentDay);
        const weekly = getWeeklyMissions(savedGender, hijriMonth, hijriDay, currentDay);
        const seasonal = getSeasonalMissions(prayerData?.hijriDate);

        const isRamadhan = hijriMonth?.includes('Ramadan');

        const isFriday = currentDay === 5;
        let allMissions = [...seasonal, ...weekly, ...daily];

        if (savedGender === "male" && isFriday) {
            allMissions = allMissions.filter(m => m.id !== 'dhuhr_prayer');
            // Ensure Friday prayer mission is included on Friday for male users
            const fridayMission: Mission = {
                id: 'friday_prayer',
                title: 'Sholat Jum\'at',
                description: 'Tunaikan sholat Jum\'at di masjid',
                category: 'prayer',
                ruling: 'obligatory',
                type: 'daily',
                hasanahReward: 200,
                icon: '🕌',
                gender: 'male',
                validationType: 'day',
                validationConfig: { allowedDays: [5] }
            };
            if (!allMissions.some(m => m.id === 'friday_prayer')) {
                allMissions.push(fridayMission);
            }
        }

        if (isRamadhan) {
            allMissions = allMissions.filter(m =>
                m.id !== 'sunnah_fasting' &&
                m.id !== 'makeup_fasting' &&
                m.id !== 'makeup_fasting_tracker' &&
                m.id !== 'sunnah_fasting_ramadan_prep'
            );
        }

        const filteredMissions = filterMissionsByArchetype(allMissions, savedArchetype);
        const localizedMissions = filteredMissions.map(mission => getLocalizedMission(mission, locale));
        return { gender: savedGender, missions: localizedMissions };
    }, [locale, prayerData?.hijriDate, prayerData?.hijriMonth, prayerData?.hijriDay, profileRevision, session]);

    useEffect(() => {
        const handleUpdate = () => setProfileRevision((revision) => revision + 1);
        window.addEventListener(APP_EVENTS.PROFILE_UPDATED, handleUpdate);
        window.addEventListener(APP_EVENTS.STORAGE_UPDATED, handleUpdate);

        return () => {
            window.removeEventListener(APP_EVENTS.PROFILE_UPDATED, handleUpdate);
            window.removeEventListener(APP_EVENTS.STORAGE_UPDATED, handleUpdate);
        };
    }, []);

    const isMissionCompleted = (missionId: string, type: Mission['type']) => {
        const todayStr = DateUtils.today();
        const targetId = normalizeMissionId(missionId);

        if (type === 'daily' || type === 'weekly' || !type) {
            return completedMissions.some(m => {
                if (normalizeMissionId(m.id) !== targetId) return false;
                const completedDate = DateUtils.toLocalDate(m.completedAt);
                return completedDate === todayStr;
            });
        }

        if (type === 'tracker') {
            return completedMissions.some(m => normalizeMissionId(m.id) === targetId);
        }

        return false;
    };

    const isRamadhan = prayerData?.hijriMonth?.includes('Ramadan');

    const widgetMissions = [...missions]
        .filter(m => {
            if (m.id === 'daily_intention' || m.id === 'daily_reflection') return false;
            // Prayer completion already has a dedicated home check-in surface.
            if (m.category === 'prayer') return false;
            if (isRamadhan) return m.phase !== 'ramadhan_prep';
            return m.phase !== 'ramadhan_during';
        })
        .sort((a, b) => {
            const aCompleted = isMissionCompleted(a.id, a.type);
            const bCompleted = isMissionCompleted(b.id, b.type);

            if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;

            const aVal = checkMissionValidation(a, prayerData);
            const bVal = checkMissionValidation(b, prayerData);

            const getPriorityScore = (m: Mission, val: ReturnType<typeof checkMissionValidation>) => {
                if (val.locked) return -20;
                if (val.isLate) return -10;

                if (isRamadhan && m.phase === 'ramadhan_during') return 200;

                if (m.category === 'prayer' && m.ruling === 'obligatory') return 100;
                if (m.id === 'makeup_fasting' || (m.phase === 'ramadhan_prep' && m.ruling === 'obligatory')) return 90;
                if (m.category === 'prayer') return 80;
                if (m.category === 'dhikr') return 70;
                if (m.phase === 'ramadhan_prep') return 60;

                return 0;
            };

            const scoreA = getPriorityScore(a, aVal);
            const scoreB = getPriorityScore(b, bVal);

            if (scoreA !== scoreB) return scoreB - scoreA;

            if (a.ruling === 'obligatory' && b.ruling !== 'obligatory') return -1;
            if (b.ruling === 'obligatory' && a.ruling !== 'obligatory') return 1;

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
