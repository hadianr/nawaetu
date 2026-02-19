/**
 * Ramadhan Fiqh & FAQ Data
 * Islamic jurisprudence rules and frequently asked questions about fasting
 * Based on Al-Quran, authentic Hadith, and scholarly consensus
 */

import { DalilData } from "./ramadhan-data";

export type FiqhCategory = 'wajib' | 'sunnah' | 'mubah' | 'makruh' | 'haram';

export interface FiqhItem {
    id: string;
    title: string;
    title_en: string;
    description: string;
    description_en: string;
    category: FiqhCategory;
    dalil?: DalilData;
}

export interface FAQItem {
    id: string;
    question: string;
    question_en: string;
    answer: string;
    answer_en: string;
    dalil?: DalilData;
    tags?: string[]; // for future search functionality
}

// ─────────────────────────────────────────────────────────────
// FIQH DATA - WAJIB (OBLIGATORY)
// ─────────────────────────────────────────────────────────────

export const FIQH_WAJIB: FiqhItem[] = [
    {
        id: 'wajib_niat',
        title: 'Niat Berpuasa',
        title_en: 'Intention to Fast',
        description: 'Niat wajib dilakukan sebelum terbit fajar (subuh) untuk puasa wajib Ramadhan. Niat cukup dalam hati, tidak perlu diucapkan.',
        description_en: 'Intention must be made before dawn (Fajr) for obligatory Ramadhan fasting. Intention in the heart is sufficient, verbal recitation is not required.',
        category: 'wajib',
        dalil: {
            id: 'dalil_niat',
            shortRef: 'HR. Bukhari No. 1',
            shortRef_en: 'Hadith Bukhari No. 1',
            translation: 'Sesungguhnya (pahala) segala amal perbuatan tergantung pada niatnya.',
            translation_en: 'Indeed, the reward of deeds depends on the intentions.',
            source: 'HR. Bukhari No. 1, dari Umar bin Khattab r.a.',
            source_en: 'Hadith narrated by Bukhari No. 1, from Umar bin Khattab r.a.',
        }
    },
    {
        id: 'wajib_menahan',
        title: 'Menahan Diri dari Makan, Minum, dan Jima\'',
        title_en: 'Abstaining from Food, Drink, and Intercourse',
        description: 'Wajib menahan diri dari makan, minum, dan hubungan suami istri mulai dari terbit fajar hingga terbenam matahari.',
        description_en: 'It is obligatory to abstain from eating, drinking, and marital relations from dawn until sunset.',
        category: 'wajib',
        dalil: {
            id: 'dalil_puasa_wajib',
            shortRef: 'QS. Al-Baqarah: 187',
            shortRef_en: 'Quran 2:187',
            translation: 'Makan dan minumlah hingga jelas bagimu (perbedaan) antara benang putih dan benang hitam, yaitu fajar. Kemudian sempurnakanlah puasa sampai malam.',
            translation_en: 'Eat and drink until the white thread of dawn becomes distinct from the black thread. Then complete the fast until night.',
            source: 'QS. Al-Baqarah: 187',
            source_en: 'Quran 2:187',
        }
    },
    {
        id: 'wajib_muslim',
        title: 'Islam (Beragama Islam)',
        title_en: 'Being Muslim',
        description: 'Puasa Ramadhan hanya wajib bagi orang yang beragama Islam.',
        description_en: 'Ramadhan fasting is only obligatory for Muslims.',
        category: 'wajib',
    },
    {
        id: 'wajib_baligh',
        title: 'Baligh (Sudah Dewasa)',
        title_en: 'Having Reached Puberty',
        description: 'Puasa wajib bagi orang yang sudah baligh. Anak yang belum baligh dianjurkan untuk dilatih berpuasa.',
        description_en: 'Fasting is obligatory for those who have reached puberty. Children who have not reached puberty are encouraged to practice fasting.',
        category: 'wajib',
    },
    {
        id: 'wajib_berakal',
        title: 'Berakal Sehat',
        title_en: 'Being of Sound Mind',
        description: 'Puasa wajib bagi orang yang berakal sehat. Orang yang hilang akal (gila) tidak diwajibkan berpuasa.',
        description_en: 'Fasting is obligatory for those who are of sound mind. People who are insane are not required to fast.',
        category: 'wajib',
    },
    {
        id: 'wajib_mampu',
        title: 'Mampu Berpuasa',
        title_en: 'Being Able to Fast',
        description: 'Puasa wajib bagi orang yang mampu melaksanakannya. Orang yang sakit atau dalam perjalanan boleh tidak berpuasa dan mengqadha di hari lain.',
        description_en: 'Fasting is obligatory for those who are able to do so. The sick or travelers may break their fast and make it up later.',
        category: 'wajib',
    },
];

