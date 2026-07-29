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
        type: 'daily',
        category: 'prayer',
        ruling: 'sunnah',
        phase: 'all_year',
        validationType: 'manual'
    },
    {
        id: 'sunnah_hajat',
        title: 'Sholat Hajat',
        description: 'Memohon dikabulkannya hajat (utama sepertiga malam)',
        hasanahReward: 30,
        icon: '🤲',
        gender: null,
        dalil: 'HR. Tirmidzi no. 479',
        type: 'daily',
        category: 'prayer',
        ruling: 'sunnah',
        phase: 'all_year',
        validationType: 'manual'
    },
    {
        id: 'sunnah_taubat',
        title: 'Sholat Taubat',
        description: 'Memohon ampunan dosa (kapan saja di luar waktu terlarang)',
        hasanahReward: 30,
        icon: '📿',
        gender: null,
        dalil: 'HR. Abu Dawud no. 1521',
        type: 'daily',
        category: 'prayer',
        ruling: 'sunnah',
        phase: 'all_year',
        validationType: 'manual'
    },
    // Phase 3: Seasonal (Musiman)
    {
        id: 'sunnah_tarawih',
        title: 'Sholat Tarawih',
        description: 'Sholat malam bulan Ramadhan (setelah Isya - Subuh)',
        hasanahReward: 50,
        icon: '🕌',
        gender: null,
        dalil: 'HR. Bukhari no. 37',
        type: 'daily',
        category: 'prayer',
        ruling: 'sunnah',
        phase: 'ramadhan_during',
        validationType: 'time',
        validationConfig: {
            afterPrayer: 'isha',
            visibility: { hijriMonth: 'Ramadan' }
        }
    },
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
        validationType: 'manual',
        validationConfig: {
            visibility: { hijriMonth: 'Shawwal', hijriDay: 1 }
        }
    },
    {
        id: 'sunnah_eid_adha',
        title: 'Sholat Idul Adha',
        description: 'Sholat hari raya 10 Dzulhijjah (jam 06:30-08:00)',
        hasanahReward: 100,
        icon: '🕋',
        gender: null,
        dalil: 'HR. Bukhari no. 951',
        type: 'daily',
        category: 'prayer',
        ruling: 'sunnah',
        phase: 'all_year',
        validationType: 'manual',
        validationConfig: {
            visibility: { hijriMonth: 'Dhu al-Hijjah', hijriDay: 10 }
        }
    },
    {
        id: 'sunnah_gerhana',
        title: 'Sholat Gerhana',
        description: 'Sholat sunnah saat gerhana (selama terjadi gerhana)',
        hasanahReward: 50,
        icon: '🌑',
        gender: null,
        dalil: 'HR. Bukhari no. 1040',
        type: 'daily',
        category: 'prayer',
        ruling: 'sunnah',
        phase: 'all_year',
        validationType: 'manual'
    },
    {
        id: 'sunnah_istisqa',
        title: 'Sholat Istisqa',
        description: 'Sholat sunnah memohon hujan (siang hari di lapangan)',
        hasanahReward: 50,
        icon: '🌧️',
        gender: null,
        dalil: 'HR. Bukhari no. 1012',
        type: 'daily',
        category: 'prayer',
        ruling: 'sunnah',
        phase: 'all_year',
        validationType: 'manual'
    }
];
