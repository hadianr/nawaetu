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

import { Mission } from './types';

export const RAMADHAN_MISSIONS: Mission[] = [
    {
        id: 'makeup_fasting',
        title: 'Bayar Qadha Puasa',
        description: 'Bayar hutang puasa Ramadhan tahun lalu',
        category: 'fasting',
        hasanahReward: 30,
        icon: '📅',
        ruling: 'obligatory',
        type: 'tracker',
        validationType: 'manual',
        phase: 'ramadhan_prep',
        gender: null,
        dalil: 'QS. Al-Baqarah: 184'
    },
    {
        id: 'health_checkup',
        title: 'Cek Kesehatan (Checkup)',
        description: 'Pastikan tubuh fit sebelum Ramadhan',
        category: 'worship',
        hasanahReward: 10,
        icon: '🩺',
        ruling: 'sunnah',
        type: 'daily',
        validationType: 'manual',
        phase: 'ramadhan_prep',
        gender: null,
        dalil: 'HR. Muslim no. 2664'
    },
    {
        id: 'sunnah_fasting_ramadan_prep',
        title: 'Puasa Sunnah (Min. 1x)',
        description: 'Latihan puasa sunnah (Senin/Kamis)',
        category: 'fasting',
        hasanahReward: 15,
        icon: '🥤',
        ruling: 'sunnah',
        type: 'daily',
        validationType: 'manual',
        phase: 'ramadhan_prep',
        gender: null,
        dalil: 'HR. Tirmidzi no. 747'
    },
    {
        id: 'read_fiqh_article',
        title: 'Baca Artikel Fiqih',
        description: 'Pelajari hukum dan fiqih puasa',
        category: 'worship',
        hasanahReward: 5,
        icon: '📚',
        ruling: 'sunnah',
        type: 'daily',
        validationType: 'manual',
        phase: 'ramadhan_prep',
        gender: null,
        dalil: 'HR. Ibnu Majah no. 224'
    },
    {
        id: 'fajr_charity',
        title: 'Rutin Sedekah Subuh',
        description: 'Sedekah di waktu subuh setiap hari',
        category: 'worship',
        hasanahReward: 15,
        icon: '💰',
        ruling: 'sunnah',
        type: 'daily',
        validationType: 'manual',
        phase: 'ramadhan_prep',
        gender: null,
        dalil: 'HR. Bukhari no. 1442'
    },
    {
        id: 'seek_forgiveness',
        title: 'Saling Memaafkan',
        description: 'Minta maaf kepada orang tua & teman',
        category: 'worship',
        hasanahReward: 10,
        icon: '🤝',
        ruling: 'sunnah',
        type: 'daily',
        validationType: 'manual',
        phase: 'ramadhan_prep',
        gender: null,
        dalil: 'HR. Muslim no. 2588'
    },
    {
        id: 'set_khatam_target',
        title: "Set Target Khatam",
        description: 'Buat target tilawah harian',
        category: 'quran',
        hasanahReward: 10,
        icon: '🎯',
        ruling: 'sunnah',
        type: 'daily',
        validationType: 'manual',
        phase: 'ramadhan_prep',
        gender: null,
        dalil: 'HR. Muslim no. 804'
    },
    {
        id: 'tarawih_prayer',
        title: "Sholat Tarawih",
        description: 'Tunaikan sholat sunnah Tarawih',
        category: 'prayer',
        hasanahReward: 50,
        icon: '🕌',
        ruling: 'sunnah',
        type: 'daily',
        validationType: 'manual',
        phase: 'ramadhan_during',
        gender: null,
        dalil: 'HR. Bukhari no. 37'
    },
    {
        id: 'breaking_fast_dua',
        title: "Buka Puasa Sederhana",
        description: 'Buka puasa tidak berlebihan',
        category: 'worship',
        hasanahReward: 20,
        icon: '🥣',
        ruling: 'sunnah',
        type: 'daily',
        validationType: 'manual',
        phase: 'ramadhan_during',
        gender: null,
        dalil: 'QS. Al-A\'raf: 31'
    },
    {
        id: 'pre_dawn_meal',
        title: "Makan Sahur Berkah",
        description: 'Makan sahur sebelum subuh untuk keberkahan',
        category: 'worship',
        hasanahReward: 20,
        icon: '🥣',
        ruling: 'sunnah',
        type: 'daily',
        validationType: 'manual',
        phase: 'ramadhan_during',
        gender: null,
        dalil: 'HR. Bukhari no. 1923'
    },
];

