/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 */

import { MissionContent } from './types';

export const SUNNAH_PRAYER_CONTENTS: Record<string, MissionContent> = {
    'sunnah_qobliyah_fajr': {
        id: 'sunnah_qobliyah_fajr',
        intro: 'Dua rakaat yang lebih berharga dari dunia dan seisinya, dilakukan sebelum sholat Subuh.',
        fadhilah: [
            'Lebih baik dari dunia dan seisinya',
            'Mengikuti sunnah muakkad yang tidak pernah ditinggalkan Rasulullah SAW',
            'Penyempurna kekurangan sholat fardhu Subuh'
        ],
        niat: {
            munfarid: {
                title: "Niat Qobliyah Subuh",
                arabic: "أُصَلِّى سُنَّةَ الصُّبْحِ رَكْعَتَيْنِ قَبْلِيَّةً لِلهِ تَعَالَى",
                latin: "Ushalli sunnatas-subhi rak'ataini qabliyyatan lillaahi ta'aalaa",
                translation: "Aku niat melakukan shalat sunat sebelum subuh 2 rakaat karena Allah ta'ala."
            }
        },
        guides: [
            'Waktu: Setelah adzan Subuh sebelum sholat fardhu.',
            'Disunnahkan membaca surah Al-Kafirun (rakaat 1) dan Al-Ikhlas (rakaat 2).',
            'Bisa dilakukan meski sholat fardhu sudah akan dimulai (jika cukup waktu).'
        ],
        source: 'HR. Muslim no. 725'
    },
    'sunnah_qobliyah_dhuhr': {
        id: 'sunnah_qobliyah_dhuhr',
        intro: 'Membuka pintu langit di siang hari dengan sunnah sebelum Dzuhur.',
        fadhilah: [
            'Pintu-pintu langit dibuka pada waktu ini',
            'Diharamkan baginya api neraka (jika rutin 4 rakaat)',
            'Mendapatkan rahmat Allah'
        ],
        niat: {
            munfarid: {
                title: "Niat Qobliyah Dzuhur",
                arabic: "أُصَلِّى سُنَّةَ الظُّهْرِ رَكْعَتَيْنِ قَبْلِيَّةً لِلهِ تَعَالَى",
                latin: "Ushalli sunnatadh-dhuhr rak'ataini qabliyyatan lillaahi ta'aalaa",
                translation: "Aku niat melakukan shalat sunat sebelum dzuhur 2 rakaat karena Allah ta'ala."
            }
        },
        guides: [
            'Waktu: Setelah adzan Dzuhur sebelum sholat fardhu.',
            'Bisa dilakukan 2 atau 4 rakaat (2x salam).'
        ],
        source: 'HR. Tirmidzi & Abu Dawud'
    },
    'sunnah_ba_diyah_dhuhr': {
        id: 'sunnah_ba_diyah_dhuhr',
        intro: 'Menutup ibadah siang dengan keberkahan sunnah sesudah Dzuhur.',
        fadhilah: [
            'Menyempurnakan pahala sholat Dzuhur',
            'Diharamkan baginya api neraka (jika rutin 4 rakaat bersama qobliyah)'
        ],
        niat: {
            munfarid: {
                title: "Niat Ba'diyah Dzuhur",
                arabic: "أُصَلِّى سُنَّةَ الظُّهْرِ رَكْعَتَيْنِ بَعْدِيَّةً لِلهِ تَعَالَى",
                latin: "Ushalli sunnatadh-dhuhr rak'ataini ba'diyyatan lillaahi ta'aalaa",
                translation: "Aku niat melakukan shalat sunat sesudah dzuhur 2 rakaat karena Allah ta'ala."
            }
        },
        guides: [
            'Waktu: Setelah selesai sholat fardhu Dzuhur.',
            'Dilakukan 2 rakaat (muakkad).'
        ],
        source: 'HR. Bukhari & Muslim'
    },
    'sunnah_ba_diyah_maghrib': {
        id: 'sunnah_ba_diyah_maghrib',
        intro: 'Sunnah muakkad yang sangat dianjurkan setelah Maghrib.',
        fadhilah: [
            'Menyempurnakan kekurangan sholat Maghrib',
            'Amalan yang senantiasa dijaga Rasulullah SAW'
        ],
        niat: {
            munfarid: {
                title: "Niat Ba'diyah Maghrib",
                arabic: "أُصَلِّى سُنَّةَ الْمَغْرِبِ رَكْعَتَيْنِ بَعْدِيَّةً لِلهِ تَعَالَى",
                latin: "Ushalli sunnatal-maghrib rak'ataini ba'diyyatan lillaahi ta'aalaa",
                translation: "Aku niat melakukan shalat sunat sesudah maghrib 2 rakaat karena Allah ta'ala."
            }
        },
        guides: [
            'Waktu: Setelah sholat fardhu Maghrib sebelum masuk waktu Isya.',
            'Sangat dianjurkan dilakukan 2 rakaat.'
        ],
        source: 'HR. Bukhari & Muslim'
    },
    'sunnah_ba_diyah_isha': {
        id: 'sunnah_ba_diyah_isha',
        intro: 'Menutup rangkaian sholat fardhu harian dengan sunnah Isya.',
        fadhilah: [
            'Pahala yang besar sebagai penutup malam',
            'Menggenapi kekurangan sholat fardhu Isya'
        ],
        niat: {
            munfarid: {
                title: "Niat Ba'diyah Isya",
                arabic: "أُصَلِّى سُنَّةَ الْعِشَاءِ رَكْعَتَيْنِ بَعْدِيَّةً لِلهِ تَعَالَى",
                latin: "Ushalli sunnatal-'isyaa-i rak'ataini ba'diyyatan lillaahi ta'aalaa",
                translation: "Aku niat melakukan shalat sunat sesudah isya 2 rakaat karena Allah ta'ala."
            }
        },
        guides: [
            'Waktu: Setelah sholat fardhu Isya.',
            'Dilakukan 2 rakaat.'
        ],
        source: 'HR. Bukhari & Muslim'
    },
    'sunnah_dhuha': {
        id: 'sunnah_dhuha',
        intro: 'Sholat Dhuha adalah sedekah bagi seluruh persendian tubuh.',
        fadhilah: [
            'Sedekah bagi 360 persendian tubuh',
            'Membuka pintu rezeki dan keberkahan siang hari',
            'Dibangunkan rumah di surga (bagi yang 12 rakaat)',
            'Wajah bercahaya dan hati tenang'
        ],
        niat: {
            munfarid: {
                title: "Niat Sholat Dhuha",
                arabic: "أُصَلِّى سُنَّةَ الضُّحَى رَكْعَتَيْنِ لِلهِ تَعَالَى",
                latin: "Ushalli sunnatad-dhuhaa rak'ataini lillaahi ta'aalaa",
                translation: "Aku niat melakukan shalat sunat dhuha 2 rakaat karena Allah ta'ala."
            }
        },
        guides: [
            'Waktu: 15 menit setelah Syuruq hingga 15 menit sebelum Dzuhur.',
            'Utama dilakukan saat panas matahari mulai terasa (jam 9-10 pagi).',
            'Minimal 2 rakaat, maksimal 12 rakaat.'
        ],
        source: 'HR. Muslim no. 720'
    },
    'sunnah_witir': {
        id: 'sunnah_witir',
        intro: 'Witir adalah sholat penutup malam yang sangat dicintai Allah.',
        fadhilah: [
            'Allah itu Witir (Ganjil) dan menyukai yang witir',
            'Penutup rangkaian sholat malam agar menjadi ganjil',
            'Waktu mustajab di penghujung malam'
        ],
        niat: {
            munfarid: {
                title: "Niat Sholat Witir (1 Rakaat)",
                arabic: "أُصَلِّى سُنَّةَ الْوِتْرِ رَكْعَةً لِلهِ تَعَالَى",
                latin: "Ushalli sunnatal-witri rak'atan lillaahi ta'aalaa",
                translation: "Aku niat melakukan shalat sunat witir 1 rakaat karena Allah ta'ala."
            }
        },
        guides: [
            'Waktu: Setelah Isya hingga sebelum Subuh.',
            'Minimal 1 rakaat, maksimal 11 rakaat.',
            'Bisa dilakukan langsung setelah Ba\'diyah Isya jika khawatir tidak bangun malam.'
        ],
        source: 'HR. Bukhari & Muslim'
    }
};
