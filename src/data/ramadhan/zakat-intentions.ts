export type ZakatIntention = {
    id: string;
    target: "self" | "wife" | "son" | "daughter" | "family" | "represented";
    title: string;
    arabic: string;
    latin: string;
    translation: string;
};

export const zakatIntentions: ZakatIntention[] = [
    {
        id: "zakat-self",
        target: "self",
        title: "Niat Zakat Fitrah untuk Diri Sendiri",
        arabic: "نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ الْفِطْرِ عَنْ نَفْسِيْ فَرْضًا لِلَّهِ تَعَالَى",
        latin: "Nawaitu an ukhrija zakaatal fithri 'an nafsii fardhan lillaahi ta'aalaa",
        translation: "Aku niat mengeluarkan zakat fitrah untuk diriku sendiri, fardhu karena Allah Ta'ala.",
    },
    {
        id: "zakat-wife",
        target: "wife",
        title: "Niat Zakat Fitrah untuk Istri",
        arabic: "نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ الْفِطْرِ عَنْ زَوْجَتِيْ فَرْضًا لِلَّهِ تَعَالَى",
        latin: "Nawaitu an ukhrija zakaatal fithri 'an zaujatii fardhan lillaahi ta'aalaa",
        translation: "Aku niat mengeluarkan zakat fitrah untuk istriku, fardhu karena Allah Ta'ala.",
    },
    {
        id: "zakat-son",
        target: "son",
        title: "Niat Zakat Fitrah untuk Anak Laki-laki",
        arabic: "نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ الْفِطْرِ عَنْ وَلَدِيْ (...) فَرْضًا لِلَّهِ تَعَالَى",
        latin: "Nawaitu an ukhrija zakaatal fithri 'an waladii (sebutkan nama) fardhan lillaahi ta'aalaa",
        translation: "Aku niat mengeluarkan zakat fitrah untuk anak laki-lakiku (sebutkan nama), fardhu karena Allah Ta'ala.",
    },
    {
        id: "zakat-daughter",
        target: "daughter",
        title: "Niat Zakat Fitrah untuk Anak Perempuan",
        arabic: "نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ الْفِطْرِ عَنْ بِنْتِيْ (...) فَرْضًا لِلَّهِ تَعَالَى",
        latin: "Nawaitu an ukhrija zakaatal fithri 'an bintii (sebutkan nama) fardhan lillaahi ta'aalaa",
        translation: "Aku niat mengeluarkan zakat fitrah untuk anak perempuanku (sebutkan nama), fardhu karena Allah Ta'ala.",
    },
    {
        id: "zakat-family",
        target: "family",
        title: "Niat Zakat Fitrah untuk Diri Sendiri & Keluarga",
        arabic: "نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ الْفِطْرِ عَنِّىْ وَعَنْ جَمِيْعِ مَا يَلْزَمُنِىْ نَفَقَاتُهُمْ شَرْعًا فَرْضًا لِلَّهِ تَعَالَى",
        latin: "Nawaitu an ukhrija zakaatal fithri 'annii wa 'an jamii'i maa yalzamunii nafaqaatuhum syar'an fardhan lillaahi ta'aalaa",
        translation: "Aku niat mengeluarkan zakat fitrah untuk diriku dan seluruh orang yang nafkahnya menjadi tanggunganku secara syariat, fardhu karena Allah Ta'ala.",
    },
    {
        id: "zakat-represented",
        target: "represented",
        title: "Niat Zakat Fitrah untuk Orang yang Diwakilkan",
        arabic: "نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ الْفِطْرِ عَنْ (...) فَرْضًا لِلَّهِ تَعَالَى",
        latin: "Nawaitu an ukhrija zakaatal fithri 'an (sebutkan nama) fardhan lillaahi ta'aalaa",
        translation: "Aku niat mengeluarkan zakat fitrah untuk (sebutkan nama spesifik), fardhu karena Allah Ta'ala.",
    }
];

export const doaSujudSahwi = {
    arabic: "سُبْحَانَ مَنْ لَا يَنَامُ وَلَا يَسْهُوْ",
    latin: "Subhaana man laa yanaamu wa laa yashuu",
    translation: "Maha Suci Dzat yang tidak tidur dan tidak lupa."
}

export const doaMenerimaZakat = {
    arabic: "آجَرَكَ اللهُ فِيْمَا أَعْطَيْتَ، وَبَارَكَ لَكَ فِيْمَا أَبْقَيْتَ، وَجَعَلَهُ لَكَ طَهُوْرًا",
    latin: "Aajarokallaahu fiimaa a'thoita, wa baaroka laka fiimaa abqoita, wa ja'alahu laka thohuuron",
    translation: "Semoga Allah memberikan pahala kepadamu atas apa yang engkau berikan, dan semoga Allah memberikan berkah kepadamu atas apa yang engkau simpan, dan menjadikannya pembersih bagimu."
}
