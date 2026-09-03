/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * Group D: Daily Life & General Supplications (Doa Sehari-hari)
 */

import { DuaItem } from "./types";

export const DAILY_LIFE_DUAS: DuaItem[] = [
    {
        id: "dua_masuk_wc",
        occasion: "general",
        category: "spiritualCategoryPerlindungan",
        title: "Doa Masuk Toilet",
        titleEn: "Du'a Before Entering Restroom",
        arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ",
        latin: "Allahumma innii a'uudzubika minal khubutsi wal khabaa-its.",
        translation: "Ya Allah, aku berlindung kepada-Mu dari godaan syaitan laki-laki dan syaitan perempuan.",
        translationEn: "O Allah, I seek refuge in You from evil spirits (male and female).",
        virtue: "Perlindungan diri dari gangguan jin/syaitan di tempat yang kotor.",
        virtueEn: "Protection from harm and evil spirits in impure places.",
        recommendedCount: 1,
        source: {
            type: "hadith",
            referenceText: "HR. Bukhari No. 142 & Muslim No. 375",
            referenceTextEn: "HR. Bukhari No. 142 & Muslim No. 375",
            hadithDetails: { collection: "Bukhari", hadithNumber: 142 }
        }
    },
    {
        id: "dua_naik_kendaraan",
        occasion: "general",
        category: "spiritualCategoryPerlindungan",
        title: "Doa Naik Kendaraan",
        titleEn: "Du'a for Boarding a Vehicle",
        arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَىٰ رَبِّنَا لَمُنقَلِبُونَ",
        latin: "Subhaanal-ladzii sakhkhara lanaa haadzaa wa maa kunnaa lahuu muqriniin, wa innaa ilaa rabbinaa lamunqalibuun.",
        translation: "Maha Suci Allah yang telah menundukkan semua ini bagi kami padahal kami sebelumnya tidak mampu menguasainya, dan sesungguhnya kami akan kembali kepada Tuhan kami.",
        translationEn: "Glory to Him Who has brought this under our control though we were unable to do so by ourselves, and to our Lord we shall return.",
        virtue: "Keselamatan dalam perjalanan dan pengingat bahwa tujuan akhir kita adalah kembali kepada Allah.",
        virtueEn: "Safety during travel and a reminder that our ultimate destination is returning to Allah.",
        recommendedCount: 1,
        source: {
            type: "quran",
            referenceText: "QS. Az-Zukhruf [43]: 13-14",
            referenceTextEn: "Surah Az-Zukhruf 43:13-14",
            quranDetails: { surahName: "Az-Zukhruf", surahNumber: 43, ayahNumber: "13-14" }
        }
    },
    {
        id: "dua_sebelum_makan",
        occasion: "general",
        category: "spiritualCategoryIbadah",
        title: "Doa Sebelum Makan",
        titleEn: "Du'a Before Eating",
        arabic: "بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ",
        latin: "Bismillaahi wa 'alaa barakatillaah.",
        translation: "Dengan nama Allah dan dengan keberkahan Allah.",
        translationEn: "In the name of Allah and with the blessing of Allah.",
        virtue: "Menghadirkan keberkahan pada makanan dan mencegah syaitan ikut makan.",
        virtueEn: "Brings blessing to the meal and prevents Satan from sharing the food.",
        recommendedCount: 1,
        source: {
            type: "hadith",
            referenceText: "HR. Muslim No. 2022 & Abu Dawud No. 3767",
            referenceTextEn: "HR. Muslim No. 2022 & Abu Dawud No. 3767",
            hadithDetails: { collection: "Muslim", hadithNumber: 2022 }
        }
    },
    {
        id: "dua_sesudah_makan",
        occasion: "gratitude",
        category: "spiritualCategorySyukur",
        title: "Doa Sesudah Makan",
        titleEn: "Du'a After Eating",
        arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ",
        latin: "Alhamdulillaahilladzi ath'amanaa wa saqaanaa wa ja'alanaa muslimiin.",
        translation: "Segala puji bagi Allah yang telah memberi kami makan dan minum serta menjadikan kami termasuk orang-orang muslim.",
        translationEn: "All praise is for Allah who has fed us and given us drink and made us Muslims.",
        virtue: "Rasa syukur atas rezeki makanan harian.",
        virtueEn: "Expression of gratitude for daily sustenance.",
        recommendedCount: 1,
        source: {
            type: "hadith",
            referenceText: "HR. Ahmad No. 3748 & Ibn Hibban",
            referenceTextEn: "HR. Ahmad No. 3748 & Ibn Hibban",
            hadithDetails: { collection: "Ahmad", hadithNumber: 3748 }
        }
    },
    {
        id: "dua_cermin",
        occasion: "general",
        category: "spiritualCategoryAkhlak",
        title: "Doa Bercermin",
        titleEn: "Du'a When Looking in the Mirror",
        arabic: "اللَّهُمَّ كَمَا حَسَّنْتَ خَلْقِي فَحَسِّنْ خُلُقِي",
        latin: "Allahumma kamaa hassanta khalqii fa hassin khuluqii.",
        translation: "Ya Allah, sebagaimana Engkau telah memperindah kejadianku (fisikku), maka indahkanlah pula akhlakku.",
        translationEn: "O Allah, as You have made my physical form beautiful, so make my character beautiful.",
        virtue: "Selfie, filter, dan penampilan boleh dirawat, tapi nilai diri tidak ditentukan oleh likes atau standar internet. Doa ini mengingatkan kita merawat luar dan dalam.",
        virtueEn: "Selfies, filters, and appearance can be cared for, but your worth is not decided by likes or internet standards. This dua reminds us to care for both outside and inside.",
        searchTerms: ["body image", "self worth", "appearance", "beauty standards", "likes", "filter", "percaya diri", "penampilan"],
        recommendedCount: 1,
        source: {
            type: "hadith",
            referenceText: "HR. Bukhari No. 1032",
            referenceTextEn: "HR. Bukhari No. 1032",
            hadithDetails: { collection: "Bukhari", hadithNumber: 1032 }
        }
    },
    {
        id: "dua_memakai_pakaian",
        occasion: "general",
        category: "spiritualCategorySyukur",
        title: "Doa Memakai Pakaian",
        titleEn: "Du'a When Dressing",
        arabic: "الْحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَٰذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
        latin: "Alhamdulillaahilladzi kasaanii haadzaa wa razaqaniihi min ghairi hawlim-minnii wa laa quwwah.",
        translation: "Segala puji bagi Allah yang telah memakaikan pakaian ini kepadaku dan memberikannya rezeki kepadaku tanpa daya dan kekuatan dariku.",
        translationEn: "All praise is for Allah who has clothed me with this garment and provided it for me without any power or might on my part.",
        virtue: "Diampuni dosa-dosa yang telah lalu bagi siapa yang membacanya saat memakai pakaian.",
        virtueEn: "Past sins are forgiven for whoever recites this upon dressing.",
        recommendedCount: 1,
        source: {
            type: "hadith",
            referenceText: "HR. Bukhari No. 6224",
            referenceTextEn: "HR. Bukhari No. 6224",
            hadithDetails: { collection: "Bukhari", hadithNumber: 6224 }
        }
    },
    {
        id: "dua_masuk_masjid",
        occasion: "general",
        category: "spiritualCategoryIbadah",
        title: "Doa Masuk Masjid",
        titleEn: "Du'a When Entering Mosque",
        arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
        latin: "Allahummaftah lii abwaaba rahmatik.",
        translation: "Ya Allah, bukakanlah untukku pintu-pintu rahmat-Mu.",
        translationEn: "O Allah, open for me the gates of Your mercy.",
        virtue: "Memohon rahmat Allah ketika melangkahkan kaki ke dalam rumah-Nya.",
        virtueEn: "Seeking Allah's mercy when stepping into His house.",
        recommendedCount: 1,
        source: {
            type: "hadith",
            referenceText: "HR. Muslim No. 713",
            referenceTextEn: "HR. Muslim No. 713",
            hadithDetails: { collection: "Muslim", hadithNumber: 713 }
        }
    },
    {
        id: "dua_sulit_tidur",
        occasion: "sleeping",
        category: "spiritualCategoryPerlindungan",
        title: "Doa Ketika Sulit Tidur / Insomnia",
        titleEn: "Du'a for Insomnia / Difficulty Sleeping",
        arabic: "اللَّهُمَّ غَارَتِ النُّجُومُ وَهَدَأَتِ الْعُيُونُ وَأَنْتَ حَيٌّ قَيُّومٌ لا تَأْخُذُكَ سِنَةٌ وَلا نَوْمٌ يَا حَيُّ يَا قَيُّومُ أَهْدِئْ لَيْلِي وَأَنِمْ عَيْنِي",
        latin: "Allahumma ghaaratin-nujuumu wa hada'atil-'uyuunu wa anta hayyun qayyuumul-laa ta'khudzuki sinatuw-wa laa nawm, yaa hayyu yaa qayyuumu ahdi' lailii wa anim 'ainii.",
        translation: "Ya Allah, bintang-bintang telah tenggelam dan mata-mata telah tenang, sedangkan Engkau Maha Hidup lagi terus-menerus mengurus makhluk-Mu, tidak mengantuk dan tidak tidur. Wahai Yang Maha Hidup lagi Maha Berdiri Sendiri, tenangkanlah malamku dan tidurkanlah mataku.",
        translationEn: "O Allah, the stars have set and eyes are at rest, and You are the Ever-Living, the Sustainer. Neither drowsiness overtakes You nor sleep. O Ever-Living, O Sustainer, calm my night and bring sleep to my eyes.",
        virtue: "Saat kepala masih penuh setelah seharian online, kuliah, atau kerja, gunakan doa ini untuk menenangkan diri dan memberi tubuh kesempatan beristirahat.",
        virtueEn: "When your mind is still full after a day online, studying, or working, use this dua to settle yourself and let your body rest.",
        searchTerms: ["insomnia", "sleep", "night anxiety", "overthinking", "doomscrolling", "rest", "sulit tidur", "gelisah malam"],
        recommendedCount: 1,
        source: {
            type: "hadith",
            referenceText: "HR. Ibn As-Sunni No. 741",
            referenceTextEn: "HR. Ibn As-Sunni No. 741",
        }
    },
    {
        id: "dua_mimpi_buruk",
        occasion: "sleeping",
        additionalOccasions: ["protection"],
        category: "spiritualCategoryPerlindungan",
        title: "Doa Terbangun karena Mimpi Buruk",
        titleEn: "Du'a Upon Waking from a Nightmare",
        arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ غَضَبِهِ وَعِقَابِهِ وَشَرِّ عِبَادِهِ وَمِنْ هَمَزَاتِ الشَّيَاطِينِ وَأَنْ يَحْضُرُونِ",
        latin: "A'uudzu bikalimaatillaahit-tammati min ghadhabihi wa 'iqaabihi wa syarri 'ibaadihi wa min hamazaatisy-syayaatiini wa an yahdhuruun.",
        translation: "Aku berlindung dengan kalimat-kalimat Allah yang sempurna dari murka-Nya, siksa-Nya, kejahatan hamba-hamba-Nya, dan dari godaan syaitan serta kedatangan mereka kepadaku.",
        translationEn: "I seek refuge in the perfect words of Allah from His anger, His punishment, the evil of His servants, and from the whisperings of devils and that they should be present with me.",
        virtue: "Melindungi dari rasa takut dan kecemasan pasca mimpi buruk.",
        virtueEn: "Protects from fear and anxiety after a distressing dream.",
        recommendedCount: 1,
        source: {
            type: "hadith",
            referenceText: "HR. Abu Dawud No. 3893 & Tirmidzi No. 3528",
            referenceTextEn: "HR. Abu Dawud No. 3893 & Tirmidhi No. 3528",
            hadithDetails: { collection: "Abu Dawud", hadithNumber: 3893 }
        }
    },
    {
        id: "dua_kesulitan",
        occasion: "general",
        additionalOccasions: ["protection"],
        category: "spiritualCategoryPerlindungan",
        title: "Doa Saat Menghadapi Kesulitan",
        titleEn: "Du'a When Facing Hardship",
        arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
        latin: "Hasbunallaahu wa ni'mal wakiil.",
        translation: "Cukuplah Allah menjadi Penolong kami dan Allah adalah sebaik-baik Pelindung.",
        translationEn: "Sufficient for us is Allah, and [He is] the best Disposer of affairs.",
        virtue: "Saat hidup terasa stuck, gunakan doa ini sebagai jeda untuk mengakui bahwa kita butuh pertolongan—lalu ambil satu langkah yang masih bisa dilakukan hari ini.",
        virtueEn: "When life feels stuck, use this dua as a pause to admit that you need help—then take one step that is still possible today.",
        searchTerms: ["hardship", "stuck", "overwhelmed", "crisis", "uncertain future", "help", "sulit", "kewalahan", "masa depan"],
        recommendedCount: 3,
        source: {
            type: "quran",
            referenceText: "QS. Ali Imran [3]: 173",
            referenceTextEn: "Surah Ali Imran 3:173",
            quranDetails: { surahName: "Ali Imran", surahNumber: 3, ayahNumber: 173 }
        }
    },
    {
        id: "dua_sedih_gelisah",
        occasion: "general",
        additionalOccasions: ["protection"],
        category: "spiritualCategoryPerlindungan",
        title: "Doa Penghilang Duka & Cemas",
        titleEn: "Du'a to Remove Grief & Anxiety",
        arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ وَالْعَجْزِ وَالْكَسَلِ وَالْبُخْلِ وَالْجُبْنِ وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ",
        latin: "Allahumma innii a'uudzubika minal-hammi wal-hazani wal-'ajzi wal-kasali wal-bukhli wal-jubni wa dhala'id-daini wa ghalabatir-rijaal.",
        translation: "Ya Allah, aku berlindung kepada-Mu dari rasa cemas, sedih, lemah, malas, penakut, kikir, beban hutang, dan tekanan orang-orang.",
        translationEn: "O Allah, I seek refuge in You from anxiety, sorrow, weakness, laziness, cowardice, miserliness, the burden of debt, and the oppression of men.",
        virtue: "Doa komprehensif pelindung kesehatan mental dan ketenangan batin.",
        virtueEn: "Comprehensive prayer protecting mental well-being and inner peace.",
        searchTerms: ["anxiety", "stress", "burnout", "worry", "debt", "pressure", "mental health", "cemas", "stres", "utang"],
        recommendedCount: 1,
        source: {
            type: "hadith",
            referenceText: "HR. Bukhari No. 6363",
            referenceTextEn: "HR. Bukhari No. 6363",
            hadithDetails: { collection: "Bukhari", hadithNumber: 6363 }
        }
    },
    {
        id: "dua_taubat_nabi_adam",
        occasion: "general",
        category: "spiritualCategoryIman",
        title: "Doa Taubat & Pengakuan Dosa",
        titleEn: "Du'a of Repentance (Nabi Adam)",
        arabic: "رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ",
        latin: "Rabbanaa zhalamnaa anfusanaa wa il-lam taghfir lanaa wa tarhamnaa lanakuunanna minal khaasiriin.",
        translation: "Ya Tuhan kami, kami telah menzalimi diri kami sendiri, dan jika Engkau tidak mengampuni kami dan memberi rahmat kepada kami, niscaya kami termasuk orang-orang yang rugi.",
        translationEn: "Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers.",
        virtue: "Doa taubat Nabi Adam AS saat menyadari kekhilafan.",
        virtueEn: "The prayer of repentance of Prophet Adam (AS) upon realizing his mistake.",
        recommendedCount: 1,
        source: {
            type: "quran",
            referenceText: "QS. Al-A'raf [7]: 23",
            referenceTextEn: "Surah Al-A'raf 7:23",
            quranDetails: { surahName: "Al-A'raf", surahNumber: 7, ayahNumber: 23 }
        }
    },
    {
        id: "dua_kesehatan",
        occasion: "general",
        category: "spiritualCategoryPerlindungan",
        title: "Doa Kesehatan & Afiat",
        titleEn: "Du'a for Health & Well-being",
        arabic: "اللَّهُمَّ عَافِنِي فِي بَدَنِي اللَّهُمَّ عَافِنِي فِي سَمْعِي اللَّهُمَّ عَافِنِي فِي بَصَرِي",
        latin: "Allahumma 'aafinii fii badanii, Allahumma 'aafinii fii sam'ii, Allahumma 'aafinii fii basharii.",
        translation: "Ya Allah, sehatkanlah badanku, ya Allah, sehatkanlah pendengaranku, ya Allah, sehatkanlah penglihatanku.",
        translationEn: "O Allah, grant health to my body, O Allah, grant health to my hearing, O Allah, grant health to my sight.",
        virtue: "Memohon nikmat kesehatan fisik dan panca indera.",
        virtueEn: "Praying for physical health and well-being of senses.",
        recommendedCount: 3,
        source: {
            type: "hadith",
            referenceText: "HR. Ahmad No. 19606",
            referenceTextEn: "HR. Ahmad No. 19606",
            hadithDetails: { collection: "Ahmad", hadithNumber: 19606 }
        }
    },
    {
        id: "dua_tahajud",
        occasion: "general",
        category: "spiritualCategoryIbadah",
        title: "Doa Sholat Tahajud",
        titleEn: "Du'a of Tahajjud Prayer",
        arabic: "اللَّهُمَّ لَكَ الْحَمْدُ أَنْتَ نُورُ السَّمَاوَاتِ وَالأَرْضِ وَمَنْ فِيهِنَّ",
        latin: "Allahumma lakal-hamdu anta nuurus-samaawaati wal-ardhi wa man fiihin.",
        translation: "Ya Allah, bagi-Mu segala puji, Engkau adalah Cahaya langit dan bumi serta semua yang ada di dalamnya.",
        translationEn: "O Allah, to You belongs all praise, You are the Light of the heavens and the earth and all that is within them.",
        virtue: "Doa pembuka sholat malam yang penuh keagungan.",
        virtueEn: "Glorious opening prayer for night vigil (Tahajjud).",
        recommendedCount: 1,
        source: {
            type: "hadith",
            referenceText: "HR. Bukhari No. 1120 & Muslim No. 769",
            referenceTextEn: "HR. Bukhari No. 1120 & Muslim No. 769",
            hadithDetails: { collection: "Bukhari", hadithNumber: 1120 }
        }
    },
];
