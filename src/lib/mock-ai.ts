export type ChatMessage = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
};

export type UserContext = {
    name: string;
    prayerStreak: number;
    lastPrayer: string;
    missedPrayers: number;
};

const ISLAMIC_GREETINGS = [
    "Assalamualaikum, {name}. Bagaimana kabar iman hari ini?",
    "Ahlan wa sahlan, {name}. Ada yang sedang mengganjal di hati?",
    "Assalamualaikum, {name}. Semoga Allah mudahkan urusan hari ini. Ada yang bisa saya bantu?",
];

const ENCOURAGEMENT_RESPONSES = [
    "MasyaAllah, setiap langkah menuju kebaikan itu dicatat pahala. Jangan menyerah ya.",
    "Ingatlah, Allah tidak membebani seseorang melainkan sesuai kesanggupannya (Al-Baqarah: 286).",
    "La tahzan, innallaha ma'ana. Jangan bersedih, Allah bersama kita.",
];

const PRAYER_ADVICE = {
    lazy: "Rasa malas itu wajar, manusiawi. Tapi ingat, sholat adalah tiang agama. Coba paksakan wudhu, insyaAllah segar dan ringan setelahnya.",
    busy: "Sesibuk apapun kita, sholat adalah 'istirahat' terbaik bagi jiwa. 'Arihna biha ya Bilal' (Istirahatkan kami dengan sholat, wahai Bilal).",
    missed: "Belum terlambat untuk qadha atau memperbaiki diri. Allah Maha Pengampun. Yuk mulai lagi dari sholat berikutnya.",
};

const SADNESS_ADVICE = [
    "Setiap kesedihan adalah penggugur dosa. Bersabarlah, {name}.",
    "Wajar jika hati merasa sempit. Coba ambil air wudhu dan baca Al-Qur'an walau satu ayat, itu obat hati terbaik.",
    "Allah sedang rindu rintihan doa hamba-Nya. Curahkan semuanya dalam sujud, {name}.",
];

export async function generateResponse(
    input: string,
    context: UserContext
): Promise<string> {
    // Simulate network delay (800ms - 2000ms) for realism
    const delay = Math.random() * 1200 + 800;
    await new Promise((resolve) => setTimeout(resolve, delay));

    const lowerInput = input.toLowerCase();

    // 1. Contextual Greeting Logic (First time / Hello)
    if (lowerInput.match(/\b(halo|hi|assalamualaikum|tes|pagi|siang|malam)\b/) && lowerInput.length < 20) {
        if (context.missedPrayers > 0) {
            return `Wa'alaikumsalam, {name}. Saya lihat ada beberapa sholat yang terlewat minggu ini. Tidak apa-apa, yang lalu biarlah berlalu. Mari kita perbaiki mulai hari ini ya?`;
        }
        if (context.prayerStreak > 3) {
            return `Wa'alaikumsalam, {name}! MasyaAllah, streak sholatmu sedang bagus sekali (${context.prayerStreak} hari). Pertahankan ya! Ada yang ingin diceritakan?`;
        }
        return ISLAMIC_GREETINGS[Math.floor(Math.random() * ISLAMIC_GREETINGS.length)].replace("{name}", context.name);
    }

    // 2. Keyword: Malas / Lazy
    if (lowerInput.match(/\b(malas|mager|berat|capek|lelah)\b/) && lowerInput.match(/\b(sholat|ibadah)\b/)) {
        return PRAYER_ADVICE.lazy;
    }

    // 3. Keyword: Sedih / Galau / Stress
    if (lowerInput.match(/\b(sedih|galau|stress|pusing|sakit hati|kecewa|putus asa)\b/)) {
        return SADNESS_ADVICE[Math.floor(Math.random() * SADNESS_ADVICE.length)].replace("{name}", context.name);
    }

    // 4. Keyword: Sibuk / Kerja
    if (lowerInput.match(/\b(sibuk|kerja|tugas|meeting|deadline)\b/)) {
        return PRAYER_ADVICE.busy;
    }

    // 5. Keyword: Dosa / Taubat
    if (lowerInput.match(/\b(dosa|salah|khilaf|tobat|ampun)\b/)) {
        return "Pintu tobat Allah seluas langit dan bumi, {name}. Selama nyawa belum di kerongkongan, Allah selalu menerima hamba-Nya yang kembali. Jangan putus asa dari rahmat Allah."
            .replace("{name}", context.name);
    }

    // Default / Fallback
    return "Saya mengerti perasaan itu. Ingatlah bahwa Allah selalu mendengar doa kita, bahkan yang tidak terucap. Ceritakan lebih lanjut jika itu membuatmu lega, {name}."
        .replace("{name}", context.name);
}
