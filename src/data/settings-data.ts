// Muadzin / Adzan Sound Options
export const MUADZIN_OPTIONS = [
    { id: "makkah", label: "Makkah", description: "Sheikh Ali Mullah", audio_url: "https://raw.githubusercontent.com/achaudhry/adhan/master/Adhan-Makkah.mp3" },
    { id: "madinah", label: "Madinah", description: "Sheikh Abdul Rahman", audio_url: "https://raw.githubusercontent.com/achaudhry/adhan/master/Adhan-Madinah.mp3" },
    { id: "egypt", label: "Mesir", description: "Sheikh Abdul Basit", audio_url: "https://www.ayouby.com/multimedia/Call_of_Prayer/Athan_AB.mp3" },
    { id: "mishary", label: "Mishary Rashid", description: "Kuwait", audio_url: "https://raw.githubusercontent.com/achaudhry/adhan/master/Adhan-Mishary-Rashid-Al-Afasy.mp3" },
];

// Quran Reciter Options (using quran.com API identifiers)
export const QURAN_RECITER_OPTIONS = [
    { id: 7, label: "Mishary Rashid Alafasy", audio_url_format: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/{verse}.mp3" },
    { id: 2, label: "Abdul Rahman Al-Sudais", audio_url_format: "https://cdn.islamic.network/quran/audio/192/ar.abdurrahmaansudais/{verse}.mp3" },
    { id: 1, label: "Abdul Basit (Murattal)", audio_url_format: "https://cdn.islamic.network/quran/audio/192/ar.abdulbasitmurattal/{verse}.mp3" },
    { id: 5, label: "Maher Al Muaiqly", audio_url_format: "https://cdn.islamic.network/quran/audio/128/ar.mahermuaiqly/{verse}.mp3" },
    { id: 3, label: "Saud Al-Shuraim", audio_url_format: "https://cdn.islamic.network/quran/audio/64/ar.saoodshuraym/{verse}.mp3" },
];

// Prayer Time Calculation Methods (Aladhan API codes)
export const CALCULATION_METHODS = [
    { id: 4, label: "Umm Al-Qura (Makkah)", description: "Umm al-Qura University, Makkah" },
    { id: 20, label: "Kemenag RI", description: "Kementerian Agama Republik Indonesia" },
    { id: 3, label: "MWL", description: "Muslim World League" },
    { id: 2, label: "ISNA", description: "Islamic Society of North America" },
    { id: 5, label: "Egyptian", description: "Egyptian General Authority of Survey" },
    { id: 1, label: "Karachi", description: "University of Islamic Sciences, Karachi" },
];

// Default Settings
export const DEFAULT_SETTINGS = {
    muadzin: "makkah",
    reciter: 7, // Mishary Rashid
    calculationMethod: 20, // Kemenag RI
    versesPerPage: 20,
};
