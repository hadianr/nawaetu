export interface Reading {
    title?: string;
    arabic: string;
    latin: string;
    translation: string;
    source?: string;
}

export interface SpiritualItem {
    id: string;
    type: "dua" | "hadith";
    category: string;
    content: Reading;
}

export const SPIRITUAL_CONTENT: SpiritualItem[] = [
    {
        id: "dua_ilmu",
        type: "dua",
        category: "Ilmu",
        content: {
            title: "Doa Memohon Ilmu yang Bermanfaat",
            arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا",
            latin: "Allahumma innii as-aluka 'ilman naafi'an, wa rizqon thoyyiban, wa 'amalan mutaqobbalan",
            translation: "Ya Allah, sesungguhnya aku memohon kepada-Mu ilmu yang bermanfaat, rezeki yang baik, dan amal yang diterima.",
            source: "HR. Ibnu Majah"
        }
    },
    {
        id: "hadith_sabar",
        type: "hadith",
        category: "Akhlak",
        content: {
            title: "Keutamaan Sabar",
            arabic: "الصَّبْرُ ضِيَاءٌ",
            latin: "Ash-shobru dhiyaa-un",
            translation: "Sabar itu adalah cahaya.",
            source: "HR. Muslim"
        }
    },
    {
        id: "dua_ketetapan_hati",
        type: "dua",
        category: "Iman",
        content: {
            title: "Doa Ketetapan Hati",
            arabic: "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ",
            latin: "Ya Muqollibal quluub tsabbit qolbi 'alaa diinik",
            translation: "Wahai Dzat yang membolak-balikkan hati, tetapkanlah hatiku di atas agama-Mu.",
            source: "HR. Tirmidzi"
        }
    },
    {
        id: "hadith_senyum",
        type: "hadith",
        category: "Sosial",
        content: {
            title: "Sedekah Paling Ringan",
            arabic: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ",
            latin: "Tabassumuka fii wajhi akhiika laka shodaqoh",
            translation: "Senyummu di hadapan saudaramu adalah sedekah.",
            source: "HR. Tirmidzi"
        }
    },
    {
        id: "dua_perlindungan",
        type: "dua",
        category: "Perlindungan",
        content: {
            title: "Doa Perlindungan dari Bahaya",
            arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
            latin: "Bismillahilladzi laa yadhurru ma'asmihi syai-un fil ardhi wa laa fis samaa-i wa huwas samii'ul 'aliim",
            translation: "Dengan nama Allah yang tidak ada sesuatu pun di bumi dan di langit yang bisa membahayakan bersama nama-Nya. Dan Dia Maha Mendengar lagi Maha Mengetahui.",
            source: "HR. Abu Daud & Tirmidzi"
        }
    },
    {
        id: "hadith_kebersihan",
        type: "hadith",
        category: "Gaya Hidup",
        content: {
            title: "Kebersihan Sebagian Iman",
            arabic: "الطُّهُورُ شَطْرُ الإِيمَانِ",
            latin: "Ath-thuhuuru syathrul iimaan",
            translation: "Kebersihan (kesucian) itu adalah setengah dari iman.",
            source: "HR. Muslim"
        }
    },
    {
        id: "dua_syukur",
        type: "dua",
        category: "Syukur",
        content: {
            title: "Doa Mensyukuri Nikmat",
            arabic: "رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَىٰ وَالِدَيَّ",
            latin: "Rabbi aw zi'nī an asykura ni'matakal-latī an'amta 'alayya wa 'alā wālidayya",
            translation: "Ya Tuhanku berilah aku ilham untuk tetap mensyukuri nikmat Mu yang telah Engkau anugerahkan kepadaku dan kepada dua orang ibu bapakku.",
            source: "QS. An-Naml: 19"
        }
    }
];

export function getSpiritualItemOfDay() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    return SPIRITUAL_CONTENT[dayOfYear % SPIRITUAL_CONTENT.length];
}