// ─────────────────────────────────────────────────────────────
// FIQH DATA - SUNNAH (RECOMMENDED)
// ─────────────────────────────────────────────────────────────

export const FIQH_SUNNAH: FiqhItem[] = [
    {
        id: 'sunnah_sahur',
        title: 'Makan Sahur',
        title_en: 'Eating Suhoor',
        description: 'Sangat dianjurkan untuk makan sahur, meskipun hanya sedikit. Sahur adalah berkah dan membedakan puasa kaum muslimin dengan ahli kitab.',
        description_en: 'It is highly recommended to eat suhoor, even if just a little. Suhoor is a blessing and distinguishes Muslim fasting from other faiths.',
        category: 'sunnah',
        dalil: {
            id: 'dalil_sahur',
            shortRef: 'HR. Bukhari No. 1923',
            shortRef_en: 'Hadith Bukhari No. 1923',
            translation: 'Makanlah sahur, karena sesungguhnya pada sahur itu terdapat berkah.',
            translation_en: 'Eat suhoor, for indeed there is blessing in suhoor.',
            source: 'HR. Bukhari No. 1923 dan Muslim No. 1095, dari Anas bin Malik r.a.',
            source_en: 'Hadith narrated by Bukhari No. 1923 and Muslim No. 1095, from Anas bin Malik r.a.',
        }
    },
    {
        id: 'sunnah_ta\'jil',
        title: 'Menyegerakan Berbuka',
        title_en: 'Hastening to Break Fast',
        description: 'Disunnahkan untuk segera berbuka puasa ketika waktu maghrib tiba, tidak menunda-nunda.',
        description_en: 'It is sunnah to hasten to break the fast when maghrib time arrives, without delay.',
        category: 'sunnah',
        dalil: {
            id: 'dalil_tajil',
            shortRef: 'HR. Bukhari No. 1957',
            shortRef_en: 'Hadith Bukhari No. 1957',
            translation: 'Manusia senantiasa dalam kebaikan selama mereka menyegerakan berbuka puasa.',
            translation_en: 'People will continue to be in goodness as long as they hasten to break their fast.',
            source: 'HR. Bukhari No. 1957 dan Muslim No. 1098, dari Sahl bin Sa\'d r.a.',
            source_en: 'Hadith narrated by Bukhari No. 1957 and Muslim No. 1098, from Sahl bin Sa\'d r.a.',
        }
    },
    {
        id: 'sunnah_kurma',
        title: 'Berbuka dengan Kurma atau Air',
        title_en: 'Breaking Fast with Dates or Water',
        description: 'Nabi Muhammad SAW berbuka dengan kurma atau air putih. Jika tidak ada kurma, maka dengan air putih.',
        description_en: 'Prophet Muhammad PBUH broke his fast with dates or water. If dates are not available, then with water.',
        category: 'sunnah',
        dalil: {
            id: 'dalil_kurma',
            shortRef: 'HR. Abu Dawud No. 2356',
            shortRef_en: 'Hadith Abu Dawud No. 2356',
            translation: 'Rasulullah SAW berbuka dengan kurma segar sebelum shalat. Jika tidak ada kurma segar, maka dengan kurma kering. Jika tidak ada kurma kering, maka dengan beberapa teguk air.',
            translation_en: 'The Messenger of Allah PBUH used to break his fast with fresh dates before praying. If there were no fresh dates, then with dried dates. If there were no dried dates, then with a few sips of water.',
            source: 'HR. Abu Dawud No. 2356 dan Tirmidzi No. 696, dari Anas bin Malik r.a.',
            source_en: 'Hadith narrated by Abu Dawud No. 2356 and Tirmidzi No. 696, from Anas bin Malik r.a.',
        }
    },
    {
        id: 'sunnah_doa_buka',
        title: 'Membaca Doa Berbuka',
        title_en: 'Reciting Iftar Prayer',
        description: 'Disunnahkan membaca doa ketika berbuka puasa.',
        description_en: 'It is sunnah to recite a prayer when breaking the fast.',
        category: 'sunnah',
        dalil: {
            id: 'dalil_doa_buka',
            shortRef: 'HR. Abu Dawud No. 2357',
            shortRef_en: 'Hadith Abu Dawud No. 2357',
            translation: 'Telah hilang dahaga, telah basah kerongkongan, dan telah pasti pahala, insya Allah.',
            translation_en: 'The thirst is gone, the veins are moistened, and the reward is confirmed, if Allah wills.',
            source: 'HR. Abu Dawud No. 2357, dari Ibnu Umar r.a.',
            source_en: 'Hadith narrated by Abu Dawud No. 2357, from Ibn Umar r.a.',
        }
    },
    {
        id: 'sunnah_menahan_nafsu',
        title: 'Menahan Diri dari Perbuatan Buruk',
        title_en: 'Restraining from Bad Behavior',
        description: 'Puasa bukan hanya menahan lapar dan haus, tetapi juga menahan diri dari perkataan dan perbuatan buruk.',
        description_en: 'Fasting is not just abstaining from hunger and thirst, but also restraining from bad speech and actions.',
        category: 'sunnah',
        dalil: {
            id: 'dalil_menahan_nafsu',
            shortRef: 'HR. Bukhari No. 1903',
            shortRef_en: 'Hadith Bukhari No. 1903',
            translation: 'Barang siapa tidak meninggalkan perkataan dusta dan perbuatan dusta, maka Allah tidak membutuhkan dia meninggalkan makan dan minumnya.',
            translation_en: 'Whoever does not give up false speech and acting upon it, Allah has no need for him to give up his food and drink.',
            source: 'HR. Bukhari No. 1903, dari Abu Hurairah r.a.',
            source_en: 'Hadith narrated by Bukhari No. 1903, from Abu Hurairah r.a.',
        }
    },
    {
        id: 'sunnah_bersiwak',
        title: 'Bersiwak (Membersihkan Mulut)',
        title_en: 'Using Siwak (Cleaning Mouth)',
        description: 'Bersiwak (atau sikat gigi) disunnahkan untuk menjaga kebersihan mulut, boleh dilakukan saat puasa.',
        description_en: 'Using siwak (or toothbrush) is recommended to maintain oral hygiene, permissible while fasting.',
        category: 'sunnah',
    },
    {
        id: 'sunnah_itikaf',
        title: 'I\'tikaf di 10 Hari Terakhir',
        title_en: 'I\'tikaf in Last 10 Days',
        description: 'Nabi Muhammad SAW selalu beri\'tikaf di 10 hari terakhir Ramadhan untuk mencari Lailatul Qadr.',
        description_en: 'Prophet Muhammad PBUH always performed i\'tikaf in the last 10 days of Ramadhan to seek Lailatul Qadr.',
        category: 'sunnah',
    },
];

