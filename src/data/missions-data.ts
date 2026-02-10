// Missions data with gender-specific tasks based on Al-Quran and Sunnah
// Includes validation types for hybrid tracking system

import { getMissionTranslation } from './missions-translations';

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
    phase?: 'all_year' | 'ramadhan_prep' | 'ramadhan_during';
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
        id: 'niat_harian',
        title: 'Luruskan Niat',
        description: 'Tetapkan niat kebaikan hari ini',
        xpReward: 50,
        icon: '🎯',
        gender: null,
        dalil: 'HR. Bukhari no. 1: "Segala amal itu tergantung niatnya..."',
        type: 'daily',
        category: 'ibadah',
        hukum: 'wajib', // Foundation of all ibadah
        phase: 'all_year',
        validationType: 'manual', // Will be handled by custom form
    },
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
        phase: 'all_year',
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
        phase: 'all_year',
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
        phase: 'all_year',
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
        phase: 'all_year',
        validationType: 'time',
        validationConfig: { timeWindow: { start: 15, end: 18 } }
    },
    {
        id: 'muhasabah',
        title: 'Muhasabah Harian',
        description: 'Refleksi ibadah di penghujung hari',
        xpReward: 50,
        icon: '📝',
        gender: null,
        dalil: 'QS. Al-Hashr: 18: "Dan hendaklah setiap diri memperhatikan apa yang telah diperbuatnya..."',
        type: 'daily',
        category: 'ibadah',
        hukum: 'sunnah',
        phase: 'all_year',
        validationType: 'manual', // Will be handled by custom form
    },

    // Individual prayer missions (MOVED TO GENDER SPECIFIC)
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
        phase: 'all_year',
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
        phase: 'ramadhan_prep',
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
        phase: 'all_year',
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
        phase: 'all_year',
        validationType: 'manual'
    },
    {
        id: 'sholat_subuh_female',
        title: 'Sholat Subuh',
        description: 'Tunaikan sholat Subuh tepat waktu',
        xpReward: 25,
        icon: '🌙',
        gender: 'female',
        dalil: 'Sebaik-baik sholat wanita adalah di rumahnya',
        type: 'daily',
        category: 'sholat',
        hukum: 'wajib',
        phase: 'all_year',
        validationType: 'time',
        validationConfig: { afterPrayer: 'fajr' }
    },
    {
        id: 'sholat_dzuhur_female',
        title: 'Sholat Dzuhur',
        description: 'Tunaikan sholat Dzuhur tepat waktu',
        xpReward: 25,
        icon: '☀️',
        gender: 'female',
        dalil: 'Sebaik-baik sholat wanita adalah di rumahnya',
        type: 'daily',
        category: 'sholat',
        hukum: 'wajib',
        phase: 'all_year',
        validationType: 'time',
        validationConfig: { afterPrayer: 'dhuhr' }
    },
    {
        id: 'sholat_ashar_female',
        title: 'Sholat Ashar',
        description: 'Tunaikan sholat Ashar tepat waktu',
        xpReward: 25,
        icon: '🌤️',
        gender: 'female',
        dalil: 'Sebaik-baik sholat wanita adalah di rumahnya',
        type: 'daily',
        category: 'sholat',
        hukum: 'wajib',
        phase: 'all_year',
        validationType: 'time',
        validationConfig: { afterPrayer: 'asr' }
    },
    {
        id: 'sholat_maghrib_female',
        title: 'Sholat Maghrib',
        description: 'Tunaikan sholat Maghrib tepat waktu',
        xpReward: 25,
        icon: '🌅',
        gender: 'female',
        dalil: 'Sebaik-baik sholat wanita adalah di rumahnya',
        type: 'daily',
        category: 'sholat',
        hukum: 'wajib',
        phase: 'all_year',
        validationType: 'time',
        validationConfig: { afterPrayer: 'maghrib' }
    },
    {
        id: 'sholat_isya_female',
        title: 'Sholat Isya',
        description: 'Tunaikan sholat Isya tepat waktu',
        xpReward: 25,
        icon: '🌃',
        gender: 'female',
        dalil: 'Sebaik-baik sholat wanita adalah di rumahnya',
        type: 'daily',
        category: 'sholat',
        hukum: 'wajib',
        phase: 'all_year',
        validationType: 'time',
        validationConfig: { afterPrayer: 'isha' }
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
        phase: 'all_year',
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
        phase: 'all_year',
        validationType: 'time',
        validationConfig: { timeWindow: { start: 8, end: 11 } }
    },
    // MALE PRAYER MISSIONS
    {
        id: 'sholat_subuh_male',
        title: 'Sholat Subuh',
        description: 'Tunaikan sholat Subuh (Utama: Berjamaah)',
        xpReward: 25,
        icon: '🌙',
        gender: 'male',
        dalil: 'Sholat berjamaah lebih utama 27 derajat',
        type: 'daily',
        category: 'sholat',
        hukum: 'wajib',
        phase: 'all_year',
        validationType: 'time',
        validationConfig: { afterPrayer: 'fajr' },
        completionOptions: [
            { label: 'Sholat Sendiri', xpReward: 25 },
            { label: 'Berjamaah di Masjid', xpReward: 75, icon: '🕌' }
        ]
    },
    {
        id: 'sholat_dzuhur_male',
        title: 'Sholat Dzuhur',
        description: 'Tunaikan sholat Dzuhur (Utama: Berjamaah)',
        xpReward: 25,
        icon: '☀️',
        gender: 'male',
        dalil: 'Sholat berjamaah lebih utama 27 derajat',
        type: 'daily',
        category: 'sholat',
        hukum: 'wajib',
        phase: 'all_year',
        validationType: 'time',
        validationConfig: { afterPrayer: 'dhuhr' },
        completionOptions: [
            { label: 'Sholat Sendiri', xpReward: 25 },
            { label: 'Berjamaah di Masjid', xpReward: 75, icon: '🕌' }
        ]
    },
    {
        id: 'sholat_ashar_male',
        title: 'Sholat Ashar',
        description: 'Tunaikan sholat Ashar (Utama: Berjamaah)',
        xpReward: 25,
        icon: '🌤️',
        gender: 'male',
        dalil: 'Sholat berjamaah lebih utama 27 derajat',
        type: 'daily',
        category: 'sholat',
        hukum: 'wajib',
        phase: 'all_year',
        validationType: 'time',
        validationConfig: { afterPrayer: 'asr' },
        completionOptions: [
            { label: 'Sholat Sendiri', xpReward: 25 },
            { label: 'Berjamaah di Masjid', xpReward: 75, icon: '🕌' }
        ]
    },
    {
        id: 'sholat_maghrib_male',
        title: 'Sholat Maghrib',
        description: 'Tunaikan sholat Maghrib (Utama: Berjamaah)',
        xpReward: 25,
        icon: '🌅',
        gender: 'male',
        dalil: 'Sholat berjamaah lebih utama 27 derajat',
        type: 'daily',
        category: 'sholat',
        hukum: 'wajib',
        phase: 'all_year',
        validationType: 'time',
        validationConfig: { afterPrayer: 'maghrib' },
        completionOptions: [
            { label: 'Sholat Sendiri', xpReward: 25 },
            { label: 'Berjamaah di Masjid', xpReward: 75, icon: '🕌' }
        ]
    },
    {
        id: 'sholat_isya_male',
        title: 'Sholat Isya',
        description: 'Tunaikan sholat Isya (Utama: Berjamaah)',
        xpReward: 25,
        icon: '🌃',
        gender: 'male',
        dalil: 'Sholat berjamaah lebih utama 27 derajat',
        type: 'daily',
        category: 'sholat',
        hukum: 'wajib',
        phase: 'all_year',
        validationType: 'time',
        validationConfig: { afterPrayer: 'isha' },
        completionOptions: [
            { label: 'Sholat Sendiri', xpReward: 25 },
            { label: 'Berjamaah di Masjid', xpReward: 75, icon: '🕌' }
        ]
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

// Ramadhan Missions Data
export const RAMADHAN_MISSIONS: Mission[] = [
    {
        id: 'qadha_puasa',
        title: 'Bayar Qadha Puasa',
        description: 'Bayar hutang puasa Ramadhan tahun lalu',
        category: 'puasa',
        xpReward: 30,
        icon: '📅',
        hukum: 'wajib',
        type: 'tracker',
        validationType: 'manual',
        phase: 'ramadhan_prep',
        gender: null,
        dalil: 'QS. Al-Baqarah: 184'
    },
    {
        id: 'cek_kesehatan',
        title: 'Cek Kesehatan (Checkup)',
        description: 'Pastikan tubuh fit sebelum Ramadhan',
        category: 'ibadah',
        xpReward: 10,
        icon: '🩺',
        hukum: 'sunnah',
        type: 'daily',
        validationType: 'manual',
        phase: 'ramadhan_prep',
        gender: null,
        dalil: 'Mukmin yang kuat lebih dicintai Allah'
    },
    {
        id: 'puasa_sunnah_ramadhan_prep',
        title: 'Puasa Sunnah (Min. 1x)',
        description: 'Latihan puasa sunnah (Senin/Kamis)',
        category: 'puasa',
        xpReward: 15,
        icon: '🥤',
        hukum: 'sunnah',
        type: 'daily',
        validationType: 'manual',
        phase: 'ramadhan_prep',
        gender: null,
        dalil: 'HR. Tirmidzi 743'
    },
    {
        id: 'baca_article',
        title: 'Baca Artikel Fiqih',
        description: 'Pelajari hukum dan fiqih puasa',
        category: 'ibadah',
        xpReward: 5,
        icon: '📚',
        hukum: 'sunnah',
        type: 'daily',
        validationType: 'manual',
        phase: 'ramadhan_prep',
        gender: null,
        dalil: 'Menuntut ilmu itu wajib'
    },
    {
        id: 'sedekah_subuh',
        title: 'Rutin Sedekah Subuh',
        description: 'Sedekah di waktu subuh setiap hari',
        category: 'ibadah',
        xpReward: 15,
        icon: '💰',
        hukum: 'sunnah',
        type: 'daily',
        validationType: 'manual',
        phase: 'ramadhan_prep',
        gender: null,
        dalil: 'Malaikat mendoakan orang yang bersedekah'
    },
    {
        id: 'maaf_maafan',
        title: 'Saling Memaafkan',
        description: 'Minta maaf kepada orang tua & teman',
        category: 'ibadah',
        xpReward: 10,
        icon: '🤝',
        hukum: 'sunnah',
        type: 'daily',
        validationType: 'manual',
        phase: 'ramadhan_prep',
        gender: null,
        dalil: 'Pemaaf adalah sifat mulia'
    },
    {
        id: 'target_khatam',
        title: "Set Target Khatam",
        description: 'Buat target tilawah harian',
        category: 'quran',
        xpReward: 10,
        icon: '🎯',
        hukum: 'sunnah',
        type: 'daily',
        validationType: 'manual',
        phase: 'ramadhan_prep',
        gender: null,
        dalil: 'Bacalah Al-Quran, ia memberi syafaat'
    },
    {
        id: 'sholat_tarawih',
        title: "Sholat Tarawih",
        description: 'Tunaikan sholat sunnah Tarawih',
        category: 'sholat',
        xpReward: 50,
        icon: '🕌',
        hukum: 'sunnah',
        type: 'daily',
        validationType: 'manual',
        phase: 'ramadhan_during',
        gender: null,
        dalil: 'Qiyamul Lail di bulan Ramadhan'
    },
    {
        id: 'bukber_hemat',
        title: "Buka Puasa Sederhana",
        description: 'Buka puasa tidak berlebihan',
        category: 'ibadah',
        xpReward: 20,
        icon: 'dates',
        hukum: 'sunnah',
        type: 'daily',
        validationType: 'manual',
        phase: 'ramadhan_during',
        gender: null,
        dalil: 'Makan dan minumlah, jangan berlebihan'
    },
    {
        id: 'sahur_berkah',
        title: "Makan Sahur Berkah",
        description: 'Makan sahur sebelum subuh untuk keberkahan',
        category: 'ibadah',
        xpReward: 20,
        icon: '🥣',
        hukum: 'sunnah',
        type: 'daily',
        validationType: 'manual',
        phase: 'ramadhan_during',
        gender: null,
        dalil: 'Bersahurlah, karena pada sahur ada keberkahan'
    },
];

export const SYABAN_MISSIONS: Mission[] = [
    {
        id: 'qadha_puasa', // Standardized ID to match Tracker
        title: "Lunasi Qadha Puasa",
        description: 'Segera lunasi hutang puasa sebelum Ramadhan',
        category: 'puasa',
        xpReward: 100,
        icon: '📅',
        hukum: 'wajib',
        type: 'tracker',
        validationType: 'manual',
        phase: 'ramadhan_prep',
        gender: null,
        dalil: 'Aisyah RA berkata: "Aku memiliki hutang puasa Ramadhan, aku tidak bisa mengqadhanya kecuali pada bulan Sya\'ban." (HR. Bukhari 1950)'
    },
    {
        id: 'puasa_syaban',
        title: "Puasa Sunnah Sya'ban",
        description: 'Perbanyak puasa sunnah di bulan Sya\'ban',
        category: 'puasa',
        xpReward: 50,
        icon: '🌙',
        hukum: 'sunnah',
        type: 'daily',
        validationType: 'manual',
        phase: 'ramadhan_prep',
        gender: null,
        dalil: 'HR. Bukhari no. 1969: "Saya tidak melihat Rasulullah menyempurnakan puasa sebulan penuh selain Ramadhan, dan saya tidak melihat beliau memperbanyak puasa selain di bulan Sya\'ban."'
    },
    {
        id: 'baca_quran_syaban',
        title: "Bulan Para Qurra'",
        description: 'Perbanyak tilawah Al-Quran (Syahrul Qurra)',
        category: 'quran',
        xpReward: 40,
        icon: '📖',
        hukum: 'sunnah',
        type: 'daily',
        validationType: 'manual',
        phase: 'ramadhan_prep',
        gender: null,
        dalil: 'Salamah bin Kuhail berkata: "Bulan Sya\'ban adalah bulan para pembaca Al-Qur\'an."'
    },
    {
        id: 'persiapan_ilmu', // Renamed/Standardized
        title: "Pelajari Fiqih Ramadhan",
        description: 'Bekali diri dengan ilmu puasa & zakat',
        category: 'ibadah',
        xpReward: 30,
        icon: '📚',
        hukum: 'wajib',
        type: 'daily',
        validationType: 'manual',
        phase: 'ramadhan_prep',
        gender: null,
        dalil: 'Menuntut ilmu wajib bagi setiap muslim. (HR. Ibnu Majah)'
    },
    {
        id: 'cek_kesehatan', // From RAMADHAN_PREP
        title: 'Cek Kesehatan (Checkup)',
        description: 'Pastikan tubuh fit sebelum Ramadhan',
        category: 'ibadah',
        xpReward: 10,
        icon: '🩺',
        hukum: 'sunnah',
        type: 'daily',
        validationType: 'manual',
        phase: 'ramadhan_prep',
        gender: null,
        dalil: 'Mukmin yang kuat lebih dicintai Allah'
    },
    {
        id: 'sedekah_subuh', // From RAMADHAN_PREP
        title: 'Rutin Sedekah Subuh',
        description: 'Sedekah di waktu subuh setiap hari',
        category: 'ibadah',
        xpReward: 15,
        icon: '💰',
        hukum: 'sunnah',
        type: 'daily',
        validationType: 'manual',
        phase: 'ramadhan_prep',
        gender: null,
        dalil: 'Malaikat mendoakan orang yang bersedekah'
    },
    {
        id: 'maaf_maafan', // From RAMADHAN_PREP
        title: 'Saling Memaafkan',
        description: 'Minta maaf kepada orang tua & teman',
        category: 'ibadah',
        xpReward: 10,
        icon: '🤝',
        hukum: 'sunnah',
        type: 'daily',
        validationType: 'manual',
        phase: 'ramadhan_prep',
        gender: null,
        dalil: 'Pemaaf adalah sifat mulia'
    },
    {
        id: 'malam_nisfu_syaban',
        title: "Malam Nisfu Sya'ban",
        description: 'Perbanyak doa & amalan di pertengahan Sya\'ban',
        category: 'ibadah',
        xpReward: 60,
        icon: '✨',
        hukum: 'sunnah',
        type: 'daily',
        validationType: 'manual',
        phase: 'ramadhan_prep',
        gender: null,
        dalil: 'HR. Ibnu Majah 1390: "Sesungguhnya Allah melihat pada malam nisfu Sya\'ban..."',
    }
];

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

// Helper function to get localized mission
export function getLocalizedMission(mission: Mission, locale: string): Mission {
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
                label: option.label === 'Sholat Sendiri'
                    ? (locale === 'en' ? 'Pray Alone' : 'Sholat Sendiri')
                    : (locale === 'en' ? 'Congregational at Mosque' : 'Berjamaah di Masjid')
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
