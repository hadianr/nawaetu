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
    niat?: {
        munfarid: Reading; // Sendiri
        makmum?: Reading;   // Berjamaah (optional)
    };
    readings?: Reading[];
    guides?: string[];
    fadhilah: string[];
    source?: string;
}

export const MISSION_CONTENTS: Record<string, MissionContent> = {
    // SHOLAT WAJIB 5 WAKTU - MALE
    'sholat_subuh_male': {
        id: 'sholat_subuh_male',
        intro: 'Sholat Subuh berjamaah disaksikan oleh para malaikat dan lebih baik dari dunia seisinya.',
        fadhilah: [
            'Pahala sholat semalam suntuk (berjamaah)',
            'Berada dalam jaminan/perlindungan Allah',
            'Disaksikan oleh Malaikat siang dan malam',
            'Pahala 27 derajat lebih tinggi'
        ],
        niat: {
            munfarid: {
                title: "Niat Sholat Subuh (Sendiri)",
                arabic: "أُصَلِّى فَرْضَ الصُّبْح رَكَعتَيْنِ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لله تَعَالَى",
                latin: "Ushalli fardhas-subhi rak'ataini mustaqbilal qiblati adaa'an lillaahi ta'aalaa",
                translation: "Aku niat melakukan shalat fardu subuh 2 rakaat, sambil menghadap qiblat, saat ini, karena Allah ta'ala."
            },
            makmum: {
                title: "Niat Sholat Subuh (Makmum)",
                arabic: "أُصَلِّى فَرْضَ الصُّبْح رَكَعتَيْنِ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً مَأْمُوْمًا لله تَعَالَى",
                latin: "Ushalli fardhas-subhi rak'ataini mustaqbilal qiblati adaa'an ma'muuman lillaahi ta'aalaa",
                translation: "Aku niat melakukan shalat fardu subuh 2 rakaat, sambil menghadap qiblat, sebagai makmum, karena Allah ta'ala."
            }
        },
        readings: [
            {
                title: "Doa Qunut",
                arabic: "اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ، وَعَافِنِي فِيمَنْ عَافَيْتَ، وَتَوَلَّنِي فِيمَنْ تَوَلَّيْتَ، وَبَارِكْ لِي فِيمَا أَعْطَيْتَ، وَقِنِي شَرَّ مَا قَضَيْتَ، فَإِنَّكَ تَقْضِي وَلَا يُقْضَى عَلَيْكَ، وَإِنَّهُ لَا يَذِلُّ مَنْ وَالَيْتَ، وَلَا يَعِزُّ مَنْ عَادَيْتَ، تَبَارَكْتَ رَبَّنَا وَتَعَالَيْتَ، فَلَكَ الْحَمْدُ عَلَى مَا قَضَيْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ، وَصَلَّى اللهُ عَلَى سَيِّدِنَا مُحَمَّدٍ النَّبِيِّ الْأُمِّيِّ وَعَلَى آلِهِ وَصَحْبِهِ وَسَلَّمَ",
                latin: "Allahummahdinii fiiman hadait, wa 'aafinii fiiman 'aafait, wa tawallanii fiiman tawallait, wa baarik lii fiima a'thait, wa qinii syarra maa qadhait. Fa innaka taqdhii wa laa yuqdhaa 'alaik, wa innahu laa yadzillu man waalaiit, wa laa ya'izzu man 'aadait, tabaarakta rabbanaa wa ta'aalait. Falakal hamdu 'alaa maa qadhait, astaghfiruka wa atuubu ilaik. Wa shallallaahu 'alaa sayyidinaa muhammadin nabiyyil ummiyyi wa 'alaa aalihi wa shahbihi wa sallam.",
                translation: "Ya Allah, berilah aku petunjuk sebagaimana orang yang Engkau beri petunjuk, berilah kesehatan sebagaimana orang yang Engkau beri kesehatan, peliharalah aku sebagaimana orang yang Engkau pelihara, berakahilah apa yang Engkau berikan, lindungilah aku dari keburukan takdir-Mu. Sesungguhnya Engkau yang menetapkan dan tidak ada yang menetapkan atas-Mu. Tidak akan hina orang yang Engkau lindungi dan tidak akan mulia orang yang Engkau musuhi. Maha Suci Engkau Wahai Tuhan kami dan Maha Tinggi Engkau. Segala puji bagi-Mu atas ketetapan-Mu. Aku memohon ampun dan bertaubat kepada-Mu. Dan semoga sholawat serta salam tercurah kepada Nabi Muhammad, keluarga dan sahabatnya.",
                note: "Sunnah Muakkad (Syafi'i)"
            }
        ],
        guides: [
            'Waktu: Terbit fajar shadiq hingga terbit matahari',
            'Utamakan berjamaah di masjid bagi laki-laki.'
        ],
        source: 'HR. Muslim'
    },
    'sholat_subuh_female': {
        id: 'sholat_subuh_female',
        intro: 'Sholat tepat waktu di rumah adalah sebaik-baik keadaan bagi wanita muslimah.',
        fadhilah: [
            'Sebaik-baik sholat wanita adalah di bagian terdalam rumahnya',
            'Pahala ketaatan yang sempurna',
            'Terhindar dari fitnah dan menjaga kehormatan'
        ],
        niat: {
            munfarid: {
                title: "Niat Sholat Subuh (Sendiri)",
                arabic: "أُصَلِّى فَرْضَ الصُّبْح رَكَعتَيْنِ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لله تَعَالَى",
                latin: "Ushalli fardhas-subhi rak'ataini mustaqbilal qiblati adaa'an lillaahi ta'aalaa",
                translation: "Aku niat melakukan shalat fardu subuh 2 rakaat, sambil menghadap qiblat, saat ini, karena Allah ta'ala."
            }
        },
        readings: [
            {
                title: "Doa Qunut",
                arabic: "اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ، وَعَافِنِي فِيمَنْ عَافَيْتَ، وَتَوَلَّنِي فِيمَنْ تَوَلَّيْتَ، وَبَارِكْ لِي فِيمَا أَعْطَيْتَ، وَقِنِي شَرَّ مَا قَضَيْتَ، فَإِنَّكَ تَقْضِي وَلَا يُقْضَى عَلَيْكَ، وَإِنَّهُ لَا يَذِلُّ مَنْ وَالَيْتَ، وَلَا يَعِزُّ مَنْ عَادَيْتَ، تَبَارَكْتَ رَبَّنَا وَتَعَالَيْتَ، فَلَكَ الْحَمْدُ عَلَى مَا قَضَيْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ، وَصَلَّى اللهُ عَلَى سَيِّدِنَا مُحَمَّدٍ النَّبِيِّ الْأُمِّيِّ وَعَلَى آلِهِ وَصَحْبِهِ وَسَلَّمَ",
                latin: "Allahummahdinii fiiman hadait, wa 'aafinii fiiman 'aafait, wa tawallanii fiiman tawallait, wa baarik lii fiima a'thait, wa qinii syarra maa qadhait. Fa innaka taqdhii wa laa yuqdhaa 'alaik, wa innahu laa yadzillu man waalaiit, wa laa ya'izzu man 'aadait, tabaarakta rabbanaa wa ta'aalait. Falakal hamdu 'alaa maa qadhait, astaghfiruka wa atuubu ilaik. Wa shallallaahu 'alaa sayyidinaa muhammadin nabiyyil ummiyyi wa 'alaa aalihi wa shahbihi wa sallam.",
                translation: "Ya Allah, berilah aku petunjuk sebagaimana orang yang Engkau beri petunjuk, berilah kesehatan sebagaimana orang yang Engkau beri kesehatan, peliharalah aku sebagaimana orang yang Engkau pelihara, berakahilah apa yang Engkau berikan, lindungilah aku dari keburukan takdir-Mu. Sesungguhnya Engkau yang menetapkan dan tidak ada yang menetapkan atas-Mu. Tidak akan hina orang yang Engkau lindungi dan tidak akan mulia orang yang Engkau musuhi. Maha Suci Engkau Wahai Tuhan kami dan Maha Tinggi Engkau. Segala puji bagi-Mu atas ketetapan-Mu. Aku memohon ampun dan bertaubat kepada-Mu. Dan semoga sholawat serta salam tercurah kepada Nabi Muhammad, keluarga dan sahabatnya.",
                note: "Sunnah Muakkad (Syafi'i)"
            }
        ],
        guides: [
            'Waktu: Terbit fajar shadiq hingga terbit matahari',
            'Tunaikan di rumah, di tempat yang tenang/khusus sholat (Musholla rumah).'
        ],
        source: 'HR. Abu Daud'
    },
    'sholat_dzuhur_male': {
        id: 'sholat_dzuhur_male',
        intro: 'Saat matahari tergelincir, pintu langit dibuka. Waktu utama untuk memohon ampunan.',
        fadhilah: [
            'Waktu dibukanya pintu-pintu langit',
            'Pahala 27 derajat berjamaah',
            'Dijauhkan dari api neraka'
        ],
        guides: ['Segera ke masjid saat adzan berkumandang.'],
        source: 'HR. Bukhari'
    },
    'sholat_dzuhur_female': {
        id: 'sholat_dzuhur_female',
        intro: 'Sholat Dzuhur tepat waktu di rumah adalah bukti ketaatan dan menjaga waktu.',
        fadhilah: [
            'Waktu dibukanya pintu-pintu langit',
            'Ketenangan di tengah kesibukan harian'
        ],
        guides: ['Segerakan sholat setelah waktu masuk, meski sibuk dengan urusan rumah.'],
        source: 'Fiqih Wanita'
    },
    'sholat_ashar_male': {
        id: 'sholat_ashar_male',
        intro: 'Sholat Wustha yang harus dijaga dengan berjamaah.',
        fadhilah: ['Masuk surga (Bardain)', 'Pahala dilipatgandakan'],
        source: 'HR. Bukhari'
    },
    'sholat_ashar_female': {
        id: 'sholat_ashar_female',
        intro: 'Menjaga sholat Ashar di rumah di sela-sela waktu istirahat sore.',
        fadhilah: ['Masuk surga karena menjaga Bardain (Subuh & Ashar)', 'Perlindungan sore hari'],
        source: 'HR. Bukhari'
    },
    'sholat_maghrib_male': {
        id: 'sholat_maghrib_male',
        intro: 'Waktu singkat yang utama untuk diisi dengan berjamaah di masjid.',
        fadhilah: ['Waktu mustajab doa antara adzan iqamah', 'Menghapus dosa seharian'],
        source: 'HR. Muslim'
    },
    'sholat_maghrib_female': {
        id: 'sholat_maghrib_female',
        intro: 'Waktu singkat saat matahari tenggelam. Segerakanlah di rumah.',
        fadhilah: ['Waktu mustajab doa', 'Keberkahan awal malam bagi keluarga'],
        source: 'HR. Muslim'
    },
    'sholat_isya_male': {
        id: 'sholat_isya_male',
        intro: 'Sholat terberat bagi munafik, namun cahaya sempurna di hari kiamat.',
        fadhilah: ['Pahala sholat setengah malam', 'Cahaya sempurna di Kiamat'],
        source: 'HR. Muslim'
    },
    'sholat_isya_female': {
        id: 'sholat_isya_female',
        intro: 'Menutup hari dengan ketaatan sholat Isya sebelum istirahat.',
        fadhilah: ['Ketentraman tidur', 'Perlindungan malam'],
        source: 'HR. Muslim'
    },

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
                latin: "Allāhu lā ilāha illā huwal-ḥayyul-qayyūm, lā ta'khużuhụ sinatuw wa lā naụm. Lahụ mā fis-samāwāti wa mā fil-arḍ. Man żallażī yasyfa'u 'indahū illā bi`iżnih. Ya'lamu mā baina aidīhim wa mā khalfahum. Wa lā yuḥīṭụna bisyai`im min 'ilmihī illā bimā syā`. Wasi'a kursiyyuhus-samāwāti wal-arḍ. Wa lā ya`ụduhụ ḥifẓuhumā. Wa huwal-'aliyyul-'aẓīm.",
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
                arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
                latin: "Allāhu lā ilāha illā huwal-ḥayyul-qayyūm, lā ta'khużuhụ sinatuw wa lā naụm. Lahụ mā fis-samāwāti wa mā fil-arḍ. Man żallażī yasyfa'u 'indahū illā bi`iżnih. Ya'lamu mā baina aidīhim wa mā khalfahum. Wa lā yuḥīṭụna bisyai`im min 'ilmihī illā bimā syā`. Wasi'a kursiyyuhus-samāwāti wal-arḍ. Wa lā ya`ụduhụ ḥifẓuhumā. Wa huwal-'aliyyul-'aẓīm.",
                translation: "Allah, tidak ada tuhan selain Dia. Yang Maha Hidup, Yang terus menerus mengurus (makhluk-Nya), tidak mengantuk dan tidak tidur. Milik-Nya apa yang ada di langit dan apa yang ada di bumi. Tidak ada yang dapat memberi syafaat di sisi-Nya tanpa izin-Nya. Dia mengetahui apa yang di hadapan mereka dan apa yang di belakang mereka, dan mereka tidak mengetahui sesuatu apa pun tentang ilmu-Nya melainkan apa yang Dia kehendaki. Kursi-Nya meliputi langit dan bumi. Dan Dia tidak merasa berat memelihara keduanya, dan Dia Maha Tinggi, Maha Besar.",
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
        intro: 'Tasbih 99x adalah dzikir ba\'da sholat yang terdiri dari: 33x Subhanallah, 33x Alhamdulillah, dan 33x Allahu Akbar. Amalan ini ringan di lisan namun berat dalam timbangan pahala.',
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
    },

    // SHOLAT BERJAMAAH (MALE SPECIFIC)
    'sholat_subuh_jamaah': {
        id: 'sholat_subuh_jamaah',
        intro: 'Sholat Subuh berjamaah memiliki pahala setara dengan sholat semalam suntuk.',
        fadhilah: [
            'Mendapatkan cahaya yang sempurna di hari kiamat',
            'Berada di bawah naungan perlindungan Allah seharian',
            'Mendapatkan pahala 27 derajat lebih tinggi',
            'Disaksikan oleh para malaikat siang dan malam'
        ],
        source: 'HR. Muslim & HR. Tirmidzi'
    },
    'sholat_dzuhur_jamaah': {
        id: 'sholat_dzuhur_jamaah',
        intro: 'Mengerjakan sholat fardhu berjamaah di masjid bagi laki-laki adalah Sunnah Muakkad.',
        fadhilah: [
            'Mendapatkan pahala 27 derajat',
            'Langkah kaki ke masjid menghapus dosa dan menaikkan derajat',
            'Menumbuhkan rasa persaudaraan sesama muslim',
            'Mendapatkan doa dari para malaikat selama di masjid'
        ],
        source: 'HR. Bukhari & Muslim'
    },
    'sholat_ashar_jamaah': {
        id: 'sholat_ashar_jamaah',
        intro: 'Ashar adalah "Sholat Wustha", menjaga sholat ini sangat ditekankan.',
        fadhilah: [
            'Tidak akan masuk neraka orang yang sholat sebelum terbit dan terbenam matahari',
            'Pahala 27 derajat berjamaah',
            'Mencegah terhapusnya amal (bagi yang meninggalkan ashar)'
        ],
        source: 'HR. Muslim no. 634'
    },
    'sholat_maghrib_jamaah': {
        id: 'sholat_maghrib_jamaah',
        intro: 'Bersegera ke masjid untuk maghrib berjamaah adalah keutamaan.',
        fadhilah: [
            'Pahala 27 derajat berjamaah',
            'Menjaga fitrah kebaikan dalam diri',
            'Waktu mustajab untuk berdoa di antara maghrib dan isya'
        ],
        source: 'HR. Bukhari & Muslim'
    },
    'sholat_isya_jamaah': {
        id: 'sholat_isya_jamaah',
        intro: 'Sholat Isya berjamaah pahalanya setara dengan sholat setengah malam.',
        fadhilah: [
            'Pahala 27 derajat berjamaah',
            'Pembeda dengan orang munafik (karena beratnya isya & subuh)',
            'Mendapatkan ketenangan tidur dalam lindungan Allah'
        ],
        source: 'HR. Muslim no. 656'
    },

    // PERSIAPAN RAMADHAN (SYABAN)
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
    'quran_10_ayat': {
        id: 'quran_10_ayat',
        intro: 'Membaca Al-Quran adalah perdagangan yang tidak akan pernah merugi. 10 Ayat sehari adalah langkah awal membangun kebiasaan.',
        fadhilah: [
            'Satu huruf diganjar 10 kebaikan',
            'Syafaat (penolong) di hari kiamat bagi pembacanya',
            'Menurunkan ketenangan (Sakinah) dan rahmat',
            'Sebaik-baik manusia adalah yang belajar Al-Quran dan mengajarkannya'
        ],
        guides: [
            'Berwudhu sebelum membaca',
            'Menghadap Kiblat',
            'Mulai dengan Ta\'awudz (A\'udzu billahi minasy syaithanir rajim) dan Basmalah',
            'Baca dengan Tartil (perlahan dan jelas)'
        ],
        source: 'HR. Tirmidzi & Bukhari'
    },
    'puasa_sunnah': {
        id: 'puasa_sunnah',
        intro: 'Puasa Senin dan Kamis adalah kebiasaan Rasulullah SAW, di mana amal perbuatan manusia dilaporkan kepada Allah.',
        fadhilah: [
            'Pintu Surga khusus (Ar-Rayyan) bagi orang yang berpuasa',
            'Bau mulut orang puasa lebih harum di sisi Allah dari minyak kasturi',
            'Dijauhkan wajahnya dari api neraka sejauh 70 tahun perjalanan',
            'Doa orang berpuasa tidak akan ditolak hingga berbuka'
        ],
        niat: {
            munfarid: {
                title: "Niat Puasa Senin",
                arabic: "نَوَيْتُ صَوْمَ يَوْمِ الِاثْنَيْنِ لِلّٰهِ تَعَالَى",
                latin: "Nawaitu sauma yaumil itsnaini lillāhi ta'ālā",
                translation: "Saya niat puasa hari Senin karena Allah Ta'āla."
            },
            makmum: {
                title: "Niat Puasa Kamis",
                arabic: "نَوَيْتُ صَوْمَ يَوْمِ الْخَمِيسِ لِلّٰهِ تَعَالَى",
                latin: "Nawaitu sauma yaumil khamīsi lillāhi ta'ālā",
                translation: "Saya niat puasa hari Kamis karena Allah Ta'āla."
            }
        },
        source: 'HR. Tirmidzi & Muslim'
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
    'qadha_puasa_tracker': { // Alias to qadha_puasa logic
        id: 'qadha_puasa_tracker',
        intro: 'Hutang kepada Allah (puasa wajib) lebih berhak untuk ditunaikan. Gunakan tracker ini untuk mencatat progress pelunasan.',
        fadhilah: [
            'Gugurnya kewajiban/dosa meninggalkan puasa',
            'Disiplin dalam menunaikan hutang ibadah',
            'Ketenangan hati menyambut Ramadhan baru'
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
    'dzikir_haid': {
        id: 'dzikir_haid',
        intro: 'Wanita yang sedang haid (udzur syar\'i) tidak boleh sholat/puasa, namun tetap bisa panen pahala dengan dzikir dan doa.',
        fadhilah: [
            'Tetap terhubung dengan Allah meski sedang berhalangan',
            'Mengisi waktu luang dengan pahala',
            'Menjaga hati agar tidak "kering" dari mengingat Allah'
        ],
        readings: [
            {
                title: "Istighfar",
                arabic: "أَسْتَغْفِرُ ٱللَّهَ",
                latin: "Astaghfirullah",
                translation: "Aku memohon ampun kepada Allah",
                note: "Perbanyak sebanyak-banyaknya"
            },
            {
                title: "Shalawat",
                arabic: "اللهم صل على محمد",
                latin: "Allahumma sholli 'ala Muhammad",
                translation: "Ya Allah sampaikanlah shalawat kepada Nabi Muhammad",
                note: "Perbanyak shalawat"
            }
        ],
        guides: [
            'Mendengarkan Murottal Al-Quran (tanpa menyentuh mushaf)',
            'Membaca buku-buku agama/sirah',
            'Berdoa di waktu mustajab',
            'Sedekah dan memberi makan orang lain'
        ],
        source: 'Ijma Ulama'
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
