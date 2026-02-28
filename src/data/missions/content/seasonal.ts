import { Reading, MissionContent } from './types';

export const SEASONAL_MISSION_CONTENTS: Record<string, MissionContent> = {
    'cek_kesehatan': {
        id: 'cek_kesehatan',
        intro: 'Memastikan kondisi fisik prima sebelum memasuki bulan Ramadhan agar dapat menjalankan ibadah puasa dengan optimal.',
        fadhilah: [
            'Menjaga amanah tubuh pemberian Allah',
            'Ibadah menjadi lebih optimal jika fisik sehat (Kuat puasa & Tarawih)',
            'Mencegah mudharat (bahaya) saat berpuasa bagi yang memiliki kondisi khusus'
        ],
        guides: [
            'Cek Gula Darah: Pastikan kadar gula darah normal (Puasa & Sewaktu). Hipoglikemia saat puasa bisa berbahaya.',
            'Cek Tekanan Darah: Kontrol hipertensi atau hipotensi agar stabil saat puasa.',
            'Cek Kolesterol & Asam Urat: Hindari komplikasi setelah berbuka puasa dengan makanan berat.',
            'Lambung (Maag/GERD): Konsultasi dokter jika memiliki riwayat asam lambung kronis untuk strategi obat.',
            'Gigi & Mulut: Cek kesehatan gigi, sakit gigi saat puasa sangat mengganggu.',
            'Pola Tidur & Hidrasi: Mulai biasakan minum air putih cukup (8 gelas) dan kurangi begadang.'
        ],
        source: 'Anjuran Medis & Konteks Fiqih Kesehatan'
    },

    'maaf_maafan': {
        id: 'maaf_maafan',
        intro: 'Membersihkan hati dari dendam dan permusuhan sebelum Ramadhan agar amal ibadah tidak terhalang (terhijab) oleh sengketa sesama manusia.',
        fadhilah: [
            'Meraih ampunan Allah (Allah memaafkan hamba yang memaafkan saudaranya)',
            'Diangkat derajatnya dan dimuliakan oleh Allah',
            'Melapangkan dada dan menenangkan hati saat beribadah',
            'Bebas dari ancaman tertolaknya amal di malam Nisfu Sya\'ban (karena permusuhan)'
        ],
        readings: [
            {
                title: "Doa Memohon Ampunan untuk Orang Tua",
                arabic: "رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
                latin: "Rabbighfir lī wa liwālidayya warḥamhumā kamā rabbayānī ṣaghīrā",
                translation: "Ya Tuhanku, ampunilah dosaku dan dosa kedua orang tuaku, dan sayangilah keduanya sebagaimana mereka mendidikku di waktu kecil.",
                note: "Mulailah dengan meminta ridho orang tua"
            },
            {
                title: "Doa Menghilangkan Dendam (Ghill)",
                arabic: "رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ وَلَا تَجْعَلْ فِي قُلُوبِنَا غِلًّا لِلَّذِينَ آمَنُوا رَبَّنَا إِنَّكَ رَءُوفٌ رَحِيمٌ",
                latin: "Rabbanaghfir lanā wa li-ikhwāninallażīna sabaqūnā bil-īmān, wa lā taj'al fī qulūbinā gillal lillażīna āmanū rabbanā innaka ra'ụfur raḥīm",
                translation: "Ya Rabb kami, beri ampunlah kami dan saudara-saudara kami yang telah beriman lebih dulu dari kami, dan janganlah Engkau membiarkan kedengkian dalam hati kami terhadap orang-orang yang beriman; Ya Rabb kami, Sesungguhnya Engkau Maha Penyantun lagi Maha Penyayang.",
                note: "QS. Al-Hasyr: 10"
            }
        ],
        guides: [
            'Hubungi Orang Tua: Telepon atau kunjungi, minta maaf dengan tulus atas kesalahan lisan/perbuatan.',
            'Sapa Sahabat/Kerabat: Jika ada yang sedang "diam-diaman", jadilah yang pertama menyapa (Mendapat pahala terbaik).',
            'Lunasi Tanggungan: Jika ada hutang atau janji pada sesama, segera selesaikan atau minta kehalalan.',
            'Maafkan Kesalahan Orang: Lapangkan hati, maafkan kesalahan orang lain pada kita agar Allah memaafkan kita.'
        ],
        source: 'QS. Ali Imran: 134, HR. Muslim No. 2565'
    },

    'puasa_sunnah_ramadhan_prep': {
        id: 'puasa_sunnah_ramadhan_prep',
        intro: 'Latihan puasa sunnah di bulan Sya\'ban sebagai pemanasan fisik dan mental menyambut Ramadhan.',
        fadhilah: [
            'Membiasakan lambung dan fisik agar tidak kaget saat Ramadhan',
            'Menghidupkan sunnah di bulan yang sering dilalaikan manusia',
            'Diangkatnya amal tahunan di bulan Sya\'ban dalam keadaan berpuasa'
        ],
        niat: {
            munfarid: {
                title: "Niat Puasa Sya'ban",
                arabic: "نَوَيْتُ صَوْمَ غَدٍ عَنْ أَدَاءِ سُنَّةِ شَعْبَانَ لِلهِ تَعَالَى",
                latin: "Nawaitu shauma ghadin 'an ada'i sunnati Sya'bana lillahi ta'ala",
                translation: "Aku berniat puasa sunnah Sya'ban esok hari karena Allah Ta'ala."
            }
        },
        source: 'HR. An-Nasa\'i'
    },

    'sedekah_subuh': {
        id: 'sedekah_subuh',
        intro: 'Setiap pagi dua malaikat turun; satu mendoakan keberkahan bagi yang berinfak, satu mendoakan kehancuran bagi yang pelit.',
        fadhilah: [
            'Didoakan langsung oleh Malaikat',
            'Tidak akan mengurangi harta, justru menambah keberkahan',
            'Menolak bala dan musibah',
            'Menghapus dosa sebagaimana air memadamkan api'
        ],
        guides: [
            'Siapkan kaleng/kotak amal khusus di rumah, isi setiap subuh',
            'Transfer donasi online (QRIS/E-Wallet) di waktu subuh',
            'Beri makan kucing liar/makhluk Allah di pagi hari',
            'Titipkan infaq ke masjid saat sholat subuh berjamaah'
        ],
        source: 'HR. Bukhari & Muslim'
    },

    'qadha_puasa': {
        id: 'qadha_puasa',
        intro: 'Hutang kepada Allah (puasa wajib) lebih berhak untuk ditunaikan. Lunasi segera sebelum masuk Ramadhan berikutnya.',
        fadhilah: [
            'Gugurnya kewajiban/dosa meninggalkan puasa',
            'Bentuk keseriusan dan ketaatan hamba',
            'Meringankan beban di akhirat'
        ],
        niat: {
            munfarid: {
                title: "Niat Puasa Qadha",
                arabic: "نَوَيْتُ صَوْمَ غَدٍ عَنْ قَضَاءِ فَرْضِ شَهْرِ رَمَضَانَ لِلهِ تَعَالَى",
                latin: "Nawaitu shauma ghadin 'an qadhā'I fardhi syahri Ramadhāna lillâhi ta'ālā.",
                translation: "Aku berniat untuk mengqadha puasa Bulan Ramadhan esok hari karena Allah Ta'ala."
            }
        },
        source: 'QS. Al-Baqarah: 184'
    },

    'puasa_syaban': {
        id: 'puasa_syaban',
        intro: 'Bulan Sya\'ban adalah bulan di mana Rasulullah SAW paling banyak berpuasa sunnah selain Ramadhan.',
        fadhilah: [
            'Rasulullah mencintai amalnya diangkat saat sedang berpuasa',
            'Melalaikan manusia (karena diapit Rajab & Ramadhan), ibadah saat orang lalai pahalanya besar',
            'Persiapan fisik terbaik jelang Ramadhan'
        ],
        niat: {
            munfarid: {
                title: "Niat Puasa Sya'ban",
                arabic: "نَوَيْتُ صَوْمَ غَدٍ عَنْ أَدَاءِ سُنَّةِ شَعْبَانَ لِلهِ تَعَالَى",
                latin: "Nawaitu shauma ghadin 'an ada'i sunnati Sya'bana lillahi ta'ala",
                translation: "Aku berniat puasa sunnah Sya'ban esok hari karena Allah Ta'ala."
            }
        },
        guides: [
            'Waktu Utama: Perbanyak puasa di awal hingga pertengahan Sya\'ban.',
            'Hari Larangan: Sebagian ulama memakruhkan puasa setelah Nisfu Sya\'ban (tgl 16-30) kecuali bagi yang sudah terbiasa (Senin-Kamis/Daud) atau Qadha.',
            'Sahur: Disunnahkan makan sahur untuk keberkahan dan kekuatan.',
            'Persiapan: Gunakan momen ini untuk melatih menahan hawa nafsu sebelum "pertandingan sesungguhnya" di Ramadhan.'
        ],
        source: 'HR. Bukhari & Muslim'
    },

    'baca_quran_syaban': {
        id: 'baca_quran_syaban',
        intro: 'Para ulama salaf menyebut Sya\'ban sebagai "Syahrul Qurra" (Bulannya para pembaca Al-Quran).',
        fadhilah: [
            'Melembutkan hati yang keras sebelum masuk Ramadhan',
            'Melancarkan lisan agar tidak kaku saat Tadarus Ramadhan',
            'Meraih syafaat Al-Quran'
        ],
        guides: [
            'Mulai targetkan khatam 1x di bulan Sya\'ban',
            'Perbaiki tajwid (Tahsin) bacaan',
            'Baca terjemahan untuk tadabbur makna'
        ],
        source: 'Atsar Salaf (Ibnu Rajab)'
    },

    'malam_nisfu_syaban': {
        id: 'malam_nisfu_syaban',
        intro: 'Malam pertengahan Sya\'ban (tgl 15), malam di mana Allah melihat kepada makhluk-Nya dan memberikan ampunan luas.',
        fadhilah: [
            'Ampunan Allah bagi seluruh makhluk kecuali musyrik dan orang yang bermusuhan (Musaahin)',
            'Malam dikabulkannya doa (menurut sebagian ulama)',
            'Momen introspeksi diri pertengahan bulan'
        ],
        readings: [
            {
                title: "Doa Nisfu Sya'ban (Umum)",
                arabic: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
                latin: "Allahumma innaka 'afuwwun tuhibbul 'afwa fa'fu 'annii",
                translation: "Ya Allah, sesungguhnya Engkau Maha Pemaaf dan suka memaafkan, maka maafkanlah aku."
            },
            {
                title: "Yasin 3x (Tradisi Ulama)",
                arabic: "يس",
                latin: "Yasin",
                translation: "Surat Yasin",
                note: "1. Niat panjang umur taat, 2. Niat tolak bala, 3. Niat kaya hati/rezeki (Boleh diamalkan sebagai wasilah doa)"
            }
        ],
        guides: [
            'Perbanyak Istighfar dan Taubat',
            'Bersihkan hati dari dendam/permusuhan dengan sesama muslim',
            'Hidupkan malam dengan sholat sunnah dan doa',
            'Hindari perbuatan syirik dan bid\'ah yang dilarang'
        ],
        source: 'HR. Ibnu Majah (Hasan)'
    },

    'target_khatam': {
        id: 'target_khatam',
        intro: 'Tanpa target yang jelas, keinginan khatam hanya akan jadi angan-angan. Buat strategi realistis.',
        fadhilah: [
            'Disiplin dalam berinteraksi dengan Quran',
            'Motivasi untuk terus membaca',
            'Manajemen waktu ibadah yang lebih baik'
        ],
        guides: [
            'One Day One Juz (ODOJ): 1 Juz per hari = Khatam 30 hari',
            'Metode Sholat: Baca 2 lembar (4 halaman) setiap selesai sholat fardhu (5x4 = 20 halaman = 1 Juz)',
            'Metode Waktu: Alokasikan 30-45 menit khusus per hari'
        ],
        source: 'Tips Manajemen Ibadah'
    },

    'persiapan_ilmu': {
        id: 'persiapan_ilmu',
        intro: 'Ibadah tanpa ilmu bagaikan debu yang beterbangan. Pelajari fiqih puasa agar ibadah sah dan berkualitas.',
        fadhilah: [
            'Mengetahui mana yang membatalkan dan mana yang makruh',
            'Ibadah menjadi sah dan diterima',
            'Menghindari keragu-raguan (was-was) saat berpuasa'
        ],
        guides: [
            'Pelajari Rukun Puasa (Niat & Menahan diri)',
            'Pelajari Pembatal Puasa (Makan, Minum, Jima\', Muntah sengaja, Haid/Nifas, Gila, Murtad)',
            'Pelajari Sunnah Puasa (Sahur, Segera Berbuka, Doa)',
            'Pelajari Qadha & Fidyah'
        ],
        source: 'Kitab Fiqih'
    },

    'baca_article': { // Alias to persiapan_ilmu
        id: 'baca_article',
        intro: 'Membaca artikel atau buku tentang fiqih Ramadhan untuk memperdalam wawasan.',
        fadhilah: [
            'Pahala menuntut ilmu (Jihad fii sabilillah)',
            'Ibadah menjadi lebih berkualitas',
            'Bisa mengajarkan orang lain (Dakwah)'
        ],
        guides: [
            'Baca artikel tentang "Hal yang membatalkan puasa"',
            'Baca artikel tentang "Keutamaan Lailatul Qadar"',
            'Baca artikel tentang "Zakat Fitrah"'
        ],
        source: 'Perintah Iqra (Bacalah)'
    },

    'sholat_tarawih': {
        id: 'sholat_tarawih',
        intro: 'Sholat sunnah muakkad yang hanya ada di bulan Ramadhan. Syiar agung yang menghidupkan malam.',
        fadhilah: [
            'Diampuni dosa yang telah lalu (Man qoma romadhona iimanan wahtisaban...)',
            'Pahala sholat semalam suntuk (jika tuntas bersama imam hingga witir)',
            'Memeriahkan masjid dengan zikir dan doa'
        ],
        niat: {
            munfarid: {
                title: "Niat Sholat Tarawih (Sendiri)",
                arabic: "اُصَلِّى سُنَّةَ التَّرَاوِيْحِ رَكْعَتَيْنِ مُسْتَقْبِلَ الْقِبْلَةِ لِلهِ تَعَالَى",
                latin: "Ushalli sunnatat tarāwīhi rak'ataini mustaqbilal qiblati lillāhi ta'ālā",
                translation: "Aku niat sholat sunnah tarawih dua rakaat menghadap kiblat karena Allah Ta'ala"
            },
            makmum: {
                title: "Niat Sholat Tarawih (Makmum)",
                arabic: "اُصَلِّى سُنَّةَ التَّرَاوِيْحِ رَكْعَتَيْنِ مُسْتَقْبِلَ الْقِبْلَةِ مَأْمُوْمًا لِلهِ تَعَالَى",
                latin: "Ushalli sunnatat tarāwīhi rak'ataini mustaqbilal qiblati ma'mūman lillāhi ta'ālā",
                translation: "Aku niat sholat sunnah tarawih dua rakaat menghadap kiblat sebagai makmum karena Allah Ta'ala"
            }
        },
        source: 'HR. Bukhari & Muslim'
    },

    'bukber_hemat': {
        id: 'bukber_hemat',
        intro: 'Bukber (Buka Bersama) boleh, tapi jangan sampai israf (berlebihan) dan melalaikan sholat Maghrib/Isya.',
        fadhilah: [
            'Menghindari sifat setan (pemboros)',
            'Menjaga kesehatan pencernaan',
            'Sisa harta bisa dialokasikan untuk sedekah'
        ],
        guides: [
            'Makan secukupnya saat berbuka (Sunnah: Kurma & Air)',
            'Jangan "lapar mata" membeli semua takjil',
            'Pastikan lokasi bukber ada tempat sholat yang layak',
            'Prioritaskan sholat Maghrib sebelum makan berat'
        ],
    },

    'sahur_berkah': {
        id: 'sahur_berkah',
        intro: 'Sahur adalah pembeda puasa kita dengan Ahli Kitab, dan di dalamnya terdapat keberkahan yang besar.',
        fadhilah: [
            'Keberkahan (Barakah) dari Allah dan doa Malaikat',
            'Memberikan kekuatan fisik untuk berpuasa seharian',
            'Pembeda dengan puasa Ahli Kitab',
            'Waktu mustajab untuk beristighfar di waktu sahur'
        ],
        guides: [
            'Waktu Utama: Mengakhirkan sahur mendekati waktu Subuh (Imtak).',
            'Menu: Tidak harus berat, seteguk air pun terhitung sahur.',
            'Sunnah: Sahur dengan kurma adalah sebaik-baik sahur mukmin.',
            'Niat: Sempurnakan niat puasa saat sahur.'
        ],
        source: 'HR. Bukhari & Muslim'
    }
};
