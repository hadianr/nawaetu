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

import { FAQItem } from './types';

// FAQ DATA
// ─────────────────────────────────────────────────────────────

export const FAQ_DATA: FAQItem[] = [
    {
        id: 'faq_gosok_gigi',
        question: 'Apakah gosok gigi membatalkan puasa?',
        question_en: 'Does brushing teeth invalidate fasting?',
        answer: 'Gosok gigi saat puasa diperbolehkan. Yang membatalkan adalah jika pasta gigi atau air tertelan dengan sengaja. Sebaiknya: (1) Gunakan pasta gigi sedikit, (2) Berkumur dengan hati-hati, (3) Atau gunakan siwak/sikat tanpa pasta. Sebagian ulama memakruhkan gosok gigi dengan pasta setelah dzuhur.',
        answer_en: 'Brushing teeth while fasting is permissible. What invalidates fasting is if toothpaste or water is intentionally swallowed. Best practices: (1) Use minimal toothpaste, (2) Rinse carefully, (3) Or use siwak/brush without paste. Some scholars dislike brushing with paste after midday.',
        dalil: {
            id: 'dalil_siwak',
            shortRef: 'HR. Bukhari No. 887',
            shortRef_en: 'Hadith Bukhari No. 887',
            translation: 'Seandainya tidak memberatkan umatku niscaya akan kuperintahkan mereka bersiwak setiap kali wudhu (dan shalat).',
            translation_en: 'Were it not that it would be too difficult for my Ummah, I would have commanded them to use the siwak with every ablution (and prayer).',
            source: 'HR. Bukhari No. 887 dan Muslim No. 252. (Ulama mengkiaskan gosok gigi dengan siwak yang ditekankan)',
            source_en: 'Hadith Bukhari No. 887 & Muslim No. 252. (Scholars analogize brushing teeth to using siwak which is emphasized)',
        },
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
        dalil: {
            id: 'dalil_mimpi_basah',
            shortRef: 'HR. Abu Dawud No. 4403',
            shortRef_en: 'Hadith Abu Dawud No. 4403',
            translation: 'Pena (catatan amal) diangkat dari tiga orang: dari orang yang tidur sampai dia bangun, dari anak kecil sampai dia baligh, dan dari orang gila sampai dia sadar/berakal.',
            translation_en: 'The pen is lifted from three: from the sleeper until he wakes up, from the child until he reaches puberty, and from the insane person until he regains his sanity.',
            source: 'HR. Abu Dawud No. 4403 dan Tirmidzi No. 1423, dari Ali bin Abi Thalib r.a.',
            source_en: 'Hadith Abu Dawud No. 4403 and Tirmidzi No. 1423, from Ali bin Abi Talib r.a.',
        },
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
        answer: 'Boleh, dengan syarat air tidak sengaja ditelan. Namun jika berenang membuat khawatir air tertelan atau membuat sangat lelah, sebaiknya dihindari.',
        answer_en: 'Permissible, with the condition that water is not intentionally swallowed. However, if swimming raises concern about swallowing water or causes severe fatigue, it should be avoided.',
        dalil: {
            id: 'dalil_menyiram_air',
            shortRef: 'HR. Abu Dawud No. 2365',
            shortRef_en: 'Hadith Abu Dawud No. 2365',
            translation: 'Aku pernah melihat Rasulullah SAW di Al-Araj menyiramkan air ke atas kepala beliau, sedang beliau dalam keadaan puasa, karena haus atau karena panas (cuaca).',
            translation_en: 'I saw the Messenger of Allah PBUH at Al-Araj pouring water over his head while he was fasting, because of thirst or heat.',
            source: 'HR. Abu Dawud No. 2365 dan Ahmad 4:63.',
            source_en: 'Hadith Abu Dawud No. 2365 and Ahmad 4:63.',
        },
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
        dalil: {
            id: 'dalil_niat_malam',
            shortRef: 'HR. Abu Dawud No. 2454',
            shortRef_en: 'Hadith Abu Dawud No. 2454',
            translation: 'Barang siapa yang tidak berniat puasa di malam hari sebelum fajar, maka tidak sah puasanya.',
            translation_en: 'Whoever does not intend to fast during the night before dawn, there is no fast for him.',
            source: 'HR. Abu Dawud No. 2454, Tirmidzi No. 730, An-Nasa\'i No. 2331, dari Hafshah r.a.',
            source_en: 'Hadith Abu Dawud No. 2454, Tirmidzi No. 730, An-Nasai No. 2331, from Hafsa r.a.',
        },
        tags: ['niat', 'intention', 'malam', 'subuh'],
    },
    {
        id: 'faq_wanita_haid',
        question: 'Bagaimana jika haid datang saat puasa?',
        question_en: 'What if menstruation comes during fasting?',
        answer: 'Jika haid datang meskipun hanya setetes, puasa langsung batal dan haram diteruskan. Wanita harus berhenti puasa dan mengqadha hari tersebut setelah suci. Begitu juga dengan nifas (darah setelah melahirkan). Ini adalah keringanan dari Allah dan tidak ada dosa.',
        answer_en: 'If menstruation comes even just a drop, fasting is immediately invalidated and forbidden to continue. Women must stop fasting and make up that day after becoming pure. Same with postpartum bleeding. This is a concession from Allah and there is no sin.',
        dalil: {
            id: 'dalil_qadha_haid',
            shortRef: 'HR. Muslim No. 335',
            shortRef_en: 'Hadith Muslim No. 335',
            translation: 'Kami pernah mengalami haid di masa Rasulullah SAW, maka kami diperintahkan untuk mengqadha puasa dan tidak diperintahkan mengqadha shalat.',
            translation_en: 'We used to menstruate during the time of the Messenger of Allah PBUH, and we were ordered to make up for the fasts, but we were not ordered to make up for the prayers.',
            source: 'HR. Muslim No. 335 dari \'Aisyah r.a.',
            source_en: 'Hadith Muslim No. 335, from Aisha r.a.',
        },
        tags: ['haid', 'menstruasi', 'menstruation', 'women'],
    },
    {
        id: 'faq_makan_imsak',
        question: 'Bolehkah makan atau minum saat waktu imsak?',
        question_en: 'Is it permissible to eat or drink during imsak time?',
        answer: 'Boleh. Waktu berpuasa baru dimulai ketika fajar menyingsing (masuk waktu subuh). "Imsak" yang umum di Indonesia adalah waktu ihtiyat (kehati-hatian) sekitar 10 menit sebelum subuh agar kita tidak terburu-buru dan makanan sudah bersih dari mulut sebelum adzan berkumandang. Oleh karena itu, secara fiqih masih sah dan boleh makan minum hingga adzan subuh terdengar.',
        answer_en: 'Yes. The fasting period begins exactly at dawn (fajr/subuh prayer time). What is known as "Imsak" in Indonesia is a precautionary time (ihtiyat) about 10 minutes before dawn so one doesn\'t eat too close to fajr and can prepare properly. Therefore, in fiqh, it is still permissible and valid to eat and drink until the actual call for fajr prayer is heard.',
        dalil: {
            id: 'dalil_imsak',
            shortRef: 'QS. Al-Baqarah: 187',
            shortRef_en: 'Quran 2:187',
            translation: 'Makan dan minumlah hingga jelas bagimu (perbedaan) antara benang putih dan benang hitam, yaitu fajar.',
            translation_en: 'Eat and drink until the white thread of dawn becomes distinct from the black thread.',
            source: 'QS. Al-Baqarah: 187. Hal ini menegaskan batas akhir sahur adalah terbit fajar (waktu subuh), bukan waktu imsak.',
            source_en: 'Quran 2:187. This affirms that the absolute limit for suhoor is the break of dawn (fajr time), not imsak time.',
        },
        tags: ['imsak', 'makan', 'minum', 'sahur', 'subuh'],
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


export function getFAQByTag(tag: string): FAQItem[] {
    return FAQ_DATA.filter(faq => faq.tags?.includes(tag));
}
