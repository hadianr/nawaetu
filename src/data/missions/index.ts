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

import { SETTINGS_TRANSLATIONS } from '../translations';
import { Mission, Gender } from './types';
import { UNIVERSAL_MISSIONS, MALE_MISSIONS, FEMALE_MISSIONS } from './daily';
import { SUNNAH_PRAYER_MISSIONS } from './sunnah-prayer';
import { RAMADHAN_MISSIONS, SYABAN_MISSIONS } from './seasonal';
import { MISSION_CONTENTS } from './content';

export * from './types';
export * from './daily';
export * from './seasonal';
export * from './sunnah-prayer';

// Get missions filtered by gender
export function getMissionsForGender(gender: Gender): Mission[] {
    const missions = [...UNIVERSAL_MISSIONS, ...SUNNAH_PRAYER_MISSIONS];

    if (gender === 'female') {
        missions.push(...FEMALE_MISSIONS);
    } else if (gender === 'male') {
        missions.push(...MALE_MISSIONS);
    }

    return missions;
}

// Get daily missions only
export function getDailyMissions(gender: Gender): Mission[] {
    return getMissionsForGender(gender).filter(m => m.type === 'daily');
}

// Get weekly missions only
export function getWeeklyMissions(gender: Gender): Mission[] {
    return getMissionsForGender(gender).filter(m => m.type === 'weekly');
}

export function getRamadhanMissions(): Mission[] {
    return RAMADHAN_MISSIONS;
}

export function getSeasonalMissions(hijriDateStr?: string): Mission[] {
    if (!hijriDateStr) return RAMADHAN_MISSIONS; // Default to Ramadhan if unknown for now, or maybe default to none? Let's use RAMADHAN as fallback or Syaban.

    const lower = hijriDateStr.toLowerCase();
    if (lower.includes("ramadhan") || lower.includes("ramadan")) {
        return RAMADHAN_MISSIONS;
    }

    if (
        lower.includes("sha'ban") ||
        lower.includes("syaban") ||
        lower.includes("sya'ban") ||
        lower.includes("shaban") ||
        lower.includes("sha’ban") ||
        lower.includes("shaʿbān") || // API Output
        (lower.includes("sha") && lower.includes("ban") && lower.includes("8")) // Fallback: Month 8 (if number is available in string?) No, string is "9 Shaʿbān 1447H".
    ) {
        return SYABAN_MISSIONS;
    }

    // Default or other months
    return [];
}

// Helper function to get translation
function getMissionTranslation(missionId: string, locale: string) {
    const t = SETTINGS_TRANSLATIONS[locale as keyof typeof SETTINGS_TRANSLATIONS] || SETTINGS_TRANSLATIONS.id;
    const titleKey = `mission_${missionId}_title` as keyof typeof t;
    const descKey = `mission_${missionId}_desc` as keyof typeof t;
    const dalilKey = `mission_${missionId}_dalil` as keyof typeof t;

    if (t[titleKey]) {
        return {
            title: t[titleKey] as string,
            description: t[descKey] as string,
            dalil: (t[dalilKey] as string) || undefined,
        };
    }
    return null;
}

// Helper function to get localized mission
export function getLocalizedMission(mission: Mission, locale: string): Mission {
    const t = SETTINGS_TRANSLATIONS[locale as keyof typeof SETTINGS_TRANSLATIONS] || SETTINGS_TRANSLATIONS.id;
    const translation = getMissionTranslation(mission.id, locale);

    if (translation) {
        const localizedMission = {
            ...mission,
            title: translation.title,
            description: translation.description,
            dalil: translation.dalil || mission.dalil,
        };

        // Localize completion options if they exist
        if (mission.completionOptions) {
            localizedMission.completionOptions = mission.completionOptions.map(option => ({
                ...option,
                label: option.label === 'Pray Alone'
                    ? t.mission_dialog_sholat_sendiri
                    : t.mission_dialog_sholat_makmum
            }));
        }

        return localizedMission;
    }

    // Fallback to original (Indonesian) if translation not found
    return mission;
}

// Helper function to get localized mission content (guides, fadhilah, intro, source, niat)
export function getLocalizedMissionContent(missionId: string, locale: string) {
    const content = MISSION_CONTENTS[missionId];
    if (!content) return null;

    const t = SETTINGS_TRANSLATIONS[locale as keyof typeof SETTINGS_TRANSLATIONS] || SETTINGS_TRANSLATIONS.id;

    let niat = content.niat;
    if (niat) {
        niat = {
            munfarid: {
                ...niat.munfarid,
                title: (t as Record<string, any>)[`mission_${missionId}_niat_munfarid_title`] || niat.munfarid.title,
                translation: (t as Record<string, any>)[`mission_${missionId}_niat_munfarid_translation`] || niat.munfarid.translation,
            },
            ...(niat.makmum ? {
                makmum: {
                    ...niat.makmum,
                    title: (t as Record<string, any>)[`mission_${missionId}_niat_makmum_title`] || niat.makmum.title,
                    translation: (t as Record<string, any>)[`mission_${missionId}_niat_makmum_translation`] || niat.makmum.translation,
                }
            } : {})
        };
    }

    const dict = t as Record<string, any>;

    return {
        ...content,
        intro: dict[`mission_${missionId}_intro`] || content.intro,
        fadhilah: dict[`mission_${missionId}_fadhilah`] || content.fadhilah,
        guides: dict[`mission_${missionId}_guides`] || content.guides,
        source: dict[`mission_${missionId}_source`] || content.source,
        niat,
    };
}
