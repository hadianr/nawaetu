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
        dalil: 'Mukmin yang kuat lebih dicintai Allah'
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
        dalil: 'HR. Tirmidzi 743'
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
        dalil: 'Menuntut ilmu itu wajib'
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
        dalil: 'Malaikat mendoakan orang yang bersedekah'
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
        dalil: 'Pemaaf adalah sifat mulia'
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
        dalil: 'Bacalah Al-Quran, ia memberi syafaat'
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
        dalil: 'Qiyamul Lail di bulan Ramadhan'
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
        dalil: 'Makan dan minumlah, jangan berlebihan'
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
        dalil: 'Bersahurlah, karena pada sahur ada keberkahan'
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
        dalil: 'Aisyah RA berkata: "Aku memiliki hutang puasa Ramadhan, aku tidak bisa mengqadhanya kecuali pada bulan Sya\'ban." (HR. Bukhari 1950)'
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
        dalil: 'HR. Bukhari no. 1969: "Saya tidak melihat Rasulullah menyempurnakan puasa sebulan penuh selain Ramadhan, dan saya tidak melihat beliau memperbanyak puasa selain di bulan Sya\'ban."'
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
        dalil: 'Salamah bin Kuhail berkata: "Bulan Sya\'ban adalah bulan para pembaca Al-Qur\'an."'
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
        dalil: 'Menuntut ilmu wajib bagi setiap muslim. (HR. Ibnu Majah)'
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
        dalil: 'Mukmin yang kuat lebih dicintai Allah'
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
        dalil: 'Malaikat mendoakan orang yang bersedekah'
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
        dalil: 'Pemaaf adalah sifat mulia'
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
        dalil: 'HR. Ibnu Majah 1390: "Sesungguhnya Allah melihat pada malam nisfu Sya\'ban..."',
    }
];