// ─────────────────────────────────────────────────────────────
// FIQH DATA - MUBAH (PERMISSIBLE)
// ─────────────────────────────────────────────────────────────

export const FIQH_MUBAH: FiqhItem[] = [
    {
        id: 'mubah_berkumur',
        title: 'Berkumur-kumur',
        title_en: 'Rinsing Mouth',
        description: 'Berkumur-kumur saat wudhu atau untuk membersihkan mulut diperbolehkan, asalkan tidak sampai tertelan.',
        description_en: 'Rinsing the mouth during ablution or for cleaning is permissible, as long as nothing is swallowed.',
        category: 'mubah',
    },
    {
        id: 'mubah_mandi',
        title: 'Mandi atau Berendam',
        title_en: 'Bathing or Swimming',
        description: 'Mandi, berendam, atau berenang diperbolehkan selama air tidak sengaja ditelan.',
        description_en: 'Bathing, soaking, or swimming is permissible as long as water is not intentionally swallowed.',
        category: 'mubah',
    },
    {
        id: 'mubah_mencicipi',
        title: 'Mencicipi Makanan (Tidak Ditelan)',
        title_en: 'Tasting Food (Not Swallowed)',
        description: 'Boleh mencicipi makanan untuk keperluan memasak, asalkan tidak sampai tertelan. Sebaiknya diminimalkan.',
        description_en: 'Permissible to taste food for cooking purposes, as long as nothing is swallowed. Should be minimized.',
        category: 'mubah',
    },
    {
        id: 'mubah_bekam',
        title: 'Bekam atau Donor Darah',
        title_en: 'Cupping or Blood Donation',
        description: 'Bekam atau donor darah diperbolehkan, namun sebagian ulama menganjurkan untuk dihindari jika membuat lemah.',
        description_en: 'Cupping or blood donation is permissible, though some scholars advise avoiding it if it causes weakness.',
        category: 'mubah',
    },
    {
        id: 'mubah_parfum',
        title: 'Memakai Parfum atau Minyak Wangi',
        title_en: 'Using Perfume or Fragrance',
        description: 'Memakai parfum, minyak wangi, atau deodoran diperbolehkan.',
        description_en: 'Using perfume, fragrance, or deodorant is permissible.',
        category: 'mubah',
    },
    {
        id: 'mubah_suntik',
        title: 'Suntik Obat (Non-Gizi)',
        title_en: 'Injection (Non-Nutritional)',
        description: 'Suntik obat yang bukan untuk nutrisi (seperti insulin, vaksin) tidak membatalkan puasa menurut mayoritas ulama kontemporer.',
        description_en: 'Injections that are not for nutrition (such as insulin, vaccines) do not invalidate fasting according to most contemporary scholars.',
        category: 'mubah',
    },
];

