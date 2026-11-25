export type DhikrPreset = {
    id: string;
    label: string;
    arab: string;
    latin: string;
    tadabbur: string;
    target: number;
};

export type DhikrCategory = {
    id: string;
    label: string;
    items: DhikrPreset[];
};

export const dhikrCategories: DhikrCategory[] = [
    {
        id: "asmaul_husna",
        label: "Asmaul Husna",
        items: [
            {
                id: "ya_rahman",
                label: "Ya Rahman",
                arab: "يَا رَحْمَٰنُ",
                latin: "Yaa Rahmaan",
                tadabbur: "Wahai Yang Maha Pengasih.",
                target: 99
            },
            {
                id: "ya_rahim",
                label: "Ya Rahim",
                arab: "يَا رَحِيمُ",
                latin: "Yaa Rahiim",
                tadabbur: "Wahai Yang Maha Penyayang.",
                target: 99
            },
            {
                id: "ya_malik",
                label: "Ya Malik",
                arab: "يَا مَلِكُ",
                latin: "Yaa Malik",
                tadabbur: "Wahai Yang Maha Merajai.",
                target: 99
            },
            {
                id: "ya_quddus",
                label: "Ya Quddus",
                arab: "يَا قُدُّوسُ",
                latin: "Yaa Qudduus",
                tadabbur: "Wahai Yang Maha Suci.",
                target: 99
            },
            {
                id: "ya_salam",
                label: "Ya Salam",
                arab: "يَا سَلَامُ",
                latin: "Yaa Salaam",
                tadabbur: "Wahai Yang Maha Memberi Kesejahteraan.",
                target: 99
            },
            {
                id: "ya_muhaimin",
                label: "Ya Muhaimin",
                arab: "يَا مُهَيْمِنُ",
                latin: "Yaa Muhaimin",
                tadabbur: "Wahai Yang Maha Memelihara.",
                target: 99
            },
            {
                id: "ya_aziz",
                label: "Ya Aziz",
                arab: "يَا عَزِيزُ",
                latin: "Yaa 'Aziiz",
                tadabbur: "Wahai Yang Maha Perkasa.",
                target: 99
            },
            {
                id: "ya_jabbar",
                label: "Ya Jabbar",
                arab: "يَا جَبَّارُ",
                latin: "Yaa Jabbaar",
                tadabbur: "Wahai Yang Maha Memaksa.",
                target: 99
            },
            {
                id: "ya_mutakabbir",
                label: "Ya Mutakabbir",
                arab: "يَا مُتَكَبِّرُ",
                latin: "Yaa Mutakabbir",
                tadabbur: "Wahai Yang Maha Memiliki Kebesaran.",
                target: 99
            },
            {
                id: "ya_khaliq",
                label: "Ya Khaliq",
                arab: "يَا خَالِقُ",
                latin: "Yaa Khaaliq",
                tadabbur: "Wahai Yang Maha Pencipta.",
                target: 99
            },
            {
                id: "ya_bari",
                label: "Ya Bari",
                arab: "يَا بَارِئُ",
                latin: "Yaa Baari'",
                tadabbur: "Wahai Yang Maha Mengadakan.",
                target: 99
            },
            {
                id: "ya_musawwir",
                label: "Ya Musawwir",
                arab: "يَا مُصَوِّرُ",
                latin: "Yaa Mushawwir",
                tadabbur: "Wahai Yang Maha Membentuk Rupa.",
                target: 99
            },
            {
                id: "ya_ghaffar",
                label: "Ya Ghaffar",
                arab: "يَا غَفَّارُ",
                latin: "Yaa Ghaffaar",
                tadabbur: "Wahai Yang Maha Pengampun.",
                target: 99
            },
            {
                id: "ya_qahhar",
                label: "Ya Qahhar",
                arab: "يَا قَهَّارُ",
                latin: "Yaa Qahhaar",
                tadabbur: "Wahai Yang Maha Menundukkan.",
                target: 99
            },
            {
                id: "ya_wahhab",
                label: "Ya Wahhab",
                arab: "يَا وَهَّابُ",
                latin: "Yaa Wahhaab",
                tadabbur: "Wahai Yang Maha Pemberi Karunia.",
                target: 99
            },
            {
                id: "ya_razzaq",
                label: "Ya Razzaq",
                arab: "يَا رَزَّاقُ",
                latin: "Yaa Razzaaq",
                tadabbur: "Wahai Yang Maha Pemberi Rezeki.",
                target: 99
            },
            {
                id: "ya_fattah",
                label: "Ya Fattah",
                arab: "يَا فَتَّاحُ",
                latin: "Yaa Fattaah",
                tadabbur: "Wahai Yang Maha Pembuka Rahmat.",
                target: 99
            },
            {
                id: "ya_alim",
                label: "Ya Alim",
                arab: "يَا عَلِيمُ",
                latin: "Yaa 'Aliim",
                tadabbur: "Wahai Yang Maha Mengetahui.",
                target: 99
            },
            {
                id: "ya_wasi",
                label: "Ya Wasi'",
                arab: "يَا وَاسِعُ",
                latin: "Yaa Waasi'",
                tadabbur: "Wahai Yang Maha Luas.",
                target: 99
            },
            {
                id: "ya_hakim",
                label: "Ya Hakim",
                arab: "يَا حَكِيمُ",
                latin: "Yaa Hakiim",
                tadabbur: "Wahai Yang Maha Bijaksana.",
                target: 99
            },
            {
                id: "ya_wadud",
                label: "Ya Wadud",
                arab: "يَا وَدُودُ",
                latin: "Yaa Waduud",
                tadabbur: "Wahai Yang Maha Mengasihi.",
                target: 99
            },
            {
                id: "ya_majid",
                label: "Ya Majid",
                arab: "يَامَجِيدُ",
                latin: "Yaa Majiid",
                tadabbur: "Wahai Yang Maha Mulia.",
                target: 99
            }
        ]
    },
    {
        id: "pagi_petang",
        label: "Pagi/Petang",
        items: [
            {
                id: "syayyidul_istighfar",
                label: "Sayyidul Istighfar",
                arab: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
                latin: "Allahumma anta rabbii laa ilaaha illaa anta, khalaqtanii wa anaa 'abduka, wa anaa 'alaa 'ahdika wa wa'dika mastatha'tu, a'uudzu bika min syarri maa shana'tu, abuu-u laka bini'matika 'alayya wa abuu-u bidzanbii, faghfir lii fa-innahuu laa yaghfirudz-dzunuuba illaa anta.",
                tadabbur: "Ya Allah, Engkau adalah Rabbku, tidak ada tuhan selain Engkau. Engkau menciptakanku dan aku adalah hamba-Mu. Aku berada di atas perjanjian-Mu semampuku. Aku berlindung kepada-Mu dari kejahatan perbuatanku. Aku mengakui nikmat-Mu kepadaku dan aku mengakui dosaku. Maka ampunilah aku, sebab tidak ada yang dapat mengampuni dosa kecuali Engkau.",
                target: 1 // Biasanya dibaca 1x atau 3x
            },
            {
                id: "allahumma_bika_asbahna",
                label: "Dzikir Pagi",
                arab: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ",
                latin: "Allahumma bika ashbahnaa, wa bika amsaynaa, wa bika nahyaa, wa bika namuutu, wa ilaikannusyuur",
                tadabbur: "Ya Allah, dengan rahmat dan pertolongan-Mu kami memasuki waktu pagi, dan dengan rahmat dan pertolongan-Mu kami memasuki waktu petang. Dengan rahmat dan pertolongan-Mu kami hidup dan kami mati, dan kepada-Mu kebangkitan.",
                target: 1
            },
            {
                id: "allahumma_bika_amsayna",
                label: "Dzikir Petang",
                arab: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ",
                latin: "Allahumma bika amsaynaa, wa bika ashbahnaa, wa bika nahyaa, wa bika namuutu, wa ilaikalmashiir",
                tadabbur: "Ya Allah, dengan rahmat dan pertolongan-Mu kami memasuki waktu petang, dan dengan rahmat dan pertolongan-Mu kami memasuki waktu pagi. Dengan rahmat dan pertolongan-Mu kami hidup dan kami mati, dan kepada-Mu tempat kembali.",
                target: 1
            }
        ]
    }
];

export const dhikrSequences = [
    {
        id: "sesudah_sholat",
        label: "Dzikir Sesudah Sholat",
        items: ["tasbih", "tahmid", "takbir", "tahlil"]
    }
];

export const getAllPresets = () => {
    return dhikrCategories.flatMap(category => category.items);
};
