import { IntentionData } from './types';

// ─────────────────────────────────────────────────────────────
// NIAT DATA
// ─────────────────────────────────────────────────────────────

export const RAMADHAN_FASTING_INTENTION: IntentionData = {
    id: 'niat_puasa_ramadhan',
    title: 'Niat Puasa Ramadhan',
    title_en: 'Intention for Ramadhan Fasting',
    arabic: 'نَوَيْتُ صَوْمَ غَدٍ عَنْ أَدَاءِ فَرْضِ شَهْرِ رَمَضَانَ هَذِهِ السَّنَةِ لِلَّهِ تَعَالَى',
    latin: 'Nawaitu shauma ghadin \'an adā\'i fardhi syahri Ramadhāna hādzihis sanati lillāhi ta\'ālā.',
    translation: 'Aku berniat puasa esok hari untuk menunaikan kewajiban puasa bulan Ramadhan tahun ini karena Allah Ta\'ala.',
    translation_en: 'I intend to fast tomorrow to fulfill the obligatory fast of the month of Ramadhan this year for Allah the Most High.',
    source: 'Niat puasa Ramadhan wajib dilakukan pada malam hari sebelum fajar (HR. Abu Dawud No. 2454)',
    source_en: 'Ramadhan fasting intention must be made at night before fajr (HR. Abu Dawud No. 2454)',
};

export const TARAWEH_INTENTION: IntentionData = {
    id: 'niat_taraweh',
    title: 'Niat Sholat Taraweh',
    title_en: 'Intention for Tarawih Prayer',
    arabic: 'أُصَلِّي سُنَّةَ التَّرَاوِيحِ رَكْعَتَيْنِ مُسْتَقْبِلَ الْقِبْلَةِ مَأْمُومًا / إِمَامًا لِلَّهِ تَعَالَى',
    latin: 'Ushalli sunnatan tarāwīhi rak\'ataini mustaqbilal qiblati ma\'mūman / imāman lillāhi ta\'ālā.',
    translation: 'Aku niat sholat sunnah taraweh dua rakaat menghadap kiblat sebagai makmum / imam karena Allah Ta\'ala.',
    translation_en: 'I intend to perform the sunnah tarawih prayer of two rak\'ahs facing the Qiblah as a follower / imam for Allah the Most High.',
    source: 'Sholat Taraweh adalah sunnah muakkadah di bulan Ramadhan',
    source_en: 'Tarawih prayer is a confirmed sunnah during Ramadhan',
};

export const QURAN_RECITATION_INTENTION: IntentionData = {
    id: 'niat_tadarus',
    title: 'Niat Tadarus Al-Quran',
    title_en: 'Intention for Quran Recitation',
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ، نَوَيْتُ قِرَاءَةَ الْقُرْآنِ الْكَرِيمِ تَقَرُّبًا إِلَى اللَّهِ تَعَالَى',
    latin: 'Bismillāhir rahmānir rahīm. Nawaitu qirā\'atal qur\'ānil karīmi taqarruban ilallāhi ta\'ālā.',
    translation: 'Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang. Aku niat membaca Al-Quran Al-Karim untuk mendekatkan diri kepada Allah Ta\'ala.',
    translation_en: 'In the name of Allah, the Most Gracious, the Most Merciful. I intend to recite the Noble Quran to draw closer to Allah the Most High.',
    source: 'Membaca Al-Quran adalah ibadah yang sangat dianjurkan, terutama di bulan Ramadhan',
    source_en: 'Reciting the Quran is a highly recommended act of worship, especially during Ramadhan',
};

