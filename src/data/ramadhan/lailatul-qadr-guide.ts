import { EvidenceData, IntentionData } from "./types";

// 1. Dzikir & Doa Lailatul Qadar
// 2. Panduan I'tikaf
// 3. Panduan Sholat Sunnah (Tahajjud, Taubat, Tasbih, Hajat)

export type GuideSection = {
    id: string;
    title: string;
    title_en?: string;
    items: GuideItem[];
};

export type GuideItem = {
    id: string;
    title: string;
    title_en?: string;
    description?: string;
    description_en?: string;
    icon?: string;
    arabic?: string;
    latin?: string;
    translation?: string;
    translation_en?: string;
    steps?: string[];
    steps_en?: string[];
    dalil?: EvidenceData;
};

// ============================================================================
// DATA: I'TIKAF
// ============================================================================
export const ITIKAF_GUIDE_ITEMS: GuideItem[] = [
    {
        id: "itikaf_niat",
        title: "Niat I'tikaf",
        title_en: "Intention for I'tikaf",
        icon: "🕌",
        description: "Dibaca saat mulai memasuki masjid dengan niat berdiam diri untuk beribadah.",
        description_en: "Read upon entering the mosque with the intention of staying to worship.",
        arabic: "نَوَيْتُ الاِعْتِكَافَ فِي هَذَا المَسْجِدِ لِلّهِ تَعَالَى",
        latin: "Nawaitul i'tikaafa fii haadzal masjidi lillaahi ta'aalaa",
        translation: "Aku berniat i'tikaf di masjid ini karena Allah ta'ala.",
        translation_en: "I intend to perform i'tikaf in this mosque for the sake of Allah the Almighty.",
        dalil: {
            id: "dalil_itikaf_niat",
            shortRef: "HR. Bukhari & Muslim",
            translation: "Bahwasanya Nabi shallallahu 'alaihi wa sallam selalu beri'tikaf pada sepuluh hari terakhir bulan Ramadhan sampai Allah wafatkan beliau.",
            source: "HR. Bukhari No. 2026 & Muslim No. 1172 (Muttafaqun 'Alaih)"
        }
    },
    {
        id: "itikaf_persiapan",
        title: "Persiapan Sebelum I'tikaf",
        title_en: "Preparation Before I'tikaf",
        icon: "🎒",
        description: "Hal-hal yang perlu disiapkan sebelum memulai i'tikaf agar berjalan lancar dan khusyuk.",
        description_en: "Things to prepare before starting i'tikaf for it to run smoothly and with devotion.",
        steps: [
            "Mandi jinabat (mandi besar) sebelum masuk masjid.",
            "Siapkan Al-Quran, buku doa, dan catatan dzikir.",
            "Bawa perlengkapan ibadah: sajadah, mukena/sarung, miswak.",
            "Siapkan makanan/minuman ringan agar tidak harus sering keluar.",
            "Pastikan semua kewajiban dunia (pekerjaan, keluarga) sudah dikomunikasikan.",
            "Memasuki masjid sebelum terbenam matahari malam ke-21 (awal 10 malam terakhir).",
            "Niatkan dengan tulus hanya untuk mencari ridho Allah dan Lailatul Qadr."
        ],
        steps_en: [
            "Perform ghusl (ritual bathing) before entering the mosque.",
            "Prepare Quran, dua books, and dhikr notes.",
            "Bring worship essentials: prayer mat, prayer garments, miswak.",
            "Prepare light food/drinks to avoid frequent exits.",
            "Ensure worldly obligations (work, family) have been communicated.",
            "Enter the mosque before sunset on the 21st night (start of the last 10 nights).",
            "Intend sincerely to seek Allah's pleasure and Lailatul Qadr."
        ]
    },
    {
        id: "itikaf_adab",
        title: "Adab dan Aturan I'tikaf",
        title_en: "Etiquette and Rules of I'tikaf",
        icon: "📜",
        steps: [
            "Memperbarui niat ikhlas semata-mata karena Allah.",
            "Berada di dalam masjid. Boleh keluar sebentar hanya untuk hajat mendesak (buang air, wudhu, makan jika tidak ada yang mengantar).",
            "Menjauhi obrolan duniawi yang tidak bermanfaat.",
            "Fokus pada ibadah: Sholat, membaca Al-Quran, berdzikir, dan berdoa.",
            "Tidak keluar masjid tanpa alasan syar'i agar i'tikaf tidak batal."
        ],
        steps_en: [
            "Renewing sincere intention solely for the sake of Allah.",
            "Staying inside the mosque. May briefly exit only for urgent needs (restroom, wudu, eating if no one brings food).",
            "Avoiding useless worldly conversations.",
            "Focusing on worship: Prayer, reading the Quran, dhikr, and supplication.",
            "Not leaving the mosque without a valid reason so the i'tikaf is not nullified."
        ],
        dalil: {
            id: "dalil_itikaf_adab",
            shortRef: "HR. Abu Dawud",
            translation: "Sunnah bagi orang yang beri'tikaf adalah tidak menjenguk orang sakit, tidak melayat jenazah, tidak menyentuh wanita dan mencumbunya, serta tidak keluar masjid kecuali untuk keperluan yang harus dipenuhi.",
            source: "HR. Abu Dawud No. 2473 (Shahih)"
        }
    },
    {
        id: "itikaf_jadwal",
        title: "Jadwal Amalan Harian I'tikaf",
        title_en: "Daily I'tikaf Schedule",
        icon: "🗓️",
        description: "Susunan amalan yang bisa menjadi panduan selama beri'tikaf agar ibadah lebih terstruktur dan produktif.",
        description_en: "A suggested daily schedule during i'tikaf so your worship is more structured and productive.",
        steps: [
            "Maghrib – Setelah sholat Maghrib berjamaah, membaca Surat Al-Kahfi (anjuran malam Jum'at) atau dzikir petang.",
            "Isya – Sholat Isya berjamaah (jika ada Taraweh, ikuti). Setelah itu sholat Witir.",
            "21.00–00.00 – Membaca Al-Quran dengan tartil (target 1 juz atau lebih per malam).",
            "00.00–02.00 – Istirahat singkat (boleh tidur di masjid agar tetap sah i'tikaf).",
            "02.00–Subuh – Bangun untuk Tahajjud, Taubat, Hajat, dan Tasbih. Panjangkan sujud dan doa.",
            "Subuh – Sholat Subuh berjamaah, dilanjut dzikir pagi dan membaca Surat As-Sajdah & Al-Insan.",
            "Pagi–Zuhur – Membaca Al-Quran, dzikir, atau menghafal. Juga waktu sahur jika pada hari puasa."
        ]
    },
    {
        id: "itikaf_pembatal",
        title: "Hal yang Membatalkan I'tikaf",
        title_en: "Actions that Nullify I'tikaf",
        icon: "⚠️",
        description: "Penting diketahui agar i'tikaf yang kita jalankan sah di sisi Allah.",
        description_en: "Important to know so that our i'tikaf is valid before Allah.",
        steps: [
            "Keluar masjid tanpa alasan syar'i yang mendesak.",
            "Murtad (keluar dari Islam) — na'udzubillah.",
            "Hilang akal (gila) atau pingsan yang lama.",
            "Haid atau nifas bagi wanita.",
            "Jima' (hubungan suami-istri) meskipun dilakukan di luar masjid.",
            "Adapun tidur, makan, minum, dan berbicara (yang dibolehkan) tidak membatalkan i'tikaf."
        ],
        steps_en: [
            "Leaving the mosque without a valid shar'i reason.",
            "Apostasy — may Allah protect us.",
            "Loss of consciousness or prolonged fainting.",
            "Menstruation or postnatal bleeding for women.",
            "Sexual intercourse, even if done outside the mosque.",
            "Sleeping, eating, drinking, and permissible talking do not nullify i'tikaf."
        ],
        dalil: {
            id: "dalil_itikaf_pembatal",
            shortRef: "Al-Baqarah: 187",
            translation: "Janganlah kamu campuri mereka (istri) itu, sedang kamu beri'tikaf dalam masjid.",
            source: "QS. Al-Baqarah: 187 (Shahih Al-Quran)"
        }
    },
    {
        id: "itikaf_niat_keluar",
        title: "Niat Keluar & Kembali I'tikaf",
        title_en: "Intention to Exit & Return I'tikaf",
        icon: "🚶",
        description: "Jika terpaksa keluar masjid dengan alasan yang dibenarkan syariat, baca niat ini saat akan kembali.",
        description_en: "If forced to leave the mosque for a valid reason, read this intention upon returning.",
        arabic: "نَوَيْتُ الرُّجُوعَ إِلَى الاِعْتِكَافِ لِلَّهِ تَعَالَى",
        latin: "Nawaitu rujuu'a ilal i'tikaafi lillaahi ta'aalaa",
        translation: "Aku berniat kembali kepada i'tikaf karena Allah ta'ala.",
        translation_en: "I intend to return to i'tikaf for the sake of Allah the Almighty."
    }
];

