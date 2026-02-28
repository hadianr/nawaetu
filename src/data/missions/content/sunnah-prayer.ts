/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 */

import { MissionContent } from './types';

export const SUNNAH_PRAYER_CONTENTS: Record<string, MissionContent> = {
    'sunnah_qobliyah_fajr': {
        id: 'sunnah_qobliyah_fajr',
        intro: 'Dua rakaat yang lebih berharga dari dunia dan seisinya, dilakukan sebelum sholat Subuh.',
        fadhilah: [
            'Lebih baik dari dunia dan seisinya',
            'Mengikuti sunnah muakkad yang tidak pernah ditinggalkan Rasulullah SAW',
            'Penyempurna kekurangan sholat fardhu Subuh'
        ],
        niat: {
            munfarid: {
                title: "Niat Qobliyah Subuh",
                arabic: "أُصَلِّى سُنَّةَ الصُّبْحِ رَكْعَتَيْنِ قَبْلِيَّةً لِلهِ تَعَالَى",
                latin: "Ushalli sunnatas-subhi rak'ataini qabliyyatan lillaahi ta'aalaa",
                translation: "Aku niat melakukan shalat sunat sebelum subuh 2 rakaat karena Allah ta'ala."
            }
        },
        guides: [
            'Waktu: Setelah adzan Subuh sebelum sholat fardhu.',
            'Disunnahkan membaca surah Al-Kafirun (rakaat 1) dan Al-Ikhlas (rakaat 2).',
            'Bisa dilakukan meski sholat fardhu sudah akan dimulai (jika cukup waktu).'
        ],
        source: 'HR. Muslim no. 725'
    },
    'sunnah_qobliyah_dhuhr': {
        id: 'sunnah_qobliyah_dhuhr',
        intro: 'Membuka pintu langit di siang hari dengan sunnah sebelum Dzuhur.',
        fadhilah: [
            'Pintu-pintu langit dibuka pada waktu ini',
            'Diharamkan baginya api neraka (jika rutin 4 rakaat)',
            'Mendapatkan rahmat Allah'
        ],
        niat: {
            munfarid: {
                title: "Niat Qobliyah Dzuhur",
                arabic: "أُصَلِّى سُنَّةَ الظُّهْرِ رَكْعَتَيْنِ قَبْلِيَّةً لِلهِ تَعَالَى",
                latin: "Ushalli sunnatadh-dhuhr rak'ataini qabliyyatan lillaahi ta'aalaa",
                translation: "Aku niat melakukan shalat sunat sebelum dzuhur 2 rakaat karena Allah ta'ala."
            }
        },
        guides: [
            'Waktu: Setelah adzan Dzuhur sebelum sholat fardhu.',
            'Bisa dilakukan 2 atau 4 rakaat (2x salam).'
        ],
        source: 'HR. Tirmidzi & Abu Dawud'
    },
    'sunnah_ba_diyah_dhuhr': {
        id: 'sunnah_ba_diyah_dhuhr',
        intro: 'Menutup ibadah siang dengan keberkahan sunnah sesudah Dzuhur.',
        fadhilah: [
            'Menyempurnakan pahala sholat Dzuhur',
            'Diharamkan baginya api neraka (jika rutin 4 rakaat bersama qobliyah)'
        ],
        niat: {
            munfarid: {
                title: "Niat Ba'diyah Dzuhur",
                arabic: "أُصَلِّى سُنَّةَ الظُّهْرِ رَكْعَتَيْنِ بَعْدِيَّةً لِلهِ تَعَالَى",
                latin: "Ushalli sunnatadh-dhuhr rak'ataini ba'diyyatan lillaahi ta'aalaa",
                translation: "Aku niat melakukan shalat sunat sesudah dzuhur 2 rakaat karena Allah ta'ala."
            }
        },
        guides: [
            'Waktu: Setelah selesai sholat fardhu Dzuhur.',
            'Dilakukan 2 rakaat (muakkad).'
        ],
        source: 'HR. Bukhari & Muslim'
    },
    'sunnah_ba_diyah_maghrib': {
        id: 'sunnah_ba_diyah_maghrib',
        intro: 'Sunnah muakkad yang sangat dianjurkan setelah Maghrib.',
        fadhilah: [
            'Menyempurnakan kekurangan sholat Maghrib',
            'Amalan yang senantiasa dijaga Rasulullah SAW'
        ],
        niat: {
            munfarid: {
                title: "Niat Ba'diyah Maghrib",
                arabic: "أُصَلِّى سُنَّةَ الْمَغْرِبِ رَكْعَتَيْنِ بَعْدِيَّةً لِلهِ تَعَالَى",
                latin: "Ushalli sunnatal-maghrib rak'ataini ba'diyyatan lillaahi ta'aalaa",
                translation: "Aku niat melakukan shalat sunat sesudah maghrib 2 rakaat karena Allah ta'ala."
            }
        },
        guides: [
            'Waktu: Setelah sholat fardhu Maghrib sebelum masuk waktu Isya.',
            'Sangat dianjurkan dilakukan 2 rakaat.'
        ],
        source: 'HR. Bukhari & Muslim'
    },
    'sunnah_ba_diyah_isha': {
        id: 'sunnah_ba_diyah_isha',
        intro: 'Menutup rangkaian sholat fardhu harian dengan sunnah Isya.',
        fadhilah: [
            'Pahala yang besar sebagai penutup malam',
            'Menggenapi kekurangan sholat fardhu Isya'
        ],
        niat: {
            munfarid: {
                title: "Niat Ba'diyah Isya",
                arabic: "أُصَلِّى سُنَّةَ الْعِشَاءِ رَكْعَتَيْنِ بَعْدِيَّةً لِلهِ تَعَالَى",
                latin: "Ushalli sunnatal-'isyaa-i rak'ataini ba'diyyatan lillaahi ta'aalaa",
                translation: "Aku niat melakukan shalat sunat sesudah isya 2 rakaat karena Allah ta'ala."
            }
        },
        guides: [
            'Waktu: Setelah sholat fardhu Isya.',
            'Dilakukan 2 rakaat.'
        ],
        source: 'HR. Bukhari & Muslim'
    },
    'sunnah_dhuha': {
        id: 'sunnah_dhuha',
        intro: 'Sholat Dhuha adalah sedekah bagi seluruh persendian tubuh.',
        fadhilah: [
            'Sedekah bagi 360 persendian tubuh',
            'Membuka pintu rezeki dan keberkahan siang hari',
            'Dibangunkan rumah di surga (bagi yang 12 rakaat)',
            'Wajah bercahaya dan hati tenang'
        ],
        niat: {
            munfarid: {
                title: "Niat Sholat Dhuha",
                arabic: "أُصَلِّى سُنَّةَ الضُّحَى رَكْعَتَيْنِ لِلهِ تَعَالَى",
                latin: "Ushalli sunnatad-dhuhaa rak'ataini lillaahi ta'aalaa",
                translation: "Aku niat melakukan shalat sunat dhuha 2 rakaat karena Allah ta'ala."
            }
        },
        guides: [
            'Waktu: 15 menit setelah Syuruq hingga 15 menit sebelum Dzuhur.',
            'Utama dilakukan saat panas matahari mulai terasa (jam 9-10 pagi).',
            'Minimal 2 rakaat, maksimal 12 rakaat.'
        ],
        source: 'HR. Muslim no. 720'
    },
    'sunnah_witir': {
        id: 'sunnah_witir',
        intro: 'Witir adalah sholat penutup malam yang sangat dicintai Allah.',
        fadhilah: [
            'Allah itu Witir (Ganjil) dan menyukai yang witir',
            'Penutup rangkaian sholat malam agar menjadi ganjil',
            'Waktu mustajab di penghujung malam'
        ],
        niat: {
            munfarid: {
                title: "Niat Sholat Witir (1 Rakaat)",
                arabic: "أُصَلِّى سُنَّةَ الْوِتْرِ رَكْعَةً لِلهِ تَعَالَى",
                latin: "Ushalli sunnatal-witri rak'atan lillaahi ta'aalaa",
                translation: "Aku niat melakukan shalat sunat witir 1 rakaat karena Allah ta'ala."
            }
        },
        guides: [
            'Waktu: Setelah Isya hingga sebelum Subuh.',
            'Minimal 1 rakaat, maksimal 11 rakaat.',
            'Bisa dilakukan langsung setelah Ba\'diyah Isya jika khawatir tidak bangun malam.'
        ],
        source: 'HR. Bukhari & Muslim'
    },
    'sunnah_tahajjud': {
        id: 'sunnah_tahajjud',
        intro: 'Tahajjud adalah kemuliaan bagi seorang mukmin di sepertiga malam terakhir.',
        fadhilah: [
            'Dinaikkan ke tempat yang terpuji (Maqaman Mahmuda)',
            'Tiket masuk surga dengan damai',
            'Waktu paling dekat antara hamba dengan Tuhannya',
            'Pembersih penyakit hati dan jasmani'
        ],
        niat: {
            munfarid: {
                title: "Niat Sholat Tahajjud",
                arabic: "أُصَلِّى سُنَّةَ التَّهَجُّدِ رَكْعَتَيْنِ لِلهِ تَعَالَى",
                latin: "Ushalli sunnatat-tahajjudi rak'ataini lillaahi ta'aalaa",
                translation: "Aku niat melakukan shalat sunat tahajjud 2 rakaat karena Allah ta'ala."
            }
        },
        guides: [
            'Waktu: Setelah sholat Isya hingga sebelum Subuh (harus tidur dulu).',
            'Utama dilakukan di sepertiga malam terakhir (jam 02:00 ke atas).',
            'Minimal 2 rakaat, maksimal tidak terbatas.'
        ],
        source: 'QS. Al-Isra: 79, HR. Tirmidzi'
    },
    'sunnah_istikharah': {
        id: 'sunnah_istikharah',
        intro: 'Sholat untuk meminta pilihan terbaik dari Allah SWT dalam setiap urusan.',
        fadhilah: [
            'Mendapatkan ketetapan hati dalam mengambil keputusan',
            'Dijauhkan dari penyesalan di masa depan',
            'Menyerahkan segala urusan kepada Yang Maha Mengetahui'
        ],
        niat: {
            munfarid: {
                title: "Niat Sholat Istikharah",
                arabic: "أُصَلِّى سُنَّةَ الاِسْتِخَارَةِ رَكْعَتَيْنِ لِلهِ تَعَالَى",
                latin: "Ushalli sunnatal-istikhaarati rak'ataini lillaahi ta'aalaa",
                translation: "Aku niat melakukan shalat sunat istikharah 2 rakaat karena Allah ta'ala."
            }
        },
        guides: [
            'Bisa dilakukan kapan saja kecuali waktu yang dilarang.',
            'Dilakukan 2 rakaat, lalu membaca doa istikharah setelah sholat.',
            'Istikharah tidak selalu lewat mimpi, bisa lewat kemantapan hati.'
        ],
        source: 'HR. Bukhari'
    },
    'sunnah_hajat': {
        id: 'sunnah_hajat',
        intro: 'Sholat saat memiliki keperluan atau keinginan kepada Allah SWT.',
        fadhilah: [
            'Allah akan mengabulkan hajat hamba-Nya',
            'Bentuk kepasrahan total atas sebuah keperluan',
            'Mendekatkan diri saat sedang kesulitan'
        ],
        niat: {
            munfarid: {
                title: "Niat Sholat Hajat",
                arabic: "أُصَلِّى سُنَّةَ الْحَاجَةِ رَكْعَتَيْنِ لِلهِ تَعَالَى",
                latin: "Ushalli sunnatal-haajati rak'ataini lillaahi ta'aalaa",
                translation: "Aku niat melakukan shalat sunat hajat 2 rakaat karena Allah ta'ala."
            }
        },
        guides: [
            'Dilakukan 2 rakaat, lalu berdoa dengan khusyuk menyebutkan hajatnya.',
            'Bisa dilakukan kapan saja, lebih utama di sepertiga malam terakhir.'
        ],
        source: 'HR. Tirmidzi & Ibnu Majah'
    },
    'sunnah_taubat': {
        id: 'sunnah_taubat',
        intro: 'Sholat untuk memohon ampunan atas dosa-dosa yang telah diperbuat.',
        fadhilah: [
            'Dihapuskannya dosa-dosa bagi yang bertaubat dengan sungguh-sungguh',
            'Mendapatkan ketenangan jiwa setelah memohon ampun',
            'Menjadi hamba yang dicintai Allah karena bertaubat'
        ],
        niat: {
            munfarid: {
                title: "Niat Sholat Taubat",
                arabic: "أُصَلِّى سُنَّةَ التَّوْبَةِ رَكْعَتَيْنِ لِلهِ تَعَالَى",
                latin: "Ushalli sunnatat-taubati rak'ataini lillaahi ta'aalaa",
                translation: "Aku niat melakukan shalat sunat taubat 2 rakaat karena Allah ta'ala."
            }
        },
        guides: [
            'Dilakukan 2 rakaat dengan penuh penyesalan.',
            'Memperbanyak istighfar dan janji tidak mengulangi dosa tersebut.'
        ],
        source: 'HR. Abu Daud & Tirmidzi'
    },
    'sunnah_tarawih': {
        id: 'sunnah_tarawih',
        intro: 'Sholat malam khusus di bulan Ramadhan untuk menghidupkan malam bulan suci.',
        fadhilah: [
            'Diampuni dosa-dosa yang telah lalu (jika dilakukan dengan iman & ikhlas)',
            'Pahala sholat semalam suntuk (jika berjamaah bersama imam hingga selesai)',
            'Mendekatkan diri kepada Allah di bulan penuh rahmat'
        ],
        niat: {
            munfarid: {
                title: "Niat Sholat Tarawih",
                arabic: "أُصَلِّى سُنَّةَ التَّرَاوِيْحِ رَكْعَتَيْنِ لِلهِ تَعَالَى",
                latin: "Ushalli sunnatat-taraawiihi rak'ataini lillaahi ta'aalaa",
                translation: "Aku niat melakukan shalat sunat tarawih 2 rakaat karena Allah ta'ala."
            }
        },
        guides: [
            'Waktu: Setelah Isya hingga sebelum Subuh di bulan Ramadhan.',
            'Bisa dilakukan 8 atau 20 rakaat (2 rakaat sekali salam).',
            'Ditutup dengan sholat Witir.'
        ],
        source: 'HR. Bukhari & Muslim'
    },
    'sunnah_eid_fitri': {
        id: 'sunnah_eid_fitri',
        intro: 'Sholat hari raya kemenangan setelah sebulan penuh berpuasa.',
        fadhilah: [
            'Simbol kegembiraan dan syukur hamba kepada Penciptanya',
            'Sarana silaturahmi akbar umat muslim',
            'Mendapatkan ampunan dan rahmat di hari yang fitri'
        ],
        niat: {
            munfarid: {
                title: "Niat Sholat Idul Fitri",
                arabic: "أُصَلِّى سُنَّةً لِعِيْدِ الْفِطْرِ رَكْعَتَيْنِ لِلهِ تَعَالَى",
                latin: "Ushalli sunnatal-li'iidil fithri rak'ataini lillaahi ta'aalaa",
                translation: "Aku niat melakukan shalat sunat Idul Fitri 2 rakaat karena Allah ta'ala."
            }
        },
        guides: [
            'Waktu: Pagi hari tanggal 1 Syawal setelah matahari terbit.',
            'Dilakukan 2 rakaat dengan 7 takbir (rakaat 1) dan 5 takbir (rakaat 2).',
            'Disunnahkan makan sebelum berangkat sholat.'
        ],
        source: 'HR. Bukhari & Muslim'
    },
    'sunnah_eid_adha': {
        id: 'sunnah_eid_adha',
        intro: 'Sholat hari raya kurban sebagai peringatan ketauhidan Nabi Ibrahim AS.',
        fadhilah: [
            'Mengingat pengabdian total Nabi Ibrahim & Ismail kepada Allah',
            'Awal dari hari-hari tasyrik yang penuh keberkahan',
            'Syiar Islam yang agung di seluruh dunia'
        ],
        niat: {
            munfarid: {
                title: "Niat Sholat Idul Adha",
                arabic: "أُصَلِّى سُنَّةً لِعِيْدِ الأَضْحَى رَكْعَتَيْنِ لِلهِ تَعَالَى",
                latin: "Ushalli sunnatal-li'iidil adha rak'ataini lillaahi ta'aalaa",
                translation: "Aku niat melakukan shalat sunat Idul Adha 2 rakaat karena Allah ta'ala."
            }
        },
        guides: [
            'Waktu: Pagi hari tanggal 10 Dzulhijjah setelah matahari terbit.',
            'Tata cara sama dengan Idul Fitri (7 & 5 takbir).',
            'Disunnahkan tidak makan hingga selesai sholat.'
        ],
        source: 'HR. Bukhari & Muslim'
    },
    'sunnah_gerhana': {
        id: 'sunnah_gerhana',
        intro: 'Sholat Kusuf (Matahari) atau Khusuf (Bulan) saat terjadi fenomena alam gerhana.',
        fadhilah: [
            'Mengingat kebesaran Allah melalui fenomena alam',
            'Bentuk ketundukan hamba agar dijauhkan dari marabahaya',
            'Mengikuti sunnah Rasulullah saat terjadi gerhana'
        ],
        niat: {
            munfarid: {
                title: "Niat Sholat Gerhana",
                arabic: "أُصَلِّى سُنَّةَ الْكُسُوْفِ رَكْعَتَيْنِ لِلهِ تَعَالَى",
                latin: "Ushalli sunnatal-kusuufi rak'ataini lillaahi ta'aalaa",
                translation: "Aku niat melakukan shalat sunat gerhana 2 rakaat karena Allah ta'ala."
            }
        },
        guides: [
            'Waktu: Selama proses gerhana berlangsung.',
            'Terdiri dari 2 rakaat, setiap rakaat memiliki 2 kali berdiri (baca Al-Fatihah & surah) dan 2 kali ruku\'.'
        ],
        source: 'HR. Bukhari & Muslim'
    },
    'sunnah_istisqa': {
        id: 'sunnah_istisqa',
        intro: 'Sholat untuk memohon turunnya hujan di saat kemarau panjang.',
        fadhilah: [
            'Bentuk kepasrahan kolektif umat kepada Sang Pemberi Rezeki',
            'Mengharap rahmat Allah melalui tetesan air hujan',
            'Mengingatkan hamba atas ketergantungan mutlak kepada Allah'
        ],
        niat: {
            munfarid: {
                title: "Niat Sholat Istisqa",
                arabic: "أُصَلِّى سُنَّةَ الاِسْتِسْقَاءِ رَكْعَتَيْنِ لِلهِ تَعَالَى",
                latin: "Ushalli sunnatal-istisqaa-i rak'ataini lillaahi ta'aalaa",
                translation: "Aku niat melakukan shalat sunat istisqa 2 rakaat karena Allah ta'ala."
            }
        },
        guides: [
            'Waktu: Biasanya dilakukan di siang hari di lapangan terbuka.',
            'Dilakukan 2 rakaat diikuti dengan khutbah dan doa membalikkan selendang/baju.'
        ],
        source: 'HR. Bukhari & Muslim'
    }
};
