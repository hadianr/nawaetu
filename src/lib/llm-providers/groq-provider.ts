import Groq from 'groq-sdk';
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

export class GroqProvider implements LLMProvider {
    name = 'Groq';
    private client: Groq;
    private model = 'llama-3.3-70b-versatile'; // Best quality model

    constructor() {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error('GROQ_API_KEY not found in environment variables');
        }
        this.client = new Groq({ apiKey });
    }

    async chat(message: string, context: UserContext, history: ChatMessage[]): Promise<string> {
        try {
            // Convert history to Groq format
            const messages: any[] = [
                { role: 'system', content: SYSTEM_INSTRUCTION }
            ];

            // Add conversation history (last 10 messages)
            history.slice(-10).forEach(msg => {
                messages.push({
                    role: msg.role === 'user' ? 'user' : 'assistant',
                    content: msg.content
                });
            });

            // Add current message with context (only on first message)
            const contextualMessage = history.length === 0
                ? `${message}\n\n[User: ${context.name}, Streak: ${context.prayerStreak} hari]`
                : message;

            messages.push({
                role: 'user',
                content: contextualMessage
            });

            // Call Groq API
            const completion = await this.client.chat.completions.create({
                messages,
                model: this.model,
                temperature: 0.9,
                max_tokens: 450,
                top_p: 0.9,
            });

            const response = completion.choices[0]?.message?.content;
            if (!response) {
                throw new ProviderError('No response from Groq', undefined, 'NO_RESPONSE');
            }

            return response;

        } catch (error: any) {
            console.error('Groq Provider Error:', {
                message: error.message,
                status: error.status,
                code: error.code
            });

            // Map Groq errors to ProviderError
            if (error.status === 429) {
                throw new ProviderError(
                    'Rate limit exceeded',
                    429,
                    'RATE_LIMIT',
                    true // Retryable
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
                error.message || 'Unknown Groq error',
                error.status,
                error.code,
                true
            );
        }
    }
}