// ============================================================================
// DATA: DOA & DZIKIR
// ============================================================================
export const DZIKIR_GUIDE_ITEMS: GuideItem[] = [
    {
        id: "doa_lailatul_qadar",
        title: "Doa Utama Lailatul Qadar",
        title_en: "Primary Lailatul Qadar Supplication",
        description: "Doa yang diajarkan Rasulullah SAW kepada Aisyah RA jika bertemu Lailatul Qadar.",
        icon: "✨",
        arabic: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
        latin: "Allahumma innaka 'afuwwun tuhibbul 'afwa fa'fu 'anni",
        translation: "Ya Allah, Engkau Maha Pemaaf dan Engkau mencintai orang yang meminta maaf, karenanya maafkanlah aku.",
        translation_en: "O Allah, You are forgiving and love forgiveness, so forgive me.",
        dalil: {
            id: "dalil_doa_lailatul_qadar",
            shortRef: "HR. Tirmidzi",
            translation: "Dari Aisyah radhiyallahu 'anha, beliau bertanya: 'Wahai Rasulullah, jika aku mendapati malam Lailatul Qadar, apa yang harus aku ucapkan?' Beliau menjawab: 'Ucapkanlah: Allahumma innaka 'afuwwun tuhibbul 'afwa fa'fu 'anni'.",
            source: "HR. Tirmidzi & Ibnu Majah (Shahih)"
        }
    },
    {
        id: "sayyidul_istighfar",
        title: "Sayyidul Istighfar",
        title_en: "The Chief of Prayers for Forgiveness",
        description: "Rajanya istighfar, sangat dianjurkan dibaca di waktu malam.",
        icon: "🤲",
        arabic: "اللَّهُمَّ أَنْتَ رَبِّيْ لاَ إِلَـهَ إِلاَّ أَنْتَ، خَلَقْتَنِيْ وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوْذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوْءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوْءُ بِذَنْبِيْ فَاغْفِرْ لِيْ فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوْبَ إِلاَّ أَنْتَ",
        latin: "Allahumma anta rabbii laa ilaaha illaa anta, khalaqtanii wa anaa 'abduka wa anaa 'alaa 'ahdika wa wa'dika mas-tatha'tu. a'uudzu bika min syarri maa shana'tu. abuu-u laka bini'matika 'alayya wa abuu-u bidzanbii fagh-firlii fa-innahu laa yaghfirudz dzunuuba illa anta.",
        translation: "Ya Allah, Engkau adalah Tuhanku, tiada tuhan selain Engkau. Engkau yang menciptakanku dan aku adalah hamba-Mu. Aku berada dalam janji-Mu semampuku. Aku berlindung kepada-Mu dari keburukan yang aku perbuat. Aku mengakui nikmat-Mu kepadaku dan aku mengakui dosaku, maka ampunilah aku. Sesungguhnya tiada yang dapat mengampuni dosa selain Engkau.",
        dalil: {
            id: "dalil_sayyidul_istighfar",
            shortRef: "HR. Bukhari",
            translation: "Barangsiapa mengucapkannya pada siang hari dengan meyakininya lalu ia mati pada hari itu sebelum petang hari, maka ia termasuk penghuni surga. Dan barangsiapa mengucapkannya pada malam hari dengan meyakininya lalu ia mati sebelum pagi hari, maka ia termasuk penghuni surga.",
            source: "HR. Bukhari No. 6306 (Shahih)"
        }
    },
    {
        id: "doa_khatam_quran",
        title: "Doa Khatam Al-Quran",
        title_en: "Dua for Completing Quran Recitation",
        description: "Doa yang dianjurkan dibaca setelah khatam membaca Al-Quran.",
        icon: "📖",
        arabic: "اللَّهُمَّ ارْحَمْنِي بِالْقُرآنِ وَاجْعَلْهُ لِي إِمَامًا وَنُورًا وَهُدًى وَرَحْمَةً",
        latin: "Allahummarhamnii bil qur'aani waj'alhu lii imaaman wa nuuran wa hudan wa rahmah",
        translation: "Ya Allah, rahmatilah aku dengan Al-Quran. Jadikanlah ia bagiku sebagai pemimpin, cahaya, petunjuk, dan rahmat.",
        translation_en: "O Allah, have mercy on me through the Quran and make it for me a guide, light, direction, and mercy."
    },
    {
        id: "dzikir_pagi_petang",
        title: "Dzikir Pagi & Petang",
        title_en: "Morning & Evening Remembrance",
        description: "Penjaga hati dan jiwa di 10 malam terakhir — jangan sampai terlewat.",
        icon: "🌅",
        steps: [
            "Ayat Kursi (1x): 'Allahu laa ilaaha illaa huwal hayyul qayyum...' — penjaga dari gangguan setan.",
            "Al-Ikhlas, Al-Falaq, An-Naas (masing-masing 3x): dibaca di pagi dan petang serta sebelum tidur.",
            "Istighfar 100x: 'Astaghfirullahal 'adzim alladzi laa ilaaha illaa huwal hayyul qayyum wa atuubu ilaih'.",
            "Tasbih 100x: 'Subhanallah wa bihamdihi, subhanallahil 'adzim'.",
            "Tahmid: 'Alhamdulillah' 100x.",
            "Takbir: 'Allahu Akbar' 100x.",
            "Tahlil 10x: 'Laa ilaaha illallah wahdahu laa syarikalah, lahul mulku wa lahul hamdu wa huwa 'alaa kulli syai-in qadir'.",
            "Sholawat Ibrahimiyah 10x: 'Allahumma sholli alaa Muhammad wa alaa aali Muhammad kamaa shollayta alaa Ibrahim...'."
        ],
        steps_en: [
            "Ayat al-Kursi (1x): 'Allahu laa ilaaha illaa huwal hayyul qayyum...' — protection from evil.",
            "Al-Ikhlas, Al-Falaq, An-Nas (3x each): recited morning, evening, and before sleeping.",
            "Istighfar 100x: 'Astaghfirullahal 'adzim...'.",
            "Tasbih 100x: 'Subhanallah wa bihamdihi, subhanallahil 'adzim'.",
            "Tahmid: 'Alhamdulillah' 100x.",
            "Takbir: 'Allahu Akbar' 100x.",
            "Tahlil 10x: 'Laa ilaaha illallah wahdahu laa syarikalah...'.",
            "Ibrahim's Salawat 10x."
        ],
        dalil: {
            id: "dalil_dzikir_pagi_petang",
            shortRef: "HR. Bukhari",
            translation: "Barangsiapa membaca Ayat Kursi setiap selesai sholat fardhu, tidak ada yang menghalanginya untuk masuk surga kecuali kematian.",
            source: "HR. An-Nasa'i & Ibnu Hibban (Shahih menurut Al-Albani)"
        }
    },
    {
        id: "dzikir_malam",
        title: "Dzikir Malam 10 Terakhir",
        title_en: "Nightly Dhikr for Last 10 Nights",
        icon: "📿",
        steps: [
            "Membaca Istighfar 100x: Astaghfirullahal 'adzim alladzi laa ilaaha illa huwal hayyul qayyum wa atuubu ilaih",
            "Membaca Tasbih 100x: Subhanallah wa bihamdihi, subhanallahil 'adzim",
            "Membaca Tahmid 100x: Alhamdulillah",
            "Membaca Takbir 100x: Allahu Akbar",
            "Membaca Tahlil 100x: Laa ilaaha illallah wahdahu laa syarikalah, lahul mulku wa lahul hamdu wa huwa 'alaa kulli syai-in qadir",
            "Membaca Sholawat Nabi 100x: Allahumma sholli 'alaa Muhammad wa 'alaa aali Muhammad",
            "Membaca Doa Sapujagat: Rabbana atina fiddunya hasanah wa fil akhiroti hasanah waqina 'adzabannar"
        ],
        dalil: {
            id: "dalil_dzikir_malam",
            shortRef: "HR. Muslim",
            translation: "Barangsiapa yang mengucapkan 'Subhanallah wa bihamdihi' (Maha Suci Allah dan segala puji bagi-Nya) seratus kali dalam sehari, maka kesalahan-kesalahannya akan dihapuskan, walaupun sebanyak buih di lautan.",
            source: "HR. Muslim No. 2691 (Shahih)"
        }
    },
    {
        id: "doa_rabbana",
        title: "Doa-Doa Rabbana Pilihan",
        title_en: "Chosen Rabbana Supplications",
        description: "Kumpulan doa pilihan dari Al-Quran yang sangat dianjurkan diperbanyak di 10 malam terakhir.",
        icon: "📚",
        steps: [
            "Rabbana atina fid dunya hasanah wa fil aakhirati hasanah wa qina 'adzabannar. (Al-Baqarah: 201)",
            "Rabbana innana asmainaa munadiyan yunaadii lil iimaan... (Ali Imran: 193)",
            "Rabbana afrigh 'alainaa shabran wa tsabbit aqdaamanaa wanshurnaa 'alal qaumil kaafiriin. (Al-Baqarah: 250)",
            "Rabbana laa tuzigh quluubanaa ba'da idz hadaytanaa wahab lanaa min ladunka rahmah. (Ali Imran: 8)",
            "Rabbana laa tu'akhidznaa in nasiinaa aw akhtha'naa. (Al-Baqarah: 286)",
            "Rabbanaghfir lii wa liwaalidayya wa lilmu'miniina yawma yaquumul hisaab. (Ibrahim: 41)"
        ],
        steps_en: [
            "Rabbana atina fid dunya hasanah... (Al-Baqarah: 201) — dua for good in this world and the hereafter.",
            "Rabbana innana asmainaa... (Ali Imran: 193) — dua of those who heard the call to faith.",
            "Rabbana afrigh 'alainaa shabran... (Al-Baqarah: 250) — dua for patience and victory.",
            "Rabbana laa tuzigh quluubanaa... (Ali Imran: 8) — dua to keep hearts steadfast.",
            "Rabbana laa tu'akhidznaa... (Al-Baqarah: 286) — dua for forgiveness of mistakes.",
            "Rabbanaghfir lii wa liwaalidayya... (Ibrahim: 41) — dua for forgiveness for oneself and parents."
        ]
    },
    {
        id: "doa_mohon_surga",
        title: "Doa Mohon Surga & Dijauhkan Neraka",
        title_en: "Dua for Paradise & Protection from Hellfire",
        description: "Doa yang paling sering Nabi ﷺ baca — ringkas namun penuh makna.",
        icon: "🌿",
        arabic: "اَللَّهُمَّ إِنِّيْ أَسْأَلُكَ الْجَنَّةَ وَأَعُوْذُ بِكَ مِنَ النَّارِ",
        latin: "Allahumma innii as'alukal jannata wa a'uudzubika minan naar",
        translation: "Ya Allah, sesungguhnya aku memohon kepada-Mu surga dan aku berlindung kepada-Mu dari neraka.",
        translation_en: "O Allah, I ask you for Paradise and I seek refuge in You from the Hellfire.",
        dalil: {
            id: "dalil_doa_surga",
            shortRef: "HR. Abu Dawud",
            translation: "Barangsiapa memohon surga kepada Allah sebanyak tiga kali, maka surga berkata: 'Ya Allah masukkan ia ke dalam surga.' Dan barangsiapa berlindung dari neraka kepada Allah tiga kali, maka neraka berkata: 'Ya Allah jauhkanlah ia dari neraka'.",
            source: "HR. Tirmidzi No. 2572 (Shahih)"
        }
    },
    {
        id: "doa_orangtua",
        title: "Doa untuk Kedua Orangtua",
        title_en: "Dua for Parents",
        description: "Doa terbaik yang bisa dikirim seorang anak kepada orang tuanya, hidup maupun yang telah wafat.",
        icon: "💝",
        arabic: "رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
        latin: "Rabbighfir lii waliwaalidayya warhamhumaa kamaa rabbayaanii shaghiiraa",
        translation: "Ya Tuhanku, ampunilah aku dan kedua orang tuaku, dan kasihilah mereka sebagaimana mereka mengasihiku di waktu kecil.",
        translation_en: "My Lord, forgive me and my parents, and have mercy on them as they raised me as a child.",
        dalil: {
            id: "dalil_doa_orangtua",
            shortRef: "QS. Al-Isra: 24",
            translation: "Rendahkanlah dirimu terhadap mereka berdua dengan penuh kesayangan dan ucapkanlah: 'Wahai Tuhanku, kasihilah mereka keduanya, sebagaimana mereka berdua telah mendidik aku waktu kecil'.",
            source: "QS. Al-Isra: 24"
        }
    }
];