// ─────────────────────────────────────────────────────────────
// FIQH DATA - MAKRUH (DISLIKED)
// ─────────────────────────────────────────────────────────────

export const FIQH_MAKRUH: FiqhItem[] = [
    {
        id: 'makruh_berlebihan_kumur',
        title: 'Berlebihan dalam Berkumur',
        title_en: 'Excessive Mouth Rinsing',
        description: 'Berkumur secara berlebihan (terlalu kuat atau dalam) dimakruhkan karena khawatir air tertelan.',
        description_en: 'Excessive mouth rinsing (too forceful or deep) is disliked due to risk of swallowing water.',
        category: 'makruh',
    },
    {
        id: 'makruh_mencium',
        title: 'Berciuman dengan Nafsu',
        title_en: 'Kissing with Desire',
        description: 'Berciuman dengan nafsu syahwat dimakruhkan karena dapat memicu hal yang membatalkan puasa.',
        description_en: 'Kissing with desire is disliked as it may lead to acts that invalidate fasting.',
        category: 'makruh',
    },
    {
        id: 'makruh_mencicipi_berlebihan',
        title: 'Terlalu Sering Mencicipi Makanan',
        title_en: 'Frequently Tasting Food',
        description: 'Terlalu sering mencicipi makanan dimakruhkan karena meningkatkan risiko tertelan.',
        description_en: 'Frequently tasting food is disliked as it increases risk of swallowing.',
        category: 'makruh',
    },
    {
        id: 'makruh_gosok_gigi_pasta',
        title: 'Gosok Gigi dengan Pasta Berpenguat Rasa',
        title_en: 'Brushing Teeth with Flavored Toothpaste',
        description: 'Sebagian ulama memakruhkan gosok gigi dengan pasta yang ada rasa kuat setelah dzuhur karena khawatir tertelan. Sebaiknya menggunakan siwak atau sikat tanpa pasta.',
        description_en: 'Some scholars dislike brushing teeth with strong-flavored toothpaste after midday due to risk of swallowing. Better to use siwak or brush without paste.',
        category: 'makruh',
    },
];

