export interface ReflectionDalil {
    id: string;
    textId: string;
    textEn: string;
    arabic?: string;
    sourceId: string;
    sourceEn: string;
}

export const reflectionDalils: ReflectionDalil[] = [
    {
        id: "umar-hisab",
        arabic: "حَاسِبُوا أَنْفُسَكُمْ قَبْلَ أَنْ تُحَاسَبُوا",
        textId: "Hisablah dirimu sebelum engkau dihisab (oleh Allah).",
        textEn: "Hold yourselves accountable before you are held accountable.",
        sourceId: "Umar bin Khattab",
        sourceEn: "Umar ibn Al-Khattab"
    },
    {
        id: "hasan-days",
        textId: "Wahai anak Adam, sesungguhnya engkau adalah kumpulan hari-hari. Jika satu hari berlalu, maka sebagian dirimu juga pergi.",
        textEn: "O son of Adam, you are but a collection of days. When a day passes, a part of you passes with it.",
        sourceId: "Hasan Al-Basri",
        sourceEn: "Hasan Al-Basri"
    },
    {
        id: "muhasabah-heart",
        textId: "Orang yang berakal harus memiliki waktu khusus untuk menyendiri bermuhasabah menata hatinya.",
        textEn: "A wise person must have a dedicated time alone for self-reflection to mend their heart.",
        sourceId: "Imam Syafi'i",
        sourceEn: "Imam Ash-Shafi'i"
    },
    {
        id: "taubat-daily",
        arabic: "إِنِّي لَأَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ فِي الْيَوْمِ مِائَةَ مَرَّةٍ",
        textId: "Sesungguhnya aku memohon ampun kepada Allah dan bertaubat kepada-Nya dalam sehari sebanyak seratus kali.",
        textEn: "Verily, I seek the forgiveness of Allah and turn to Him in repentance a hundred times a day.",
        sourceId: "HR. Muslim",
        sourceEn: "Sahih Muslim"
    },
    {
        id: "improving-deeds",
        textId: "Barangsiapa yang hari ini lebih baik dari hari kemarin, maka ia beruntung.",
        textEn: "Whoever today is better than his yesterday, then he is successful.",
        sourceId: "Ali bin Abi Thalib",
        sourceEn: "Ali ibn Abi Talib"
    }
];

export function getRandomReflectionDalil(): ReflectionDalil {
    const randomIndex = Math.floor(Math.random() * reflectionDalils.length);
    return reflectionDalils[randomIndex];
}
