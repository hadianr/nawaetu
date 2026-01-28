// Missions data with gender-specific tasks based on Al-Quran and Sunnah
// Includes validation types for hybrid tracking system

export type Gender = 'male' | 'female' | null;
export type ValidationType = 'auto' | 'time' | 'day' | 'manual';

export interface ValidationConfig {
    requiredCount?: number;     // For auto validation (e.g., 10 ayat, 99 tasbih)
    allowedDays?: number[];     // For day validation (0=Sun, 1=Mon, 4=Thu, 5=Fri)
    afterPrayer?: string;       // For time validation (fajr, dhuhr, asr, maghrib, isha)
    timeWindow?: { start: number; end: number }; // Hours window (e.g., pagi: 4-10)
}

export type Hukum = 'wajib' | 'sunnah' | 'mubah' | 'makruh' | 'harram';

export interface Mission {
    id: string;
    title: string;
    description: string;
    xpReward: number;
    icon: string;
    gender: Gender;
    dalil?: string;
    type: 'daily' | 'weekly' | 'tracker';
    category: 'ibadah' | 'quran' | 'dzikir' | 'puasa' | 'sholat';
    hukum: Hukum;
    validationType: ValidationType;
    validationConfig?: ValidationConfig;
    completionOptions?: {
        label: string;
        xpReward: number;
        icon?: string;
    }[];
}

// Prayer names mapping
export const PRAYER_NAMES: Record<string, string> = {
    fajr: 'Subuh',
    dhuhr: 'Dzuhur',
    asr: 'Ashar',
    maghrib: 'Maghrib',
    isha: 'Isya',
    dhuha: 'Dhuha'
};

// Universal missions (for all genders)
export const UNIVERSAL_MISSIONS: Mission[] = [
    {
        id: 'quran_10_ayat',
        title: 'Baca 10 Ayat Quran',
        description: 'Membaca minimal 10 ayat Al-Quran',
        xpReward: 50,
        icon: '📖',
        gender: null,
        dalil: 'QS. Al-Muzzammil:20',
        type: 'daily',
        category: 'quran',
        hukum: 'sunnah',
        validationType: 'auto',
        validationConfig: { requiredCount: 10 }
    },
    {
        id: 'tasbih_99',
        title: 'Tasbih 99x',
        description: 'Selesaikan dzikir tasbih 99 kali',
        xpReward: 50,
        icon: '📿',
        gender: null,
        dalil: 'HR Bukhari 6329',
        type: 'daily',
        category: 'dzikir',
        hukum: 'sunnah',
        validationType: 'auto',
        validationConfig: { requiredCount: 99 }
    },
    {
        id: 'doa_pagi',
        title: 'Dzikir Pagi',
        description: 'Baca dzikir pagi (jam 04:00-10:00)',
        xpReward: 20,
        icon: '🌅',
        gender: null,
        dalil: 'Al-Ma\'thurat',
        type: 'daily',
        category: 'dzikir',
        hukum: 'sunnah',
        validationType: 'time',
        validationConfig: { timeWindow: { start: 4, end: 10 } }
    },
    {
        id: 'doa_sore',
        title: 'Dzikir Sore',
        description: 'Baca dzikir sore (jam 15:00-18:00)',
        xpReward: 20,
        icon: '🌆',
        gender: null,
        dalil: 'Al-Ma\'thurat',
        type: 'daily',
        category: 'dzikir',
        hukum: 'sunnah',
        validationType: 'time',
        validationConfig: { timeWindow: { start: 15, end: 18 } }
    },
    // Individual prayer missions
    {
        id: 'sholat_subuh',
        title: 'Sholat Subuh',
        description: 'Tunaikan sholat Subuh',
        xpReward: 25,
        icon: '🌙',
        gender: null,
        dalil: 'QS. Al-Baqarah:238',
        type: 'daily',
        category: 'sholat',
        hukum: 'wajib',
        validationType: 'time',
        validationConfig: { afterPrayer: 'fajr' },
        completionOptions: [
            { label: 'Sholat Sendiri', xpReward: 25 },
            { label: 'Berjamaah di Masjid', xpReward: 75, icon: '🕌' }
        ]
    },
    {
        id: 'sholat_dzuhur',
        title: 'Sholat Dzuhur',
        description: 'Tunaikan sholat Dzuhur',
        xpReward: 25,
        icon: '☀️',
        gender: null,
        dalil: 'QS. Al-Baqarah:238',
        type: 'daily',
        category: 'sholat',
        hukum: 'wajib',
        validationType: 'time',
        validationConfig: { afterPrayer: 'dhuhr' },
        completionOptions: [
            { label: 'Sholat Sendiri', xpReward: 25 },
            { label: 'Berjamaah di Masjid', xpReward: 75, icon: '🕌' }
        ]
    },
    {
        id: 'sholat_ashar',
        title: 'Sholat Ashar',
        description: 'Tunaikan sholat Ashar',
        xpReward: 25,
        icon: '🌤️',
        gender: null,
        dalil: 'QS. Al-Baqarah:238',
        type: 'daily',
        category: 'sholat',
        hukum: 'wajib',
        validationType: 'time',
        validationConfig: { afterPrayer: 'asr' },
        completionOptions: [
            { label: 'Sholat Sendiri', xpReward: 25 },
            { label: 'Berjamaah di Masjid', xpReward: 75, icon: '🕌' }
        ]
    },
    {
        id: 'sholat_maghrib',
        title: 'Sholat Maghrib',
        description: 'Tunaikan sholat Maghrib',
        xpReward: 25,
        icon: '🌅',
        gender: null,
        dalil: 'QS. Al-Baqarah:238',
        type: 'daily',
        category: 'sholat',
        hukum: 'wajib',
        validationType: 'time',
        validationConfig: { afterPrayer: 'maghrib' },
        completionOptions: [
            { label: 'Sholat Sendiri', xpReward: 25 },
            { label: 'Berjamaah di Masjid', xpReward: 75, icon: '🕌' }
        ]
    },
    {
        id: 'sholat_isya',
        title: 'Sholat Isya',
        description: 'Tunaikan sholat Isya',
        xpReward: 25,
        icon: '🌃',
        gender: null,
        dalil: 'QS. Al-Baqarah:238',
        type: 'daily',
        category: 'sholat',
        hukum: 'wajib',
        validationType: 'time',
        validationConfig: { afterPrayer: 'isha' },
        completionOptions: [
            { label: 'Sholat Sendiri', xpReward: 25 },
            { label: 'Berjamaah di Masjid', xpReward: 75, icon: '🕌' }
        ]
    },
    {
        id: 'puasa_sunnah',
        title: 'Puasa Senin/Kamis',
        description: 'Puasa sunnah (hanya Senin/Kamis)',
        xpReward: 150,
        icon: '🌙',
        gender: null,
        dalil: 'HR Muslim 1162',
        type: 'weekly',
        category: 'puasa',
        hukum: 'sunnah',
        validationType: 'day',
        validationConfig: { allowedDays: [1, 4] } // Monday = 1, Thursday = 4
    }
];

