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

export interface Reading {
    title?: string;
    titleEn?: string;
    arabic: string;
    latin: string;
    translation: string;       // Indonesian
    translationEn?: string;    // English
    source?: string;
}

export interface SpiritualItem {
    id: string;
    type: "dua" | "hadith";
    category: string;
    content: Reading;
}

/** Pick the right translation/title based on locale */
export function getLocalizedContent(content: Reading, locale: string) {
    const isEn = locale === "en";
    return {
        title: (isEn && content.titleEn) ? content.titleEn : content.title,
        translation: (isEn && content.translationEn) ? content.translationEn : content.translation,
    };
}

export const SPIRITUAL_CONTENT: SpiritualItem[] = [
    // ─── AKHLAK ──────────────────────────────────────────────────────
    {
        id: "hadith_sabar",
        type: "hadith",
        category: "spiritualCategoryAkhlak",
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
        id: "hadith_jujur",
        type: "hadith",
        category: "spiritualCategoryAkhlak",
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
        category: "spiritualCategoryAkhlak",
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
        category: "spiritualCategoryAkhlak",
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
        id: "hadith_tawadhu",
        type: "hadith",
        category: "spiritualCategoryAkhlak",
        content: {
            title: "Perintah Tawadhu",
            titleEn: "Command to Be Humble",
            arabic: "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ وَمَا زَادَ اللَّهُ عَبْدًا بِعَفْوٍ إِلَّا عِزًّا وَمَا تَوَاضَعَ أَحَدٌ لِلَّهِ إِلَّا رَفَعَهُ اللَّهُ",
            latin: "Maa naqosot shodaqotun min maalin, wa maa zaadallahu abdaan bi'afwin illaa 'izzaan, wa maa tawaadho-a ahadun lillaahi illaa rofa-ahullahu.",
            translation: "Sedekah tidak pernah mengurangi harta, Allah tidak menambah bagi yang memaafkan kecuali kemuliaan, dan tidaklah seseorang merendahkan diri karena Allah kecuali Allah mengangkat derajatnya.",
            translationEn: "Charity never diminishes wealth; Allah increases no one's honor by forgiving except in honor; and no one humbles themselves for Allah except that Allah raises their rank.",
            source: "HR. Muslim"
        }
    },

    // ─── IBADAH ──────────────────────────────────────────────────────
    {
        id: "hadith_sholat_awal_waktu",
        type: "hadith",
        category: "spiritualCategoryIbadah",
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
        id: "hadith_dzikir",
        type: "hadith",
        category: "spiritualCategoryIbadah",
        content: {
            title: "Dzikir Paling Ringan",
            titleEn: "The Lightest Remembrance",
            arabic: "أَحَبُّ الكَلامِ إِلَى اللَّهِ: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
            latin: "Ahabbu al-kalaami ilallaahi: Subhanallahi wa bihamdih.",
            translation: "Kalimat yang paling dicintai Allah adalah: Subhanallahi wa bihamdih.",
            translationEn: "The most beloved words to Allah are: Subhanallahi wa bihamdih (Glory be to Allah, and His is the praise).",
            source: "HR. Muslim"
        }
    },
    {
        id: "hadith_dua_dikabulkan",
        type: "hadith",
        category: "spiritualCategoryIbadah",
        content: {
            title: "Doa adalah Ibadah",
            titleEn: "Supplication Is Worship",
            arabic: "الدُّعَاءُ هُوَ الْعِبَادَةُ",
            latin: "Ad-du'aa-u huwal 'ibaadah.",
            translation: "Doa adalah ibadah.",
            translationEn: "Supplication (du'a) is worship.",
            source: "HR. Tirmidzi, Abu Dawud"
        }
    },
    {
        id: "hadith_sholat_jamaah",
        type: "hadith",
        category: "spiritualCategoryIbadah",
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

    // ─── SOSIAL ───────────────────────────────────────────────────────
    {
        id: "hadith_senyum",
        type: "hadith",
        category: "spiritualCategorySosial",
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
        id: "hadith_tetangga",
        type: "hadith",
        category: "spiritualCategorySosial",
        content: {
            title: "Hak Tetangga",
            titleEn: "Rights of Neighbors",
            arabic: "مَا زَالَ جِبْرِيلُ يُوصِينِي بِالْجَارِ حَتَّى ظَنَنْتُ أَنَّهُ سَيُوَرِّثُهُ",
            latin: "Maa zaala Jibriilu yuushiinii bil-jaari hattaa dhonnantu annahu sayuwarritsuh.",
            translation: "Jibril terus berwasiat kepadaku tentang tetangga, hingga aku mengira bahwa tetangga akan mendapatkan hak waris.",
            translationEn: "Jibreel kept urging me to be kind to my neighbors until I thought he would make them heirs.",
            source: "HR. Bukhari & Muslim"
        }
    },
    {
        id: "hadith_silaturrahim",
        type: "hadith",
        category: "spiritualCategorySosial",
        content: {
            title: "Keutamaan Silaturrahim",
            titleEn: "Excellence of Keeping Family Ties",
            arabic: "مَنْ أَحَبَّ أَنْ يُبْسَطَ لَهُ فِي رِزْقِهِ وَأَنْ يُنْسَأَ لَهُ فِي أَثَرِهِ فَلْيَصِلْ رَحِمَهُ",
            latin: "Man ahabba an yubsatha lahu fii rizqihi wa an yunsaa lahu fii atsarihi falyashil rahimah.",
            translation: "Barangsiapa ingin dilapangkan rezekinya dan dipanjangkan umurnya, hendaklah ia menyambung tali silaturrahim.",
            translationEn: "Whoever wishes to have his provision expanded and his life span extended, should maintain ties of kinship.",
            source: "HR. Bukhari & Muslim"
        }
    },
    {
        id: "hadith_tolong_menolong",
        type: "hadith",
        category: "spiritualCategorySosial",
        content: {
            title: "Muslim itu Bersaudara",
            titleEn: "Muslims Are Brothers",
            arabic: "الْمُسْلِمُ أَخُو الْمُسْلِمِ لَا يَظْلِمُهُ وَلَا يُسْلِمُهُ",
            latin: "Al-muslimu akhul muslimi, laa yadzlimuhu wa laa yuslimuhu.",
            translation: "Seorang muslim adalah saudara bagi muslim lainnya. Ia tidak boleh menzaliminya dan tidak boleh membiarkannya dalam kesulitan.",
            translationEn: "A Muslim is the brother of a Muslim. He does not oppress him, nor does he leave him in trouble.",
            source: "HR. Bukhari & Muslim"
        }
    },

    // ─── GAYA HIDUP ───────────────────────────────────────────────────
    {
        id: "hadith_kebersihan",
        type: "hadith",
        category: "spiritualCategoryGayaHidup",
        content: {
            title: "Kebersihan Sebagian Iman",
            titleEn: "Cleanliness Is Half of Faith",
            arabic: "الطُّهُورُ شَطْرُ الإِيمَانِ",
            latin: "Ath-thuhuuru syathrul iimaan.",
            translation: "Kebersihan (kesucian) itu adalah setengah dari iman.",
            translationEn: "Purity (cleanliness) is half of faith.",
            source: "HR. Muslim"
        }
    },
    {
        id: "hadith_makan",
        type: "hadith",
        category: "spiritualCategoryGayaHidup",
        content: {
            title: "Kiat Sehat Nabi",
            titleEn: "The Prophet's Healthy Living Tip",
            arabic: "مَا مَلأَ آدَمِيٌّ وِعَاءً شَرًّا مِنْ بَطْنٍ",
            latin: "Maa mala-a aadamiyyun wi'aa-an syarran min bathnin.",
            translation: "Tidaklah anak Adam memenuhi suatu wadah yang lebih buruk dari perut.",
            translationEn: "No human ever filled a vessel worse than the stomach.",
            source: "HR. Tirmidzi, Ibnu Majah"
        }
    },
    {
        id: "hadith_tidur",
        type: "hadith",
        category: "spiritualCategoryGayaHidup",
        content: {
            title: "Bersihkan Tempat Tidur",
            titleEn: "Clean Your Bed",
            arabic: "إِذَا قَامَ أَحَدُكُمْ مِنَ اللَّيْلِ فَلْيَصُنَّ فَرَاشَهُ",
            latin: "Idzaa qaama ahadukum minal laili falyashunna firaasyah.",
            translation: "Apabila salah seorang dari kalian bangkit di malam hari, maka bersihkanlah tempat tidurnya.",
            translationEn: "When one of you rises at night, let him clean his bed.",
            source: "HR. Bukhari & Muslim"
        }
    },

    // ─── IMAN ─────────────────────────────────────────────────────────
    {
        id: "hadith_iman_manis",
        type: "hadith",
        category: "spiritualCategoryIman",
        content: {
            title: "Manisnya Iman",
            titleEn: "The Sweetness of Faith",
            arabic: "ثَلَاثٌ مَنْ كُنَّ فِيهِ وَجَدَ حَلَاوَةَ الإِيمَانِ: أَنْ يَكُونَ اللَّهُ وَرَسُولُهُ أَحَبَّ إِلَيْهِ مِمَّا سِوَاهُمَا",
            latin: "Tsalaatsun man kunna fiihi wajada halaawatal iimaan: an yakuunallaahu wa rasuuluhu ahabba ilaihi mimmaa siwaahuma.",
            translation: "Tiga hal yang jika ada pada seseorang, ia merasakan manisnya iman: menjadikan Allah dan Rasul-Nya lebih dicintai daripada yang lain.",
            translationEn: "Three qualities give a person the sweetness of faith: that Allah and His Messenger are dearer to him than everything else.",
            source: "HR. Bukhari & Muslim"
        }
    },
    {
        id: "hadith_tawakkal",
        type: "hadith",
        category: "spiritualCategoryIman",
        content: {
            title: "Keutamaan Tawakkal",
            titleEn: "The Excellence of Reliance on Allah",
            arabic: "لَوْ أَنَّكُمْ كُنْتُمْ تَوَكَّلُونَ عَلَى اللَّهِ حَقَّ تَوَكُّلِهِ لَرُزِقْتُمْ كَمَا يُرْزَقُ الطَّيْرُ",
            latin: "Lau annakum kuntum tawakkaluuna 'alallaahi haqqa tawakkulihi, laroziqtum kamaa yurzaqut-toir.",
            translation: "Jika kalian benar-benar bertawakkal kepada Allah, niscaya kalian akan diberi rezeki sebagaimana burung diberi rezeki.",
            translationEn: "If you truly rely upon Allah as He deserves to be relied upon, He would provide for you as He provides for the birds.",
            source: "HR. Tirmidzi"
        }
    },
    {
        id: "hadith_husnuzhan",
        type: "hadith",
        category: "spiritualCategoryIman",
        content: {
            title: "Berbaik Sangka kepada Allah",
            titleEn: "Having Good Expectations of Allah",
            arabic: "أَنَا عِنْدَ ظَنِّ عَبْدِي بِي",
            latin: "Ana 'inda zhanni 'abdii bii.",
            translation: "Aku (Allah) sesuai dengan prasangka hamba-Ku kepada-Ku.",
            translationEn: "I (Allah) am as My servant thinks of Me.",
            source: "HR. Bukhari & Muslim"
        }
    },

    // ─── ILMU ─────────────────────────────────────────────────────────
    {
        id: "hadith_ilmu",
        type: "hadith",
        category: "spiritualCategoryIlmu",
        content: {
            title: "Kewajiban Menuntut Ilmu",
            titleEn: "The Obligation of Seeking Knowledge",
            arabic: "طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ",
            latin: "Tholabul 'ilmi fariidlotun 'alaa kulli muslimin.",
            translation: "Menuntut ilmu adalah kewajiban bagi setiap muslim.",
            translationEn: "Seeking knowledge is an obligation upon every Muslim.",
            source: "HR. Ibnu Majah"
        }
    },
    {
        id: "hadith_amal_ilmu",
        type: "hadith",
        category: "spiritualCategoryIlmu",
        content: {
            title: "Ilmu yang Bermanfaat",
            titleEn: "Beneficial Knowledge",
            arabic: "إِذَا مَاتَ الإِنْسَانُ انْقَطَعَ عَنْهُ عَمَلُهُ إِلَّا مِنْ ثَلَاثَةٍ: إِلَّا مِنْ صَدَقَةٍ جَارِيَةٍ، وَعِلْمٍ يُنْتَفَعُ بِهِ",
            latin: "Idzaa maatal insaanu anqato'a 'anhu 'amaluhu illaa min tsalaatsin: illaa min shodaqotin jaariyatin, wa 'ilmin yuntafa'u bih.",
            translation: "Apabila seorang manusia meninggal, amalnya terputus kecuali tiga hal: sedekah jariyah, ilmu yang bermanfaat...",
            translationEn: "When a person dies, his deeds come to an end except for three: a continuing charity, beneficial knowledge, or a righteous child who prays for him.",
            source: "HR. Muslim"
        }
    },

    // ─── SYUKUR ──────────────────────────────────────────────────────
    {
        id: "hadith_syukur",
        type: "hadith",
        category: "spiritualCategorySyukur",
        content: {
            title: "Syukur kepada Manusia",
            titleEn: "Gratitude to People",
            arabic: "مَنْ لَمْ يَشْكُرِ النَّاسَ لَمْ يَشْكُرِ اللَّهَ",
            latin: "Man lam yasykurin-naasa lam yasykurillaha.",
            translation: "Barangsiapa tidak bersyukur kepada manusia, berarti ia tidak bersyukur kepada Allah.",
            translationEn: "Whoever does not thank people does not thank Allah.",
            source: "HR. Abu Dawud, Tirmidzi"
        }
    },
    {
        id: "hadith_rezeki",
        type: "hadith",
        category: "spiritualCategorySyukur",
        content: {
            title: "Rezeki yang Berkah",
            titleEn: "Blessings in Your Meal",
            arabic: "الْبَرَكَةُ تَنْزِلُ فِي وَسَطِ الطَّعَامِ فَكُلُوا مِنْ جَوَانِبِهِ",
            latin: "Al-barokatu tanzilu fii wasatith-tho'aami fakuluu min jawaanibihi.",
            translation: "Keberkahan turun di tengah makanan, maka makanlah dari pinggirnya.",
            translationEn: "Blessing descends in the middle of food, so eat from the sides.",
            source: "HR. Abu Dawud, Tirmidzi"
        }
    },

    // ─── RAMADHAN ────────────────────────────────────────────────────
    {
        id: "hadith_puasa_perisai",
        type: "hadith",
        category: "spiritualCategoryRamadhan",
        content: {
            title: "Puasa adalah Perisai",
            titleEn: "Fasting Is a Shield",
            arabic: "الصِّيَامُ جُنَّةٌ",
            latin: "Ash-shiyaamu junnah.",
            translation: "Puasa adalah perisai (pelindung dari api neraka).",
            translationEn: "Fasting is a shield (a protection from the Fire).",
            source: "HR. Bukhari & Muslim"
        }
    },
    {
        id: "hadith_ramadhan_berkah",
        type: "hadith",
        category: "spiritualCategoryRamadhan",
        content: {
            title: "Keistimewaan Ramadhan",
            titleEn: "The Greatness of Ramadhan",
            arabic: "إِذَا جَاءَ رَمَضَانُ فُتِّحَتْ أَبْوَابُ الْجَنَّةِ وَغُلِّقَتْ أَبْوَابُ النَّارِ وَصُفِّدَتِ الشَّيَاطِينُ",
            latin: "Idzaa jaa-a Ramadhanu futti-hat abwaabu-l-jannati wa ghulliqat abwaabu-n-naari wa shuffidat-isy-syayaathiin.",
            translation: "Apabila datang bulan Ramadhan, pintu-pintu surga dibuka, pintu-pintu neraka ditutup, dan setan-setan dibelenggu.",
            translationEn: "When Ramadhan comes, the gates of Paradise are opened, the gates of Hell are closed, and the devils are chained.",
            source: "HR. Bukhari & Muslim"
        }
    },
    {
        id: "hadith_sahur",
        type: "hadith",
        category: "spiritualCategoryRamadhan",
        content: {
            title: "Keberkahan Sahur",
            titleEn: "Blessings in Suhoor",
            arabic: "تَسَحَّرُوا فَإِنَّ فِي السَّحُورِ بَرَكَةً",
            latin: "Tasahharuu fa-inna fis-sahuri barakah.",
            translation: "Bersahurlah, karena sesungguhnya dalam sahur terdapat keberkahan.",
            translationEn: "Have suhoor (predawn meal), for there is blessing in suhoor.",
            source: "HR. Bukhari & Muslim"
        }
    },
    {
        id: "hadith_iftar_cepat",
        type: "hadith",
        category: "spiritualCategoryRamadhan",
        content: {
            title: "Menyegerakan Buka Puasa",
            titleEn: "Hasten to Break the Fast",
            arabic: "لَا يَزَالُ النَّاسُ بِخَيْرٍ مَا عَجَّلُوا الْفِطْرَ",
            latin: "Laa yazaalun-naasu bikhoirin maa 'ajjalul-fithro.",
            translation: "Manusia senantiasa dalam kebaikan selama mereka menyegerakan berbuka puasa.",
            translationEn: "The people will remain well off as long as they hasten the breaking of the fast.",
            source: "HR. Bukhari & Muslim"
        }
    },
    {
        id: "hadith_lailatul_qadr_cari",
        type: "hadith",
        category: "spiritualCategoryRamadhan",
        content: {
            title: "Mencari Lailatul Qadr",
            titleEn: "Seeking Laylatul Qadr",
            arabic: "تَحَرَّوْا لَيْلَةَ الْقَدْرِ فِي الْوِتْرِ مِنَ الْعَشْرِ الأَوَاخِرِ مِنْ رَمَضَانَ",
            latin: "Taharraw lailatal qodri fil-witri minal 'asyril awaakhiri min Ramadhon.",
            translation: "Carilah Lailatul Qadr pada malam-malam ganjil dari sepuluh hari terakhir bulan Ramadhan.",
            translationEn: "Seek Laylatul Qadr in the odd nights of the last ten days of Ramadhan.",
            source: "HR. Bukhari"
        }
    },
    {
        id: "hadith_ramadhan_diampuni",
        type: "hadith",
        category: "spiritualCategoryRamadhan",
        content: {
            title: "Puasa Ramadhan Menghapus Dosa",
            titleEn: "Ramadhan Fasting Erases Past Sins",
            arabic: "مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ",
            latin: "Man shaama Ramadhona iimaanan wahtisaaban ghufira lahu maa taqoddama min dzanbih.",
            translation: "Barangsiapa berpuasa Ramadhan dengan penuh keimanan dan mengharap pahala, maka diampuni dosa-dosanya yang telah lalu.",
            translationEn: "Whoever fasts Ramadhan out of faith and hoping for reward, his past sins will be forgiven.",
            source: "HR. Bukhari & Muslim"
        }
    },
    {
        id: "hadith_taraweh",
        type: "hadith",
        category: "spiritualCategoryRamadhan",
        content: {
            title: "Keutamaan Sholat Malam Ramadhan",
            titleEn: "Excellence of Night Prayer in Ramadhan",
            arabic: "مَنْ قَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ",
            latin: "Man qaama Ramadhona iimaanan wahtisaaban ghufira lahu maa taqoddama min dzanbih.",
            translation: "Barangsiapa menghidupkan malam Ramadhan dengan penuh keimanan dan mengharap pahala, maka diampuni dosa-dosanya yang telah lalu.",
            translationEn: "Whoever stands (in prayer) during Ramadhan out of faith and hoping for reward, his past sins will be forgiven.",
            source: "HR. Bukhari & Muslim"
        }
    },
    {
        id: "hadith_sedekah_ramadhan",
        type: "hadith",
        category: "spiritualCategoryRamadhan",
        content: {
            title: "Nabi Paling Dermawan di Ramadhan",
            titleEn: "The Prophet's Generosity in Ramadhan",
            arabic: "كَانَ النَّبِيُّ أَجْوَدَ النَّاسِ وَكَانَ أَجْوَدُ مَا يَكُونُ فِي رَمَضَانَ",
            latin: "Kaanat-nabiyyu ajwadan-naasi wa kaana ajwadu maa yakuunu fii Ramadhaan.",
            translation: "Nabi adalah orang yang paling dermawan, dan kedermawanan beliau paling tinggi di bulan Ramadhan.",
            translationEn: "The Prophet was the most generous of people, and he was most generous in Ramadhan.",
            source: "HR. Bukhari"
        }
    },
    {
        id: "hadith_puasa_bicara",
        type: "hadith",
        category: "spiritualCategoryRamadhan",
        content: {
            title: "Jaga Lisan saat Puasa",
            titleEn: "Guard Your Speech While Fasting",
            arabic: "مَنْ لَمْ يَدَعْ قَوْلَ الزُّورِ وَالْعَمَلَ بِهِ فَلَيْسَ لِلَّهِ حَاجَةٌ فِي أَنْ يَدَعَ طَعَامَهُ وَشَرَابَهُ",
            latin: "Man lam yada'u qoulaz-zuuri wal-'amala bihi falaisa lillaahi haajatun fii an yada'a tho'aamahu wa syarobah.",
            translation: "Barangsiapa tidak meninggalkan perkataan dusta dan perbuatannya, maka Allah tidak butuh ia meninggalkan makan dan minumnya.",
            translationEn: "Whoever does not give up false speech and acting upon it, Allah has no need of him giving up his food and drink.",
            source: "HR. Bukhari"
        }
    },

    // ─── DOA ─────────────────────────────────────────────────────────
    {
        id: "dua_berbuka",
        type: "dua",
        category: "spiritualCategoryRamadhan",
        content: {
            title: "Doa Berbuka Puasa",
            titleEn: "Du'a for Breaking Fast",
            arabic: "اللَّهُمَّ لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ",
            latin: "Allahumma laka shumtu wa bika aamantu wa 'alaa rizqika afthortu.",
            translation: "Ya Allah, karena-Mu aku berpuasa, kepada-Mu aku beriman, dan dengan rezeki-Mu aku berbuka.",
            translationEn: "O Allah, for You I fasted, in You I believed, and upon Your provision I break my fast.",
            source: "HR. Abu Dawud"
        }
    },
    {
        id: "dua_sahur_niat",
        type: "dua",
        category: "spiritualCategoryRamadhan",
        content: {
            title: "Niat Puasa Ramadhan",
            titleEn: "Intention for Ramadhan Fast",
            arabic: "نَوَيْتُ صَوْمَ غَدٍ عَنْ أَدَاءِ فَرْضِ شَهْرِ رَمَضَانَ هَذِهِ السَّنَةِ لِلَّهِ تَعَالَى",
            latin: "Nawaitu shouma ghodin 'an adaa-i fardhi syahri Ramadhona hadzihis-sanati lillahi ta'aalaa.",
            translation: "Aku berniat puasa esok hari untuk menunaikan kewajiban puasa bulan Ramadhan tahun ini karena Allah Ta'ala.",
            translationEn: "I intend to fast tomorrow to fulfill the obligatory fast of Ramadhan this year for the sake of Allah the Exalted.",
            source: "Kitab Fiqih"
        }
    },
    {
        id: "dua_lailatul_qadr",
        type: "dua",
        category: "spiritualCategoryRamadhan",
        content: {
            title: "Doa Lailatul Qadr",
            titleEn: "Du'a for Laylatul Qadr",
            arabic: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
            latin: "Allahumma innaka 'afuwwun tuhibbul-'afwa fa'fu 'annii.",
            translation: "Ya Allah, sesungguhnya Engkau Maha Pemaaf, menyukai pemberian maaf, maka maafkanlah aku.",
            translationEn: "O Allah, You are the Most Forgiving, and You love forgiveness, so forgive me.",
            source: "HR. Tirmidzi, Ibnu Majah"
        }
    },
    {
        id: "dua_ilmu",
        type: "dua",
        category: "spiritualCategoryIlmu",
        content: {
            title: "Doa Memohon Ilmu yang Bermanfaat",
            titleEn: "Du'a for Beneficial Knowledge",
            arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا",
            latin: "Allahumma innii as-aluka 'ilman naafi'an, wa rizqon thoyyiban, wa 'amalan mutaqobbalan",
            translation: "Ya Allah, sesungguhnya aku memohon kepada-Mu ilmu yang bermanfaat, rezeki yang baik, dan amal yang diterima.",
            translationEn: "O Allah, I ask You for beneficial knowledge, good provision, and accepted deeds.",
            source: "HR. Ibnu Majah"
        }
    },
    {
        id: "dua_ketetapan_hati",
        type: "dua",
        category: "spiritualCategoryIman",
        content: {
            title: "Doa Ketetapan Hati",
            titleEn: "Du'a for Steadfastness of Heart",
            arabic: "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ",
            latin: "Ya Muqollibal quluub tsabbit qolbi 'alaa diinik",
            translation: "Wahai Dzat yang membolak-balikkan hati, tetapkanlah hatiku di atas agama-Mu.",
            translationEn: "O You Who turns hearts, keep my heart steadfast upon Your religion.",
            source: "HR. Tirmidzi"
        }
    },
    {
        id: "dua_perlindungan",
        type: "dua",
        category: "spiritualCategoryPerlindungan",
        content: {
            title: "Doa Perlindungan Pagi & Sore",
            titleEn: "Morning & Evening Protection Du'a",
            arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ",
            latin: "Bismillahilladzi laa yadhurru ma'asmihi syai-un fil ardhi wa laa fis samaa-i",
            translation: "Dengan nama Allah yang tidak ada sesuatu pun di bumi dan di langit yang bisa membahayakan bersama nama-Nya.",
            translationEn: "In the name of Allah, with whose name nothing on earth or in the heaven can cause harm.",
            source: "HR. Abu Daud & Tirmidzi"
        }
    },
    {
        id: "dua_syukur",
        type: "dua",
        category: "spiritualCategorySyukur",
        content: {
            title: "Doa Mensyukuri Nikmat",
            titleEn: "Du'a of Gratitude",
            arabic: "رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَىٰ وَالِدَيَّ",
            latin: "Rabbi aw zi'nī an asykura ni'matakal-latī an'amta 'alayya wa 'alā wālidayya",
            translation: "Ya Tuhanku berilah aku ilham untuk tetap mensyukuri nikmat-Mu yang telah Engkau anugerahkan kepadaku dan kepada dua orang ibu bapakku.",
            translationEn: "My Lord, inspire me to be grateful for Your blessing which You have bestowed upon me and upon my parents.",
            source: "QS. An-Naml: 19"
        }
    },
    {
        id: "dua_ketenangan",
        type: "dua",
        category: "spiritualCategoryIman",
        content: {
            title: "Doa Ketenangan Hati",
            titleEn: "Du'a for Peace of Heart",
            arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ",
            latin: "Allahumma innii a'uudzu bika minal hammi wal hazan.",
            translation: "Ya Allah, aku berlindung kepada-Mu dari kesedihan dan duka cita.",
            translationEn: "O Allah, I seek refuge in You from grief and sadness.",
            source: "HR. Bukhari"
        }
    },
];

export function getSpiritualItemOfDay() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    return SPIRITUAL_CONTENT[dayOfYear % SPIRITUAL_CONTENT.length];
}

