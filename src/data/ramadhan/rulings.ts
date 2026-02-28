import { RulingItem, RulingCategory } from './types';

// FIQH DATA - WAJIB (OBLIGATORY)
// ─────────────────────────────────────────────────────────────

export const OBLIGATORY_RULINGS: RulingItem[] = [
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


// FIQH DATA - SUNNAH (RECOMMENDED)
// ─────────────────────────────────────────────────────────────

export const RECOMMENDED_RULINGS: RulingItem[] = [
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


// FIQH DATA - MUBAH (PERMISSIBLE)
// ─────────────────────────────────────────────────────────────

export const PERMISSIBLE_RULINGS: RulingItem[] = [
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


// FIQH DATA - MAKRUH (DISLIKED)
// ─────────────────────────────────────────────────────────────

export const DISLIKED_RULINGS: RulingItem[] = [
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


// FIQH DATA - HARAM (FORBIDDEN / INVALIDATES FASTING)
// ─────────────────────────────────────────────────────────────

export const FORBIDDEN_RULINGS: RulingItem[] = [
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


// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────

export function getAllRulingsByCategory(category: RulingCategory): RulingItem[] {
    switch (category) {
        case 'wajib': return OBLIGATORY_RULINGS;
        case 'sunnah': return RECOMMENDED_RULINGS;
        case 'mubah': return PERMISSIBLE_RULINGS;
        case 'makruh': return DISLIKED_RULINGS;
        case 'haram': return FORBIDDEN_RULINGS;
        default: return [];
    }
}

export function getAllRulingItems(): RulingItem[] {
    return [
        ...OBLIGATORY_RULINGS,
        ...RECOMMENDED_RULINGS,
        ...PERMISSIBLE_RULINGS,
        ...DISLIKED_RULINGS,
        ...FORBIDDEN_RULINGS,
    ];
}