// Female-specific missions (Perempuan)
export const FEMALE_MISSIONS: Mission[] = [
    {
        id: 'qadha_puasa_tracker',
        title: 'Tracker Qadha Puasa',
        description: 'Catat dan bayar utang puasa Ramadhan',
        xpReward: 100,
        icon: '📅',
        gender: 'female',
        dalil: 'HR Muslim 335 - Aisyah r.a.',
        type: 'tracker',
        category: 'puasa',
        hukum: 'sunnah',
        validationType: 'manual'
    },
    {
        id: 'dzikir_haid',
        title: 'Dzikir Saat Udzur',
        description: 'Perbanyak dzikir dan istighfar',
        xpReward: 30,
        icon: '💜',
        gender: 'female',
        dalil: 'Amalan saat haid',
        type: 'daily',
        category: 'dzikir',
        hukum: 'sunnah',
        validationType: 'manual'
    },
    {
        id: 'shalawat_100',
        title: 'Shalawat 100x',
        description: 'Membaca shalawat 100 kali',
        xpReward: 40,
        icon: '💚',
        gender: 'female',
        dalil: 'QS. Al-Ahzab:56',
        type: 'daily',
        category: 'dzikir',
        hukum: 'sunnah',
        validationType: 'manual'
    }
];

// Male-specific missions (Laki-laki)
export const MALE_MISSIONS: Mission[] = [
    {
        id: 'sholat_jumat',
        title: 'Sholat Jumat',
        description: 'Tunaikan sholat Jumat (hanya Jumat)',
        xpReward: 200,
        icon: '🕌',
        gender: 'male',
        dalil: 'QS. Al-Jumu\'ah:9',
        type: 'weekly',
        category: 'sholat',
        hukum: 'wajib',
        validationType: 'day',
        validationConfig: { allowedDays: [5] } // Friday = 5
    },
    {
        id: 'sholat_dhuha',
        title: 'Sholat Dhuha',
        description: 'Tunaikan sholat Dhuha (08:00-11:00)',
        xpReward: 50,
        icon: '☀️',
        gender: 'male',
        dalil: 'HR Muslim 748',
        type: 'daily',
        category: 'sholat',
        hukum: 'sunnah',
        validationType: 'time',
        validationConfig: { timeWindow: { start: 8, end: 11 } }
    }
];

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

// Qadha Puasa tracker data structure
export interface QadhaPuasaData {
    totalDays: number;
    completedDays: number;
    lastUpdated: string;
}

export const DEFAULT_QADHA_DATA: QadhaPuasaData = {
    totalDays: 0,
    completedDays: 0,
    lastUpdated: new Date().toISOString()
};
