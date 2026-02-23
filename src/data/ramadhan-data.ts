/**
 * Ramadhan Hub Data
 * Niat, dalil, and amalan content for the Ramadhan Hub feature
 * All content based on Al-Quran and authenticated Hadits
 */

export interface NiatData {
    id: string;
    title: string;
    title_en?: string;      // English title (optional for bilingual support)
    arabic: string;
    latin: string;
    translation: string;
    translation_en?: string; // English translation (optional for bilingual support)
    source?: string;
    source_en?: string;      // English source description (optional)
}

export interface DalilData {
    id: string;
    shortRef: string;        // e.g. "QS. Al-Baqarah: 187"
    shortRef_en?: string;    // English short reference (optional)
    arabic?: string;
    latin?: string;
    translation: string;
    translation_en?: string;  // English translation (optional for bilingual support)
    source: string;          // Full source description
    source_en?: string;      // English source description (optional)
}

export interface RamadhanAmalanData {
    id: string;
    title: string;
    title_en?: string;
    description: string;
    description_en?: string;
    icon: string;
    niat?: NiatData;
    dalil: DalilData;
    tips?: string[];
    tips_en?: string[];
}

// ─────────────────────────────────────────────────────────────
// NIAT DATA
// ─────────────────────────────────────────────────────────────