export function getHadithOnly() {
    return SPIRITUAL_CONTENT.filter(item => item.type === "hadith");
}

export function getDuaOnly() {
    return SPIRITUAL_CONTENT.filter(item => item.type === "dua");
}

export function getByCategory(category: string) {
    return SPIRITUAL_CONTENT.filter(item => item.category === category);
}

export const SPIRITUAL_CATEGORIES = [
    { key: "all", labelId: "Semua", labelEn: "All" },
    { key: "spiritualCategoryRamadhan", labelId: "Ramadhan", labelEn: "Ramadhan" },
    { key: "spiritualCategoryAkhlak", labelId: "Akhlak", labelEn: "Character" },
    { key: "spiritualCategoryIbadah", labelId: "Ibadah", labelEn: "Worship" },
    { key: "spiritualCategorySosial", labelId: "Sosial", labelEn: "Social" },
    { key: "spiritualCategoryIman", labelId: "Iman", labelEn: "Faith" },
    { key: "spiritualCategoryIlmu", labelId: "Ilmu", labelEn: "Knowledge" },
    { key: "spiritualCategoryGayaHidup", labelId: "Gaya Hidup", labelEn: "Lifestyle" },
    { key: "spiritualCategorySyukur", labelId: "Syukur", labelEn: "Gratitude" },
    { key: "spiritualCategoryPerlindungan", labelId: "Doa", labelEn: "Duas" },
];
