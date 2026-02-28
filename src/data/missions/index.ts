import { SETTINGS_TRANSLATIONS } from '../translations';
import { Mission, Gender } from './types';
import { UNIVERSAL_MISSIONS, MALE_MISSIONS, FEMALE_MISSIONS } from './daily';
import { RAMADHAN_MISSIONS, SYABAN_MISSIONS } from './seasonal';

export * from './types';
export * from './daily';
export * from './seasonal';

// Get missions filtered by gender
export function getMissionsForGender(gender: Gender): Mission[] {
    const missions = [...UNIVERSAL_MISSIONS];

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

    if (t[titleKey]) {
        return {
            title: t[titleKey] as string,
            description: t[descKey] as string
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
            description: translation.description
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

// Helper function to get all missions with translations
export function getAllMissionsLocalized(locale: string): Mission[] {
    return [...UNIVERSAL_MISSIONS, ...MALE_MISSIONS, ...FEMALE_MISSIONS]
        .map(mission => getLocalizedMission(mission, locale));
}

// Helper function to get seasonal missions with translations
export function getSeasonalMissionsLocalized(hijriDateStr: string, locale: string): Mission[] {
    const missions = getSeasonalMissions(hijriDateStr);
    return missions.map(mission => getLocalizedMission(mission, locale));
}
