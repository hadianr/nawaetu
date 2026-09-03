/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * Group B: Evening Adhkar (Dzikir Petang)
 */

import { DuaItem } from "./types";

export const EVENING_DUAS: DuaItem[] = [
    {
        id: "dua_petang_ayat_kursi",
        occasion: "evening",
        additionalOccasions: ["protection"],
        category: "spiritualCategoryPerlindungan",
        title: "Ayat Kursi Dzikir Petang",
        titleEn: "Ayat Kursi (Evening Adhkar)",
        arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ",
        latin: "Allahu laa ilaaha illaa huwal-hayyul-qayyuum, laa ta'khudzuhuu sinatuw-wa laa nawm.",
        translation: "Allah, tidak ada tuhan selain Dia, Yang Maha Hidup lagi terus-menerus mengurus makhluk-Nya. Tidak mengantuk dan tidak tidur.",
        translationEn: "Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep.",
        virtue: "Siapa membaca Ayat Kursi setiap petang, ia akan selalu mendapat perlindungan Allah hingga pagi.",
        virtueEn: "Whoever recites Ayat Kursi every evening will be under Allah's protection until morning.",
        recommendedCount: 1,
        source: {
            type: "quran",
            referenceText: "QS. Al-Baqarah [2]: 255",
            referenceTextEn: "Surah Al-Baqarah 2:255",
            quranDetails: { surahName: "Al-Baqarah", surahNumber: 2, ayahNumber: 255 }
        }
    },
    {
        id: "dua_petang_sayyidul_istighfar",
        occasion: "evening",
        category: "spiritualCategoryIman",
        title: "Sayyidul Istighfar Petang",
        titleEn: "Master of Forgiveness (Evening)",
        arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
        latin: "Allahumma anta rabbii laa ilaaha illaa anta, khalaqtanii wa anaa 'abduka, wa anaa 'alaa 'ahdika wa wa'dika mastatha'tu, a'uudzu bika min syarri maa shana'tu, abuu-u laka bini'matika 'alayya wa abuu-u bidzanbii, faghfir lii fa-innahuu laa yaghfirudz-dzunuuba illaa anta.",
        translation: "Ya Allah, Engkau adalah Rabbku, tidak ada tuhan selain Engkau. Engkau menciptakanku dan aku adalah hamba-Mu. Aku berada di atas perjanjian-Mu semampuku. Aku berlindung kepada-Mu dari kejahatan perbuatanku. Aku mengakui nikmat-Mu kepadaku dan aku mengakui dosaku. Maka ampunilah aku, sebab tidak ada yang dapat mengampuni dosa kecuali Engkau.",
        translationEn: "O Allah, You are my Lord. There is no deity except You. You created me and I am Your servant. I am upon Your covenant and Your promise as best I can. I seek refuge in You from the evil of what I have done. I acknowledge Your blessing upon me and I acknowledge my sin, so forgive me, for indeed none forgives sins except You.",
        virtue: "Siapa membacanya dengan yakin di sore hari lalu meninggal sebelum pagi, ia termasuk ahli surga.",
        virtueEn: "Whoever recites it sincerely in the evening and dies before morning will be among the people of Paradise.",
        recommendedCount: 1,
        source: {
            type: "hadith",
            referenceText: "HR. Bukhari No. 6306",
            referenceTextEn: "HR. Bukhari No. 6306",
            hadithDetails: { collection: "Bukhari", hadithNumber: 6306 }
        }
    },
    {
        id: "dua_petang_tasbih",
        occasion: "evening",
        isDhikr: true,
        category: "spiritualCategoryIbadah",
        title: "Tasbih, Tahmid, Takbir Petang (33x)",
        titleEn: "Evening Glorification (33x)",
        arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
        latin: "Subhaanallaahi wa bihamdih.",
        translation: "Maha Suci Allah dan segala puji bagi-Nya.",
        translationEn: "Glory be to Allah and all praise is for Him.",
        virtue: "Zikir ringan yang sangat besar pahalanya. Membuka petang dengan kesadaran penuh akan keagungan Allah.",
        virtueEn: "Light words that carry great reward. Opening the evening with full awareness of Allah's greatness.",
        recommendedCount: 33,
        source: {
            type: "hadith",
            referenceText: "HR. Muslim No. 2691",
            referenceTextEn: "HR. Muslim No. 2691",
            hadithDetails: { collection: "Muslim", hadithNumber: 2691 }
        }
    },
    {
        id: "dua_masuk_rumah",
        occasion: "evening",
        category: "spiritualCategoryIbadah",
        title: "Doa Masuk Rumah",
        titleEn: "Du'a When Entering Home",
        arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلِجِ وَخَيْرَ الْمَخْرَجِ بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا",
        latin: "Allahumma innii as-aluka khairal mawliji wa khairal makhraji, bismillaahi walajnaa wa bismillaahi kharajnaa wa 'alallaahi rabbinaa tawakkalnaa.",
        translation: "Ya Allah, sesungguhnya aku memohon kepada-Mu sebaik-baik tempat masuk dan sebaik-baik tempat keluar. Dengan nama Allah kami masuk, dengan nama Allah kami keluar, dan kepada Allah Tuhan kami kami bertawakal.",
        translationEn: "O Allah, I ask You for the best entrance and the best exit. In Allah's name we enter, in Allah's name we exit, and upon Allah our Lord we place our trust.",
        virtue: "Membawa keberkahan ke dalam rumah dan memohon perlindungan Allah atas tempat tinggal dan seluruh penghuninya.",
        virtueEn: "Brings blessings into the home and asks Allah's protection over the dwelling and all its inhabitants.",
        recommendedCount: 1,
        source: {
            type: "hadith",
            referenceText: "HR. Abu Dawud No. 5096",
            referenceTextEn: "HR. Abu Dawud No. 5096",
            hadithDetails: { collection: "Abu Dawud", hadithNumber: 5096 }
        }
    },
    {
        id: "dua_petang_perlindungan_keluarga",
        occasion: "evening",
        additionalOccasions: ["protection"],
        category: "spiritualCategoryPerlindungan",
        title: "Doa Perlindungan Diri dan Keluarga",
        titleEn: "Du'a for Protection of Self and Family",
        arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
        latin: "A'uudzu bikalimaatillaahit-taaammaati min syarri maa khalaq.",
        translation: "Aku berlindung dengan kalimat-kalimat Allah yang sempurna dari kejahatan semua yang Dia ciptakan.",
        translationEn: "I seek refuge in the perfect words of Allah from the evil of all that He has created.",
        virtue: "Nabi SAW mengajarkan doa ini kepada cucu-cucunya (Hasan dan Husain) agar terlindungi dari bahaya, penyakit, dan gangguan jin.",
        virtueEn: "The Prophet (PBUH) taught this dua to his grandsons (Hasan and Husain) for protection from harm, illness, and jinn.",
        recommendedCount: 3,
        source: {
            type: "hadith",
            referenceText: "HR. Bukhari No. 3371",
            referenceTextEn: "HR. Bukhari No. 3371",
            hadithDetails: { collection: "Bukhari", hadithNumber: 3371 }
        }
    },
    {
        id: "dua_petang_qulhu",
        occasion: "evening",
        additionalOccasions: ["protection"],
        isDhikr: true,
        category: "spiritualCategoryPerlindungan",
        title: "Surat Pelindung Petang (Al-Ikhlas, Al-Falaq, An-Nas)",
        titleEn: "Evening Protection Surahs",
        arabic: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ  مِن شَرِّ مَا خَلَقَ  وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ",
        latin: "Qul a'uudzu bi rabbil-falaq. Min syarri maa khalaq. Wa min syarri ghaasiqin idzaa waqab.",
        translation: "Katakanlah: Aku berlindung kepada Tuhan yang menguasai subuh. Dari kejahatan makhluk-Nya. Dan dari kejahatan malam apabila telah gelap gulita.",
        translationEn: "Say: I seek refuge in the Lord of daybreak. From the evil of that which He created. And from the evil of darkness when it settles.",
        virtue: "Membaca Al-Ikhlas, Al-Falaq, dan An-Nas masing-masing 3x di petang hari melindungi hingga pagi.",
        virtueEn: "Reading Al-Ikhlas, Al-Falaq, and An-Nas 3x each in the evening provides protection until morning.",
        recommendedCount: 3,
        source: {
            type: "hadith",
            referenceText: "HR. Abu Dawud No. 5082 & Tirmidzi No. 3575",
            referenceTextEn: "HR. Abu Dawud No. 5082 & Tirmidhi No. 3575",
            hadithDetails: { collection: "Abu Dawud", hadithNumber: 5082 }
        }
    },
    {
        id: "dua_sebelum_tidur",
        occasion: "sleeping",
        category: "spiritualCategoryIbadah",
        title: "Doa Sebelum Tidur",
        titleEn: "Du'a Before Sleep",
        arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
        latin: "Bismikallaahumma amuutu wa ahyaa.",
        translation: "Dengan nama-Mu ya Allah, aku mati dan aku hidup.",
        translationEn: "In Your name, O Allah, I die and I live.",
        virtue: "Tidur dimulai dengan mengingat Allah, sebuah kematian kecil yang kita pasrahkan kepada-Nya. Sunah Nabi SAW setiap malam.",
        virtueEn: "Sleep begins with remembrance of Allah — a small death we surrender to Him. A nightly Sunnah of the Prophet (PBUH).",
        recommendedCount: 1,
        source: {
            type: "hadith",
            referenceText: "HR. Bukhari No. 6312",
            referenceTextEn: "HR. Bukhari No. 6312",
            hadithDetails: { collection: "Bukhari", hadithNumber: 6312 }
        }
    },
    {
        id: "dua_sebelum_tidur_ayat",
        occasion: "sleeping",
        category: "spiritualCategoryPerlindungan",
        title: "Ayat & Doa Sebelum Tidur (Al-Kafirun)",
        titleEn: "Bedtime Du'a & Verses (Al-Kafirun)",
        arabic: "قُلْ يَا أَيُّهَا الْكَافِرُونَ  لَا أَعْبُدُ مَا تَعْبُدُونَ  وَلَا أَنتُمْ عَابِدُونَ مَا أَعْبُدُ",
        latin: "Qul yaa ayyuhal-kaafiruun. Laa a'budu maa ta'buduun. Wa laa antum 'aabiduuna maa a'bud.",
        translation: "Katakanlah: Hai orang-orang kafir! Aku tidak akan menyembah apa yang kamu sembah. Dan kamu bukan penyembah Tuhan yang aku sembah.",
        translationEn: "Say: O disbelievers! I do not worship what you worship. Nor are you worshippers of what I worship.",
        virtue: "Nabi SAW membaca Surat Al-Kafirun sebelum tidur sebagai pernyataan berlepas diri dari syirik dan perlindungan selama tidur.",
        virtueEn: "The Prophet (PBUH) recited Surah Al-Kafirun before sleep as a declaration of freedom from polytheism and protection during sleep.",
        recommendedCount: 1,
        source: {
            type: "hadith",
            referenceText: "HR. Abu Dawud No. 5055 & Tirmidzi No. 3403",
            referenceTextEn: "HR. Abu Dawud No. 5055 & Tirmidhi No. 3403",
            hadithDetails: { collection: "Abu Dawud", hadithNumber: 5055 }
        }
    },
    {
        id: "dua_syukur",
        occasion: "evening",
        additionalOccasions: ["gratitude"],
        category: "spiritualCategorySyukur",
        title: "Doa Mensyukuri Nikmat",
        titleEn: "Du'a of Gratitude",
        arabic: "رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَىٰ وَالِدَيَّ",
        latin: "Rabbi aw zi'nī an asykura ni'matakal-latī an'amta 'alayya wa 'alā wālidayya.",
        translation: "Ya Tuhanku berilah aku ilham untuk tetap mensyukuri nikmat-Mu yang telah Engkau anugerahkan kepadaku dan kepada dua orang ibu bapakku.",
        translationEn: "My Lord, inspire me to be grateful for Your blessing which You have bestowed upon me and upon my parents.",
        virtue: "Doa Al-Quran memohon keikhlasan dan ilham untuk terus bersyukur. Cocok dibaca saat muhasabah petang.",
        virtueEn: "Quranic prayer asking for inspiration to remain constantly grateful. Perfect for evening reflection.",
        recommendedCount: 1,
        source: {
            type: "quran",
            referenceText: "QS. An-Naml [27]: 19",
            referenceTextEn: "Surah An-Naml 27:19",
            quranDetails: { surahName: "An-Naml", surahNumber: 27, ayahNumber: 19 }
        }
    },
    {
        id: "dua_petang_muhasabah",
        occasion: "evening",
        category: "spiritualCategoryIman",
        title: "Doa Muhasabah Malam",
        titleEn: "Evening Self-Reflection Du'a",
        arabic: "اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ",
        latin: "Allahumma maa amsa bii min ni'matin aw bi-ahadin min khalqika fa-minka wahdaka laa syariika laka, falakal-hamdu wa lakasy-syukr.",
        translation: "Ya Allah, nikmat apa pun yang ada padaku atau pada salah seorang dari makhluk-Mu di sore ini, maka semuanya dari-Mu semata, tiada sekutu bagi-Mu. Maka bagi-Mu segala pujian dan syukur.",
        translationEn: "O Allah, whatever blessing I or any of Your creation entered the evening with — it is from You alone, You have no partner. So for You is all praise and thanks.",
        virtue: "Doa muhasabah petang yang mengajarkan kita mengakhiri hari dengan kesadaran bahwa semua nikmat hanya dari Allah semata.",
        virtueEn: "Evening reflection dua that teaches us to end the day with the awareness that all blessings come from Allah alone.",
        recommendedCount: 1,
        source: {
            type: "hadith",
            referenceText: "HR. Abu Dawud No. 5073 & An-Nasa'i No. 9836",
            referenceTextEn: "HR. Abu Dawud No. 5073 & An-Nasa'i No. 9836",
            hadithDetails: { collection: "Abu Dawud", hadithNumber: 5073 }
        }
    },
];
