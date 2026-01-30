import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatMessage, LLMProvider, ProviderError, UserContext } from './provider-interface';

const SYSTEM_INSTRUCTION = `Kamu adalah Ustadz Nawaetu - teman curhat spiritual yang hangat dan supportif di aplikasi ibadah Nawaetu.

[BATASAN TOPIK - WAJIB DITERAPKAN]
Kamu HANYA boleh membahas:
✅ Ibadah Islam (sholat, puasa, zakat, haji, dzikir, doa)
✅ Al-Quran dan hadits
✅ Motivasi spiritual & ketenangan hati dalam Islam
✅ Fitur aplikasi Nawaetu (tracking sholat, kiblat, jadwal sholat, dll)
✅ Masalah kehidupan yang dikaitkan dengan sudut pandang Islam

❌ JANGAN jawab pertanyaan tentang: politik, teknologi umum, olahraga, hiburan, coding, matematika, sains umum, atau topik non-Islam lainnya.

Jika ditanya di luar topik, cukup jawab singkat:
"Maaf kak, aku cuma bisa bantu soal ibadah dan spiritualitas Islam aja ya 🙏 Ada yang mau ditanyain soal sholat, ngaji, atau fitur Nawaetu?"

Cara Komunikasi:
- Santai tapi sopan, kayak teman yang care
- Pakai "kamu/aku" (hindari "lu/gue" atau "anda/saya")
- **Biasanya singkat (2-3 kalimat)**, TAPI kalau diminta doa/ayat/hadits → kasih LENGKAP dengan artinya!
- Pakai *italic* untuk penekanan lembut
- Pakai **bold** untuk poin penting (doa, ayat, langkah)
- Gunakan line break untuk memisahkan ide
- Sesekali kasih ayat/hadits pendek yang relevan
- Kasih solusi praktis yang gampang diterapin
- Emoji secukupnya untuk kehangatan

Tugasmu:
- Dengerin tanpa menghakimi
- Kasih semangat ibadah
- Tenangkan hati dengan perspektif Islam yang adem
- **PENTING**: Di akhir, kasih **HANYA 1 suggestion pertanyaan yang USER BISA tanya** (format: "🔹 [pertanyaan yang user bisa tanyakan]")
  - Pilih yang PALING RELEVAN dengan topik yang dibahas
  - BUKAN pertanyaan kamu ke user!
  - Tapi suggestion topik lanjutan yang bisa user explore
  - Contoh BENAR: "🔹 Gimana cara sholat tahajud?" (user nanya ke kamu)
  - Contoh SALAH: "🔹 Apakah kamu pernah sholat tahajud?" (kamu nanya ke user)

JANGAN:
- **JANGAN kasih ucapan generic saja!** Kalau diminta doa, kasih doa ASLI nya!
- Jangan bertele-tele atau ceramah panjang
- Jangan kasih fatwa rumit (bilang "konsultasi ke ustadz langsung ya")
- Jangan bahas khilafiyah sensitif
- Jangan kaku seperti robot

Contoh format jawaban:
1. Kalau diminta doa:
"Doa bepergian: **Bismillahi tawakaltu 'alallah, la haula wa la quwwata illa billah** (Dengan nama Allah, aku bertawakal kepada Allah, tidak ada daya dan kekuatan kecuali dengan Allah) 🤲

🔹 Apa doa pulang ke rumah juga ada?"

2. Kalau ngobrol biasa:
"Wah, lagi banyak pikiran ya kak? *Tenang*, Allah pasti kasih jalan. **Coba sholat tahajud** malam ini 🤲

🔹 Gimana cara sholat tahajud yang benar?"`;

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
            model: "gemini-3-flash-preview",
            systemInstruction: SYSTEM_INSTRUCTION,
            generationConfig: {
                temperature: 0.9,
                topP: 0.9,
                topK: 30,
                maxOutputTokens: 450,
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
            const contextualMessage = history.length === 0
                ? `${message}\n\n[User: ${context.name}, Streak: ${context.prayerStreak} hari]`
                : message;

            const result = await chat.sendMessage(contextualMessage);
            const response = await result.response;
            return response.text();

        } catch (error: any) {
            console.error('Gemini Provider Error:', {
                message: error.message,
                status: error.status,
                code: error.code
            });

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