export const ITIKAF_INTENTION: IntentionData = {
    id: 'niat_itikaf',
    title: "Niat I'tikaf",
    title_en: "Intention for I'tikaf",
    arabic: 'نَوَيْتُ الاِعْتِكَافَ فِي هَذَا الْمَسْجِدِ لِلَّهِ تَعَالَى',
    latin: 'Nawaitul i\'tikāfa fī hādzal masjidi lillāhi ta\'ālā.',
    translation: "Aku niat beri'tikaf di masjid ini karena Allah Ta'ala.",
    translation_en: "I intend to perform i'tikaf in this mosque for Allah the Most High.",
    source: "I'tikaf di 10 malam terakhir Ramadhan adalah sunnah Nabi SAW (HR. Bukhari No. 2026)",
    source_en: "I'tikaf in the last 10 nights of Ramadhan is the sunnah of Prophet Muhammad SAW (HR. Bukhari No. 2026)",
};


// DOA BUKA PUASA — Multiple authentic options
// ─────────────────────────────────────────────────────────────

export const IFTAR_PRAYER: IntentionData = {
    id: 'doa_iftar',
    title: 'Doa Berbuka Puasa (Pilihan 1)',
    title_en: 'Breaking Fast Prayer (Option 1)',
    arabic: 'اللَّهُمَّ لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ',
    latin: 'Allāhumma laka shumtu wa bika āmantu wa \'alā rizqika afthartu.',
    translation: 'Ya Allah, karena-Mu aku berpuasa, kepada-Mu aku beriman, dan dengan rezeki-Mu aku berbuka.',
    translation_en: 'O Allah, for You I have fasted, in You I have believed, and with Your provision I break my fast.',
    source: 'HR. Abu Dawud No. 2357',
    source_en: 'HR. Abu Dawud No. 2357',
};

export const IFTAR_PRAYER_2: IntentionData = {
    id: 'doa_iftar_2',
    title: 'Doa Berbuka Puasa (Pilihan 2)',
    title_en: 'Breaking Fast Prayer (Option 2 - Recommended)',
    arabic: 'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ',
    latin: 'Dzahabazh zhamā\', wabtallatil \'urūq, wa tsabatal ajru insyā Allāh.',
    translation: 'Telah hilang dahaga, telah basah kerongkongan, dan telah ditetapkan pahala, insya Allah.',
    translation_en: 'Thirst has gone, the veins are moist, and the reward is confirmed, God willing.',
    source: 'HR. Abu Dawud No. 2357, Ad-Daruquthni 2/185 — doa yang dibaca Nabi SAW (Sahih — Paling Dianjurkan)',
    source_en: 'HR. Abu Dawud No. 2357, Ad-Daruquthni 2/185 — prayer recited by Prophet Muhammad SAW (Sahih — Most Recommended)',
};

export const IFTAR_PRAYER_3: IntentionData = {
    id: 'doa_iftar_3',
    title: 'Doa Berbuka Puasa (Pilihan 3)',
    title_en: 'Breaking Fast Prayer (Option 3)',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ بِرَحْمَتِكَ الَّتِي وَسِعَتْ كُلَّ شَيْءٍ أَنْ تَغْفِرَ لِي',
    latin: 'Allāhumma innī as\'aluka birahmatikallati wasi\'at kulla syai\'in an taghfira lī.',
    translation: 'Ya Allah, sesungguhnya aku memohon kepada-Mu dengan rahmat-Mu yang meliputi segala sesuatu, agar Engkau mengampuni aku.',
    translation_en: 'O Allah, I ask You by Your mercy which encompasses all things, to forgive me.',
    source: 'HR. Ibnu Majah No. 1753 — doa berbuka yang makbul',
    source_en: 'HR. Ibnu Majah No. 1753 — accepted breaking fast prayer',
};

export const SUHOOR_PRAYER: IntentionData = {
    id: 'doa_sahur',
    title: 'Doa Makan Sahur',
    title_en: 'Suhoor Meal Prayer',
    arabic: 'اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ',
    latin: 'Allāhumma bārik lanā fīmā razaqtanā wa qinā \'adzāban nār.',
    translation: 'Ya Allah, berkahilah kami dalam rezeki yang Engkau berikan kepada kami, dan jauhkan kami dari azab neraka.',
    translation_en: 'O Allah, bless us in the provision You have given us and protect us from the punishment of the Fire.',
    source: 'Doa makan yang dianjurkan',
    source_en: 'Recommended meal prayer',
};

