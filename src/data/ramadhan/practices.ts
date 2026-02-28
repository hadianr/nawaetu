import { EvidenceData, RamadhanPracticeData, IntentionData, SunnahFood } from './types';
import {
    RAMADHAN_FASTING_INTENTION, TARAWEH_INTENTION, QURAN_RECITATION_INTENTION
} from './intentions';

// DALIL DATA
// ─────────────────────────────────────────────────────────────

export const FASTING_EVIDENCE: EvidenceData = {
    id: 'dalil_fasting',
    shortRef: 'QS. Al-Baqarah: 183',
    shortRef_en: 'Quran 2:183',
    arabic: 'يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ كُتِبَ عَلَيْكُمُ ٱلصِّيَامُ كَمَا كُتِبَ عَلَى ٱلَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ',
    latin: 'Yā ayyuhal ladzīna āmanū kutiba \'alaikumush shiyāmu kamā kutiba \'alal ladzīna min qablikum la\'allakum tattaqūn.',
    translation: 'Wahai orang-orang yang beriman! Diwajibkan atas kamu berpuasa sebagaimana diwajibkan atas orang sebelum kamu agar kamu bertakwa.',
    translation_en: 'O you who have believed, fasting is prescribed for you as a it was prescribed for those before you that you may become righteous.',
    source: 'Al-Quran Surat Al-Baqarah Ayat 183',
    source_en: 'Quran, Surah Al-Baqarah, Verse 183',
};

