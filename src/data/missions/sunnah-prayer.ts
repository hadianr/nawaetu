/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 */

import { Mission } from './types';

export const SUNNAH_PRAYER_MISSIONS: Mission[] = [
    // Rawatib Subuh
    {
        id: 'sunnah_qobliyah_fajr',
        title: 'Qobliyah Subuh',
        description: '2 Rakaat sebelum Subuh (setelah adzan Subuh)',
        hasanahReward: 30, // Muakkad
        icon: '✨',
        gender: null,
        dalil: 'HR. Muslim no. 725',
        hadithId: 'hadith_qobliyah_fajr',
        type: 'daily',
        category: 'prayer',
        ruling: 'sunnah',
        phase: 'all_year',
        validationType: 'time',
        validationConfig: { afterPrayer: 'fajr' }
    },
    // Rawatib Dzuhur
    {
        id: 'sunnah_qobliyah_dhuhr',
        title: 'Qobliyah Dzuhur',
        description: 'Sholat sunnah sebelum Dzuhur (setelah adzan Dzuhur)',
        hasanahReward: 25,
        icon: '☀️',
        gender: null,
        dalil: 'HR. Tirmidzi no. 417',
        hadithId: 'hadith_sholat_rawatib',
        type: 'daily',
        category: 'prayer',
        ruling: 'sunnah',
        phase: 'all_year',
        validationType: 'time',
        validationConfig: { afterPrayer: 'dhuhr' }
    },
    {
        id: 'sunnah_ba_diyah_dhuhr',
        title: "Ba'diyah Dzuhur",
        description: 'Sholat sunnah sesudah Dzuhur (setelah sholat Dzuhur)',
        hasanahReward: 25,
        icon: '☀️',
        gender: null,
        dalil: 'HR. Tirmidzi no. 427',
        hadithId: 'hadith_sholat_rawatib',
        type: 'daily',
        category: 'prayer',
        ruling: 'sunnah',
        phase: 'all_year',
        validationType: 'time',
        validationConfig: { afterPrayer: 'dhuhr' }
    },
    // Rawatib Maghrib
    {
        id: 'sunnah_ba_diyah_maghrib',
        title: "Ba'diyah Maghrib",
        description: 'Sholat sunnah sesudah Maghrib (setelah sholat Maghrib)',
        hasanahReward: 25,
        icon: '🌅',
        gender: null,
        dalil: 'HR. Bukhari no. 1180',
        hadithId: 'hadith_rawatib_maghrib',
        type: 'daily',
        category: 'prayer',
        ruling: 'sunnah',
        phase: 'all_year',
        validationType: 'time',
        validationConfig: { afterPrayer: 'maghrib' }
    },
    // Rawatib Isya
    {
        id: 'sunnah_ba_diyah_isha',
        title: "Ba'diyah Isya",
        description: 'Sholat sunnah sesudah Isya (setelah sholat Isya)',
        hasanahReward: 25,
        icon: '🌙',
        gender: null,
        dalil: 'HR. Muslim no. 729',
        hadithId: 'hadith_sholat_rawatib',
        type: 'daily',
        category: 'prayer',
        ruling: 'sunnah',
        phase: 'all_year',
        validationType: 'time',
        validationConfig: { afterPrayer: 'isha' }
    },
    // Dhuha (Universal)
    {
        id: 'sunnah_dhuha',
        title: 'Sholat Dhuha',
        description: 'Tunaikan sholat Dhuha (jam 06:00-11:00)',
        hasanahReward: 50,
        icon: '☀️',
        gender: null,
        dalil: 'HR. Muslim no. 720',
        hadithId: 'hadith_sholat_dhuha',
        type: 'daily',
        category: 'prayer',
        ruling: 'sunnah',
        phase: 'all_year',
        validationType: 'time',
        validationConfig: { timeWindow: { start: 6, end: 11 } }
    },
    // Witir
    {
        id: 'sunnah_witir',
        title: 'Sholat Witir',
        description: 'Penutup sholat malam (setelah Isya - Subuh)',
        hasanahReward: 40,
        icon: '🌙',
        gender: null,
        dalil: 'HR. Bukhari no. 998',
        hadithId: 'hadith_sholat_witir',
        type: 'daily',
        category: 'prayer',
        ruling: 'sunnah',
        phase: 'all_year',
        validationType: 'time',
        validationConfig: { afterPrayer: 'isha' }
    },
    // Phase 2: Night & Special
    {
        id: 'sunnah_tahajjud',
        title: 'Sholat Tahajjud',
        description: 'Sholat malam sepertiga malam terakhir (jam 02:00-04:00)',
        hasanahReward: 50,
        icon: '🌙',
        gender: null,
        dalil: 'QS. Al-Isra: 79',
        hadithId: 'hadith_taraweh',
        type: 'daily',
        category: 'prayer',
        ruling: 'sunnah',
        phase: 'all_year',
        validationType: 'time',
        validationConfig: { timeWindow: { start: 2, end: 4 } } // Approx sepertiga malam
    },
    {
        id: 'sunnah_istikharah',
        title: 'Sholat Istikharah',
        description: 'Memohon petunjuk pilihan (kapan saja di luar waktu terlarang)',
        hasanahReward: 30,
        icon: '❓',
        gender: null,
        dalil: 'HR. Bukhari no. 1166',
        hadithId: 'hadith_istikharah',
        type: 'daily',
        category: 'prayer',
        ruling: 'sunnah',
        phase: 'all_year',
        validationType: 'manual'
    },
    {
        id: 'sunnah_taubat',
        title: 'Sholat Taubat',
        description: 'Sholat 2 rakaat memohon ampunan dosa',
        hasanahReward: 40,
        icon: '🤲',
        gender: null,
        dalil: 'HR. Abu Dawud no. 1521',
        hadithId: 'hadith_taubat',
        type: 'daily',
        category: 'prayer',
        ruling: 'sunnah',
        phase: 'all_year',
        validationType: 'manual'
    },
    {
        id: 'sunnah_tahiyyatul_masjid',
        title: 'Tahiyyatul Masjid',
        description: 'Sholat 2 rakaat saat baru memasuki masjid',
        hasanahReward: 30,
        icon: '🕌',
        gender: null,
        dalil: 'HR. Bukhari no. 1163',
        hadithId: 'hadith_tahiyyatul_masjid',
        type: 'daily',
        category: 'prayer',
        ruling: 'sunnah',
        phase: 'all_year',
        validationType: 'manual'
    },
    {
        id: 'sunnah_syuruq',
        title: 'Sholat Syuruq',
        description: '2 Rakaat setelah terbit matahari (duduk berdzikir sejak Subuh)',
        hasanahReward: 50,
        icon: '🌅',
        gender: null,
        dalil: 'HR. Tirmidzi no. 586',
        hadithId: 'hadith_syuruq',
        type: 'daily',
        category: 'prayer',
        ruling: 'sunnah',
        phase: 'all_year',
        validationType: 'manual'
    },
    {
        id: 'sunnah_wudhu',
        title: 'Sholat Sunnah Wudhu',
        description: '2 Rakaat setelah menyempurnakan wudhu',
        hasanahReward: 30,
        icon: '💧',
        gender: null,
        dalil: 'HR. Bukhari no. 159',
        hadithId: 'hadith_wudhu',
        type: 'daily',
        category: 'prayer',
        ruling: 'sunnah',
        phase: 'all_year',
        validationType: 'manual'
    },
    {
        id: 'sunnah_hajat',
        title: 'Sholat Hajat',
        description: 'Memohon kemudahan hajat khusus kepada Allah',
        hasanahReward: 30,
        icon: '🤲',
        gender: null,
        dalil: 'HR. Tirmidzi no. 479',
        hadithId: 'hadith_hajat',
        type: 'daily',
        category: 'prayer',
        ruling: 'sunnah',
        phase: 'all_year',
        validationType: 'manual'
    },
    // Eid Prayers — only visible on specific Hijri dates
    {
        id: 'sunnah_eid_fitri',
        title: 'Sholat Idul Fitri',
        description: 'Sholat hari raya 1 Syawal (jam 06:30-08:00)',
        hasanahReward: 100,
        icon: '🌙',
        gender: null,
        dalil: 'HR. Bukhari no. 958',
        type: 'daily',
        category: 'prayer',
        ruling: 'sunnah',
        phase: 'all_year',
        validationType: 'time',
        validationConfig: {
            timeWindow: { start: 6, end: 8 },
            visibility: { hijriMonth: 'shawwal', hijriDay: 1 }
        }
    },
    {
        id: 'sunnah_eid_adha',
        title: 'Sholat Idul Adha',
        description: 'Sholat hari raya 10 Dzulhijjah (jam 06:30-08:00)',
        hasanahReward: 100,
        icon: '🐑',
        gender: null,
        dalil: 'HR. Bukhari no. 968',
        type: 'daily',
        category: 'prayer',
        ruling: 'sunnah',
        phase: 'all_year',
        validationType: 'time',
        validationConfig: {
            timeWindow: { start: 6, end: 8 },
            visibility: { hijriMonth: 'dzulhijjah', hijriDay: 10 }
        }
    }
];
