export type AppLocale = 'id' | 'en';

/**
 * Every fixed reply the mentor gives instead of a real answer. The server never counts them against the daily
 * limit, and the app uses the same list to tell an answer from one of these, so both count the same things.
 */
export const CODE_REFUSAL = {
    id: "Maaf, Tanya Nawaetu hanya membantu pertanyaan seputar Islam dan fitur Nawaetu.",
    en: "Sorry, Tanya Nawaetu only answers questions about Islam and Nawaetu features.",
};

export const USER_MESSAGES = {
    id: {
        empty: "Pesan tidak boleh kosong ya.",
        tooLong: "Pesan terlalu panjang. Coba dipersingkat, maksimal 500 karakter.",
        login: "Maaf, kamu harus login dulu untuk menggunakan fitur ini.",
        rateLimit: "Terlalu banyak pesan. Tunggu sebentar, lalu coba lagi dalam 1 menit.",
        dailyLimit: "Batas pesan harian sudah tercapai. Coba lagi besok ya.",
        busy: "Sistem sedang sibuk. Coba lagi dalam beberapa menit.",
        updated: "Sistem sedang diperbarui. Coba lagi nanti.",
        auth: "Maaf, ada kendala sistem. Tim kami akan segera memperbaikinya.",
        unclear: "Maaf, saya kurang memahami maksudnya. Bisa gunakan kalimat yang lebih jelas?",
        technical: "Maaf, ada kendala teknis. Coba lagi nanti.",
    },
    en: {
        empty: "Please enter a message.",
        tooLong: "Your message is too long. Please keep it under 500 characters.",
        login: "Sorry, please log in to use this feature.",
        rateLimit: "Too many messages. Please wait a minute before asking again.",
        dailyLimit: "You have reached today's message limit. Please try again tomorrow.",
        busy: "Sorry, the system is busy. Please try again in a few minutes.",
        updated: "Sorry, the system is being updated. Please try again later.",
        auth: "Sorry, the system is having trouble. Our team will fix it soon.",
        unclear: "Sorry, I could not understand that. Could you rephrase it?",
        technical: "Sorry, there is a technical problem. Please try again later.",
    },
};

export const SCHOLAR_REFERRAL = {
    id: "Maaf, saya tidak dapat memastikan jawaban agama tanpa rujukan yang jelas dari Al-Qur'an, Sunnah, hadits shahih, atau sirah nabawiyyah. Untuk perkara yang kompleks, konsultasikan dengan ulama yang terpercaya.",
    en: "Sorry, I cannot verify a religious answer without a clear reference from the Quran, Sunnah, authentic hadith, or Sirah Nabawiyyah. For complex matters, consult a trusted religious scholar.",
};

const NON_ANSWERS = new Set<string>([
    ...Object.values(CODE_REFUSAL),
    ...Object.values(SCHOLAR_REFERRAL),
    ...Object.values(USER_MESSAGES.id),
    ...Object.values(USER_MESSAGES.en),
]);

/** True for a fixed reply (a refusal, a limit or an error), false for a real answer. */
export function isMentorNonAnswer(reply: string): boolean {
    return NON_ANSWERS.has(reply);
}