export const SYABAN_MISSIONS: Mission[] = [
    {
        id: 'qadha_puasa', // Standardized ID to match Tracker
        title: "Lunasi Qadha Puasa",
        description: 'Segera lunasi hutang puasa sebelum Ramadhan',
        category: 'fasting',
        hasanahReward: 100,
        icon: '📅',
        ruling: 'obligatory',
        type: 'tracker',
        validationType: 'manual',
        phase: 'ramadhan_prep',
        gender: null,
        dalil: 'HR. Bukhari no. 1950'
    },
    {
        id: 'syaban_fasting',
        title: "Puasa Sunnah Sya'ban",
        description: 'Perbanyak puasa sunnah di bulan Sya\'ban',
        category: 'fasting',
        hasanahReward: 50,
        icon: '🌙',
        ruling: 'sunnah',
        type: 'daily',
        validationType: 'manual',
        phase: 'ramadhan_prep',
        gender: null,
        dalil: 'HR. Bukhari no. 1969'
    },
    {
        id: 'syaban_quran',
        title: "Bulan Para Qurra'",
        description: 'Perbanyak tilawah Al-Quran (Syahrul Qurra)',
        category: 'quran',
        hasanahReward: 40,
        icon: '📖',
        ruling: 'sunnah',
        type: 'daily',
        validationType: 'manual',
        phase: 'ramadhan_prep',
        gender: null,
        dalil: 'HR. Ibn Rajab no. 385'
    },
    {
        id: 'ramadan_fiqh_study', // Renamed/Standardized
        title: "Pelajari Fiqih Ramadhan",
        description: 'Bekali diri dengan ilmu puasa & zakat',
        category: 'worship',
        hasanahReward: 30,
        icon: '📚',
        ruling: 'obligatory',
        type: 'daily',
        validationType: 'manual',
        phase: 'ramadhan_prep',
        gender: null,
        dalil: 'HR. Ibnu Majah no. 224'
    },
    {
        id: 'cek_kesehatan', // From RAMADHAN_PREP
        title: 'Cek Kesehatan (Checkup)',
        description: 'Pastikan tubuh fit sebelum Ramadhan',
        category: 'worship',
        hasanahReward: 10,
        icon: '🩺',
        ruling: 'sunnah',
        type: 'daily',
        validationType: 'manual',
        phase: 'ramadhan_prep',
        gender: null,
        dalil: 'HR. Muslim no. 2664'
    },
    {
        id: 'sedekah_subuh', // From RAMADHAN_PREP
        title: 'Rutin Sedekah Subuh',
        description: 'Sedekah di waktu subuh setiap hari',
        category: 'worship',
        hasanahReward: 15,
        icon: '💰',
        ruling: 'sunnah',
        type: 'daily',
        validationType: 'manual',
        phase: 'ramadhan_prep',
        gender: null,
        dalil: 'HR. Bukhari no. 1442'
    },
    {
        id: 'maaf_maafan', // From RAMADHAN_PREP
        title: 'Saling Memaafkan',
        description: 'Minta maaf kepada orang tua & teman',
        category: 'worship',
        hasanahReward: 10,
        icon: '🤝',
        ruling: 'sunnah',
        type: 'daily',
        validationType: 'manual',
        phase: 'ramadhan_prep',
        gender: null,
        dalil: 'HR. Muslim no. 2588'
    },
    {
        id: 'mid_syaban_night',
        title: "Malam Nisfu Sya'ban",
        description: 'Perbanyak doa & amalan di pertengahan Sya\'ban',
        category: 'worship',
        hasanahReward: 60,
        icon: '✨',
        ruling: 'sunnah',
        type: 'daily',
        validationType: 'manual',
        phase: 'ramadhan_prep',
        gender: null,
        dalil: 'HR. Ibnu Majah no. 1390',
    }
];