// ─────────────────────────────────────────────────────────────
// FIQH DATA - HARAM (FORBIDDEN / INVALIDATES FASTING)
// ─────────────────────────────────────────────────────────────

export const FIQH_HARAM: FiqhItem[] = [
    {
        id: 'haram_makan_minum_sengaja',
        title: 'Makan atau Minum dengan Sengaja',
        title_en: 'Eating or Drinking Intentionally',
        description: 'Makan atau minum dengan sengaja membatalkan puasa dan wajib diqadha serta membayar kafarat.',
        description_en: 'Eating or drinking intentionally invalidates fasting and requires making up the day plus expiation.',
        category: 'haram',
    },
    {
        id: 'haram_muntah_sengaja',
        title: 'Muntah dengan Sengaja',
        title_en: 'Vomiting Intentionally',
        description: 'Memuntahkan makanan dengan sengaja membatalkan puasa. Jika muntah tidak sengaja, puasa tetap sah.',
        description_en: 'Intentionally vomiting invalidates fasting. If vomiting occurs unintentionally, the fast remains valid.',
        category: 'haram',
    },
    {
        id: 'haram_jimak',
        title: 'Berhubungan Suami Istri',
        title_en: 'Marital Intercourse',
        description: 'Berhubungan suami istri di siang hari Ramadhan membatalkan puasa dan wajib diqadha serta kafarat berat.',
        description_en: 'Marital intercourse during Ramadhan daylight invalidates fasting and requires making up the day plus severe expiation.',
        category: 'haram',
    },
    {
        id: 'haram_haid_nifas',
        title: 'Haid atau Nifas',
        title_en: 'Menstruation or Postpartum Bleeding',
        description: 'Wanita yang sedang haid atau nifas haram berpuasa. Wajib mengqadha di hari lain setelah suci.',
        description_en: 'Women who are menstruating or in postpartum bleeding are forbidden to fast. They must make up the days after becoming pure.',
        category: 'haram',
    },
    {
        id: 'haram_murtad',
        title: 'Keluar dari Islam (Murtad)',
        title_en: 'Apostasy',
        description: 'Murtad (keluar dari Islam) membatalkan segala amal ibadah termasuk puasa.',
        description_en: 'Apostasy (leaving Islam) invalidates all acts of worship including fasting.',
        category: 'haram',
    },
];

// ─────────────────────────────────────────────────────────────
// FAQ DATA
// ─────────────────────────────────────────────────────────────

