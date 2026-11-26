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

/**
 * Hadiths on haid, nifas and istihadah, used by udzur mode (src/lib/udzur.ts). Arabic and translations of
 * entries with a hadeethEncId are copied unchanged from HadeethEnc.com (checked 26 November 2026), which must
 * be credited and kept up to date. Titles, explanations and search terms are Nawaetu's own.
 */

import type { HadithItem } from "./types";

export const UDZUR_HADITHS: HadithItem[] = [
    {
        id: "hadith_haid_qadha_puasa",
        collection: "Bukhari",
        hadithNumber: "321 / 335",
        narrator: "Aisyah RA",
        authenticity: "Muttafaq 'Alaih",
        category: "spiritualCategoryWorship",
        title: "Puasa Diqadha, Sholat Tidak",
        titleEn: "Make Up the Fasts, Not the Prayers",
        arabic: "عَنْ مُعَاذَةَ قَالَتْ: سَأَلْتُ عَائِشَةَ، فَقُلْتُ: مَا بَالُ الْحَائِضِ تَقْضِي الصَّوْمَ، وَلَا تَقْضِي الصَّلَاةَ؟ فَقَالَتْ: أَحَرُورِيَّةٌ أَنْتِ؟ قُلْتُ: لَسْتُ بِحَرُورِيَّةٍ، وَلَكِنِّي أَسْأَلُ. قَالَتْ: كَانَ يُصِيبُنَا ذَلِكَ، فَنُؤْمَرُ بِقَضَاءِ الصَّوْمِ، وَلَا نُؤْمَرُ بِقَضَاءِ الصَّلَاةِ.",
        translation: "Mu'āżah berkata, Aku bertanya kepada Aisyah, \"Mengapa wanita haid harus mengqada puasa dan tidak mengqada salat?\" Aisyah bertanya, \"Apakah engkau wanita Ḥarūriyyah (Khawarij)?\" Aku menjawab, \"Aku bukan wanita Ḥarūriyyah. Tetapi, aku hanya bertanya.\" Ia berkata, \"Dulu kami juga mengalaminya. Kami diperintahkan untuk mengqada puasa dan tidak diperintahkan untuk mengqada salat.\"",
        translationEn: "Mu‘ādhah reported: I asked ‘Ā’ishah: Why does the menstruating woman make up for her missed fasts but does not make up for the missed prayers? She said: Are you a Harūriyyah woman? I said: I am not a Harūriyyah woman, but I am just asking. She said: That would happen to us, so we were ordered to make up for the fasts, but were not ordered to make up for the prayers.",
        explanation: "Sholat yang ditinggalkan saat haid atau nifas tidak perlu diganti, sedangkan puasa Ramadhan yang ditinggalkan wajib diqadha. Aisyah RA menjawab dengan perintah yang mereka terima, bukan dengan logika: ketaatan cukup menjadi alasannya. Karena itu Nawaetu menandai sholat saat udzur sebagai gugur, bukan sebagai hutang.",
        explanationEn: "Prayers left during haid or nifas are not made up, while missed Ramadan fasts must be. Aisyah answered with the command they were given rather than an argument: obedience is reason enough. This is why Nawaetu marks those prayers as excused, not as owed.",
        searchTerms: ["haid", "menstruasi", "datang bulan", "lagi dapet", "period", "qadha", "ganti puasa", "hutang puasa", "make up fast", "nifas", "udzur", "berhalangan"],
        topics: ["women", "worship"],
        hadeethEncId: 3449
    },
    {
        id: "hadith_haid_quran_pangkuan",
        collection: "Bukhari",
        hadithNumber: "297 / 301",
        narrator: "Aisyah RA",
        authenticity: "Muttafaq 'Alaih",
        category: "spiritualCategoryWorship",
        title: "Tetap Dekat dengan Al-Quran Saat Haid",
        titleEn: "Close to the Quran During Your Period",
        arabic: "عن عَائِشَة رضي الله عنها قالت: «كان رسول الله صلى الله عليه وسلم يَتَكِّئُ فِي حِجرِي، فَيَقرَأُ القرآن وأنا حَائِض».",
        translation: "Dari Aisyah -raḍiyallāhu 'anhumā- ia berkata, \"Rasulullah -ṣallallāhu 'alaihi wa sallam- bersandar di pangkuanku, lalu beliau membaca Al-Qur'ān, padahal aku dalam keadaan haid.\"",
        translationEn: "‘Ā'ishah (may Allah be pleased with her) reported: The Messenger of Allah (may Allah's peace and blessings be upon him) used to recline in my lap and recite the Qur'an during my menstruation.",
        explanation: "Nabi Muhammad SAW membaca Al-Quran sambil bersandar di pangkuan Aisyah RA yang sedang haid. Haid tidak membuat seorang wanita jauh dari Allah atau dari Al-Quran. Mendengarkan murottal, membaca terjemahan dan tafsir tetap terbuka. Soal membaca langsung dan menyentuh mushaf, ulama berbeda pendapat.",
        explanationEn: "Prophet Muhammad SAW recited the Quran while resting in the lap of Aisyah during her period. A period does not distance a woman from Allah or from the Quran. Listening to recitation and reading the translation and tafsir stay open to her; on reciting it herself and touching the mushaf, scholars differ.",
        searchTerms: ["haid", "menstruasi", "period", "murottal", "dengar quran", "listen quran", "mushaf", "baca quran saat haid", "berhalangan", "udzur"],
        topics: ["women", "worship"],
        hadeethEncId: 3478
    },
    {
        id: "hadith_istihadah_fatimah",
        collection: "Bukhari",
        hadithNumber: "325 / 333",
        narrator: "Aisyah RA",
        authenticity: "Muttafaq 'Alaih",
        category: "spiritualCategoryWorship",
        title: "Istihadah Bukan Haid",
        titleEn: "Extra Bleeding Is Not a Period",
        arabic: "عَنْ عَائِشَةَ أُمِّ المؤمنين رضي الله عنها أَنَّ فَاطِمَةَ بِنْتَ أَبِي حُبَيْشٍ سَأَلَتِ النَّبِيَّ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ قَالَتْ: إِنِّي أُسْتَحَاضُ فَلاَ أَطْهُرُ، أَفَأَدَعُ الصَّلاَةَ؟ فَقَالَ: «لَا، إِنَّ ذَلِكِ عِرْقٌ، وَلَكِنْ دَعِي الصَّلاَةَ قَدْرَ الأَيَّامِ الَّتِي كُنْتِ تَحِيضِينَ فِيهَا، ثُمَّ اغْتَسِلِي وَصَلِّي».",
        translation: "Ummul Mukminin Aisyah -raḍiyallāhu 'anhā- meriwayatkan bahwa Fāṭimah bin Abu Ḥubaisy bertanya kepada Nabi ﷺ, ia berkata, \"Aku mengalami istihada, sehingga aku tidak pernah bersih. Apakah aku meninggalkan salat?\" Beliau bersabda, \"Tidak, karena sesungguhnya itu darah kotor. Tetapi, tinggalkanlah salat seukuran hari yang engkau biasa mengalami haid, kemudian mandi dan salatlah.\"",
        translationEn: "‘Ā’ishah, the Mother of the Believers, (may Allah be pleased with her) reported that Fātimah bint Abi Hubaysh asked the Prophet (may Allah's peace and blessings be upon him) saying: I have a continuous flow of vaginal bleeding; so, I never attain purity (from menses). Should I abstain from prayer? He replied: \"No, this is a vein. Abstain from prayer only for a number of days similar to those of your normal menses; then, take a ritual bath and pray.\"",
        explanation: "Darah istihadah, yang keluar di luar kebiasaan haid, tidak menggugurkan sholat. Wanita tersebut meninggalkan sholat hanya sebanyak hari haidnya yang biasa, lalu mandi dan kembali sholat. Jika darah keluar jauh lebih lama dari biasanya, tanyakan kepada ustadzah yang kamu percaya.",
        explanationEn: "Istihadah, bleeding outside the usual period, does not excuse prayer. She leaves prayer only for the days of her usual period, then takes the ritual bath and prays. If bleeding lasts much longer than usual, ask a scholar you trust.",
        searchTerms: ["istihadah", "istihadhah", "darah penyakit", "flek", "pendarahan", "bleeding", "haid lama", "period too long", "mandi wajib", "ghusl"],
        topics: ["women", "worship"],
        hadeethEncId: 3029
    },
    {
        id: "hadith_istihadah_ummu_habibah",
        collection: "Muslim",
        hadithNumber: 334,
        narrator: "Aisyah RA",
        authenticity: "Sahih",
        category: "spiritualCategoryWorship",
        title: "Kembali ke Kebiasaan Haidmu",
        titleEn: "Go by Your Usual Period",
        arabic: "عَنْ عَائِشَةَ أُمِّ المُؤْمِنينَ رَضي الله عنها أَنَّهَا قَالَتْ: إِنَّ أُمَّ حَبِيبَةَ بِنْتَ جَحْشٍ الَّتِي كَانَتْ تَحْتَ عَبْدِ الرَّحْمَنِ بْنِ عَوْفٍ شَكَتْ إِلَى رَسُولِ اللهِ صلى الله عليه وسلم الدَّمَ، فَقَالَ لَهَا: «امْكُثِي قَدْرَ مَا كَانَتْ تَحْبِسُكِ حَيْضَتُكِ، ثُمَّ اغْتَسِلِي». فَكَانَتْ تَغْتَسِلُ عِنْدَ كُلِّ صَلَاةٍ.",
        translation: "Aisyah ummul mukminīn -raḍiyallāhu 'anhā- meriwayatkan, ia berkata, Ummu Ḥabībah binti Jaḥsyin istri Abdurrahman bin 'Auf datang menanyakan perihal darah kepada Rasulullah ﷺ, lalu beliau bersabda kepadanya, \"Tunggulah selama waktu biasanya engkau ditahan oleh haidmu, kemudian mandilah.\" Ia pun melakukan mandi setiap waktu salat.",
        translationEn: "‘Ā’ishah, Mother of the Believers, (may Allah be pleased with her) reported: ’Umm Habībah bint Jahsh, who was the wife of ‘Abdur-Rahmān ibn ‘Awf, complained to the Messenger of Allah (may Allah's peace and blessings be upon him) about blood. He told her: \"Wait for as long as your menstrual period normally stops you, and then take a ritual bath.\" So, she used to take a ritual bath for every prayer.",
        explanation: "Nabi Muhammad SAW meminta Ummu Habibah berpegang pada lama haidnya yang biasa, lalu mandi. Kebiasaan setiap wanita berbeda, dan kebiasaan itulah patokannya. Itulah sebabnya Nawaetu menanyakan apakah kamu sudah suci, alih-alih mengakhiri mode udzur sendiri.",
        explanationEn: "Prophet Muhammad SAW told Umm Habibah to go by the length of her usual period, then bathe. Every woman's habit differs, and her habit is the measure. That is why Nawaetu asks whether your period has ended instead of ending udzur mode on its own.",
        searchTerms: ["kebiasaan haid", "siklus", "cycle", "lama haid", "istihadah", "mandi wajib", "ghusl", "period length"],
        topics: ["women", "worship"],
        hadeethEncId: 10015
    },
    {
        id: "hadith_haid_kudrah",
        collection: "Abu Dawud",
        hadithNumber: 307,
        narrator: "Ummu 'Athiyyah RA",
        authenticity: "Sahih",
        category: "spiritualCategoryWorship",
        title: "Cairan Setelah Suci",
        titleEn: "Discharge After Becoming Pure",
        arabic: "عن أُمِّ عَطِيَّةَ رَضي الله عنها، وكَانَتْ بايَعَت النبيَّ صلى الله عليه وسلم، قالت: كُنَّا لا نَعُدّ الكُدرَةَ والصُّفْرَةَ بعدَ الطُّهرِ شيئًا.",
        translation: "Ummu 'Aṭiyyah -raḍiyallāhu 'anhā- meriwayatkan, ia termasuk yang telah berbaiat kepada Nabi ﷺ, ia berkata, \"Dahulu kami tidak menganggap cairan keruh dan kekuning-kuningan (yang keluar) ‎setelah masa suci sebagai haid.\"",
        translationEn: "’Umm ‘Atiyyah (may Allah be pleased with her), the one who pledged allegiance to the Prophet (may Allah's peace and blessings be upon him), reported: After becoming pure (from menstruation), we would not consider brownish and yellowish discharges to be of any significance.",
        explanation: "Cairan keruh atau kekuningan yang keluar setelah tanda suci terlihat tidak dihitung sebagai haid. Setelah mandi wajib, sholat dan puasa kembali seperti biasa; cukup berwudhu.",
        explanationEn: "Brownish or yellowish discharge after the signs of purity is not counted as a period. After the ritual bath, prayer and fasting resume as normal; ablution is enough.",
        searchTerms: ["flek", "keputihan", "cairan kuning", "coklat", "brown discharge", "yellow discharge", "sudah suci", "selesai haid", "period ended", "mandi wajib"],
        topics: ["women", "worship"],
        hadeethEncId: 10014
    },
    {
        id: "hadith_qadha_syaban",
        collection: "Bukhari",
        hadithNumber: "1950 / 1146",
        narrator: "Aisyah RA",
        authenticity: "Muttafaq 'Alaih",
        category: "spiritualCategoryWorship",
        title: "Qadha Boleh Sampai Sya'ban",
        titleEn: "Make-Up Fasts Can Wait Until Sha'ban",
        arabic: "كَانَ يَكُونُ عَلَيَّ الصَّوْمُ مِنْ رَمَضَانَ، فَمَا أَسْتَطِيعُ أَنْ أَقْضِيَ إِلَّا فِي شَعْبَانَ",
        translation: "Dahulu aku memiliki hutang puasa Ramadhan, dan aku tidak bisa mengqadhanya kecuali di bulan Sya'ban.",
        translationEn: "I would owe fasts from Ramadan, and I could not make them up except in Sha'ban.",
        explanation: "Qadha puasa Ramadhan boleh ditunda selama belum masuk Ramadhan berikutnya, seperti yang dilakukan Aisyah RA. Meski begitu, menyegerakannya lebih baik, dan Senin-Kamis atau Ayyamul Bidh bisa dipakai untuk qadha.",
        explanationEn: "Making up Ramadan fasts may wait until before the next Ramadan, as Aisyah did. Doing it sooner is better, and Mondays, Thursdays or the white days can be used for it.",
        searchTerms: ["qadha", "hutang puasa", "ganti puasa", "make up fast", "syaban", "sya'ban", "sebelum ramadhan", "haid", "nifas"],
        topics: ["women", "worship"]
    },
];
