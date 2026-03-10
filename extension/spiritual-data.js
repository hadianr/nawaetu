const SPIRITUAL_CONTENT = [
    // ─── AKHLAK (spiritualCategoryCharacter) ──────────────────────────
    {
        id: "hadith_patience",
        type: "hadith",
        category: "spiritualCategoryCharacter",
        content: {
            title: "Keutamaan Sabar",
            titleEn: "The Virtue of Patience",
            arabic: "الصَّبْرُ ضِيَاءٌ",
            latin: "Ash-shobru dhiyaa-un",
            translation: "Sabar itu adalah cahaya.",
            translationEn: "Patience is light.",
            source: "HR. Muslim"
        }
    },
    {
        id: "hadith_honesty",
        type: "hadith",
        category: "spiritualCategoryCharacter",
        content: {
            title: "Perintah Berlaku Jujur",
            titleEn: "The Command to Be Truthful",
            arabic: "عَلَيْكُمْ بِالصِّدْقِ فَإِنَّ الصِّدْقَ يَهْدِي إِلَى الْبِرِّ وَإِنَّ الْبِرَّ يَهْدِي إِلَى الْجَنَّةِ",
            latin: "Alaikum bish-shidqi, fainnash-shidqa yahdii ilal birri wa innal birra yahdii ilal jannah.",
            translation: "Hendaklah kalian berlaku jujur, karena sesungguhnya kejujuran mengantarkan kepada kebaikan, dan kebaikan mengantarkan ke surga.",
            translationEn: "Be truthful, for truthfulness leads to righteousness, and righteousness leads to Paradise.",
            source: "HR. Bukhari & Muslim"
        }
    },
    {
        id: "hadith_marah",
        type: "hadith",
        category: "spiritualCategoryCharacter",
        content: {
            title: "Jangan Marah",
            titleEn: "Do Not Get Angry",
            arabic: "لَا تَغْضَبْ",
            latin: "Laa taghdob.",
            translation: "Jangan marah.",
            translationEn: "Do not get angry.",
            source: "HR. Bukhari"
        }
    },
    {
        id: "hadith_malu",
        type: "hadith",
        category: "spiritualCategoryCharacter",
        content: {
            title: "Rasa Malu Bagian dari Iman",
            titleEn: "Shyness Is Part of Faith",
            arabic: "الْحَيَاءُ مِنَ الإِيمَانِ",
            latin: "Al-hayaa-u minal iimaan.",
            translation: "Rasa malu adalah bagian dari iman.",
            translationEn: "Modesty (shyness) is a part of faith.",
            source: "HR. Bukhari & Muslim"
        }
    },
    {
        id: "hadith_adab_makan",
        type: "hadith",
        category: "spiritualCategoryCharacter",
        content: {
            title: "Adab Makan dengan Tangan Kanan",
            titleEn: "Etiquette of Eating with the Right Hand",
            arabic: "يَا غُلامُ، سَمِّ اللَّهَ، وَكُلْ بِيَمِينِكَ، وَكُلْ مِمَّا يَلِيكَ",
            latin: "Yaa ghulaam, sammillaah, wa kul biyamiinika, wa kul mimmaa yaliik.",
            translation: "Wahai anak muda, sebutlah nama Allah, makanlah dengan tangan kananmu, dan makanlah dari yang terdekat darimu.",
            translationEn: "O young boy, say Bismillah, eat with your right hand, and eat from what is in front of you.",
            source: "HR. Bukhari & Muslim"
        }
    },

    // ─── IBADAH (spiritualCategoryWorship) ──────────────────────────
    {
        id: "hadith_sholat_awal_waktu",
        type: "hadith",
        category: "spiritualCategoryWorship",
        content: {
            title: "Amalan Paling Dicintai Allah",
            titleEn: "The Most Beloved Deed to Allah",
            arabic: "أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ الصَّلَاةُ عَلَى وَقْتِهَا",
            latin: "Ahabbu-l-a'maali ilallaahi ash-sholaatu 'alaa waqtihaa.",
            translation: "Amalan yang paling dicintai Allah adalah sholat pada waktunya.",
            translationEn: "The most beloved deed to Allah is prayer performed on time.",
            source: "HR. Bukhari & Muslim"
        }
    },
    {
        id: "hadith_sholat_jamaah",
        type: "hadith",
        category: "spiritualCategoryWorship",
        content: {
            title: "Keutamaan Sholat Berjamaah",
            titleEn: "Excellence of Congregational Prayer",
            arabic: "صَلَاةُ الجَمَاعَةِ تَفْضُلُ صَلَاةَ الفَذِّ بِسَبْعٍ وَعِشْرِينَ دَرَجَةً",
            latin: "Sholaatul jamaa'ati tafdlulu sholaatal fadzzi bisab'in wa 'isyriina darojatan.",
            translation: "Sholat berjamaah melebihi sholat sendirian dengan dua puluh tujuh derajat.",
            translationEn: "Prayer in congregation is twenty-seven degrees superior to prayer offered individually.",
            source: "HR. Bukhari & Muslim"
        }
    },
    {
        id: "dua_masuk_masjid",
        type: "dua",
        category: "spiritualCategoryWorship",
        content: {
            title: "Doa Masuk Masjid",
            titleEn: "Du'a for Entering the Mosque",
            arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
            latin: "Allahummaf-tahlii abwaaba rahmatik.",
            translation: "Ya Allah, bukakanlah untukku pintu-pintu rahmat-Mu.",
            translationEn: "O Allah, open for me the gates of Your mercy.",
            source: "HR. Muslim"
        }
    },
    {
        id: "dua_keluar_masjid",
        type: "dua",
        category: "spiritualCategoryWorship",
        content: {
            title: "Doa Keluar Masjid",
            titleEn: "Du'a for Leaving the Mosque",
            arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
            latin: "Allahumma innii as-aluka min fadblik.",
            translation: "Ya Allah, sesungguhnya aku memohon keutamaan dari-Mu.",
            translationEn: "O Allah, I ask You from Your favor.",
            source: "HR. Muslim"
        }
    },

    // ─── SOSIAL (spiritualCategorySocial) ──────────────────────────
    {
        id: "hadith_senyum",
        type: "hadith",
        category: "spiritualCategorySocial",
        content: {
            title: "Sedekah Paling Ringan",
            titleEn: "The Lightest Charity",
            arabic: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ",
            latin: "Tabassumuka fii wajhi akhiika laka shodaqoh.",
            translation: "Senyummu di hadapan saudaramu adalah sedekah.",
            translationEn: "Your smile for your brother is a charity.",
            source: "HR. Tirmidzi"
        }
    },
    {
        id: "hadith_mulia_tetangga",
        type: "hadith",
        category: "spiritualCategorySocial",
        content: {
            title: "Memuliakan Tetangga",
            titleEn: "Honoring Neighbors",
            arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيُكْرِمْ جَارَهُ",
            latin: "Man kaana yu'minu billaahi wal yaumil aakhiri falyukrim jaaroh.",
            translation: "Barangsiapa beriman kepada Allah dan hari akhir, hendaklah ia memuliakan tetangganya.",
            translationEn: "Whoever believes in Allah and the Last Day should be generous to his neighbor.",
            source: "HR. Bukhari & Muslim"
        }
    },
    {
        id: "hadith_tamu",
        type: "hadith",
        category: "spiritualCategorySocial",
        content: {
            title: "Memuliakan Tamu",
            titleEn: "Honoring Guests",
            arabic: "وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيُكْرِمْ ضَيْفَهُ",
            latin: "Wa man kaana yu'minu billaahi wal yaumil aakhiri falyukrim dhoifah.",
            translation: "Barangsiapa beriman kepada Allah dan hari akhir, hendaklah ia memuliakan tamunya.",
            translationEn: "Whoever believes in Allah and the Last Day should show hospitality to his guest.",
            source: "HR. Bukhari & Muslim"
        }
    },

    // ─── DOA HARIAN (spiritualCategoryDaily) ──────────────────────────
    {
        id: "dua_bangun_tidur",
        type: "dua",
        category: "spiritualCategoryDaily",
        content: {
            title: "Doa Bangun Tidur",
            titleEn: "Du'a for Waking Up",
            arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
            latin: "Alhamdu lillaahil-ladzii ahyaanaa ba'da maa amaatanaa wa ilaihin-nusyuur.",
            translation: "Segala puji bagi Allah yang telah menghidupkan kami setelah kami mati (tidur) dan kepada-Nyalah kami kembali.",
            translationEn: "Praise be to Allah Who has given us life after causing us to die, and to Him is the resurrection.",
            source: "HR. Bukhari"
        }
    },
    {
        id: "dua_makan_mulai",
        type: "dua",
        category: "spiritualCategoryDaily",
        content: {
            title: "Doa Sebelum Makan",
            titleEn: "Du'a Before Eating",
            arabic: "بِسْمِ اللَّهِ",
            latin: "Bismillah.",
            translation: "Dengan nama Allah.",
            translationEn: "In the name of Allah.",
            source: "HR. Abu Dawud & Tirmidzi"
        }
    },
    {
        id: "dua_makan_selesai",
        type: "dua",
        category: "spiritualCategoryDaily",
        content: {
            title: "Doa Setelah Makan",
            titleEn: "Du'a After Eating",
            arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ",
            latin: "Alhamdu lillaahil-ladzii ath'amanaa wa saqoonaa wa ja'alanaa muslimiin.",
            translation: "Segala puji bagi Allah yang memberi kami makan dan minum serta menjadikan kami orang-orang muslim.",
            translationEn: "Praise be to Allah Who fed us and gave us drink and made us Muslims.",
            source: "HR. Abu Dawud & Tirmidzi"
        }
    },
    {
        id: "dua_masuk_wc",
        type: "dua",
        category: "spiritualCategoryDaily",
        content: {
            title: "Doa Masuk Kamar Mandi",
            titleEn: "Du'a for Entering the Toilet",
            arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ",
            latin: "Allahumma innii a'uudzu bika minal khubutsi wal khobaa-its.",
            translation: "Ya Allah, aku berlindung pada-Mu dari godaan setan laki-laki dan setan perempuan.",
            translationEn: "O Allah, I seek refuge with You from all offensive and wicked things.",
            source: "HR. Bukhari & Muslim"
        }
    },
    {
        id: "dua_keluar_wc",
        type: "dua",
        category: "spiritualCategoryDaily",
        content: {
            title: "Doa Keluar Kamar Mandi",
            titleEn: "Du'a for Leaving the Toilet",
            arabic: "غُفْرَانَكَ",
            latin: "Ghufroonak.",
            translation: "Aku memohon ampunan-Mu.",
            translationEn: "I seek Your forgiveness.",
            source: "HR. Abu Dawud"
        }
    },

    // ─── KELUARGA (spiritualCategoryFamily) ──────────────────────────
    {
        id: "hadith_ibu",
        type: "hadith",
        category: "spiritualCategoryFamily",
        content: {
            title: "Berbakti kepada Ibu",
            titleEn: "Devotion to Mother",
            arabic: "أُمُّكَ ، ثُمَّ أُمُّكَ ، ثُمَّ أُمُّكَ ، ثُمَّ أَبُوكَ",
            latin: "Ummuka, tsumma ummuka, tsumma ummuka, tsumma abuuka.",
            translation: "Ibumu, kemudian ibumu, kemudian ibumu, kemudian ayahmu.",
            translationEn: "Your mother, then your mother, then your mother, then your father.",
            source: "HR. Bukhari & Muslim"
        }
    },
    {
        id: "dua_orang_tua",
        type: "dua",
        category: "spiritualCategoryFamily",
        content: {
            title: "Doa untuk Kedua Orang Tua",
            titleEn: "Du'a for Parents",
            arabic: "رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
            latin: "Rabbighfir lii wa liwaalidayya warhamhumaa kamaa rabbayaanii shoghiiraa.",
            translation: "Wahai Tuhanku, ampunilah aku dan kedua orang tuaku, sayangilah mereka sebagaimana mereka mendidikku sewaktu kecil.",
            translationEn: "My Lord, forgive me and my parents and have mercy on them as they brought me up when I was small.",
            source: "QS. Al-Isra: 24"
        }
    },

    // ─── KESEHATAN (spiritualCategoryPain) ──────────────────────────
    {
        id: "dua_sakit_diri",
        type: "dua",
        category: "spiritualCategoryPain",
        content: {
            title: "Doa saat Anggota Tubuh Sakit",
            titleEn: "Du'a for Pain in the Body",
            arabic: "بِسْمِ اللَّهِ (٣) أَعُوذُ بِاللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ (٧)",
            latin: "Bismillah (3x), A'uudzu billaahi wa qudrotihi min syarri maa ajidu wa uhaadziru (7x).",
            translation: "Dengan nama Allah (3x), aku berlindung kepada Allah dan kekuasaan-Nya dari keburukan yang aku temui dan aku khawatirkan (7x).",
            translationEn: "In the name of Allah (3x), I seek refuge in Allah and His power from the evil that I find and that I fear (7x).",
            source: "HR. Muslim"
        }
    },
    {
        id: "dua_jenguk_sakit",
        type: "dua",
        category: "spiritualCategoryPain",
        content: {
            title: "Doa Menjenguk Orang Sakit",
            titleEn: "Du'a for Visiting the Sick",
            arabic: "لَا بَأْسَ طَهُورٌ إِنْ شَاءَ اللَّهُ",
            latin: "Laa ba'sa thohuurun in syaa-allahu.",
            translation: "Tidak mengapa, semoga sakitmu ini menjadi pembersih dosa, insya Allah.",
            translationEn: "No harm, it will be a purification (from sins) if Allah wills.",
            source: "HR. Bukhari"
        }
    },

    // ─── SAFAR (spiritualCategoryTravel) ──────────────────────────
    {
        id: "dua_safar",
        type: "dua",
        category: "spiritualCategoryTravel",
        content: {
            title: "Doa Naik Kendaraan",
            titleEn: "Du'a for Traveling",
            arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
            latin: "Subhaanal-ladzii sakh-khoro lanaa haadzaa wa maa kunnaa lahu muqriniina wa innaa ilaa rabbinaa lamunqolibuun.",
            translation: "Maha Suci Allah yang telah menundukkan kendaraan ini bagi kami padahal sebelumnya kami tidak mampu menguasainya, dan sesungguhnya kami akan kembali kepada Tuhan kami.",
            translationEn: "Glory be to Him Who has brought this [vehicle] under our control, though we were unable to control it [ourselves], and indeed, to our Lord we will surely return.",
            source: "QS. Az-Zukhruf: 13-14"
        }
    },

    // ─── DZIKIR (spiritualCategoryMorningEvening) ────────────────────
    {
        id: "dua_dzikir_pagi",
        type: "dua",
        category: "spiritualCategoryMorningEvening",
        content: {
            title: "Kalimat Tauhid (Syahadat)",
            titleEn: "Word of Monotheism",
            arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
            latin: "Laa ilaaha illallahu wahdahu laa syariika lah, lahul mulku wa lahul hamdu, wa huwa 'alaa kulli syai-in qodiir.",
            translation: "Tidak ada Tuhan selain Allah Yang Maha Esa, tidak ada sekutu bagi-Nya. Bagi-Nya kerajaan dan segala puji, dan Dia Maha Kuasa atas segala sesuatu.",
            translationEn: "None has the right to be worshipped but Allah alone, Who has no partner, His is the dominion and His is the praise, and He is Able to do all things.",
            source: "HR. Bukhari & Muslim"
        }
    },

    // ─── AMPUNAN (spiritualCategoryForgiveness) ──────────────────────
    {
        id: "dua_istighfar",
        type: "dua",
        category: "spiritualCategoryForgiveness",
        content: {
            title: "Istighfar",
            titleEn: "Seeking Forgiveness",
            arabic: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ",
            latin: "Astaghfirullaahal 'adzhiim alladzii laa ilaaha illaa huwal hayyul qoyyuum wa atuubu ilaih.",
            translation: "Aku memohon ampun kepada Allah Yang Maha Agung, yang tidak ada Tuhan selain Dia, Yang Maha Hidup, Yang Terus Menerus Mengurus (makhluk-Nya), dan aku bertaubat kepada-Nya.",
            translationEn: "I seek the forgiveness of Allah the Magnificent, of whom there is no deity but Him, the Ever-Living, the Sustainer of all, and I repent to Him.",
            source: "HR. Abu Dawud & Tirmidzi"
        }
    },

    // ─── IMAN & KEYAKINAN (spiritualCategoryFaith) ────────────────────
    {
        id: "hadith_iman_manis",
        type: "hadith",
        category: "spiritualCategoryFaith",
        content: {
            title: "Manisnya Iman",
            titleEn: "The Sweetness of Faith",
            arabic: "ثَلَاثٌ مَنْ كُنَّ فِيهِ وَجَدَ حَلَاوَةَ الإِيمَانِ",
            latin: "Tsalaatsun man kunna fiihi wajada halaawatal iimaan.",
            translation: "Tiga hal yang jika ada pada seseorang, ia merasakan manisnya iman: menjadikan Allah dan Rasul-Nya lebih dicintai daripada yang lain.",
            translationEn: "Three qualities give a person the sweetness of faith: that Allah and His Messenger are dearer to him than everything else.",
            source: "HR. Bukhari & Muslim"
        }
    },
    {
        id: "dua_ketetapan_hati",
        type: "dua",
        category: "spiritualCategoryFaith",
        content: {
            title: "Doa Ketetapan Hati",
            titleEn: "Du'a for Steadfastness of Heart",
            arabic: "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ",
            latin: "Ya Muqollibal quluub tsabbit qolbi 'alaa diinik",
            translation: "Wahai Dzat yang membolak-balikkan hati, tetapkanlah hatiku di atas agama-Mu.",
            translationEn: "O You Who turns hearts, keep my heart steadfast upon Your religion.",
            source: "HR. Tirmidzi"
        }
    }
];

window.SPIRITUAL_CONTENT = SPIRITUAL_CONTENT;
