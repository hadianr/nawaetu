/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * Group E: Social & Good Habits for Gen Z
 */

import { DuaItem } from "./types";

export const SOCIAL_DUAS: DuaItem[] = [
    {
        id: "dua_berbuat_baik_pada_ortu",
        occasion: "social",
        category: "spiritualCategoryAkhlak",
        title: "Doa Berbakti pada Orang Tua",
        titleEn: "Du'a for Honoring Parents",
        arabic: "رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
        latin: "Rabbir-hamhumaa kamaa rabbayaanii shaghiiraa.",
        translation: "Ya Tuhanku, sayangilah keduanya (orang tuaku) sebagaimana mereka berdua mendidikku di waktu kecil.",
        translationEn: "My Lord, have mercy upon them (my parents) as they raised me when I was small.",
        virtue: "Doa terpendek dan terdalam untuk orang tua. Surga ada di bawah telapak kaki ibu — mulai dari mendoakannya setiap hari.",
        virtueEn: "The shortest and deepest prayer for parents. Paradise lies beneath a mother's feet — begin by praying for them daily.",
        recommendedCount: 1,
        source: {
            type: "quran",
            referenceText: "QS. Al-Isra [17]: 24",
            referenceTextEn: "Surah Al-Isra 17:24",
            quranDetails: { surahName: "Al-Isra", surahNumber: 17, ayahNumber: 24 }
        }
    },
    {
        id: "dua_mendoakan_orang_lain",
        occasion: "social",
        category: "spiritualCategoryAkhlak",
        title: "Doa untuk Saudara Seiman",
        titleEn: "Du'a for a Fellow Muslim",
        arabic: "اللَّهُمَّ اغْفِرْ لِلْمُسْلِمِينَ وَالْمُسْلِمَاتِ وَالْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ",
        latin: "Allaahummagh-fir lil-muslimiina wal-muslimaati wal-mu'miniina wal-mu'minaat.",
        translation: "Ya Allah, ampunilah kaum muslimin dan muslimat, serta kaum mukminin dan mukminat.",
        translationEn: "O Allah, forgive the Muslim men and Muslim women, and the believing men and believing women.",
        virtue: "Mendoakan sesama Muslim tanpa sepengetahuannya adalah salah satu amalan terbaik. Doamu kembali kepadamu dalam bentuk yang sama.",
        virtueEn: "Praying for a fellow Muslim without their knowledge is among the best deeds. Your dua returns to you in the same form.",
        recommendedCount: 1,
        source: {
            type: "hadith",
            referenceText: "HR. Muslim No. 2733",
            referenceTextEn: "HR. Muslim No. 2733",
            hadithDetails: { collection: "Muslim", hadithNumber: 2733 }
        }
    },
    {
        id: "dua_teman_yang_baik",
        occasion: "social",
        category: "spiritualCategoryAkhlak",
        title: "Doa Memohon Teman Shalih",
        titleEn: "Du'a for Righteous Companions",
        arabic: "اللَّهُمَّ اجْعَلْنِي أُحِبُّكَ وَأُحِبُّ مَنْ يُحِبُّكَ وَأُحِبُّ مَا يُقَرِّبُنِي إِلَيْكَ",
        latin: "Allaahumaj-'alnii uhibbuka wa uhibbu man yuhibbuka wa uhibbu maa yuqarribunii ilaik.",
        translation: "Ya Allah, jadikanlah aku mencintai-Mu, mencintai orang-orang yang mencintai-Mu, dan mencintai apa yang mendekatkanku kepada-Mu.",
        translationEn: "O Allah, make me love You, love those who love You, and love that which brings me closer to You.",
        virtue: "Seseorang dipengaruhi oleh teman dekatnya. Doa ini memohon agar Allah menghadirkan lingkungan yang positif dan shalih di sekitar kita.",
        virtueEn: "A person is influenced by their close companions. This dua asks Allah to surround us with a positive and righteous environment.",
        recommendedCount: 1,
        source: {
            type: "hadith",
            referenceText: "HR. Tirmidzi No. 3490",
            referenceTextEn: "HR. Tirmidhi No. 3490",
            hadithDetails: { collection: "Tirmidzi", hadithNumber: 3490 }
        }
    },
    {
        id: "dua_memaafkan",
        occasion: "social",
        category: "spiritualCategoryAkhlak",
        title: "Doa Kekuatan untuk Memaafkan",
        titleEn: "Du'a for the Strength to Forgive",
        arabic: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
        latin: "Allahumma innaka 'afuwwun tuhibbul-'afwa fa'fu 'annii.",
        translation: "Ya Allah, sesungguhnya Engkau Maha Pemaaf, menyukai pemberian maaf, maka maafkanlah aku.",
        translationEn: "O Allah, You are the Most Forgiving, and You love forgiveness, so forgive me.",
        virtue: "Doa ini mengajarkan bahwa dengan memohon dimaafkan oleh Allah, kita juga belajar untuk memaafkan orang lain. Kunci resolusi konflik.",
        virtueEn: "This dua teaches that by asking Allah for forgiveness, we also learn to forgive others. The key to conflict resolution.",
        recommendedCount: 3,
        source: {
            type: "hadith",
            referenceText: "HR. Tirmidzi No. 3513 & Ibn Majah No. 3850",
            referenceTextEn: "HR. Tirmidhi No. 3513 & Ibn Majah No. 3850",
            hadithDetails: { collection: "Tirmidzi", hadithNumber: 3513 }
        }
    },
    {
        id: "dua_jaga_lisan",
        occasion: "social",
        category: "spiritualCategoryAkhlak",
        title: "Doa Menjaga Lisan di Media Sosial",
        titleEn: "Du'a for Guarding Speech (Social Media)",
        arabic: "اللَّهُمَّ اهْدِنِي لِأَحْسَنِ الأَخْلاقِ لا يَهْدِي لأَحْسَنِهَا إِلا أَنْتَ وَاصْرِفْ عَنِّي سَيِّئَهَا",
        latin: "Allaahummahdini li-ahsanil-akhlaaq, laa yahdii li-ahsanihaa illaa anta, washrifh 'annii sayyi-ahaa.",
        translation: "Ya Allah, tunjukkan aku kepada akhlak terbaik, tidak ada yang dapat menunjukkan kepada yang terbaik kecuali Engkau, dan jauhkanlah dariku akhlak yang buruk.",
        translationEn: "O Allah, guide me to the best of character, for none guides to the best of it except You, and turn away from me the worst of it.",
        virtue: "Di era media sosial, menjaga lisan (dan jari) sangat penting. Doa ini memohon bimbingan Allah agar setiap kata yang kita tulis atau ucapkan bernilai baik.",
        virtueEn: "In the social media age, guarding speech (and fingers) is crucial. This dua asks Allah's guidance so every word we write or speak carries good value.",
        recommendedCount: 1,
        source: {
            type: "hadith",
            referenceText: "HR. Muslim No. 771",
            referenceTextEn: "HR. Muslim No. 771",
            hadithDetails: { collection: "Muslim", hadithNumber: 771 }
        }
    },
    {
        id: "dua_sedekah",
        occasion: "social",
        category: "spiritualCategoryAkhlak",
        title: "Doa Sebelum Bersedekah",
        titleEn: "Du'a Before Giving Charity",
        arabic: "اللَّهُمَّ اجْعَلْهَا مَقْبُولَةً عِنْدَكَ نَافِعَةً لِصَاحِبِهَا",
        latin: "Allaahumaj-'alhaa maqbuulatan 'indaka naafi'atan li-shaahibihaa.",
        translation: "Ya Allah, jadikanlah (sedekah) ini diterima di sisi-Mu dan bermanfaat bagi penerimanya.",
        translationEn: "O Allah, make this (charity) accepted by You and beneficial for its recipient.",
        virtue: "Sedekah online atau langsung tetap bernilai besar. Doa ini memastikan niat sedekah kita tulus dan pahalanya diterima.",
        virtueEn: "Online or direct charity is equally valuable. This dua ensures our charitable intention is pure and its reward accepted.",
        recommendedCount: 1,
        source: {
            type: "hadith",
            referenceText: "Doa umum para salaf sebelum bersedekah (Hisnul Muslim)",
            referenceTextEn: "Salaf supplication before giving charity (Hisn al-Muslim)",
        }
    },
    {
        id: "dua_amanah_kerja",
        occasion: "social",
        category: "spiritualCategoryAkhlak",
        title: "Doa Amanah dalam Bekerja & Belajar",
        titleEn: "Du'a for Trustworthiness at Work & Study",
        arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْغِشِّ وَالْخِيَانَةِ",
        latin: "Allaahumma innii a'uudzubika minal ghisysyi wal khiyaanah.",
        translation: "Ya Allah, aku berlindung kepada-Mu dari sifat menipu dan berkhianat.",
        translationEn: "O Allah, I seek refuge in You from deception and treachery.",
        virtue: "Menjaga integritas dalam mengerjakan tugas, ujian, atau pekerjaan. Anti-contekan dan anti-KKN. Bagi Gen Z yang sedang membangun reputasi diri.",
        virtueEn: "Maintaining integrity in assignments, exams, or work. Anti-cheating and anti-corruption. For Gen Z building their personal reputation.",
        recommendedCount: 1,
        source: {
            type: "hadith",
            referenceText: "HR. Abu Dawud No. 3527 (Makna dari hadits tentang larangan ghisy)",
            referenceTextEn: "HR. Abu Dawud No. 3527 (Hadith prohibiting deception)",
            hadithDetails: { collection: "Abu Dawud", hadithNumber: 3527 }
        }
    },
    {
        id: "dua_jauhi_ghibah",
        occasion: "social",
        category: "spiritualCategoryAkhlak",
        title: "Doa Terhindar dari Gosip & Ghibah",
        titleEn: "Du'a to Avoid Backbiting & Gossip",
        arabic: "اللَّهُمَّ طَهِّرْ قَلْبِي مِنَ النِّفَاقِ وَعَمَلِي مِنَ الرِّيَاءِ وَلِسَانِي مِنَ الْكَذِبِ",
        latin: "Allaahumma thahhir qalbii minan-nifaaq, wa 'amalii minar-riyaa', wa lisaanii minal-kidzb.",
        translation: "Ya Allah, bersihkanlah hatiku dari nifak, amalku dari riya, dan lisanku dari kebohongan.",
        translationEn: "O Allah, purify my heart from hypocrisy, my deeds from showing off, and my tongue from lies.",
        virtue: "Ghibah dan gosip adalah kanker sosial yang merusak ukhuwah. Doa ini memohon pembersihan hati dan lisan dari tiga penyakit tersembunyi.",
        virtueEn: "Backbiting and gossip are social cancers that destroy brotherhood. This dua asks for purification of heart and tongue from these three hidden diseases.",
        recommendedCount: 1,
        source: {
            type: "hadith",
            referenceText: "Doa salaf (diriwayatkan dengan berbagai sanad)",
            referenceTextEn: "Salaf supplication (narrated across various chains)",
        }
    },
    {
        id: "dua_pengaruh_buruk",
        occasion: "social",
        category: "spiritualCategoryPerlindungan",
        title: "Doa Terhindar dari Pengaruh Buruk",
        titleEn: "Du'a Against Bad Influences",
        arabic: "اللَّهُمَّ أَلِّفْ بَيْنَ قُلُوبِنَا وَأَصْلِحْ ذَاتَ بَيْنِنَا وَاهْدِنَا سُبُلَ السَّلَامِ",
        latin: "Allaahumma allif baina quluubinaa wa ashlih dzaata bainanaa wahdinaa subulas-salaam.",
        translation: "Ya Allah, satukanlah hati-hati kami, perbaikilah hubungan di antara kami, dan tunjukkanlah kepada kami jalan-jalan keselamatan.",
        translationEn: "O Allah, unite our hearts, improve the relations between us, and guide us to the paths of peace.",
        virtue: "Di lingkungan pertemanan yang beragam, doa ini memohon agar kita terhindar dari pengaruh buruk dan tetap terjaga di jalan yang lurus.",
        virtueEn: "In diverse friendship circles, this dua asks that we be protected from bad influences and remain on the straight path.",
        recommendedCount: 1,
        source: {
            type: "hadith",
            referenceText: "HR. Abu Dawud No. 969",
            referenceTextEn: "HR. Abu Dawud No. 969",
            hadithDetails: { collection: "Abu Dawud", hadithNumber: 969 }
        }
    },
    {
        id: "dua_bersyukur_nikmat_kecil",
        occasion: "social",
        category: "spiritualCategorySyukur",
        title: "Doa Syukur atas Nikmat Kecil",
        titleEn: "Du'a of Gratitude for Small Blessings",
        arabic: "الْحَمْدُ لِلَّهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ",
        latin: "Alhamdulillaahilladzi bini'matihii tatimmush-shaalihaat.",
        translation: "Segala puji bagi Allah yang dengan nikmat-Nya segala kebaikan menjadi sempurna.",
        translationEn: "All praise is for Allah by whose blessing all good deeds are completed.",
        virtue: "Di era FOMO dan perbandingan sosial, mensyukuri hal-hal kecil — makan enak, internet lancar, teman baik — adalah senjata melawan kecemasan dan ketidakpuasan.",
        virtueEn: "In the era of FOMO and social comparison, being grateful for small things — a good meal, fast internet, kind friends — is a weapon against anxiety and dissatisfaction.",
        recommendedCount: 1,
        source: {
            type: "hadith",
            referenceText: "HR. Ibn Majah No. 3803 & Hakim",
            referenceTextEn: "HR. Ibn Majah No. 3803 & Al-Hakim",
            hadithDetails: { collection: "Ibn Majah", hadithNumber: 3803 }
        }
    },
];
