/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * Group A: Morning Adhkar (Dzikir Pagi)
 */

import { DuaItem } from "./types";

export const MORNING_DUAS: DuaItem[] = [
    {
        id: "dua_bangun_tidur",
        occasion: "morning",
        additionalOccasions: ["gratitude"],
        category: "spiritualCategoryIbadah",
        title: "Doa Bangun Tidur",
        titleEn: "Du'a Upon Waking",
        arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
        latin: "Alhamdulillahilladzi ahyaanaa ba'da maa amaatanaa wa ilaihin-nusyuur.",
        translation: "Segala puji bagi Allah yang telah menghidupkan kami setelah Dia mematikan kami, dan kepada-Nya kami akan dibangkitkan.",
        translationEn: "All praise is for Allah who gave us life after causing us to die, and to Him is the resurrection.",
        virtue: "Dibaca setiap kali bangun tidur sebagai tanda syukur atas nikmat hidup dan kesadaran akan hari kebangkitan.",
        virtueEn: "Recited every time one wakes up as gratitude for the gift of life and awareness of the resurrection.",
        recommendedCount: 1,
        source: {
            type: "hadith",
            referenceText: "HR. Bukhari No. 6312",
            referenceTextEn: "HR. Bukhari No. 6312",
            hadithDetails: { collection: "Bukhari", hadithNumber: 6312 }
        }
    },
    {
        id: "dua_keluar_rumah",
        occasion: "morning",
        category: "spiritualCategoryPerlindungan",
        title: "Doa Keluar Rumah",
        titleEn: "Du'a When Leaving Home",
        arabic: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
        latin: "Bismillaahi, tawakkaltu 'alallaahi, wa laa hawla wa laa quwwata illaa billaah.",
        translation: "Dengan nama Allah, aku bertawakal kepada Allah, tidak ada daya dan kekuatan kecuali dengan Allah.",
        translationEn: "In the name of Allah, I place my trust in Allah. There is no power and no strength except with Allah.",
        virtue: "Barangsiapa membaca doa ini saat keluar rumah, ia akan dijaga, dituntun, dan dijauhkan dari syaitan.",
        virtueEn: "Whoever recites this when leaving home will be protected, guided, and kept away from Shaytan.",
        recommendedCount: 1,
        source: {
            type: "hadith",
            referenceText: "HR. Abu Dawud No. 5095 & Tirmidzi No. 3426",
            referenceTextEn: "HR. Abu Dawud No. 5095 & Tirmidhi No. 3426",
            hadithDetails: { collection: "Abu Dawud", hadithNumber: 5095 }
        }
    },
    {
        id: "dua_pagi_ayat_kursi",
        occasion: "morning",
        additionalOccasions: ["protection"],
        category: "spiritualCategoryPerlindungan",
        title: "Ayat Kursi Dzikir Pagi",
        titleEn: "Ayat Kursi (Morning Adhkar)",
        arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ",
        latin: "Allahu laa ilaaha illaa huwal-hayyul-qayyuum, laa ta'khudzuhuu sinatuw-wa laa nawm.",
        translation: "Allah, tidak ada tuhan selain Dia, Yang Maha Hidup lagi terus-menerus mengurus makhluk-Nya. Tidak mengantuk dan tidak tidur.",
        translationEn: "Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep.",
        virtue: "Siapa membaca Ayat Kursi setiap pagi, ia akan selalu mendapat perlindungan Allah hingga petang.",
        virtueEn: "Whoever recites Ayat Kursi every morning will be under Allah's protection until evening.",
        recommendedCount: 1,
        source: {
            type: "quran",
            referenceText: "QS. Al-Baqarah [2]: 255",
            referenceTextEn: "Surah Al-Baqarah 2:255",
            quranDetails: { surahName: "Al-Baqarah", surahNumber: 2, ayahNumber: 255 }
        }
    },
    {
        id: "dua_pagi_sayyidul_istighfar",
        occasion: "morning",
        category: "spiritualCategoryIman",
        title: "Sayyidul Istighfar Pagi",
        titleEn: "Master of Forgiveness (Morning)",
        arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
        latin: "Allahumma anta rabbii laa ilaaha illaa anta, khalaqtanii wa anaa 'abduka, wa anaa 'alaa 'ahdika wa wa'dika mastatha'tu, a'uudzu bika min syarri maa shana'tu, abuu-u laka bini'matika 'alayya wa abuu-u bidzanbii, faghfir lii fa-innahuu laa yaghfirudz-dzunuuba illaa anta.",
        translation: "Ya Allah, Engkau adalah Rabbku, tidak ada tuhan selain Engkau. Engkau menciptakanku dan aku adalah hamba-Mu. Aku berada di atas perjanjian-Mu semampuku. Aku berlindung kepada-Mu dari kejahatan perbuatanku. Aku mengakui nikmat-Mu kepadaku dan aku mengakui dosaku. Maka ampunilah aku, sebab tidak ada yang dapat mengampuni dosa kecuali Engkau.",
        translationEn: "O Allah, You are my Lord. There is no deity except You. You created me and I am Your servant. I am upon Your covenant and Your promise as best I can. I seek refuge in You from the evil of what I have done. I acknowledge Your blessing upon me and I acknowledge my sin, so forgive me, for indeed none forgives sins except You.",
        virtue: "Penghulu istighfar. Siapa membacanya dengan yakin di pagi hari lalu meninggal sebelum petang, ia termasuk ahli surga.",
        virtueEn: "Master of forgiveness. Whoever recites it sincerely in the morning and dies before evening will be among the people of Paradise.",
        recommendedCount: 1,
        source: {
            type: "hadith",
            referenceText: "HR. Bukhari No. 6306",
            referenceTextEn: "HR. Bukhari No. 6306",
            hadithDetails: { collection: "Bukhari", hadithNumber: 6306 }
        }
    },
    {
        id: "dua_ilmu",
        occasion: "morning",
        category: "spiritualCategoryIlmu",
        title: "Doa Memohon Ilmu yang Bermanfaat",
        titleEn: "Du'a for Beneficial Knowledge",
        arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا",
        latin: "Allahumma innii as-aluka 'ilman naafi'an, wa rizqon thoyyiban, wa 'amalan mutaqobbalan.",
        translation: "Ya Allah, sesungguhnya aku memohon kepada-Mu ilmu yang bermanfaat, rezeki yang baik, dan amal yang diterima.",
        translationEn: "O Allah, I ask You for beneficial knowledge, good provision, and accepted deeds.",
        virtue: "Dibaca setiap pagi setelah Sholat Subuh untuk memohon keberkahan ilmu, rezeki, dan amal sepanjang hari.",
        virtueEn: "Recited every morning after Fajr prayer to seek blessings of knowledge, provision, and deeds throughout the day.",
        recommendedCount: 1,
        source: {
            type: "hadith",
            referenceText: "HR. Ibn Majah No. 925 & Ahmad No. 26521",
            referenceTextEn: "HR. Ibn Majah No. 925 & Ahmad No. 26521",
            hadithDetails: { collection: "Ibn Majah", hadithNumber: 925 }
        }
    },
    {
        id: "dua_pagi_tasbih",
        occasion: "morning",
        isDhikr: true,
        category: "spiritualCategoryIbadah",
        title: "Tasbih, Tahmid, Takbir Pagi (33x)",
        titleEn: "Morning Glorification (33x)",
        arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
        latin: "Subhaanallaahi wa bihamdih.",
        translation: "Maha Suci Allah dan segala puji bagi-Nya.",
        translationEn: "Glory be to Allah and all praise is for Him.",
        virtue: "Siapa membaca kalimat ini 100x di pagi hari, dosa-dosanya diampuni meskipun sebanyak buih lautan.",
        virtueEn: "Whoever recites this 100 times in the morning will have their sins forgiven even if they are as much as the foam of the sea.",
        recommendedCount: 33,
        source: {
            type: "hadith",
            referenceText: "HR. Muslim No. 2691",
            referenceTextEn: "HR. Muslim No. 2691",
            hadithDetails: { collection: "Muslim", hadithNumber: 2691 }
        }
    },
    {
        id: "dua_rizki",
        occasion: "morning",
        category: "spiritualCategoryIbadah",
        title: "Doa untuk Rezeki Halal dan Karier yang Berkah",
        titleEn: "Du'a for Halal Provision and a Blessed Career",
        arabic: "اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ",
        latin: "Allaahummak-finii bihalaalika 'an haraamika wa aghninii bifadhlika 'amman siwaak.",
        translation: "Ya Allah, cukupkanlah aku dengan yang halal dari-Mu sehingga terhindar dari yang haram, dan kayakanlah aku dengan karunia-Mu sehingga tidak bergantung kepada selain-Mu.",
        translationEn: "O Allah, suffice me with what You have made lawful so I have no need for what is forbidden, and enrich me with Your grace so I have no need of anyone besides You.",
        virtue: "Saat merintis karier, freelance, atau bisnis, minta rezeki yang cukup dan halal—bukan sekadar terlihat sukses di LinkedIn atau Instagram.",
        virtueEn: "While building a career, freelancing, or starting a business, ask for provision that is sufficient and halal—not just success that looks good online.",
        searchTerms: ["career", "job", "freelance", "business", "money", "financial anxiety", "halal income", "karier", "kerja", "rezeki"],
        recommendedCount: 1,
        source: {
            type: "hadith",
            referenceText: "HR. Tirmidzi No. 3563",
            referenceTextEn: "HR. Tirmidhi No. 3563",
            hadithDetails: { collection: "Tirmidzi", hadithNumber: 3563 }
        }
    },
    {
        id: "dua_belajar",
        occasion: "morning",
        category: "spiritualCategoryIlmu",
        title: "Doa Sebelum Belajar, Presentasi, atau Kerja",
        titleEn: "Du'a Before Studying, Presenting, or Working",
        arabic: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي يَفْقَهُوا قَوْلِي",
        latin: "Rabbisyrahlii shadrii, wa yassir lii amrii, wahlul 'uqdatan min lisaanii, yafqahu qawlii.",
        translation: "Ya Tuhanku, lapangkanlah dadaku, mudahkanlah urusanku, dan lepaskanlah kekakuan dari lidahku agar mereka mengerti perkataanku.",
        translationEn: "My Lord, expand my breast, ease my task, and untie the knot from my tongue so they may understand my speech.",
        virtue: "Baca sebelum ujian, presentasi, interview, meeting, atau mengerjakan tugas yang bikin nervous. Minta kelapangan dada dan komunikasi yang jelas.",
        virtueEn: "Read it before an exam, presentation, interview, meeting, or stressful assignment. Ask for an open heart and clear communication.",
        searchTerms: ["presentation", "interview", "exam", "meeting", "nervous", "public speaking", "study", "work", "ujian", "presentasi", "wawancara"],
        recommendedCount: 1,
        source: {
            type: "quran",
            referenceText: "QS. Taha [20]: 25-28",
            referenceTextEn: "Surah Taha 20:25-28",
            quranDetails: { surahName: "Taha", surahNumber: 20, ayahNumber: "25-28" }
        }
    },
    {
        id: "dua_perlindungan",
        occasion: "morning",
        additionalOccasions: ["protection"],
        isDhikr: true,
        category: "spiritualCategoryPerlindungan",
        title: "Doa Perlindungan Pagi",
        titleEn: "Morning Protection Du'a",
        arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
        latin: "Bismillaahilladzi laa yadhurru ma'asmihi syai-un fil ardhi wa laa fis-samaa-i wa huwas-samii'ul 'aliim.",
        translation: "Dengan nama Allah yang tidak ada sesuatu pun di bumi dan di langit yang dapat membahayakan bersama nama-Nya, dan Dia Maha Mendengar lagi Maha Mengetahui.",
        translationEn: "In the name of Allah with Whose name nothing can cause harm on earth or in heaven, and He is the All-Hearing, the All-Knowing.",
        virtue: "Barangsiapa membacanya 3 kali di pagi dan petang hari, tidak akan ada sesuatu yang membahayakannya.",
        virtueEn: "Whoever recites it 3 times in the morning and evening will not be harmed by anything.",
        recommendedCount: 3,
        source: {
            type: "hadith",
            referenceText: "HR. Abu Dawud No. 5088 & Tirmidzi No. 3388",
            referenceTextEn: "HR. Abu Dawud No. 5088 & Tirmidhi No. 3388",
            hadithDetails: { collection: "Abu Dawud", hadithNumber: 5088 }
        }
    },
    {
        id: "dua_pagi_qulhu",
        occasion: "morning",
        isDhikr: true,
        category: "spiritualCategoryPerlindungan",
        title: "Surat Pelindung Pagi (Al-Ikhlas, Al-Falaq, An-Nas)",
        titleEn: "Morning Protection Surahs",
        arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ  اللَّهُ الصَّمَدُ  لَمْ يَلِدْ وَلَمْ يُولَدْ  وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
        latin: "Qul huwallahu ahad. Allahush-shamad. Lam yalid wa lam yuulad. Wa lam yakul-lahuu kufuwan ahad.",
        translation: "Katakanlah: Dialah Allah, Yang Maha Esa. Allah adalah Tuhan bergantung kepada-Nya segala sesuatu. Dia tidak beranak dan tidak diperanakkan. Dan tidak ada sesuatu yang setara dengan Dia.",
        translationEn: "Say: He is Allah, [who is] One. Allah, the Eternal Refuge. He neither begets nor is born. Nor is there to Him any equivalent.",
        virtue: "Membaca Al-Ikhlas, Al-Falaq, dan An-Nas masing-masing 3x di pagi dan petang cukup sebagai perlindungan dari segala sesuatu.",
        virtueEn: "Reading Al-Ikhlas, Al-Falaq, and An-Nas 3x each in morning and evening provides protection from all things.",
        recommendedCount: 3,
        source: {
            type: "hadith",
            referenceText: "HR. Abu Dawud No. 5082 & Tirmidzi No. 3575",
            referenceTextEn: "HR. Abu Dawud No. 5082 & Tirmidhi No. 3575",
            hadithDetails: { collection: "Abu Dawud", hadithNumber: 5082 }
        }
    },
];
