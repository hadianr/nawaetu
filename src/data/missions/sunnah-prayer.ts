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
        description: '2 Rakaat sebelum Subuh (Fajar)',
        xpReward: 30, // Muakkad
        icon: '✨',
        gender: null,
        dalil: 'HR. Muslim no. 725: "Dua rakaat fajar lebih baik dari dunia dan seisinya."',
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
        description: 'Sholat sunnah sebelum Dzuhur',
        xpReward: 25,
        icon: '☀️',
        gender: null,
        dalil: 'HR. Bukhari & Muslim',
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
        description: 'Sholat sunnah sesudah Dzuhur',
        xpReward: 25,
        icon: '☀️',
        gender: null,
        dalil: 'HR. Bukhari & Muslim',
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
        description: 'Sholat sunnah sesudah Maghrib',
        xpReward: 25,
        icon: '🌅',
        gender: null,
        dalil: 'HR. Bukhari & Muslim',
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
        description: 'Sholat sunnah sesudah Isya',
        xpReward: 25,
        icon: '🌃',
        gender: null,
        dalil: 'HR. Bukhari & Muslim',
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
        description: 'Tunaikan sholat Dhuha (08:00-11:00)',
        xpReward: 50,
        icon: '☀️',
        gender: null,
        dalil: 'HR. Muslim no. 720',
        type: 'daily',
        category: 'prayer',
        ruling: 'sunnah',
        phase: 'all_year',
        validationType: 'time',
        validationConfig: { timeWindow: { start: 8, end: 11 } }
    },
    // Witir
    {
        id: 'sunnah_witir',
        title: 'Sholat Witir',
        description: 'Penutup sholat malam',
        xpReward: 40,
        icon: '🌙',
        gender: null,
        dalil: 'HR. Bukhari & Muslim',
        type: 'daily',
        category: 'prayer',
        ruling: 'sunnah',
        phase: 'all_year',
        validationType: 'time',
        validationConfig: { afterPrayer: 'isha' }
    }
];
