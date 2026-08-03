/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * Decoupled Dua & Supplications Data Library (Bilingual EN/ID)
 */

import { DuaItem, DuaCategoryDefinition } from "./types";

export * from "./types";

export const DUA_LIBRARY: DuaItem[] = [
    {
        id: "dua_berbuka",
        occasion: "fasting",
        category: "spiritualCategoryRamadhan",
        title: "Doa Berbuka Puasa",
        titleEn: "Du'a for Breaking Fast",
        arabic: "اللَّهُمَّ لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ",
        latin: "Allahumma laka shumtu wa bika aamantu wa 'alaa rizqika afthortu.",
        translation: "Ya Allah, karena-Mu aku berpuasa, kepada-Mu aku beriman, dan dengan rezeki-Mu aku berbuka.",
        translationEn: "O Allah, for You I fasted, in You I believed, and upon Your provision I break my fast.",
        virtue: "Diucapkan saat membatalkan puasa sebagai rasa syukur atas nikmat rezeki dan pertolongan Allah.",
        virtueEn: "Recited when breaking the fast as an expression of gratitude for Allah's provision and guidance.",
        recommendedCount: 1,
        source: {
            type: "hadith",
            referenceText: "HR. Abu Dawud No. 2358",
            hadithDetails: { collection: "Abu Dawud", hadithNumber: 2358 }
        }
    },
    {
        id: "dua_sahur_niat",
        occasion: "fasting",
        category: "spiritualCategoryRamadhan",
        title: "Niat Puasa Ramadhan",
        titleEn: "Intention for Ramadhan Fast",
        arabic: "نَوَيْتُ صَوْمَ غَدٍ عَنْ أَدَاءِ فَرْضِ شَهْرِ رَمَضَانَ هَذِهِ السَّنَةِ لِلَّهِ تَعَالَى",
        latin: "Nawaitu shouma ghodin 'an adaa-i fardhi syahri Ramadhona hadzihis-sanati lillahi ta'aalaa.",
        translation: "Aku berniat puasa esok hari untuk menunaikan kewajiban puasa bulan Ramadhan tahun ini karena Allah Ta'ala.",
        translationEn: "I intend to fast tomorrow to fulfill the obligatory fast of Ramadhan this year for the sake of Allah the Exalted.",
        virtue: "Menetapkan niat ibadah puasa fardhu sebelum fajar.",
        virtueEn: "Establishing the intention for the obligatory fast before dawn.",
        recommendedCount: 1,
        source: {
            type: "fiqh",
            referenceText: "Fiqh Asy-Syafi'i (Al-Fiqh al-Manhaji)"
        }
    },
    {
        id: "dua_lailatul_qadr",
        occasion: "fasting",
        category: "spiritualCategoryRamadhan",
        title: "Doa Lailatul Qadr",
        titleEn: "Du'a for Laylatul Qadr",
        arabic: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
        latin: "Allahumma innaka 'afuwwun tuhibbul-'afwa fa'fu 'annii.",
        translation: "Ya Allah, sesungguhnya Engkau Maha Pemaaf, menyukai pemberian maaf, maka maafkanlah aku.",
        translationEn: "O Allah, You are the Most Forgiving, and You love forgiveness, so forgive me.",
        virtue: "Doa khusus yang diajarkan Rasulullah SAW kepada Aisyah RA di 10 malam terakhir Ramadhan.",
        virtueEn: "Special supplication taught by the Prophet (PBUH) to Aisha (RA) for the last 10 nights of Ramadhan.",
        recommendedCount: 3,
        source: {
            type: "hadith",
            referenceText: "HR. Tirmidzi No. 3513 & Ibn Majah No. 3850",
            hadithDetails: { collection: "Tirmidzi", hadithNumber: 3513 }
        }
    },
    {
        id: "dua_ilmu",
        occasion: "morning",
        category: "spiritualCategoryKnowledge",
        title: "Doa Memohon Ilmu yang Bermanfaat",
        titleEn: "Du'a for Beneficial Knowledge",
        arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا",
        latin: "Allahumma innii as-aluka 'ilman naafi'an, wa rizqon thoyyiban, wa 'amalan mutaqobbalan",
        translation: "Ya Allah, sesungguhnya aku memohon kepada-Mu ilmu yang bermanfaat, rezeki yang baik, dan amal yang diterima.",
        translationEn: "O Allah, I ask You for beneficial knowledge, good provision, and accepted deeds.",
        virtue: "Dibaca setiap pagi setelah Sholat Subuh untuk memohon keberkahan sepanjang hari.",
        virtueEn: "Recited every morning after Fajr prayer to seek blessings throughout the day.",
        recommendedCount: 1,
        source: {
            type: "hadith",
            referenceText: "HR. Ibn Majah No. 925 & Ahmad No. 26521",
            hadithDetails: { collection: "Ibn Majah", hadithNumber: 925 }
        }
    },
    {
        id: "dua_ketetapan_hati",
        occasion: "general",
        category: "spiritualCategoryFaith",
        title: "Doa Ketetapan Hati",
        titleEn: "Du'a for Steadfastness of Heart",
        arabic: "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ",
        latin: "Ya Muqollibal quluub tsabbit qolbi 'alaa diinik",
        translation: "Wahai Dzat yang membolak-balikkan hati, tetapkanlah hatiku di atas agama-Mu.",
        translationEn: "O You Who turns hearts, keep my heart steadfast upon Your religion.",
        virtue: "Doa yang paling sering dibaca oleh Nabi SAW untuk menjaga keistiqamahan iman.",
        virtueEn: "Supplication most frequently recited by the Prophet (PBUH) to maintain steadfast faith.",
        recommendedCount: 3,
        source: {
            type: "hadith",
            referenceText: "HR. Tirmidzi No. 2140 & 3522",
            hadithDetails: { collection: "Tirmidzi", hadithNumber: 2140 }
        }
    },
    {
        id: "dua_perlindungan",
        occasion: "morning",
        category: "spiritualCategoryProtection",
        title: "Doa Perlindungan Pagi & Sore",
        titleEn: "Morning & Evening Protection Du'a",
        arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ",
        latin: "Bismillahilladzi laa yadhurru ma'asmihi syai-un fil ardhi wa laa fis samaa-i",
        translation: "Dengan nama Allah yang tidak ada sesuatu pun di bumi dan di langit yang bisa membahayakan bersama nama-Nya.",
        translationEn: "In the name of Allah, with whose name nothing on earth or in the heaven can cause harm.",
        virtue: "Barangsiapa membacanya 3 kali pada pagi dan petang, tidak ada bahaya yang akan menimpanya.",
        virtueEn: "Whoever recites it 3 times morning and evening will suffer no harm.",
        recommendedCount: 3,
        source: {
            type: "hadith",
            referenceText: "HR. Abu Dawud No. 5088 & Tirmidzi No. 3388",
            hadithDetails: { collection: "Abu Dawud", hadithNumber: 5088 }
        }
    },
    {
        id: "dua_syukur",
        occasion: "gratitude",
        category: "spiritualCategoryGratitude",
        title: "Doa Mensyukuri Nikmat",
        titleEn: "Du'a of Gratitude",
        arabic: "رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَىٰ وَالِدَيَّ",
        latin: "Rabbi aw zi'nī an asykura ni'matakal-latī an'amta 'alayya wa 'alā wālidayya",
        translation: "Ya Tuhanku berilah aku ilham untuk tetap mensyukuri nikmat-Mu yang telah Engkau anugerahkan kepadaku dan kepada dua orang ibu bapakku.",
        translationEn: "My Lord, inspire me to be grateful for Your blessing which You have bestowed upon me and upon my parents.",
        virtue: "Doa Al-Quran memohon keikhlasan dan ilham untuk terus bersyukur.",
        virtueEn: "Quranic prayer asking for inspiration to remain constantly grateful.",
        recommendedCount: 1,
        source: {
            type: "quran",
            referenceText: "QS. An-Naml [27]: 19",
            quranDetails: { surahName: "An-Naml", surahNumber: 27, ayahNumber: 19 }
        }
    },
    {
        id: "dua_ketenangan",
        occasion: "protection",
        category: "spiritualCategoryFaith",
        title: "Doa Ketenangan Hati",
        titleEn: "Du'a for Peace of Heart",
        arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ",
        latin: "Allahumma innii a'uudzu bika minal hammi wal hazan.",
        translation: "Ya Allah, aku berlindung kepada-Mu dari kesedihan dan duka cita.",
        translationEn: "O Allah, I seek refuge in You from grief and sadness.",
        virtue: "Perlindungan hati dari rasa cemas berlebihan dan tekanan batin.",
        virtueEn: "Protection of the heart against excessive anxiety and grief.",
        recommendedCount: 1,
        source: {
            type: "hadith",
            referenceText: "HR. Bukhari No. 6363",
            hadithDetails: { collection: "Bukhari", hadithNumber: 6363 }
        }
    }
];

export const DUA_OCCASIONS: DuaCategoryDefinition[] = [
    { key: "all", labelId: "Semua", labelEn: "All" },
    { key: "morning", labelId: "Dzikir Pagi", labelEn: "Morning" },
    { key: "evening", labelId: "Dzikir Petang", labelEn: "Evening" },
    { key: "after_prayer", labelId: "Sesudah Sholat", labelEn: "After Prayer" },
    { key: "fasting", labelId: "Puasa & Ramadhan", labelEn: "Fasting" },
    { key: "protection", labelId: "Perlindungan", labelEn: "Protection" },
    { key: "gratitude", labelId: "Syukur & Hati", labelEn: "Gratitude" },
    { key: "general", labelId: "Doa Umum", labelEn: "General" }
];

export function getDuaById(id: string): DuaItem | undefined {
    return DUA_LIBRARY.find(item => item.id === id);
}

export function getDuasByOccasion(occasion: string): DuaItem[] {
    if (occasion === "all") return DUA_LIBRARY;
    return DUA_LIBRARY.filter(item => item.occasion === occasion);
}