export const NIAT_PUASA_RAMADHAN: NiatData = {
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

export const NIAT_TARAWEH: NiatData = {
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

export const NIAT_TADARUS: NiatData = {
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

export const NIAT_ITIKAF: NiatData = {
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

// ─────────────────────────────────────────────────────────────
// DALIL DATA
// ─────────────────────────────────────────────────────────────

export const DALIL_PUASA: DalilData = {
    id: 'dalil_puasa',
    shortRef: 'QS. Al-Baqarah: 183',
    shortRef_en: 'Quran 2:183',
    arabic: 'يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ كُتِبَ عَلَيْكُمُ ٱلصِّيَامُ كَمَا كُتِبَ عَلَى ٱلَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ',
    latin: 'Yā ayyuhal ladzīna āmanū kutiba \'alaikumush shiyāmu kamā kutiba \'alal ladzīna min qablikum la\'allakum tattaqūn.',
    translation: 'Wahai orang-orang yang beriman! Diwajibkan atas kamu berpuasa sebagaimana diwajibkan atas orang sebelum kamu agar kamu bertakwa.',
    translation_en: 'O you who have believed, fasting is prescribed for you as it was prescribed for those before you that you may become righteous.',
    source: 'Al-Quran Surat Al-Baqarah Ayat 183',
    source_en: 'Quran, Surah Al-Baqarah, Verse 183',
};

export const DALIL_FASTING_SCHEDULE: DalilData = {
    id: 'dalil_fasting_schedule',
    shortRef: 'QS. Al-Baqarah: 187',
    shortRef_en: 'Quran 2:187',
    arabic: 'وَكُلُوا۟ وَٱشْرَبُوا۟ حَتَّىٰ يَتَبَيَّنَ لَكُمُ ٱلْخَيْطُ ٱلْأَبْيَضُ مِنَ ٱلْخَيْطِ ٱلْأَسْوَدِ مِنَ ٱلْفَجْرِ',
    latin: 'Wa kulū wasyrabū hattā yatabayyana lakumul khaithul abyadhu minal khaithil aswadi minal fajr.',
    translation: 'Dan makan minumlah hingga terang bagimu benang putih dari benang hitam, yaitu fajar.',
    translation_en: 'And eat and drink until the white thread of dawn appears to you distinct from the black thread.',
    source: 'Al-Quran Surat Al-Baqarah Ayat 187 — dasar waktu imsak dan buka puasa',
    source_en: 'Quran, Surah Al-Baqarah, Verse 187 — the basis for imsak and breaking fast times',
};

export const DALIL_TARAWEH: DalilData = {
    id: 'dalil_taraweh',
    shortRef: 'HR. Bukhari 2008',
    arabic: 'مَنْ قَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ',
    latin: 'Man qāma Ramadhāna īmānan wahtisāban ghufira lahū mā taqaddama min dzanbih.',
    translation: 'Barangsiapa yang mendirikan sholat malam di bulan Ramadhan dengan penuh keimanan dan mengharap pahala, maka diampuni dosa-dosanya yang telah lalu.',
    source: 'HR. Bukhari No. 2008, Muslim No. 759 — dari Abu Hurairah radhiyallahu \'anhu',
};

export const DALIL_TADARUS: DalilData = {
    id: 'dalil_tadarus',
    shortRef: 'HR. Tirmidzi 2910',
    arabic: 'اقْرَؤُوا الْقُرْآنَ فَإِنَّهُ يَأْتِي يَوْمَ الْقِيَامَةِ شَفِيعًا لِأَصْحَابِهِ',
    latin: 'Iqra\'ul qur\'āna fa\'innahū ya\'tī yaumal qiyāmati syafī\'an li\'ashhābih.',
    translation: 'Bacalah Al-Quran, karena sesungguhnya ia akan datang pada hari kiamat sebagai pemberi syafaat bagi para pembacanya.',
    source: 'HR. Muslim No. 804 — dari Abu Umamah Al-Bahili radhiyallahu \'anhu',
};

export const DALIL_LAILATUL_QADR: DalilData = {
    id: 'dalil_lailatul_qadr',
    shortRef: 'QS. Al-Qadr: 1-3',
    shortRef_en: 'Quran 97:1-3',
    arabic: 'إِنَّآ أَنزَلْنَٰهُ فِى لَيْلَةِ ٱلْقَدْرِ ۝ وَمَآ أَدْرَىٰكَ مَا لَيْلَةُ ٱلْقَدْرِ ۝ لَيْلَةُ ٱلْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ',
    latin: 'Innā anzalnāhu fī lailatil qadr. Wa mā adrāka mā lailatul qadr. Lailatul qadri khairum min alfi syahr.',
    translation: 'Sesungguhnya Kami telah menurunkannya (Al-Quran) pada malam qadar. Dan tahukah kamu apakah malam kemuliaan itu? Malam kemuliaan itu lebih baik dari seribu bulan.',
    translation_en: 'Indeed, We sent it down during the Night of Decree. And what can make you know what is the Night of Decree? The Night of Decree is better than a thousand months.',
    source: 'Al-Quran Surat Al-Qadr Ayat 1-3',
    source_en: 'Quran, Surah Al-Qadr, Verses 1-3',
};

export const DALIL_SEDEKAH_RAMADHAN: DalilData = {
    id: 'dalil_sedekah_ramadhan',
    shortRef: 'HR. Tirmidzi 663',
    arabic: 'أَفْضَلُ الصَّدَقَةِ صَدَقَةٌ فِي رَمَضَانَ',
    latin: 'Afdhalush shadaqati shadaqatun fī Ramadhān.',
    translation: 'Sedekah yang paling utama adalah sedekah di bulan Ramadhan.',
    source: 'HR. Tirmidzi No. 663 — dari Anas bin Malik radhiyallahu \'anhu',
};

export const DALIL_SAHUR: DalilData = {
    id: 'dalil_sahur',
    shortRef: 'HR. Bukhari 1923',
    arabic: 'تَسَحَّرُوا فَإِنَّ فِي السَّحُورِ بَرَكَةً',
    latin: 'Tasahharū fa\'inna fis sahūri barakah.',
    translation: 'Bersahurlah kalian, karena sesungguhnya pada sahur itu terdapat keberkahan.',
    translation_en: 'Eat suhoor, for in suhoor there is blessing.',
    source: 'HR. Bukhari No. 1923, Muslim No. 1095 — dari Anas bin Malik radhiyallahu \'anhu',
    source_en: 'Reported by Bukhari No. 1923, Muslim No. 1095 — narrated by Anas bin Malik RA'
};

export const DALIL_IFTAR: DalilData = {
    id: 'dalil_iftar',
    shortRef: 'HR. Abu Dawud 2357',
    arabic: 'لِلصَّائِمِ فَرْحَتَانِ يَفْرَحُهُمَا: إِذَا أَفْطَرَ فَرِحَ بِفِطْرِهِ، وَإِذَا لَقِيَ رَبَّهُ فَرِحَ بِصَوْمِهِ',
    latin: 'Lish shā\'imi farhatāni yafrahhumā: idzā aftara fariha bifithrih, wa idzā laqiya rabbahū fariha bishaumih.',
    translation: 'Orang yang berpuasa memiliki dua kegembiraan: ketika berbuka ia gembira dengan bukanya, dan ketika bertemu Tuhannya ia gembira dengan puasanya.',
    translation_en: 'The fasting person has two joys: when he breaks his fast he is joyful with his breaking of the fast, and when he meets his Lord he is joyful with his fasting.',
    source: 'HR. Bukhari No. 1904, Muslim No. 1151 — dari Abu Hurairah radhiyallahu \'anhu',
    source_en: 'Reported by Bukhari No. 1904, Muslim No. 1151 — narrated by Abu Hurairah RA'
};

// ─────────────────────────────────────────────────────────────
// DOA BUKA PUASA — Multiple authentic options
// ─────────────────────────────────────────────────────────────

export const DOA_IFTAR: NiatData = {
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

export const DOA_IFTAR_2: NiatData = {
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

export const DOA_IFTAR_3: NiatData = {
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

export const DOA_SAHUR: NiatData = {
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

// ─────────────────────────────────────────────────────────────
// SUNNAH FOODS (SAHUR & BUKA)
// ─────────────────────────────────────────────────────────────

export interface SunnahFood {
    id: string;
    name: string;
    name_en?: string;
    icon: string;
    description: string;
    description_en?: string;
    dalil: DalilData;
}

export const DALIL_DATES_IFTAR: DalilData = {
    id: 'dalil_dates_iftar',
    shortRef: 'HR. Abu Dawud 2356',
    shortRef_en: 'Abu Dawud 2356',
    arabic: 'كَانَ رَسُولُ اللَّهِ صلى الله عليه وسلم يُفْطِرُ عَلَى رُطَبَاتٍ قَبْلَ أَنْ يُصَلِّيَ',
    latin: 'Kāna Rasūlullāh shallallāhu \'alaihi wasallam yufthiru \'alā ruthabātin qabla an yushalliya.',
    translation: 'Rasulullah SAW biasanya berbuka puasa dengan kurma basah (ruthab) sebelum menunaikan shalat.',
    translation_en: 'The Messenger of Allah (ﷺ) used to break his fast with fresh dates before praying.',
    source: 'HR. Abu Dawud No. 2356 — Hadits Hasan, dari Anas bin Malik RA',
    source_en: 'Reported by Abu Dawud No. 2356 — Hasan Hadith, narrated by Anas bin Malik RA'
};

export const DALIL_WATER_IFTAR: DalilData = {
    id: 'dalil_water_iftar',
    shortRef: 'HR. Abu Dawud 2356',
    shortRef_en: 'Abu Dawud 2356',
    arabic: 'فَإِنْ لَمْ تَكُنْ رُطَبَاتٌ فَعَلَى تَمَرَاتٍ فَإِنْ لَمْ تَكُنْ حَسَا حَسَوَاتٍ مِنْ مَاءٍ',
    latin: 'Fa in lam takun ruthabātun fa\'alā tamāratin, fa in lam takun hasā hasawātin min mā\'.',
    translation: 'Jika tidak ada kurma basah, beliau berbuka dengan kurma kering. Jika tidak ada kurma kering, beliau berbuka dengan beberapa teguk air.',
    translation_en: 'If there were no fresh dates, he would break his fast with dry dates; and if there were no dry dates, he would take a few sips of water.',
    source: 'HR. Abu Dawud No. 2356 — Hadits Hasan, pelengkap hadits kurma',
    source_en: 'Reported by Abu Dawud No. 2356 — Hasan Hadith, supplement to dates hadith'
};

export const DALIL_DATES_SAHUR: DalilData = {
    id: 'dalil_dates_sahur',
    shortRef: 'HR. Abu Dawud 2345',
    shortRef_en: 'Abu Dawud 2345',
    arabic: 'نِعْمَ سَحُورُ الْمُؤْمِنِ التَّمْرُ',
    latin: 'Ni\'ma sahūrul mu\'minit tamru.',
    translation: 'Sebaik-baik hidangan sahur seorang mukmin adalah kurma.',
    translation_en: 'How excellent are dates for the believer\'s suhoor.',
    source: 'HR. Abu Dawud No. 2345 — Hadits Shahih, dari Abu Hurairah RA',
    source_en: 'Reported by Abu Dawud No. 2345 — Sahih Hadith, narrated by Abu Hurairah RA'
};

export const DALIL_MILK_HONEY: DalilData = {
    id: 'dalil_milk_honey',
    shortRef: 'HR. Tirmidzi 3455',
    shortRef_en: 'Tirmidzi 3455',
    arabic: 'الشِّفَاءُ فِي ثَلَاثَةٍ: شَرْبَةِ عَسَلٍ...',
    latin: 'Asy-syifā\'u fī tsalātsatin: syarbati \'asalin...',
    translation: 'Kesembuhan itu ada pada tiga hal: meminum madu...',
    translation_en: 'Healing is in three things: a gulp of honey...',
    source: 'HR. Bukhari No. 5680. Susu & madu sangat dianjurkan Nabi SAW untuk memulihkan tenaga (Sunnah ammah).',
    source_en: 'Reported by Bukhari No. 5680. Milk & honey are highly recommended by the Prophet (ﷺ) for strength (General Sunnah).'
};

export const DALIL_WATER_SAHUR: DalilData = {
    id: 'dalil_water_sahur',
    shortRef: 'HR. Ahmad 11086',
    shortRef_en: 'Ahmad 11086',
    arabic: 'السَّحُورُ بَرَكَةٌ فَلا تَدَعُوهُ وَلَوْ أَنْ يَجْرَعَ أَحَدُكُمْ جُرْعَةً مِنْ مَاءٍ',
    latin: 'As-sahūru barakatun falā tada\'ūhu walau an yajra\'a ahadukum jur\'atan min mā\'.',
    translation: 'Sahur itu berkah, maka janganlah kalian meninggalkannya walau hanya dengan seteguk air.',
    translation_en: 'Suhoor is a blessed meal, so do not abandon it even if you take only a sip of water.',
    source: 'HR. Ahmad No. 11086 — Hadits Hasan',
    source_en: 'Reported by Ahmad No. 11086 — Hasan Hadith'
};

export const SUNNAH_FOODS_IFTAR: SunnahFood[] = [
    {
        id: 'iftar_ruthab',
        name: 'Kurma Basah (Ruthab)',
        name_en: 'Fresh Dates (Ruthab)',
        icon: '🌴',
        description: 'Sunnah utama Nabi SAW. Sangat cepat mengembalikan kadar gula darah yang turun setelah berpuasa.',
        description_en: 'The primary Sunnah. Rapidly restores blood sugar levels after fasting.',
        dalil: DALIL_DATES_IFTAR
    },
    {
        id: 'iftar_tamr',
        name: 'Kurma Kering (Tamr)',
        name_en: 'Dried Dates (Tamr)',
        icon: '🟤',
        description: 'Alternatif utama jika tidak ada Ruthab. Disunnahkan memakannya dalam jumlah ganjil (1, 3, atau 5).',
        description_en: 'Primary alternative to fresh dates. Recommended to eat an odd number (1, 3, or 5).',
        dalil: DALIL_DATES_IFTAR
    },
    {
        id: 'iftar_water',
        name: 'Air Putih',
        name_en: 'Plain Water',
        icon: '💧',
        description: 'Pelepas dahaga yang paling murni dan sehat jika tidak menemukan kurma sama sekali.',
        description_en: 'The purest thirst quencher if dates are completely unavailable.',
        dalil: DALIL_WATER_IFTAR
    },
    {
        id: 'iftar_milk',
        name: 'Susu',
        name_en: 'Milk',
        icon: '🥛',
        description: 'Minuman yang mengenyangkan sekaligus menghilangkan dahaga, sering dikonsumsi Nabi SAW.',
        description_en: 'A filling drink that quenches thirst, often consumed by the Prophet SAW.',
        dalil: DALIL_MILK_HONEY
    }
];

export const SUNNAH_FOODS_SAHUR: SunnahFood[] = [
    {
        id: 'sahur_tamr',
        name: 'Kurma (Tamr)',
        name_en: 'Dates',
        icon: '🟤',
        description: 'Sebaik-baik makanan sahur. Memberikan serat dan energi lambat (slow-release) agar kenyang lebih lama.',
        description_en: 'The best suhoor food. Provides fiber and slow-release energy to stay full longer.',
        dalil: DALIL_DATES_SAHUR
    },
    {
        id: 'sahur_water',
        name: 'Air Putih',
        name_en: 'Water',
        icon: '💧',
        description: 'Penting untuk hidrasi. Nabi SAW tetap sahur meskipun hanya dengan seteguk air untuk mengejar berkah.',
        description_en: 'Essential for hydration. The Prophet (ﷺ) kept suhoor even with only a sip of water for the sake of blessing.',
        dalil: DALIL_WATER_SAHUR
    },
    {
        id: 'sahur_honey',
        name: 'Madu murni',
        name_en: 'Pure Honey',
        icon: '🍯',
        description: 'Sumber penyembuh dan energi instan. Baik dicampur dengan air hangat saat sahur.',
        description_en: 'A source of healing and instant energy. Great when mixed with warm water for suhoor.',
        dalil: DALIL_MILK_HONEY
    },
    {
        id: 'sahur_milk',
        name: 'Susu',
        name_en: 'Milk',
        icon: '🥛',
        description: 'Memberikan rasa kenyang lebih lama dan kalsium yang baik untuk energi saat berpuasa.',
        description_en: 'Provides long-lasting satiety and calcium for energy during fasting.',
        dalil: DALIL_MILK_HONEY
    }
];

// ─────────────────────────────────────────────────────────────
// TIGA PERIODE RAMADHAN (10 hari pertama, kedua, ketiga)
// ─────────────────────────────────────────────────────────────

// Tentang rahmat di bulan Ramadhan
export const DALIL_10_DAYS_MERCY: DalilData = {
    id: 'dalil_10_days_mercy',
    shortRef: 'HR. Thabrani',
    arabic: 'شَهْرُ رَمَضَانَ أَوَّلُهُ رَحْمَةٌ وَأَوْسَطُهُ مَغْفِرَةٌ وَآخِرُهُ عِتْقٌ مِنَ النَّارِ',
    latin: 'Syahru Ramadhāna awwaluhū rahmatun wa ausathuhū maghfiratun wa ākhiruhū \'itqun minan nār.',
    translation: 'Bulan Ramadhan, awalnya adalah rahmat, pertengahannya adalah ampunan, dan akhirnya adalah pembebasan dari api neraka.',
    translation_en: 'The month of Ramadhan: its beginning is mercy, its middle is forgiveness, and its end is freedom from the Fire.',
    source: 'HR. Thabrani, Ibnu Khuzaimah — Keutamaan 10 hari Ramadhan',
    source_en: 'Reported by Thabrani, Ibn Khuzaimah — The virtues of the 10 days of Ramadhan'
};

// Tentang ampunan di pertengahan Ramadhan
export const DALIL_10_DAYS_FORGIVENESS: DalilData = {
    id: 'dalil_10_days_forgiveness',
    shortRef: 'HR. Ibnu Majah 1644',
    arabic: 'مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ',
    latin: 'Man shāma Ramadhāna īmānan wahtisāban ghufira lahū mā taqaddama min dzanbih.',
    translation: 'Barangsiapa yang berpuasa di bulan Ramadhan dengan penuh keimanan dan mengharap pahala, maka diampuni dosa-dosanya yang telah lalu.',
    translation_en: 'Whoever fasts during Ramadhan out of sincere faith and hoping to attain Allah\'s rewards, then all his past sins will be forgiven.',
    source: 'HR. Bukhari No. 38, Muslim No. 760, Ibnu Majah No. 1644 — dari Abu Hurairah RA tentang keutamaan puasa Ramadhan',
    source_en: 'Reported by Bukhari No. 38, Muslim No. 760, Ibn Majah No. 1644 — narrated by Abu Hurairah RA'
};

// Tentang pembebasan dari neraka di akhir Ramadhan
export const DALIL_10_DAYS_FREEDOM: DalilData = {
    id: 'dalil_10_days_freedom',
    shortRef: 'HR. Tirmidzi 682',
    arabic: 'إِنَّ لِلَّهِ عُتَقَاءَ فِي كُلِّ يَوْمٍ وَلَيْلَةٍ لِكُلِّ عَبْدٍ مِنْهُمْ دَعْوَةٌ مُسْتَجَابَةٌ',
    latin: 'Inna lillāhi \'utuqā\'a fī kulli yaumin wa lailatin likulli \'abdin minhum da\'watun mustajābah.',
    translation: 'Sesungguhnya Allah membebaskan beberapa hamba dari api neraka pada setiap siang dan malam (di bulan Ramadhan), dan setiap hamba dari mereka memiliki doa yang dikabulkan.',
    translation_en: 'Indeed, Allah has people whom He frees from Hell every day and night (during Ramadhan), and every servant of them has a supplication that is answered.',
    source: 'HR. Tirmidzi No. 682, Ibnu Majah No. 1643 — dari Abu Hurairah RA tentang pembebasan dari neraka di Ramadhan',
    source_en: 'Reported by Tirmidzi No. 682, Ibn Majah No. 1643 — narrated by Abu Hurairah RA'
};

// ─────────────────────────────────────────────────────────────
// LAILATUL QADR — 10 malam terakhir dengan penekanan pada malam ganjil
// ─────────────────────────────────────────────────────────────

// Semua 10 malam terakhir Ramadhan
export const LAST_TEN_NIGHTS = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30] as const;

// Malam-malam ganjil (lebih kuat peluangnya untuk Lailatul Qadr)
export const ODD_NIGHTS = [21, 23, 25, 27, 29] as const;

// Backward compatibility
export const LAILATUL_QADR_NIGHTS = ODD_NIGHTS;

// Dalil tentang 10 malam terakhir
export const DALIL_LAST_10_NIGHTS: DalilData = {
    id: 'dalil_last_10_nights',
    shortRef: 'HR. Bukhari No. 2020',
    shortRef_en: 'HR. Bukhari No. 2020',
    arabic: 'تَحَرَّوْا لَيْلَةَ الْقَدْرِ فِي الْعَشْرِ الأَوَاخِرِ مِنْ رَمَضَانَ',
    latin: 'Taharrau lailatal qadri fil \'asyril awākhiri min Ramadhān.',
    translation: 'Carilah Lailatul Qadr pada sepuluh malam terakhir bulan Ramadhan.',
    translation_en: 'Seek Lailatul Qadr in the last ten nights of Ramadhan.',
    source: 'HR. Bukhari No. 2020, Muslim No. 1169 — sabda Rasulullah SAW',
    source_en: 'HR. Bukhari No. 2020, Muslim No. 1169 — words of Prophet Muhammad SAW',
};

// Dalil tentang keutamaan malam ganjil
export const DALIL_ODD_NIGHTS: DalilData = {
    id: 'dalil_odd_nights',
    shortRef: 'HR. Bukhari No. 2017',
    shortRef_en: 'HR. Bukhari No. 2017',
    arabic: 'فَمَنْ كَانَ مُتَحَرِّيهَا فَلْيَتَحَرَّهَا فِي الْوِتْرِ مِنَ الْعَشْرِ الأَوَاخِرَ',
    latin: 'Fa man kāna mutaharrīhā falyataharraha fil witri minal \'asyril awākhir.',
    translation: 'Barangsiapa yang sedang mencarinya, maka hendaklah ia mencarinya pada malam-malam ganjil dari sepuluh malam terakhir.',
    translation_en: 'Whoever is seeking it, let him seek it in the odd nights of the last ten nights.',
    source: 'HR. Bukhari No. 2017 — dari Aisyah RA tentang pencarian Lailatul Qadr',
    source_en: 'HR. Bukhari No. 2017 — from Aisha RA about seeking Lailatul Qadr',
};

// Dalil tentang I\'tikaf di 10 malam terakhir
export const DALIL_ITIKAF_10_NIGHTS: DalilData = {
    id: 'dalil_itikaf_10_nights',
    shortRef: 'HR. Bukhari 2026',
    arabic: 'كَانَ رَسُولُ اللَّهِ صلى الله عليه وسلم يَعْتَكِفُ الْعَشْرَ الأَوَاخِرَ مِنْ رَمَضَانَ حَتَّى تَوَفَّاهُ اللَّهُ',
    latin: 'Kāna Rasūlullāh shallallāhu \'alaihi wasallam ya\'takiful \'asyral awākhira min Ramadhāna hattā tawaffāhullāh.',
    translation: 'Rasulullah SAW beri\'tikaf di sepuluh malam terakhir bulan Ramadhan hingga Allah mewafatkan beliau.',
    translation_en: 'The Messenger of Allah (ﷺ) used to practice I\'tikaf during the last ten nights of Ramadhan until he passed away.',
    source: 'HR. Bukhari No. 2026, Muslim No. 1172 — dari Aisyah RA tentang kebiasaan Nabi',
    source_en: 'Reported by Bukhari No. 2026, Muslim No. 1172 — narrated by Aisha RA'
};

export const DOA_LAILATUL_QADR: NiatData = {
    id: 'doa_lailatul_qadr',
    title: "Doa Malam Lailatul Qadr",
    title_en: "Lailatul Qadr Night Prayer",
    arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
    latin: 'Allāhumma innaka \'afuwwun tuhibbul \'afwa fa\'\'fu \'annī.',
    translation: 'Ya Allah, sesungguhnya Engkau Maha Pemaaf dan menyukai pemaafan, maka maafkanlah aku.',
    translation_en: 'O Allah, You are the Most Forgiving and You love forgiveness, so forgive me.',
    source: 'HR. Tirmidzi No. 3513, Ibnu Majah No. 3850 — doa yang diajarkan Nabi SAW kepada Aisyah RA',
    source_en: 'HR. Tirmidzi No. 3513, Ibnu Majah No. 3850 — prayer taught by Prophet Muhammad SAW to Aisha RA',
};

// ─────────────────────────────────────────────────────────────
// AMALAN RAMADHAN (enriched with niat & dalil)
// ─────────────────────────────────────────────────────────────

export const RAMADHAN_PRACTICES: RamadhanAmalanData[] = [
    {
        id: 'puasa_wajib',
        title: 'Puasa Ramadhan',
        title_en: 'Ramadhan Fasting',
        description: 'Menahan makan, minum, dan hal yang membatalkan dari fajar hingga maghrib',
        description_en: 'Abstaining from food, drink, and things that invalidate fasting from dawn to dusk',
        icon: '🌙',
        niat: NIAT_PUASA_RAMADHAN,
        dalil: DALIL_PUASA,
        tips: [
            'Niatkan setiap malam sebelum tidur',
            'Sahur sebelum imsak untuk keberkahan',
            'Jaga lisan dan perbuatan agar puasa sempurna',
        ],
        tips_en: [
            'Set your intention every night before sleeping',
            'Have suhoor before imsak for blessing',
            'Guard your speech and actions for a perfect fast',
        ],
    },
    {
        id: 'taraweh',
        title: 'Sholat Taraweh',
        title_en: 'Tarawih Prayer',
        description: 'Sholat sunnah malam Ramadhan, 8 atau 20 rakaat',
        description_en: 'Sunnah night prayer during Ramadhan, 8 or 20 units (rak\'ahs)',
        icon: '🕌',
        niat: NIAT_TARAWEH,
        dalil: DALIL_TARAWEH,
        tips: [
            'Bisa 8 rakaat (sunnah Nabi) atau 20 rakaat (sunnah Umar RA)',
            'Lebih utama berjamaah di masjid',
            'Tutup dengan witir 1 atau 3 rakaat',
        ],
        tips_en: [
            'Can be 8 rak\'ahs (Prophetic tradition) or 20 rak\'ahs (Umar RA tradition)',
            'Preferably performed in congregation at the mosque',
            'Complete with 1 or 3 rak\'ahs of Witr prayer',
        ],
    },
    {
        id: 'tadarus',
        title: 'Tadarus Al-Quran',
        title_en: 'Quran Recitation',
        description: 'Membaca dan mempelajari Al-Quran, target khatam 30 juz',
        description_en: 'Reciting and studying the Quran, aiming to finish all 30 parts (juz)',
        icon: '📖',
        niat: NIAT_TADARUS,
        dalil: DALIL_TADARUS,
        tips: [
            'Target 1 juz per hari = khatam dalam 30 hari',
            'Baca dengan tartil dan pahami maknanya',
            'Jibril AS mengkhatamkan Quran bersama Nabi SAW setiap Ramadhan',
        ],
        tips_en: [
            'Target 1 juz per day = finish in 30 days',
            'Recite with measured tone (tartil) and understand the meaning',
            'Angel Gabriel completed the Quran with the Prophet (ﷺ) every Ramadhan',
        ],
    },
    {
        id: 'sedekah',
        title: 'Perbanyak Sedekah',
        title_en: 'Abundant Charity',
        description: 'Sedekah di bulan Ramadhan pahalanya berlipat ganda',
        description_en: 'Giving charity in Ramadhan yields manifold rewards',
        icon: '💝',
        dalil: DALIL_SEDEKAH_RAMADHAN,
        tips: [
            'Nabi SAW adalah orang paling dermawan, terutama di Ramadhan',
            'Bisa berupa makanan buka puasa untuk orang lain',
            'Sedekah subuh sangat dianjurkan',
        ],
        tips_en: [
            'The Prophet (ﷺ) was the most generous of people, especially in Ramadhan',
            'Can be as simple as providing iftar for others',
            'Morning charity (Sadaqah Subuh) is highly recommended',
        ],
    },
];

// ─────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────

/**
 * Get the current Ramadhan day (1-30) from a Hijri date string
 */
export function getRamadhanDay(hijriDay: number): number {
    if (isNaN(hijriDay)) return 1;
    return Math.max(1, Math.min(30, hijriDay));
}

/**
 * Check if tonight is a potential Lailatul Qadr night (odd nights in last 10)
 */
export function isLailatulQadrNight(hijriDay: number): boolean {
    if (isNaN(hijriDay)) return false;
    return hijriDay >= 21 && hijriDay % 2 === 1;
}

/**
 * Get the next odd night (Lailatul Qadr candidate) from current Hijri day
 */
export function getNextLailatulQadrNight(hijriDay: number): number | null {
    if (isNaN(hijriDay)) return 21;
    for (const night of ODD_NIGHTS) {
        if (night > hijriDay) return night;
    }
    return null; // All odd nights have passed
}

/**
 * Get Ramadhan progress percentage (0-100)
 */
export function getRamadhanProgress(hijriDay: number): number {
    if (isNaN(hijriDay)) return 0;
    return Math.round((hijriDay / 30) * 100);
}

/**
 * Format Hijri date key for storage (e.g. "1447-09-01")
 */
export function formatHijriKey(year: number, day: number): string {
    return `${year}-09-${String(day).padStart(2, '0')}`;
}
