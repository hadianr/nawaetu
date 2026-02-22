import 'server-only';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatMessage, LLMProvider, ProviderError, UserContext } from './provider-interface';
import { sanitizeUserContext } from './utils';

const SYSTEM_INSTRUCTION = `Kamu adalah Nawaetu AI - Asisten Muslim Digital yang ramah, supportif, dan cerdas di aplikasi ibadah Nawaetu. Kamu adalah mentor spiritual yang membantu pengguna memahami dan menjalankan ibadah dengan lebih baik. Jawablah dengan SINGKAT, PADAT, dan INFORMATIF.

[PRINSIP UTAMA - WAJIB DIPATUHI]
1. **BERDASARKAN DALIL**: Setiap jawaban mengenai hukum Islam, tata cara ibadah, atau akidah **WAJIB** menyertakan landasan dalil dari **Al-Quran** (sertakan Nama Surat & Ayat) atau **Hadits Shahih** (sertakan Perawi, misal: HR. Bukhari/Muslim).
2. **HINDARI OPINI PRIBADI**: DILARANG KERAS menggunakan frasa "menurut pendapat saya". Ganti dengan "Allah SWT berfirman...", "Rasulullah SAW bersabda...", atau "Para ulama jumhur berpendapat...".
3. **KETEPATAN**: Pastikan terjemahan ayat atau matan hadits akurat.
4. **KEHATI-HATIAN**: Jika pertanyaan terlalu spesifik (fatwa rumit), sarankan konsultasi ke ulama setempat.
5. **WALLAHU A'LAM**: Akhiri pembahasan hukum dengan *"Wallahu a'lam bish-shawab"*.
6. **HINDARI BASA-BASI SALAM**: **JANGAN** memulai atau membalas dengan "Assalamu'alaikum" atau "Wa'alaikumussalam" KECUALI user mengucapkannya terlebih dahulu. Jika user langsung bertanya, LANGSUNG JAWAB pertanyaannya.

[GAYA KOMUNIKASI "EASY TO READ"]
- **ANTI WALL-OF-TEXT**: Pecah paragraf panjang! Maksimal 3-4 baris per paragraf.
- **Poin-Poin**: Gunakan bullet points (1, 2, 3 atau -) untuk menjelaskan langkah, daftar, atau opsi.
- **Struktur Rapi**:
  - Paragraf 1: Jawaban inti (Langsung to-the-point).
  - Paragraf 2: Dalil pendukung (Al-Quran/Hadits).
  - Paragraf 3: Penjelasan/Kesimpulan praktis.
- **Formatting**: Gunakan **Bold** untuk kata kunci/dalil penting agar mata user nyaman.

[BATASAN TOPIK]
✅ Ibadah Islam, Al-Quran & Hadits, Motivasi Spiritual, Fitur Nawaetu.
❌ Politik praktis, SARA, debat kusir, ramalan, topik non-Islam.

[STRUKTUR JAWABAN]
1. **Langsung Jawab**: Jawab pertanyaan intinya dulu.
2. **Isi Jawaban (Terstruktur)**: Gunakan poin-poin jika memungkinkan.
3. **DALIL**: Kutip dengan jelas namun ringkas.
4. **DOA/HADITS HARIAN**: Jika relevan dengan topik chat, kamu bisa merujuk atau menyarankan user untuk merenungkan "Doa/Hadits Hari Ini" yang ada di beranda mereka.
5. **PENUTUP**: Doa/Semangat.
6. **TRAFFIC CONTROL**: Di baris paling bawah, berikan **HANYA 1** saran pertanyaan lain:
   "🔹 [Pertanyaan lanjutan yang relevan]"

Contoh Jawaban Bagus (Tanpa Salam jika user tidak salam):
"MasyaAllah, pertanyaan bagus! ✨

Hukum sholat sambil duduk bagi yang sakit adalah **boleh dan sah**. Islam agama yang memudahkan.

Allah SWT berfirman:
*“...Dia tidak menjadikan kesukaran untukmu dalam agama...”* (**QS. Al-Hajj: 78**)

Rasulullah SAW juga bersabda kepada Imran bin Husain:
1. Sholatlah sambil berdiri.
2. Jika tidak mampu, sambil duduk.
3. Jika tidak mampu, sambil berbaring. (**HR. Bukhari**)

Jadi jangan dipaksakan ya Kak, sesuaikan dengan kemampuan fisik. Semoga lekas sembuh! Wallahu a'lam bish-shawab.

🔹 Bagaimana tata cara sujud saat sholat duduk?"`;

export class GeminiProvider implements LLMProvider {
    name = 'Gemini';
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY not found in environment variables');
        }

        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({
            model: "gemini-flash-lite-latest",
            systemInstruction: SYSTEM_INSTRUCTION,
            generationConfig: {
                temperature: 0.9,
                topP: 0.9,
                topK: 30,
                maxOutputTokens: 2000,
            },
        });
    }

    async chat(message: string, context: UserContext, history: ChatMessage[]): Promise<string> {
        try {
            // Convert history to Gemini format
            const geminiHistory = history.slice(-10).map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            }));

            // Start chat session with history
            const chat = this.model.startChat({ history: geminiHistory });

            // Send message with context (only on first message)
            const safeName = sanitizeUserContext(context.name);
            let contextStr = `[User: ${safeName}, Streak: ${context.prayerStreak} hari, Date: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}]`;

            if (context.dailySpiritualItem) {
                const item = context.dailySpiritualItem;
                contextStr += `\n[Daily Spirit: ${item.type === 'hadith' ? 'Hadits' : 'Doa'} - "${item.content.title}" (Source: ${item.content.source})]`;
            }

            const contextualMessage = history.length === 0
                ? `${message}\n\n${contextStr}`
                : message;

            const result = await chat.sendMessage(contextualMessage);
            const response = await result.response;

            try {
                return response.text();
            } catch (textError) {
                // Check if blocked due to safety
                if (response.promptFeedback?.blockReason) {
                    throw new ProviderError(
                        `Response blocked: ${response.promptFeedback.blockReason}`,
                        400,
                        'SAFETY_BLOCK',
                        false
                    );
                }
                // Check for safety ratings if available in candidates
                if (response.candidates && response.candidates[0]?.finishReason) {
                    const reason = response.candidates[0].finishReason;
                    if (reason === 'SAFETY' || reason === 'RECITATION' || reason === 'OTHER') {
                        throw new ProviderError(
                            `Response filtered: ${reason}`,
                            400,
                            'CONTENT_FILTER',
                            false
                        );
                    }
                }
                throw textError;
            }

        } catch (error: any) {

            // Map Gemini errors to ProviderError
            if (error.status === 429 || error.code === 'RESOURCE_EXHAUSTED') {
                throw new ProviderError(
                    'Rate limit exceeded',
                    429,
                    'RATE_LIMIT',
                    true
                );
            }

            if (error.status === 404 || error.message?.includes('models/')) {
                throw new ProviderError(
                    'Model not found',
                    404,
                    'MODEL_NOT_FOUND',
                    false
                );
            }

            if (error.status === 401 || error.status === 403) {
                throw new ProviderError(
                    'Authentication failed',
                    error.status,
                    'AUTH_ERROR',
                    false
                );
            }

            // Generic error
            throw new ProviderError(
                error.message || 'Unknown Gemini error',
                error.status,
                error.code,
                true
            );
        }
    }
}
