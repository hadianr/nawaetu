// Mission content database: Readings (Dzikir/Doa), Guides, Benefits, and Dalil.

export interface Reading {
    title?: string;
    arabic: string;
    latin: string;
    translation: string;
    count?: number; // Recommended count (e.g. 33x, 100x)
    note?: string; // Additional instruction e.g. "Dibaca 3x"
}

export interface MissionContent {
    id: string;
    intro?: string;
    readings?: Reading[];
    guides?: string[]; // Step-by-step guide (e.g. for Sholat)
    fadhilah: string[]; // List of benefits/keutamaan
    source?: string; // Source reference details
}

export const MISSION_CONTENTS: Record<string, MissionContent> = {
    // DZIKIR PAGI
    'doa_pagi': {
        id: 'doa_pagi',
        intro: 'Dzikir pagi adalah pembuka pintu rezeki dan pelindung diri hingga sore hari.',
        fadhilah: [
            'Dilindungi Allah dari segala marabahaya hingga sore',
            'Mendapatkan ketenangan hati',
            'Dicukupkan segala kebutuhan dunia dan akhirat',
            'Menghapus dosa-dosa kecil'
        ],
        source: 'Al-Ma\'tsurat (Hasan Al-Banna), Himpunan Doa dari Rasulullah SAW',
        readings: [
            {
                title: "Ayat Kursi",
                arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
                latin: "Allāhu lā ilāha illā huwal-ḥayyul-qayyūm, lā ta'khużuhụ sinatuw wa lā naụm, lahụ mā fis-samāwāti wa mā fil-arḍ, man żallażī yasyfa'u 'indahū illā bi`iżnih, ya'lamu mā baina aidīhim wa mā khalfahum, wa lā yuḥīṭụna bisyai`im min 'ilmihī illā bimā syā`, wasi'a kursiyyuhus-samāwāti wal-arḍ, wa lā ya`ụduhụ ḥifẓuhumā, wa huwal-'aliyyul-'aẓīm.",
                translation: "Allah, tidak ada tuhan selain Dia. Yang Maha Hidup, Yang terus menerus mengurus (makhluk-Nya), tidak mengantuk dan tidak tidur. Milik-Nya apa yang ada di langit dan apa yang ada di bumi. Tidak ada yang dapat memberi syafaat di sisi-Nya tanpa izin-Nya. Dia mengetahui apa yang di hadapan mereka dan apa yang di belakang mereka, dan mereka tidak mengetahui sesuatu apa pun tentang ilmu-Nya melainkan apa yang Dia kehendaki. Kursi-Nya meliputi langit dan bumi. Dan Dia tidak merasa berat memelihara keduanya, dan Dia Maha Tinggi, Maha Besar.",
                note: "Dibaca 1x"
            },
            {
                title: "Surah Al-Ikhlas, Al-Falaq, An-Naas",
                arabic: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ . قُلْ هُوَ اللَّهُ أَحَدٌ ...",
                latin: "Qul huwallāhu aḥad...",
                translation: "Katakanlah: Dialah Allah, Yang Maha Esa...",
                note: "Masing-masing dibaca 3x"
            },
            {
                title: "Sayyidul Istighfar",
                arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
                latin: "Allahumma anta rabbī lā ilāha illā anta khalaqtanī wa anā 'abduka wa anā 'alā 'ahdika wa wa'dika mastaṭa'tu a'ūżubika min syarri mā ṣana'tu abū'u laka bini'matika 'alayya wa abū'u laka biżanbī fagfir lī fa innahū lā yagfiruż-żunūba illā anta",
                translation: "Ya Allah, Engkau adalah Tuhanku, tidak ada Tuhan yang berhak disembah selain Engkau. Engkau telah menciptakanku dan aku adalah hamba-Mu. Aku menetapi perjanjian-Mu dan janji-Mu sesuai dengan kemampuanku. Aku berlindung kepada-Mu dari keburukan perbuatanku, aku mengakui nikmat-Mu kepadaku dan aku mengakui dosaku kepada-Mu, maka ampunilah aku. Sebab tidak ada yang dapat mengampuni dosa selain Engkau.",
                note: "Dibaca 1x"
            }
        ]
    },

    // DZIKIR SORE
    'doa_sore': {
        id: 'doa_sore',
        intro: 'Dzikir sore menutup aktifitas harian dengan perlindungan dan rasa syukur.',
        fadhilah: [
            'Dilindungi dari gangguan setan di malam hari',
            'Menutup hari dengan pahala',
            'Menenangkan jiwa setelah seharian beraktivitas'
        ],
        source: 'Al-Ma\'tsurat',
        readings: [
            {
                title: "Ayat Kursi",
                arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...",
                latin: "Allāhu lā ilāha illā huwal-ḥayyul-qayyūm...",
                translation: "Allah, tidak ada tuhan selain Dia...",
                note: "Dibaca 1x"
            },
            {
                title: "Doa Perlindungan",
                arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
                latin: "A'uudzu bikalimaatillaahit-taammaati min syarri maa khalaq",
                translation: "Aku berlindung dengan kalimat-kalimat Allah yang sempurna dari kejahatan makhluk yang diciptakan-Nya.",
                note: "Dibaca 3x"
            }
        ]
    },

    // TASBIH 99
    'tasbih_99': {
        id: 'tasbih_99',
        intro: 'Mengingat Allah dengan memuji, mensucikan, dan mengagungkan-Nya.',
        fadhilah: [
            'Diampuni dosanya walau sebanyak buih di lautan (jika ditutup Lailahaillallah...)',
            'Tanaman surga bagi yang membacanya',
            'Menenangkan hati dan pikiran'
        ],
        source: 'HR. Muslim no. 597',
        readings: [
            {
                title: "Subhanallah (Tasbih)",
                arabic: "سُبْحَانَ اللَّهِ",
                latin: "Subhanallah",
                translation: "Maha Suci Allah",
                note: "33x"
            },
            {
                title: "Alhamdulillah (Tahmid)",
                arabic: "الْحَمْدُ لِلَّهِ",
                latin: "Alhamdulillah",
                translation: "Segala Puji Bagi Allah",
                note: "33x"
            },
            {
                title: "Allahu Akbar (Takbir)",
                arabic: "اللَّهُ أَكْبَرُ",
                latin: "Allahu Akbar",
                translation: "Allah Maha Besar",
                note: "33x"
            }
        ]
    },

    // SHALAWAT 100
    'shalawat_100': {
        id: 'shalawat_100',
        intro: 'Membaca shalawat kepada Nabi Muhammad SAW.',
        fadhilah: [
            'Barangsiapa bershalawat kepadaku 1x, Allah akan bershalawat kepadanya 10x',
            'Mendapat syafaat di hari kiamat',
            'Dikabulkannya doa-doa'
        ],
        source: 'HR. Muslim',
        readings: [
            {
                title: "Shalawat Nabi",
                arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ",
                latin: "Allahumma sholli 'ala Muhammad wa 'ala aali Muhammad",
                translation: "Ya Allah, berilah shalawat kepada Muhammad dan keluarga Muhammad",
                note: "100x"
            }
        ]
    },

    // SHOLAT JUMAT
    'sholat_jumat': {
        id: 'sholat_jumat',
        intro: 'Kewajiban mingguan bagi laki-laki muslim.',
        fadhilah: [
            'Menghapus dosa antara dua Jumat',
            'Langkah kaki ke masjid bernilai puasa dan sholat setahun (jika datang awal)',
            'Hari raya pekanan umat Islam'
        ],
        guides: [
            'Mandi sunnah Jumat',
            'Memakai wewangian dan pakaian terbaik',
            'Berangkat lebih awal ke masjid',
            'Sholat Tahiyatul Masjid',
            'Mendengarkan khutbah dengan seksama (dilarang berbicara)',
            'Sholat 2 rakaat berjamaah'
        ],
        source: 'Hadits Riwayat Bukhari & Muslim'
    },

    // SHOLAT DHUHA
    'sholat_dhuha': {
        id: 'sholat_dhuha',
        intro: 'Sedekah bagi setiap persendian tubuh (360 sendi) di pagi hari.',
        fadhilah: [
            'Dicukupkan rezekinya pada hari itu',
            'Pengganti sedekah bagi seluruh persendian',
            'Wajah bercahaya dan hati tenang',
            'Dibangunkan rumah di surga (bagi yang sholat 12 rakaat)'
        ],
        guides: [
            'Waktu: Mulai saat matahari setinggi tombak (sekitar 15 menit setelah terbit) hingga 15 menit sebelum dzuhur.',
            'Jumlah Rakaat: Minimal 2 rakaat, bisa 4, 8, hingga 12 rakaat.',
            'Niat: "Ushalli sunnatad-dhuhaa rak\'ataini lillaahi ta\'aalaa."'
        ],
        source: 'HR. Muslim, Abu Dawud, Tirmidzi'
    }
};