export const FAQ_DATA: FAQItem[] = [
    {
        id: 'faq_gosok_gigi',
        question: 'Apakah gosok gigi membatalkan puasa?',
        question_en: 'Does brushing teeth invalidate fasting?',
        answer: 'Gosok gigi saat puasa diperbolehkan. Yang membatalkan adalah jika pasta gigi atau air tertelan dengan sengaja. Sebaiknya: (1) Gunakan pasta gigi sedikit, (2) Berkumur dengan hati-hati, (3) Atau gunakan siwak/sikat tanpa pasta. Sebagian ulama memakruhkan gosok gigi dengan pasta setelah dzuhur.',
        answer_en: 'Brushing teeth while fasting is permissible. What invalidates fasting is if toothpaste or water is intentionally swallowed. Best practices: (1) Use minimal toothpaste, (2) Rinse carefully, (3) Or use siwak/brush without paste. Some scholars dislike brushing with paste after midday.',
        tags: ['gosok gigi', 'pasta gigi', 'sikat gigi', 'brushing'],
    },
    {
        id: 'faq_lupa_makan',
        question: 'Jika lupa dan makan/minum saat puasa, apakah batal?',
        question_en: 'If I forget and eat/drink while fasting, is it invalidated?',
        answer: 'Tidak batal. Jika seseorang lupa bahwa ia sedang berpuasa lalu makan atau minum, maka puasanya tetap sah. Ketika ingat, segera hentikan dan lanjutkan puasa. Ini adalah rizki dari Allah dan tidak perlu diqadha.',
        answer_en: 'Not invalidated. If someone forgets they are fasting and eats or drinks, their fast remains valid. Upon remembering, immediately stop and continue fasting. This is provision from Allah and does not need to be made up.',
        dalil: {
            id: 'dalil_lupa',
            shortRef: 'HR. Bukhari No. 1933',
            shortRef_en: 'Hadith Bukhari No. 1933',
            translation: 'Barang siapa lupa bahwa ia sedang berpuasa lalu dia makan atau minum, maka sempurnakanlah puasanya. Sesungguhnya Allah telah memberinya makan dan minum.',
            translation_en: 'Whoever forgets that he is fasting and eats or drinks, let him complete his fast. Indeed, Allah has fed him and given him drink.',
            source: 'HR. Bukhari No. 1933 dan Muslim No. 1155, dari Abu Hurairah r.a.',
            source_en: 'Hadith narrated by Bukhari No. 1933 and Muslim No. 1155, from Abu Hurairah r.a.',
        },
        tags: ['lupa', 'forget', 'makan', 'minum'],
    },
    {
        id: 'faq_menelan_ludah',
        question: 'Apakah menelan ludah sendiri membatalkan puasa?',
        question_en: 'Does swallowing one\'s own saliva invalidate fasting?',
        answer: 'Tidak membatalkan. Menelan ludah (air liur) sendiri yang sudah ada di dalam mulut tidak membatalkan puasa. Yang membatalkan adalah menelan sesuatu dari luar seperti makanan, minuman, atau ludah orang lain.',
        answer_en: 'Does not invalidate. Swallowing one\'s own saliva that is already in the mouth does not invalidate fasting. What invalidates is swallowing something from outside such as food, drink, or someone else\'s saliva.',
        tags: ['ludah', 'liur', 'saliva', 'air liur'],
    },
    {
        id: 'faq_mimpi_basah',
        question: 'Apakah mimpi basah membatalkan puasa?',
        question_en: 'Does a wet dream invalidate fasting?',
        answer: 'Tidak membatalkan. Mimpi basah (ihtilam) tidak membatalkan puasa karena terjadi di luar kesadaran. Setelah bangun, wajib mandi junub kemudian melanjutkan puasa. Puasa tetap sah dan tidak perlu diqadha.',
        answer_en: 'Does not invalidate. Wet dreams do not invalidate fasting as they occur beyond one\'s control. After waking, obligatory bath is required then continue fasting. The fast remains valid and does not need to be made up.',
        tags: ['mimpi basah', 'ihtilam', 'wet dream', 'junub'],
    },
    {
        id: 'faq_donor_darah',
        question: 'Bolehkah donor darah saat puasa?',
        question_en: 'Is blood donation permissible while fasting?',
        answer: 'Boleh, tetapi sebaiknya dihindari jika membuat sangat lemah. Donor darah tidak membatalkan puasa menurut mayoritas ulama kontemporer karena darah keluar tanpa syahwat dan bukan melalui lubang alami. Namun jika membuat sangat lemas hingga sulit melanjutkan puasa, sebaiknya ditunda.',
        answer_en: 'Permissible, but should be avoided if it causes severe weakness. Blood donation does not invalidate fasting according to most contemporary scholars as blood exits without desire and not through natural openings. However, if it causes severe weakness making it difficult to continue fasting, it should be postponed.',
        tags: ['donor darah', 'bekam', 'blood donation', 'cupping'],
    },
    {
        id: 'faq_obat_kumur',
        question: 'Bolehkah menggunakan obat kumur saat puasa?',
        question_en: 'Is using mouthwash permissible while fasting?',
        answer: 'Boleh, dengan syarat sangat hati-hati agar tidak tertelan. Jika ada alternatif yang lebih aman (seperti berkumur dengan air biasa), itu lebih baik. Ulama bersepakat bahwa jika obat kumur tertelan dengan sengaja, maka membatalkan puasa.',
        answer_en: 'Permissible, with the condition of being very careful not to swallow. If there is a safer alternative (such as rinsing with plain water), that is better. Scholars agree that if mouthwash is intentionally swallowed, it invalidates fasting.',
        tags: ['obat kumur', 'mouthwash', 'listerine'],
    },
    {
        id: 'faq_suntik',
        question: 'Apakah suntik obat membatalkan puasa?',
        question_en: 'Do injections invalidate fasting?',
        answer: 'Mayoritas ulama kontemporer berpendapat bahwa suntik obat (seperti insulin, antibiotik, vaksin) tidak membatalkan puasa, karena bukan makanan/minuman dan tidak melalui lubang alami. Yang membatalkan adalah suntik untuk nutrisi (infus makanan). Untuk lebih yakin, sebaiknya konsultasi dengan ustadz setempat.',
        answer_en: 'Most contemporary scholars hold that medical injections (such as insulin, antibiotics, vaccines) do not invalidate fasting, as they are not food/drink and do not enter through natural openings. What invalidates is nutritional injections (IV feeding). For certainty, consult local scholars.',
        tags: ['suntik', 'injection', 'insulin', 'vaksin'],
    },
    {
        id: 'faq_berenang',
        question: 'Bolehkah berenang saat puasa?',
        question_en: 'Is swimming permissible while fasting?',
        answer: 'Boleh, dengan syarat air tidak sengaja ditelan. Nabi Muhammad SAW pernah menyiramkan air ke kepala beliau saat berpuasa. Namun jika berenang membuat khawatir air tertelan atau membuat sangat lelah, sebaiknya dihindari.',
        answer_en: 'Permissible, with the condition that water is not intentionally swallowed. Prophet Muhammad PBUH once poured water over his head while fasting. However, if swimming raises concern about swallowing water or causes severe fatigue, it should be avoided.',
        tags: ['berenang', 'swimming', 'kolam', 'mandi'],
    },
    {
        id: 'faq_muntah',
        question: 'Jika muntah saat puasa, apakah batal?',
        question_en: 'If I vomit while fasting, is it invalidated?',
        answer: 'Jika muntah tidak disengaja (karena sakit atau kondisi), puasa tetap sah. Jika muntah disengaja (dengan memasukkan jari ke mulut misalnya), maka membatalkan puasa dan wajib diqadha. Jika setelah muntah tidak sengaja, isi muntahan tertelan kembali, maka membatalkan puasa.',
        answer_en: 'If vomiting is unintentional (due to illness or condition), the fast remains valid. If vomiting is intentional (by putting finger in mouth for example), it invalidates fasting and must be made up. If after unintentional vomiting, the vomit is swallowed back, it invalidates fasting.',
        dalil: {
            id: 'dalil_muntah',
            shortRef: 'HR. Abu Dawud No. 2380',
            shortRef_en: 'Hadith Abu Dawud No. 2380',
            translation: 'Barang siapa yang terpaksa muntah (tidak sengaja), maka tidak wajib mengqadha. Dan barang siapa yang muntah dengan sengaja, maka hendaklah ia mengqadha.',
            translation_en: 'Whoever is overcome by vomit (unintentionally), is not required to make it up. And whoever vomits intentionally, let him make it up.',
            source: 'HR. Abu Dawud No. 2380 dan Tirmidzi No. 720, dari Abu Hurairah r.a.',
            source_en: 'Hadith narrated by Abu Dawud No. 2380 and Tirmidzi No. 720, from Abu Hurairah r.a.',
        },
        tags: ['muntah', 'vomit', 'mual'],
    },
    {
        id: 'faq_niat_malam',
        question: 'Apakah niat puasa harus di malam hari?',
        question_en: 'Must the intention for fasting be made at night?',
        answer: 'Untuk puasa wajib Ramadhan, niat harus sudah ada sebelum terbit fajar (subuh). Boleh niat sejak malam hari atau sebelum imsak. Niat tidak harus diucapkan, cukup dalam hati dengan azam akan berpuasa esok hari. Untuk puasa sunnah, boleh niat sampai sebelum dzuhur jika belum makan/minum.',
        answer_en: 'For obligatory Ramadhan fasting, intention must be made before dawn (Fajr). It may be intended from the night before or before imsak. Intention does not need to be verbalized, sufficient in the heart with determination to fast the next day. For voluntary fasting, intention may be made until before midday if one has not eaten/drunk.',
        tags: ['niat', 'intention', 'malam', 'subuh'],
    },
    {
        id: 'faq_wanita_haid',
        question: 'Bagaimana jika haid datang saat puasa?',
        question_en: 'What if menstruation comes during fasting?',
        answer: 'Jika haid datang meskipun hanya setetes, puasa langsung batal dan haram diteruskan. Wanita harus berhenti puasa dan mengqadha hari tersebut setelah suci. Begitu juga dengan nifas (darah setelah melahirkan). Ini adalah keringanan dari Allah dan tidak ada dosa.',
        answer_en: 'If menstruation comes even just a drop, fasting is immediately invalidated and forbidden to continue. Women must stop fasting and make up that day after becoming pure. Same with postpartum bleeding. This is a concession from Allah and there is no sin.',
        tags: ['haid', 'menstruasi', 'menstruation', 'women'],
    },
    {
        id: 'faq_traveling',
        question: 'Bolehkah tidak puasa saat bepergian (musafir)?',
        question_en: 'Is it permissible not to fast while traveling?',
        answer: 'Boleh tidak berpuasa saat dalam perjalanan jauh (musafir), ini adalah rukhsah (keringanan) dari Allah. Kriteria musafir menurut mayoritas ulama adalah perjalanan minimal ±83 km dengan niat safar. Namun jika mampu puasa tanpa kesulitan berarti, berpuasa lebih utama. Hari yang tidak dipuasa wajib diqadha.',
        answer_en: 'Permissible not to fast during long-distance travel, this is a concession from Allah. The criteria for traveler according to most scholars is a journey of at least ±83 km with intention of travel. However, if able to fast without significant difficulty, fasting is more virtuous. Days not fasted must be made up.',
        dalil: {
            id: 'dalil_musafir',
            shortRef: 'QS. Al-Baqarah: 184',
            shortRef_en: 'Quran 2:184',
            translation: 'Barang siapa di antara kamu sakit atau dalam perjalanan (lalu tidak berpuasa), maka (wajib menggantinya) sebanyak hari (yang dia tidak berpuasa itu) pada hari-hari yang lain.',
            translation_en: 'And whoever among you is ill or on a journey, then (must make up) an equal number of other days.',
            source: 'QS. Al-Baqarah: 184',
            source_en: 'Quran 2:184',
        },
        tags: ['musafir', 'traveling', 'perjalanan', 'safar'],
    },
];

// ─────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────

export function getAllFiqhByCategory(category: FiqhCategory): FiqhItem[] {
    switch (category) {
        case 'wajib': return FIQH_WAJIB;
        case 'sunnah': return FIQH_SUNNAH;
        case 'mubah': return FIQH_MUBAH;
        case 'makruh': return FIQH_MAKRUH;
        case 'haram': return FIQH_HARAM;
        default: return [];
    }
}

export function getAllFiqhItems(): FiqhItem[] {
    return [
        ...FIQH_WAJIB,
        ...FIQH_SUNNAH,
        ...FIQH_MUBAH,
        ...FIQH_MAKRUH,
        ...FIQH_HARAM,
    ];
}

export function getFAQByTag(tag: string): FAQItem[] {
    return FAQ_DATA.filter(faq => faq.tags?.includes(tag));
}