export const FASTING_SCHEDULE_EVIDENCE: EvidenceData = {
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

export const TARAWEH_EVIDENCE: EvidenceData = {
    id: 'dalil_tarawih',
    shortRef: 'HR. Bukhari 2008',
    arabic: 'مَنْ قَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ',
    latin: 'Man qāma Ramadhāna īmānan wahtisāban ghufira lahū mā taqaddama min dzanbih.',
    translation: 'Barangsiapa yang mendirikan sholat malam di bulan Ramadhan dengan penuh keimanan dan mengharap pahala, maka diampuni dosa-dosanya yang telah lalu.',
    source: 'HR. Bukhari No. 2008, Muslim No. 759 — dari Abu Hurairah radhiyallahu \'anhu',
};

export const QURAN_RECITATION_EVIDENCE: EvidenceData = {
    id: 'dalil_quran_recitation',
    shortRef: 'HR. Tirmidzi 2910',
    arabic: 'اقْرَؤُوا الْقُرْآنَ فَإِنَّهُ يَأْتِي يَوْمَ الْقِيَامَةِ شَفِيعًا لِأَصْحَابِهِ',
    latin: 'Iqra\'ul qur\'āna fa\'innahū ya\'tī yaumal qiyāmati syafī\'an li\'ashhābih.',
    translation: 'Bacalah Al-Quran, karena sesungguhnya ia akan datang pada hari kiamat sebagai pemberi syafaat bagi para pembacanya.',
    source: 'HR. Muslim No. 804 — dari Abu Umamah Al-Bahili radhiyallahu \'anhu',
};

export const LAILATUL_QADR_EVIDENCE: EvidenceData = {
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

export const RAMADHAN_CHARITY_EVIDENCE: EvidenceData = {
    id: 'dalil_ramadan_charity',
    shortRef: 'HR. Tirmidzi 663',
    arabic: 'أَفْضَلُ الصَّدَقَةِ صَدَقَةٌ فِي رَمَضَانَ',
    latin: 'Afdhalush shadaqati shadaqatun fī Ramadhān.',
    translation: 'Sedekah yang paling utama adalah sedekah di bulan Ramadhan.',
    source: 'HR. Tirmidzi No. 663 — dari Anas bin Malik radhiyallahu \'anhu',
};

export const SUHOOR_EVIDENCE: EvidenceData = {
    id: 'dalil_suhoor',
    shortRef: 'HR. Bukhari 1923',
    arabic: 'تَسَحَّرُوا فَإِنَّ فِي السَّحُورِ بَرَكَةً',
    latin: 'Tasahharū fa\'inna fis sahūri barakah.',
    translation: 'Bersahurlah kalian, karena sesungguhnya pada sahur itu terdapat keberkahan.',
    translation_en: 'Eat suhoor, for in suhoor there is blessing.',
    source: 'HR. Bukhari No. 1923, Muslim No. 1095 — dari Anas bin Malik radhiyallahu \'anhu',
    source_en: 'Reported by Bukhari No. 1923, Muslim No. 1095 — narrated by Anas bin Malik RA'
};

export const IFTAR_EVIDENCE: EvidenceData = {
    id: 'dalil_iftar',
    shortRef: 'HR. Abu Dawud 2357',
    arabic: 'لِلصَّائِمِ فَرْحَتَانِ يَفْرَحُهُمَا: إِذَا أَفْطَرَ فَرِحَ بِفِطْرِهِ، وَإِذَا لَقِيَ رَبَّهُ فَرِحَ بِصَوْمِهِ',
    latin: 'Lish shā\'imi farhatāni yafrahhumā: idzā aftara fariha bifithrih, wa idzā laqiya rabbahū fariha bishaumih.',
    translation: 'Orang yang berpuasa memiliki dua kegembiraan: ketika berbuka ia gembira dengan bukanya, dan ketika bertemu Tuhannya ia gembira dengan puasanya.',
    translation_en: 'The fasting person has two joys: when he breaks his fast he is joyful with his breaking of the fast, and when he meets his Lord he is joyful with his fasting.',
    source: 'HR. Bukhari No. 1904, Muslim No. 1151 — dari Abu Hurairah radhiyallahu \'anhu',
    source_en: 'Reported by Bukhari No. 1904, Muslim No. 1151 — narrated by Abu Hurairah RA'
};


// SUNNAH FOODS (SAHUR & BUKA)
// ─────────────────────────────────────────────────────────────


export const DATES_IFTAR_EVIDENCE: EvidenceData = {
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

export const WATER_IFTAR_EVIDENCE: EvidenceData = {
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

export const DATES_SUHOOR_EVIDENCE: EvidenceData = {
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

export const MILK_HONEY_EVIDENCE: EvidenceData = {
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

export const WATER_SUHOOR_EVIDENCE: EvidenceData = {
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
        dalil: DATES_IFTAR_EVIDENCE
    },
    {
        id: 'iftar_tamr',
        name: 'Kurma Kering (Tamr)',
        name_en: 'Dried Dates (Tamr)',
        icon: '🟤',
        description: 'Alternatif utama jika tidak ada Ruthab. Disunnahkan memakannya dalam jumlah ganjil (1, 3, atau 5).',
        description_en: 'Primary alternative to fresh dates. Recommended to eat an odd number (1, 3, or 5).',
        dalil: DATES_IFTAR_EVIDENCE
    },
    {
        id: 'iftar_water',
        name: 'Air Putih',
        name_en: 'Plain Water',
        icon: '💧',
        description: 'Pelepas dahaga yang paling murni dan sehat jika tidak menemukan kurma sama sekali.',
        description_en: 'The purest thirst quencher if dates are completely unavailable.',
        dalil: WATER_IFTAR_EVIDENCE
    },
    {
        id: 'iftar_milk',
        name: 'Susu',
        name_en: 'Milk',
        icon: '🥛',
        description: 'Minuman yang mengenyangkan sekaligus menghilangkan dahaga, sering dikonsumsi Nabi SAW.',
        description_en: 'A filling drink that quenches thirst, often consumed by the Prophet SAW.',
        dalil: MILK_HONEY_EVIDENCE
    }
];

export const SUNNAH_FOODS_SUHOOR: SunnahFood[] = [
    {
        id: 'sahur_tamr',
        name: 'Kurma (Tamr)',
        name_en: 'Dates',
        icon: '🟤',
        description: 'Sebaik-baik makanan sahur. Memberikan serat dan energi lambat (slow-release) agar kenyang lebih lama.',
        description_en: 'The best suhoor food. Provides fiber and slow-release energy to stay full longer.',
        dalil: DATES_SUHOOR_EVIDENCE
    },
    {
        id: 'sahur_water',
        name: 'Air Putih',
        name_en: 'Water',
        icon: '💧',
        description: 'Penting untuk hidrasi. Nabi SAW tetap sahur meskipun hanya dengan seteguk air untuk mengejar berkah.',
        description_en: 'Essential for hydration. The Prophet (ﷺ) kept suhoor even with only a sip of water for the sake of blessing.',
        dalil: WATER_SUHOOR_EVIDENCE
    },
    {
        id: 'sahur_honey',
        name: 'Madu murni',
        name_en: 'Pure Honey',
        icon: '🍯',
        description: 'Sumber penyembuh dan energi instan. Baik dicampur dengan air hangat saat sahur.',
        description_en: 'A source of healing and instant energy. Great when mixed with warm water for suhoor.',
        dalil: MILK_HONEY_EVIDENCE
    },
    {
        id: 'sahur_milk',
        name: 'Susu',
        name_en: 'Milk',
        icon: '🥛',
        description: 'Memberikan rasa kenyang lebih lama dan kalsium yang baik untuk energi saat berpuasa.',
        description_en: 'Provides long-lasting satiety and calcium for energy during fasting.',
        dalil: MILK_HONEY_EVIDENCE
    }
];


// TIGA PERIODE RAMADHAN (10 hari pertama, kedua, ketiga)
// ─────────────────────────────────────────────────────────────

// Tentang rahmat di bulan Ramadhan
export const FIRST_10_DAYS_MERCY_EVIDENCE: EvidenceData = {
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
export const MIDDLE_10_DAYS_FORGIVENESS_EVIDENCE: EvidenceData = {
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
export const LAST_10_DAYS_FREEDOM_EVIDENCE: EvidenceData = {
    id: 'dalil_10_days_freedom',
    shortRef: 'HR. Tirmidzi 682',
    arabic: 'إِنَّ لِلَّهِ عُتَقَاءَ فِي كُلِّ يَوْمٍ وَلَيْلَةٍ لِكُلِّ عَبْدٍ مِنْهُمْ دَعْوَةٌ مُسْتَجَابَةٌ',
    latin: 'Inna lillāhi \'utuqā\'a fī kulli yaumin wa lailatin likulli \'abdin minhum da\'watun mustajābah.',
    translation: 'Sesungguhnya Allah membebaskan beberapa hamba dari api neraka pada setiap siang dan malam (di bulan Ramadhan), dan setiap hamba dari mereka memiliki doa yang dikabulkan.',
    translation_en: 'Indeed, Allah has people whom He frees from Hell every day and night (during Ramadhan), and every servant of them has a supplication that is answered.',
    source: 'HR. Tirmidzi No. 682, Ibnu Majah No. 1643 — dari Abu Hurairah RA tentang pembebasan dari neraka di Ramadhan',
    source_en: 'Reported by Tirmidzi No. 682, Ibn Majah No. 1643 — narrated by Abu Hurairah RA'
};


// LAILATUL QADR — 10 malam terakhir dengan penekanan pada malam ganjil
// ─────────────────────────────────────────────────────────────

// Semua 10 malam terakhir Ramadhan
export const LAST_TEN_NIGHTS = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30] as const;

// Malam-malam ganjil (lebih kuat peluangnya untuk Lailatul Qadr)
export const ODD_NIGHTS = [21, 23, 25, 27, 29] as const;

// Backward compatibility
export const LAILATUL_QADR_NIGHTS = ODD_NIGHTS;

// Dalil tentang 10 malam terakhir
export const LAST_10_NIGHTS_EVIDENCE: EvidenceData = {
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
export const ODD_NIGHTS_EVIDENCE: EvidenceData = {
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
export const ITIKAF_10_NIGHTS_EVIDENCE: EvidenceData = {
    id: 'dalil_itikaf_10_nights',
    shortRef: 'HR. Bukhari 2026',
    arabic: 'كَانَ رَسُولُ اللَّهِ صلى الله عليه وسلم يَعْتَكِفُ الْعَشْرَ الأَوَاخِرَ مِنْ رَمَضَانَ حَتَّى تَوَفَّاهُ اللَّهُ',
    latin: 'Kāna Rasūlullāh shallallāhu \'alaihi wasallam ya\'takiful \'asyral awākhira min Ramadhāna hattā tawaffāhullāh.',
    translation: 'Rasulullah SAW beri\'tikaf di sepuluh malam terakhir bulan Ramadhan hingga Allah mewafatkan beliau.',
    translation_en: 'The Messenger of Allah (ﷺ) used to practice I\'tikaf during the last ten nights of Ramadhan until he passed away.',
    source: 'HR. Bukhari No. 2026, Muslim No. 1172 — dari Aisyah RA tentang kebiasaan Nabi',
    source_en: 'Reported by Bukhari No. 2026, Muslim No. 1172 — narrated by Aisha RA'
};

export const LAILATUL_QADR_PRAYER: IntentionData = {
    id: 'dua_lailatul_qadr',
    title: "Doa Malam Lailatul Qadr",
    title_en: "Lailatul Qadr Night Prayer",
    arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
    latin: 'Allāhumma innaka \'afuwwun tuhibbul \'afwa fa\'\'fu \'annī.',
    translation: 'Ya Allah, sesungguhnya Engkau Maha Pemaaf dan menyukai pemaafan, maka maafkanlah aku.',
    translation_en: 'O Allah, You are the Most Forgiving and You love forgiveness, so forgive me.',
    source: 'HR. Tirmidzi No. 3513, Ibnu Majah No. 3850 — doa yang diajarkan Nabi SAW kepada Aisyah RA',
    source_en: 'HR. Tirmidzi No. 3513, Ibnu Majah No. 3850 — prayer taught by Prophet Muhammad SAW to Aisha RA',
};


// AMALAN RAMADHAN (enriched with niat & dalil)
// ─────────────────────────────────────────────────────────────

export const RAMADHAN_PRACTICES: RamadhanPracticeData[] = [
    {
        id: 'ramadan_fasting',
        title: 'Puasa Ramadhan',
        title_en: 'Ramadhan Fasting',
        description: 'Menahan makan, minum, dan hal yang membatalkan dari fajar hingga maghrib',
        description_en: 'Abstaining from food, drink, and things that invalidate fasting from dawn to dusk',
        icon: '🌙',
        intention: RAMADHAN_FASTING_INTENTION,
        dalil: FASTING_EVIDENCE,
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
        id: 'tarawih_prayer',
        title: 'Sholat Taraweh',
        title_en: 'Tarawih Prayer',
        description: 'Sholat sunnah malam Ramadhan, 8 atau 20 rakaat',
        description_en: 'Sunnah night prayer during Ramadhan, 8 or 20 units (rak\'ahs)',
        icon: '🕌',
        intention: TARAWEH_INTENTION,
        dalil: TARAWEH_EVIDENCE,
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
        id: 'quran_recitation',
        title: 'Tadarus Al-Quran',
        title_en: 'Quran Recitation',
        description: 'Membaca dan mempelajari Al-Quran, target khatam 30 juz',
        description_en: 'Reciting and studying the Quran, aiming to finish all 30 parts (juz)',
        icon: '📖',
        intention: QURAN_RECITATION_INTENTION,
        dalil: QURAN_RECITATION_EVIDENCE,
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
        id: 'ramadan_charity',
        title: 'Perbanyak Sedekah',
        title_en: 'Abundant Charity',
        description: 'Sedekah di bulan Ramadhan pahalanya berlipat ganda',
        description_en: 'Giving charity in Ramadhan yields manifold rewards',
        icon: '💝',
        dalil: RAMADHAN_CHARITY_EVIDENCE,
        tips: [
            'Niatkan setiap malam sebelum tidur',
            'Dapatkan ampunan dengan sedekah',
            'Dapatkan pahala melimpah',
        ],
        tips_en: [
            'The Prophet (ﷺ) was the most generous of people, especially in Ramadhan',
            'Can be as simple as providing iftar for others',
            'Morning charity (Sadaqah Subuh) is highly recommended',
        ],
    },
];


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

