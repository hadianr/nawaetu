/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * Group C: After-Prayer Adhkar (Dzikir Setelah Sholat)
 */

import { DuaItem } from "./types";

export const AFTER_PRAYER_DUAS: DuaItem[] = [
    {
        id: "dua_setelah_wudhu",
        occasion: "after_prayer",
        category: "spiritualCategoryIbadah",
        title: "Doa Setelah Wudhu",
        titleEn: "Du'a After Wudu",
        arabic: "أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
        latin: "Asyhadu allaa ilaaha illallaahu wahdahuu laa syariika lahu, wa asyhadu anna muhammadan 'abduhu wa rasuuluh.",
        translation: "Aku bersaksi bahwa tidak ada tuhan selain Allah, Yang Maha Esa, tiada sekutu bagi-Nya, dan aku bersaksi bahwa Muhammad adalah hamba dan utusan-Nya.",
        translationEn: "I bear witness that there is no deity but Allah alone with no partner, and I bear witness that Muhammad is His servant and messenger.",
        virtue: "Siapa membacanya setelah wudhu, delapan pintu surga akan dibuka untuknya dan ia dapat masuk dari pintu mana saja yang ia mau.",
        virtueEn: "Whoever recites this after wudu, the eight gates of Paradise will be opened for them and they may enter through whichever they wish.",
        recommendedCount: 1,
        source: {
            type: "hadith",
            referenceText: "HR. Muslim No. 234",
            referenceTextEn: "HR. Muslim No. 234",
            hadithDetails: { collection: "Muslim", hadithNumber: 234 }
        }
    },
    {
        id: "dua_setelah_sholat_tasbih",
        occasion: "after_prayer",
        isDhikr: true,
        category: "spiritualCategoryIbadah",
        title: "Tasbih Setelah Sholat (33x)",
        titleEn: "Post-Prayer Glorification (33x)",
        arabic: "سُبْحَانَ اللَّهِ  الْحَمْدُ لِلَّهِ  اللَّهُ أَكْبَرُ",
        latin: "Subhanallah (33x), Alhamdulillah (33x), Allahu Akbar (33x), wa laa ilaaha illallaahu wahdahuu laa syariikalah, lahul mulku wa lahul hamdu wa huwa 'ala kulli syai-in qadiir.",
        translation: "Maha Suci Allah (33x), Segala puji bagi Allah (33x), Allah Maha Besar (33x), dan tidak ada tuhan selain Allah, Yang Maha Esa, tiada sekutu bagi-Nya, milik-Nya kerajaan dan segala puji, Dia Maha Kuasa atas segala sesuatu.",
        translationEn: "Glory be to Allah (33x), All praise to Allah (33x), Allah is Greatest (33x), and there is no deity but Allah alone, no partner, His is the dominion and His is the praise, and He is able to do all things.",
        virtue: "Dosa-dosa diampuni meski sebanyak buih lautan bagi siapa yang membaca zikir ini lengkap setelah setiap sholat.",
        virtueEn: "Sins are forgiven even if they were as much as the foam of the sea for whoever completes this dhikr after every prayer.",
        recommendedCount: 33,
        source: {
            type: "hadith",
            referenceText: "HR. Muslim No. 597",
            referenceTextEn: "HR. Muslim No. 597",
            hadithDetails: { collection: "Muslim", hadithNumber: 597 }
        }
    },
    {
        id: "dua_sholawat_ibrahimiyyah",
        occasion: "after_prayer",
        category: "spiritualCategoryIbadah",
        title: "Sholawat Ibrahimiyyah",
        titleEn: "Salawat Ibrahimiyyah",
        arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ",
        latin: "Allahumma shalli 'alaa muhammadin wa 'alaa aali muhammadin, kamaa shallaita 'alaa ibraahiima wa 'alaa aali ibraahiima, innaka hamiidum-majiid.",
        translation: "Ya Allah, berikanlah sholawat kepada Muhammad dan keluarga Muhammad sebagaimana Engkau memberikan sholawat kepada Ibrahim dan keluarga Ibrahim. Sesungguhnya Engkau Maha Terpuji lagi Maha Mulia.",
        translationEn: "O Allah, send prayers upon Muhammad and upon the family of Muhammad, as You sent prayers upon Ibrahim and upon the family of Ibrahim. Indeed, You are Praiseworthy and Glorious.",
        virtue: "Setiap sholawat yang diucapkan seorang Muslim akan dibalas oleh Allah dengan 10 rahmat untuknya.",
        virtueEn: "Every salawat a Muslim utters will be answered by Allah with 10 blessings upon them.",
        recommendedCount: 1,
        source: {
            type: "hadith",
            referenceText: "HR. Bukhari No. 3370 & Muslim No. 406",
            referenceTextEn: "HR. Bukhari No. 3370 & Muslim No. 406",
            hadithDetails: { collection: "Bukhari", hadithNumber: 3370 }
        }
    },
    {
        id: "dua_setelah_sholat_perlindungan",
        occasion: "after_prayer",
        category: "spiritualCategoryPerlindungan",
        title: "Doa Perlindungan Pasca Sholat",
        titleEn: "Post-Prayer Protection Du'a",
        arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْجُبْنِ وَأَعُوذُ بِكَ أَنْ أُرَدَّ إِلَى أَرْذَلِ الْعُمُرِ وَأَعُوذُ بِكَ مِنْ فِتْنَةِ الدُّنْيَا وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ",
        latin: "Allahumma innii a'uudzubika minal-jubni, wa a'uudzubika an uradda ilaa ardzalil-'umuri, wa a'uudzubika min fitnatid-dunyaa, wa a'uudzubika min 'adzaabil-qabri.",
        translation: "Ya Allah, aku berlindung kepada-Mu dari sifat pengecut, dari dikembalikan kepada umur yang paling hina (pikun), dari fitnah dunia, dan dari azab kubur.",
        translationEn: "O Allah, I seek refuge in You from cowardice, from being returned to the worst age, from the trial of this world, and from the punishment of the grave.",
        virtue: "Doa komprehensif yang melindungi dari empat hal yang paling ditakuti: pengecut, kepikunan, fitnah dunia, dan siksa kubur.",
        virtueEn: "Comprehensive prayer protecting from four major trials: cowardice, extreme old age, worldly trials, and punishment of the grave.",
        recommendedCount: 1,
        source: {
            type: "hadith",
            referenceText: "HR. Muslim No. 590",
            referenceTextEn: "HR. Muslim No. 590",
            hadithDetails: { collection: "Muslim", hadithNumber: 590 }
        }
    },
    {
        id: "dua_ketetapan_hati_sholat",
        occasion: "after_prayer",
        category: "spiritualCategoryIman",
        title: "Doa Ketetapan Hati dalam Agama",
        titleEn: "Du'a for Steadfastness in Faith",
        arabic: "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ",
        latin: "Ya Muqallibal-quluubi tsabbit qalbii 'alaa diinik.",
        translation: "Wahai Dzat yang membolak-balikkan hati, tetapkanlah hatiku di atas agama-Mu.",
        translationEn: "O Turner of the hearts, make my heart steadfast upon Your religion.",
        virtue: "Doa yang paling sering dibaca oleh Nabi SAW. Sangat dianjurkan dibaca setelah sholat agar iman tidak goyah.",
        virtueEn: "The most frequent supplication of the Prophet (PBUH). Highly recommended after prayer so faith remains unshakeable.",
        recommendedCount: 3,
        source: {
            type: "hadith",
            referenceText: "HR. Tirmidzi No. 2140 & 3522",
            referenceTextEn: "HR. Tirmidhi No. 2140 & 3522",
            hadithDetails: { collection: "Tirmidzi", hadithNumber: 2140 }
        }
    },
    {
        id: "dua_setelah_sholat_pertolongan",
        occasion: "after_prayer",
        category: "spiritualCategoryIbadah",
        title: "Doa Pertolongan dalam Beribadah",
        titleEn: "Du'a for Assistance in Worship",
        arabic: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
        latin: "Allahumma a'innii 'alaa dzikrika wa syukrika wa husni 'ibaadatik.",
        translation: "Ya Allah, tolonglah aku untuk selalu mengingat-Mu, bersyukur kepada-Mu, dan beribadah kepada-Mu dengan baik.",
        translationEn: "O Allah, help me to remember You, to thank You, and to worship You in the best manner.",
        virtue: "Wasiat Nabi SAW kepada Mu'adz bin Jabal RA: 'Jangan pernah tinggalkan doa ini di akhir setiap sholat.'",
        virtueEn: "The Prophet's (PBUH) advice to Mu'adh ibn Jabal (RA): 'Never forget to recite this at the end of every prayer.'",
        recommendedCount: 1,
        source: {
            type: "hadith",
            referenceText: "HR. Ahmad No. 17342 & Hakim",
            referenceTextEn: "HR. Ahmad No. 17342 & Al-Hakim",
            hadithDetails: { collection: "Ahmad", hadithNumber: 17342 }
        }
    },
];
