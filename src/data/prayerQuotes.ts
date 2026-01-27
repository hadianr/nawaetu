
export interface PrayerQuote {
    text: string;
    source: string;
    type: "quran" | "hadith" | "quote";
}

export const PREPARATION_QUOTES: PrayerQuote[] = [
    {
        text: "Menunggu waktu sholat dinilai sebagai sedang sholat.",
        source: "HR. Bukhari",
        type: "hadith"
    },
    {
        text: "Pakailah pakaianmu yang indah di setiap (memasuki) masjid.",
        source: "QS. Al-A'raf: 31",
        type: "quran"
    },
    {
        text: "Sempurnakan wudhu, karena ia adalah separuh dari iman.",
        source: "HR. Muslim",
        type: "hadith"
    },
    {
        text: "Sholat tepat waktu adalah amalan yang paling dicintai Allah.",
        source: "HR. Bukhari & Muslim",
        type: "hadith"
    },
    {
        text: "Jadikan sabar dan sholat sebagai penolongmu.",
        source: "QS. Al-Baqarah: 45",
        type: "quran"
    }
];
