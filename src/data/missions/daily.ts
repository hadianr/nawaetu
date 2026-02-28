import { Mission } from './types';

export const PRAYER_NAMES: Record<string, string> = {
    fajr: 'Subuh',
    dhuhr: 'Dzuhur',
    asr: 'Ashar',
    maghrib: 'Maghrib',
    isha: 'Isya',
    dhuha: 'Dhuha'
};

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
        category: 'worship',
        hukum: 'obligatory', // Foundation of all worship
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
        category: 'dhikr',
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
        category: 'dhikr',
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
        category: 'dhikr',
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
        category: 'worship',
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
        category: 'fasting',
        hukum: 'sunnah',
        phase: 'all_year',
        validationType: 'day',
        validationConfig: { allowedDays: [1, 4] } // Monday = 1, Thursday = 4
    }
];

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
        category: 'fasting',
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
        category: 'dhikr',
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
        category: 'dhikr',
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
        category: 'prayer',
        hukum: 'obligatory',
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
        category: 'prayer',
        hukum: 'obligatory',
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
        category: 'prayer',
        hukum: 'obligatory',
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
        category: 'prayer',
        hukum: 'obligatory',
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
        category: 'prayer',
        hukum: 'obligatory',
        phase: 'all_year',
        validationType: 'time',
        validationConfig: { afterPrayer: 'isha' }
    }
];

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
        category: 'prayer',
        hukum: 'obligatory',
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
        category: 'prayer',
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
        category: 'prayer',
        hukum: 'obligatory',
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
        category: 'prayer',
        hukum: 'obligatory',
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
        category: 'prayer',
        hukum: 'obligatory',
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
        category: 'prayer',
        hukum: 'obligatory',
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
        category: 'prayer',
        hukum: 'obligatory',
        phase: 'all_year',
        validationType: 'time',
        validationConfig: { afterPrayer: 'isha' },
        completionOptions: [
            { label: 'Sholat Sendiri', xpReward: 25 },
            { label: 'Berjamaah di Masjid', xpReward: 75, icon: '🕌' }
        ]
    }
];