// ============================================================================
// DATA: SHOLAT SUNNAH
// ============================================================================
export const SUNNAH_PRAYERS_GUIDE: GuideItem[] = [
    {
        id: "sholat_tahajjud",
        title: "Sholat Tahajjud",
        title_en: "Tahajjud Prayer",
        description: "Sholat malam yang dikerjakan setelah bangun tidur (walaupun tidur sejenak).",
        icon: "🌌",
        arabic: "أُصَلِّيْ سُنَّةَ التَّهَجُّدِ رَكْعَتَيْنِ لِلَّهِ تَعَالَى",
        latin: "Ushalli sunnatat-tahajjudi rak'ataini lillahi ta'aalaa",
        translation: "Aku niat sholat sunnah Tahajjud dua rakaat karena Allah ta'ala.",
        steps: [
            "Dikerjakan minimal 2 rakaat. Tidak ada batasan maksimal, umumnya ditutup dengan Witir.",
            "Rakaat pertama dianjurkan membaca Surat Al-Kafirun setelah Al-Fatihah.",
            "Rakaat kedua dianjurkan membaca Surat Al-Ikhlas setelah Al-Fatihah.",
            "Waktu terbaik adalah sepertiga malam terakhir (sekitar jam 02.00 hingga sebelum Subuh).",
            "Berdoa panjang di waktu sujud terakhir memohon hajat dunia & akhirat."
        ],
        dalil: {
            id: "dalil_sholat_tahajjud",
            shortRef: "HR. Muslim",
            translation: "Sebaik-baik puasa setelah puasa Ramadhan adalah puasa pada bulan Allah, Muharram. Dan sebaik-baik sholat setelah sholat fardhu adalah sholat malam.",
            source: "HR. Muslim No. 1163 (Shahih)"
        }
    },
    {
        id: "doa_tahajjud",
        title: "Doa Setelah Sholat Tahajjud",
        title_en: "Dua After Tahajjud",
        description: "Doa khusus yang dianjurkan dibaca setelah selesai sholat Tahajjud.",
        icon: "🤲",
        arabic: "اَللّٰهُمَّ لَكَ الْحَمْدُ اَنْتَ قَيِّمُ السَّمَوَاتِ وَاْلاَرْضِ وَمَنْ فِيْهِنَّ، وَلَكَ الْحَمْدُ اَنْتَ مَلِكُ السَّمَوَاتِ وَاْلاَرْضِ وَمَنْ فِيْهِنَّ...",
        latin: "Allahumma lakal hamdu anta qayyimus samawaati wal ardhi wa man fiihinna, wa lakal hamdu anta malikus samawaati wal ardhi wa man fiihinna...",
        translation: "Ya Allah, bagi-Mu segala puji, Engkau-lah penegak langit dan bumi serta segala yang ada di dalamnya...",
        dalil: {
            id: "dalil_doa_tahajjud",
            shortRef: "Muttafaqun 'Alaih",
            translation: "Adalah Rasulullah shallallahu 'alaihi wa sallam apabila bangun untuk sholat malam beliau membaca (doa tersebut).",
            source: "HR. Bukhari No. 1120 & Muslim No. 769 (Shahih)"
        }
    },
    {
        id: "sholat_taubat",
        title: "Sholat Taubat",
        title_en: "Prayer of Repentance",
        description: "Sholat untuk memohon ampunan Allah atas dosa-dosa yang telah lalu.",
        icon: "💧",
        arabic: "أُصَلِّيْ سُنَّةَ التَّوْبَةِ رَكْعَتَيْنِ لِلَّهِ تَعَالَى",
        latin: "Ushalli sunnatat-taubati rak'ataini lillahi ta'aalaa",
        translation: "Aku niat sholat sunnah Taubat dua rakaat karena Allah ta'ala.",
        steps: [
            "Dikerjakan 2 rakaat.",
            "Rakaat pertama setelah Al-Fatihah membaca Surat Al-Kafirun.",
            "Rakaat kedua setelah Al-Fatihah membaca Surat Al-Ikhlas.",
            "Saat sujud terakhir membaca tasbih: 'Subhaana robbiyal a'laa wa bihamdih' (3x), dilanjut doa memohon ampunan.",
            "Setelah salam, membaca Istighfar 100x: 'Astaghfirullahal 'adzim...'",
            "Membaca Sayyidul Istighfar."
        ],
        dalil: {
            id: "dalil_sholat_taubat",
            shortRef: "HR. Abu Dawud",
            translation: "Tidaklah seorang hamba berbuat dosa, lalu ia bersuci dengan sebaik-baiknya, kemudian berdiri melakukan sholat dua rakaat, lalu ia memohon ampun kepada Allah, melainkan Allah akan mengampuninya.",
            source: "HR. Abu Dawud No. 1521 & Tirmidzi No. 406 (Dishahihkan oleh Al-Albani)"
        }
    },
    {
        id: "doa_taubat",
        title: "Doa Setelah Sholat Taubat",
        title_en: "Dua After Repentance Prayer",
        description: "Membaca Sayyidul Istighfar dan doa mohon ampunan total.",
        icon: "🤲",
        arabic: "أَسْتَغْفِرُ اللهَ الْعَظِيْمَ الَّذِي لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّوْمُ وَأَتُوْبُ إِلَيْهِ",
        latin: "Astaghfirullahal 'adziim alladzii laa ilaaha illaa huwal hayyul qayyuumu wa atuubu ilaih.",
        translation: "Aku memohon ampun kepada Allah Yang Maha Agung, tiada tuhan selain Dia Yang Maha Hidup lagi Maha Berdiri Sendiri, dan aku bertaubat kepada-Nya.",
        steps: [
            "Dibaca sebanyak-banyaknya (minimal 100x) dengan penuh penyesalan.",
            "Setelah itu berdoa dengan bahasa sendiri menyebut dosa-dosa dan berjanji tidak mengulangi."
        ]
    },
    {
        id: "sholat_hajat",
        title: "Sholat Hajat",
        title_en: "Prayer of Need",
        description: "Sholat ketika memiliki keinginan atau hajat khusus kepada Allah.",
        icon: "🎯",
        arabic: "أُصَلِّيْ سُنَّةَ الْحَاجَةِ رَكْعَتَيْنِ لِلَّهِ تَعَالَى",
        latin: "Ushalli sunnatal-haajati rak'ataini lillahi ta'aalaa",
        translation: "Aku niat sholat sunnah Hajat dua rakaat karena Allah ta'ala.",
        steps: [
            "Dikerjakan 2 rakaat sampai 12 rakaat (salam setiap 2 rakaat).",
            "Rakaat pertama setelah Al-Fatihah membaca Ayat Kursi atau Al-Kafirun (jika tidak hafal).",
            "Rakaat kedua setelah Al-Fatihah membaca Al-Ikhlas.",
            "Setelah salam, membaca puji-pujian (Alhamdulillah) & Sholawat Nabi.",
            "Membaca Doa Sholat Hajat khusus.",
            "Sujud di luar sholat dan memohon hajat spesifik kepada Allah."
        ],
        dalil: {
            id: "dalil_sholat_hajat",
            shortRef: "HR. Tirmidzi",
            translation: "Barangsiapa yang memiliki hajat kepada Allah atau kepada salah seorang keturunan Adam, hendaklah ia berwudhu dengan sebaik-baiknya, lalu sholat dua rakaat, kemudian memuji Allah dan bershalawat atas Nabi...",
            source: "HR. Tirmidzi No. 479 & Ibnu Majah No. 1384 (Hasan/Dhaif ringan, banyak diamalkan ulama fadha'ilul a'mal)"
        }
    },
    {
        id: "doa_hajat",
        title: "Doa Setelah Sholat Hajat",
        title_en: "Dua After Hajat Prayer",
        description: "Doa khusus yang dianjurkan dibaca sebelum menyebutkan hajat pribadi.",
        icon: "🤲",
        arabic: "لاَ إِلَهَ إِلاَّ اللهُ الْحَلِيْمُ الْكَرِيْمُ، سُبْحَانَ اللهِ رَبِّ الْعَرْشِ الْعَظِيْمِ، الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِيْنَ...",
        latin: "Laa ilaaha illallaahul haliimul kariim, subhaanallaahi rabbil 'arsyil 'adziim, alhamdulillaahi rabbil 'aalamiin...",
        translation: "Tiada Tuhan selain Allah Yang Maha Penyantun lagi Maha Mulia, Mahasuci Allah pengeran 'Arsy yang agung...",
    },
    {
        id: "sholat_tasbih",
        title: "Sholat Tasbih",
        title_en: "Prayer of Tasbih",
        description: "Sholat yang di dalamnya terdapat bacaan tasbih sebanyak 300 kali, sangat dianjurkan untuk menggugurkan dosa.",
        icon: "📿",
        arabic: "أُصَلِّيْ سُنَّةَ التَّسْبِيْحِ أَرْبَعَ رَكَعَاتٍ لِلَّهِ تَعَالَى",
        latin: "Ushalli sunnatat-tasbiihi (arba'a raka'aatin / rak'ataini) lillahi ta'aalaa",
        translation: "Aku niat sholat sunnah Tasbih (empat rakaat / dua rakaat) karena Allah ta'ala.",
        steps: [
            "Total 4 rakaat. Jika malam dianjurkan 2 rakaat salam, 2 rakaat salam.",
            "Rakaat 1: Al-Fatihah + At-Takatsur. Rakaat 2: Al-Fatihah + Al-Ashr. Rakaat 3: Al-Fatihah + Al-Kafirun. Rakaat 4: Al-Fatihah + Al-Ikhlas.",
            "Membaca tasbih: 'Subhanallah walhamdulillah walaa ilaaha illallah wallahu akbar.'",
            "Cara menghitung 75 tasbih tiap rakaat:",
            "  - Setelah baca surat (sebelum ruku'): 15 kali",
            "  - Saat ruku' (setelah tasbih ruku'): 10 kali",
            "  - I'tidal (setelah tahmid i'tidal): 10 kali",
            "  - Sujud pertama: 10 kali",
            "  - Duduk di antara dua sujud: 10 kali",
            "  - Sujud kedua: 10 kali",
            "  - Duduk istirahat sebelum berdiri (atau sebelum salam): 10 kali",
            "Total = 300 tasbih."
        ],
        dalil: {
            id: "dalil_sholat_tasbih",
            shortRef: "HR. Abu Dawud",
            translation: "Wahai pamanku (Abbas bin Abdul Muthalib), maukah aku beri suatu anugerah... Jika engkau melakukannya, Allah akan mengampuni dosamu yang awal dan yang akhir, yang lama dan yang baru, yang tidak sengaja dan yang disengaja, yang kecil dan yang besar...",
            source: "HR. Abu Dawud No. 1297 (Dishahihkan oleh Ibn Hajar & Al-Albani)"
        }
    }
];

export const LAILATUL_QADR_GUIDE_SECTIONS: GuideSection[] = [
    {
        id: "itikaf",
        title: "Panduan I'tikaf",
        title_en: "I'tikaf Guide",
        items: ITIKAF_GUIDE_ITEMS
    },
    {
        id: "dzikir",
        title: "Doa & Dzikir",
        title_en: "Prayers & Dhikr",
        items: DZIKIR_GUIDE_ITEMS
    },
    {
        id: "sholat",
        title: "Sholat Sunnah",
        title_en: "Sunnah Prayers",
        items: SUNNAH_PRAYERS_GUIDE
    }
];
