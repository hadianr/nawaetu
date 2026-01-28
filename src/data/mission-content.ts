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
    // SHOLAT WAJIB 5 WAKTU
    'sholat_subuh': {
        id: 'sholat_subuh',
        intro: 'Sholat Subuh disaksikan oleh para malaikat dan lebih baik dari dunia seisinya.',
        fadhilah: [
            'Pahala sholat semalam suntuk (jika berjamaah)',
            'Berada dalam jaminan/perlindungan Allah',
            'Disaksikan oleh Malaikat siang dan malam',
            'Dua rakaat qobliyah subuh lebih baik dari dunia dan seisinya'
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
                title: "Dzikir Istighfar & Tahlil (10x)",
                arabic: "لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
                latin: "Laa ilaaha illallaahu wahdahu laa syariika lah, lahul mulku wa lahul hamdu yuhyii wa yumiitu wa huwa 'alaa kulli syai'in qodiir",
                translation: "Tiada Tuhan selain Allah yang Maha Esa, tiada sekutu bagi-Nya. Bagi-Nya segala kerajaan dan bagi-Nya segala puji. Dia yang menghidupkan dan mematikan, dan Dia Maha Kuasa atas segala sesuatu.",
                note: "Dibaca 10x setelah salam (Posisi kaki tetap)"
            },
            {
                title: "Doa Qunut (Subuh)",
                arabic: "اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ، وَعَافِنِي فِيمَنْ عَافَيْتَ...",
                latin: "Allahummahdinii fiiman hadait, wa 'aafinii fiiman 'aafait...",
                translation: "Ya Allah, berilah aku petunjuk sebagaimana orang-orang yang telah Engkau beri petunjuk...",
                note: "Sunnah Muakkad (Syafi'i)"
            }
        ],
        guides: [
            'Waktu: Terbit fajar shadiq hingga terbit matahari',
            'Rakaat: 2 rakaat',
            'Sunnah: Qunut (Mazhab Syafi\'i) dan membaca surat panjang'
        ],
        source: 'QS. Al-Isra: 78, HR. Muslim'
    },
    'sholat_dzuhur': {
        id: 'sholat_dzuhur',
        intro: 'Saat matahari tergelincir, pintu langit dibuka. Waktu utama untuk memohon ampunan.',
        fadhilah: [
            'Waktu dibukanya pintu-pintu langit',
            'Dijauhkan dari api neraka',
            'Waktu mustajab untuk berdoa di antara adzan dan iqamah'
        ],
        niat: {
            munfarid: {
                title: "Niat Sholat Dzuhur (Sendiri)",
                arabic: "أُصَلِّى فَرْضَ الظُّهْرِ أَرْبَعَ رَكَعاَتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لله تَعَالَى",
                latin: "Ushalli fardhadz-dzuhri arba'a raka'aatin mustaqbilal qiblati adaa'an lillaahi ta'aalaa",
                translation: "Aku niat melakukan shalat fardu dzuhur 4 rakaat, sambil menghadap qiblat, saat ini, karena Allah ta'ala."
            },
            makmum: {
                title: "Niat Sholat Dzuhur (Makmum)",
                arabic: "أُصَلِّى فَرْضَ الظُّهْرِ أَرْبَعَ رَكَعاَتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً مَأْمُوْمًا لله تَعَالَى",
                latin: "Ushalli fardhadz-dzuhri arba'a raka'aatin mustaqbilal qiblati adaa'an ma'muuman lillaahi ta'aalaa",
                translation: "Aku niat melakukan shalat fardu dzuhur 4 rakaat, sambil menghadap qiblat, sebagai makmum, karena Allah ta'ala."
            }
        },
        readings: [
            {
                title: "Tasbih, Tahmid, Takbir (33x)",
                arabic: "سُبْحَانَ اللَّهِ ... الْحَمْدُ لِلَّهِ ... اللَّهُ أَكْبَرُ",
                latin: "Subhanallah (33x), Alhamdulillah (33x), Allahu Akbar (33x)",
                translation: "Maha Suci Allah, Segala Puji Bagi Allah, Allah Maha Besar",
                note: "Dzikir Ba'da Sholat Fardhu"
            }
        ],
        guides: [
            'Waktu: Matahari tergelincir hingga bayangan benda sama panjang dengan bendanya',
            'Rakaat: 4 rakaat',
            'Sunnah: Rawatib 4 rakaat sebelum dan 2 sesudah'
        ],
        source: 'HR. Tirmidzi & Ahmad'
    },
    'sholat_ashar': {
        id: 'sholat_ashar',
        intro: 'Sholat Wustha (pertengahan) yang sangat ditekankan penjagaannya. Paling rawan terlewat karena kesibukan.',
        fadhilah: [
            'Menjadi penyebab masuk surga (jika menjaga Bardain: Subuh & Ashar)',
            'Pahala dilipatgandakan (karena beratnya waktu ini)',
            'Disaksikan malaikat pergantian shift'
        ],
        niat: {
            munfarid: {
                title: "Niat Sholat Ashar (Sendiri)",
                arabic: "أُصَلِّى فَرْضَ الْعَصْرِأَرْبَعَ رَكَعاَتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لله تَعَالَى",
                latin: "Ushalli fardhal-'ashri arba'a raka'aatin mustaqbilal qiblati adaa'an lillaahi ta'aalaa",
                translation: "Aku niat melakukan shalat fardu ashar 4 rakaat, sambil menghadap qiblat, saat ini, karena Allah ta'ala."
            },
            makmum: {
                title: "Niat Sholat Ashar (Makmum)",
                arabic: "أُصَلِّى فَرْضَ الْعَصْرِأَرْبَعَ رَكَعاَتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً مَأْمُوْمًا لله تَعَالَى",
                latin: "Ushalli fardhal-'ashri arba'a raka'aatin mustaqbilal qiblati adaa'an ma'muuman lillaahi ta'aalaa",
                translation: "Aku niat melakukan shalat fardu ashar 4 rakaat, sambil menghadap qiblat, sebagai makmum, karena Allah ta'ala."
            }
        },
        readings: [
            {
                title: "Doa Perlindungan (Sore)",
                arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ",
                latin: "Amsainaa wa amsal mulku lillahi walhamdulillahi, laa ilaha illallahu wahdahu laa syarika lah, lahul mulku wa lahul hamdu wa huwa 'ala kulli syai-in qadir. Rabbi as-aluka khaira maa fii hadzihil lailah wa khaira maa ba'dahaa, wa a'udzu bika min syarri maa fii hadzihil lailah wa syarri maa ba'dahaa. Rabbi a'udzu bika minal kasali wa suu-il kibar, Rabbi a'udzu bika min 'adzabin fin naari wa 'adzabin fil qabri.",
                translation: "Kami memasuki waktu sore dan kerajaan milik Allah, segala puji bagi Allah. Tidak ada Tuhan selain Allah semata, tidak ada sekutu bagi-Nya. Bagi-Nya kerajaan dan bagi-Nya pujian. Dia-lah Yang Mahakuasa atas segala sesuatu. Wahai Tuhanku, aku mohon kepada-Mu kebaikan malam ini dan kebaikan yang ada setelahnya. Aku berlindung kepada-Mu dari keburukan malam ini dan keburukan yang ada setelahnya. Wahai Tuhanku, aku berlindung kepada-Mu dari kemalasan dan keburukan di hari tua. Wahai Tuhanku, aku berlindung kepada-Mu dari siksaan di neraka dan siksaan di kubur.",
                note: "Bagian dari dzikir sore (dibaca ba'da ashar)"
            }
        ],
        guides: [
            'Waktu: Bayangan benda sama panjang hingga matahari terbenam',
            'Rakaat: 4 rakaat',
            'Sunnah: Rawatib 4 rakaat sebelum (Ghairu Muakkad)'
        ],
        source: 'QS. Al-Baqarah: 238, HR. Bukhari'
    },
    'sholat_maghrib': {
        id: 'sholat_maghrib',
        intro: 'Waktu singkat saat matahari tenggelam. Segerakanlah.',
        fadhilah: [
            'Waktu mustajab untuk berdoa',
            'Menghapus dosa-dosa kecil seharian',
            'Keberkahan di awal malam'
        ],
        niat: {
            munfarid: {
                title: "Niat Sholat Maghrib (Sendiri)",
                arabic: "أُصَلِّى فَرْضَ الْمَغْرِبِ ثَلاَثَ رَكَعاَتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لله تَعَالَى",
                latin: "Ushalli fardhal-maghribi tsalaatsa raka'aatin mustaqbilal qiblati adaa'an lillaahi ta'aalaa",
                translation: "Aku niat melakukan shalat fardu maghrib 3 rakaat, sambil menghadap qiblat, saat ini, karena Allah ta'ala."
            },
            makmum: {
                title: "Niat Sholat Maghrib (Makmum)",
                arabic: "أُصَلِّى فَرْضَ الْمَغْرِبِ ثَلاَثَ رَكَعاَتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً مَأْمُوْمًا لله تَعَالَى",
                latin: "Ushalli fardhal-maghribi tsalaatsa raka'aatin mustaqbilal qiblati adaa'an ma'muuman lillaahi ta'aalaa",
                translation: "Aku niat melakukan shalat fardu maghrib 3 rakaat, sambil menghadap qiblat, sebagai makmum, karena Allah ta'ala."
            }
        },
        readings: [
            {
                title: "Dzikir Khusus Maghrib (10x)",
                arabic: "لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
                latin: "Laa ilaaha illallaahu wahdahu laa syariika lah... (10x)",
                translation: "Tiada Tuhan selain Allah... (Dibaca 10x sebelum merubah posisi kaki)",
                note: "Sunnah Muakkad ba'da Maghrib & Subuh"
            },
            {
                title: "Ayat Kursi",
                arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
                latin: "Allāhu lā ilāha illā huwal-ḥayyul-qayyūm, lā ta'khużuhụ sinatuw wa lā naụm. Lahụ mā fis-samāwāti wa mā fil-arḍ. Man żallażī yasyfa'u 'indahū illā bi`iżnih. Ya'lamu mā baina aidīhim wa mā khalfahum. Wa lā yuḥīṭụna bisyai`im min 'ilmihī illā bimā syā`. Wasi'a kursiyyuhus-samāwāti wal-arḍ. Wa lā ya`ụduhụ ḥifẓuhumā. Wa huwal-'aliyyul-'aẓīm.",
                translation: "Allah, tidak ada tuhan selain Dia. Yang Maha Hidup, Yang terus menerus mengurus (makhluk-Nya), tidak mengantuk dan tidak tidur. Milik-Nya apa yang ada di langit dan apa yang ada di bumi. Tidak ada yang dapat memberi syafaat di sisi-Nya tanpa izin-Nya. Dia mengetahui apa yang di hadapan mereka dan apa yang di belakang mereka, dan mereka tidak mengetahui sesuatu apa pun tentang ilmu-Nya melainkan apa yang Dia kehendaki. Kursi-Nya meliputi langit dan bumi. Dan Dia tidak merasa berat memelihara keduanya, dan Dia Maha Tinggi, Maha Besar.",
                note: "Dibaca setiap selesai sholat fardhu"
            }
        ],
        guides: [
            'Waktu: Matahari terbenam hingga mega merah hilang',
            'Rakaat: 3 rakaat',
            'Sunnah: Rawatib 2 rakaat sesudah (Muakkad)'
        ],
        source: 'HR. Muslim'
    },
    'sholat_isya': {
        id: 'sholat_isya',
        intro: 'Sholat terberat bagi munafik, namun memiliki cahaya sempurna di hari kiamat.',
        fadhilah: [
            'Pahala sholat setengah malam (jika berjamaah)',
            'Cahaya yang sempurna di hari Kiamat',
            'Ketentraman tidur dan perlindungan malam'
        ],
        niat: {
            munfarid: {
                title: "Niat Sholat Isya (Sendiri)",
                arabic: "أُصَلِّى فَرْضَ الْعِشَاءِ أَرْبَعَ رَكَعاَتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لله تَعَالَى",
                latin: "Ushalli fardhal-'isyaa-i arba'a raka'aatin mustaqbilal qiblati adaa'an lillaahi ta'aalaa",
                translation: "Aku niat melakukan shalat fardu isya 4 rakaat, sambil menghadap qiblat, saat ini, karena Allah ta'ala."
            },
            makmum: {
                title: "Niat Sholat Isya (Makmum)",
                arabic: "أُصَلِّى فَرْضَ الْعِشَاءِ أَرْبَعَ رَكَعاَتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً مَأْمُوْمًا لله تَعَالَى",
                latin: "Ushalli fardhal-'isyaa-i arba'a raka'aatin mustaqbilal qiblati adaa'an ma'muuman lillaahi ta'aalaa",
                translation: "Aku niat melakukan shalat fardu isya 4 rakaat, sambil menghadap qiblat, sebagai makmum, karena Allah ta'ala."
            }
        },
        readings: [
            {
                title: "Ayat Kursi (Pelindung Tidur)",
                arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
                latin: "Allāhu lā ilāha illā huwal-ḥayyul-qayyūm, lā ta'khużuhụ sinatuw wa lā naụm. Lahụ mā fis-samāwāti wa mā fil-arḍ. Man żallażī yasyfa'u 'indahū illā bi`iżnih. Ya'lamu mā baina aidīhim wa mā khalfahum. Wa lā yuḥīṭụna bisyai`im min 'ilmihī illā bimā syā`. Wasi'a kursiyyuhus-samāwāti wal-arḍ. Wa lā ya`ụduhụ ḥifẓuhumā. Wa huwal-'aliyyul-'aẓīm.",
                translation: "Allah, tidak ada tuhan selain Dia. Yang Maha Hidup, Yang terus menerus mengurus (makhluk-Nya), tidak mengantuk dan tidak tidur. Milik-Nya apa yang ada di langit dan apa yang ada di bumi. Tidak ada yang dapat memberi syafaat di sisi-Nya tanpa izin-Nya. Dia mengetahui apa yang di hadapan mereka dan apa yang di belakang mereka, dan mereka tidak mengetahui sesuatu apa pun tentang ilmu-Nya melainkan apa yang Dia kehendaki. Kursi-Nya meliputi langit dan bumi. Dan Dia tidak merasa berat memelihara keduanya, dan Dia Maha Tinggi, Maha Besar.",
                note: "Dibaca sebelum tidur"
            },
            {
                title: "Surah Al-Ikhlas",
                arabic: "قُلْ هُوَ ٱللَّهُ أَحَدٌ، ٱللَّهُ ٱلصَّمَدُ، لَمْ يَلِدْ وَلَمْ يُولَدْ، وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ",
                latin: "Qul huwallāhu aḥad. Allāhuṣ-ṣamad. Lam yalid wa lam yūlad. Wa lam yakul lahụ kufuwan aḥad.",
                translation: "Katakanlah: Dialah Allah, Yang Maha Esa. Allah adalah Tuhan yang bergantung kepada-Nya segala sesuatu. Dia tiada beranak dan tidak pula diperanakkan, dan tidak ada seorangpun yang setara dengan Dia.",
                note: "Dibaca 3x"
            },
            {
                title: "Surah Al-Falaq",
                arabic: "قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ، مِن شَرِّ مَا خَلَقَ، وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ، وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ، وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
                latin: "Qul a'ụżu birabbil-falaq. Min syarri mā khalaq. Wa min syarri gāsiqin iżā waqab. Wa min syarrin-naffāṡāti fil-'uqad. Wa min syarri ḥāsidin iżā ḥasad.",
                translation: "Katakanlah: Aku berlindung kepada Tuhan Yang Menguasai waktu subuh, dari kejahatan makhluk-Nya, dan dari kejahatan malam apabila telah gelap gulita, dan dari kejahatan wanita-wanita tukang sihir yang menghembus pada buhul-buhul, dan dari kejahatan pendengki bila ia dengki.",
                note: "Dibaca 3x"
            },
            {
                title: "Surah An-Nas",
                arabic: "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ، مَلِكِ ٱلنَّاسِ، إِلَٰهِ ٱلنَّاسِ، مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ، ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ، مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ",
                latin: "Qul a'ụżu birabbin-nās. Malikin-nās. Ilāhin-nās. Min syarril-waswāsil-khannās. Allażī yuwaswisu fī ṣudụrin-nās. Minal-jinnati wan-nās.",
                translation: "Katakanlah: Aku berlindung kepada Tuhan (yang memelihara dan menguasai) manusia. Raja manusia. Sembahan manusia. Dari kejahatan (bisikan) syaitan yang biasa bersembunyi, yang membisikkan (kejahatan) ke dalam dada manusia, dari (golongan) jin dan manusia.",
                note: "Dibaca 3x"
            }
        ],
        guides: [
            'Waktu: Hilangnya mega merah hingga sepertiga malam (utama)',
            'Rakaat: 4 rakaat',
            'Sunnah: Rawatib 2 rakaat sesudah (Muakkad)'
        ],
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
    }
};
