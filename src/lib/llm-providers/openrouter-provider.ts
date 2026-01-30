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

export class OpenRouterProvider implements LLMProvider {
    name = 'OpenRouter';
    private apiKey: string;
    private baseURL = 'https://openrouter.ai/api/v1';
    // Using free Gemini Flash via OpenRouter
    private model = 'google/gemini-flash-1.5';

    constructor() {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            throw new Error('OPENROUTER_API_KEY not found in environment variables');
        }
        this.apiKey = apiKey;
    }

    async chat(message: string, context: UserContext, history: ChatMessage[]): Promise<string> {
        try {
            // Prepare messages in OpenAI format (OpenRouter compatible)
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

            // Call OpenRouter API
            const response = await fetch(`${this.baseURL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://nawaetu.app', // Optional: your app URL
                    'X-Title': 'Nawaetu Chat' // Optional: your app name
                },
                body: JSON.stringify({
                    model: this.model,
                    messages,
                    temperature: 0.9,
                    max_tokens: 450,
                    top_p: 0.9,
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new ProviderError(
                    errorData.error?.message || 'OpenRouter API error',
                    response.status,
                    errorData.error?.code,
                    response.status === 429 // Retryable if rate limit
                );
            }

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;

            if (!content) {
                throw new ProviderError('No response from OpenRouter', undefined, 'NO_RESPONSE');
            }

            return content;

        } catch (error: any) {
            console.error('OpenRouter Provider Error:', {
                message: error.message,
                status: error.status,
                code: error.code
            });

            // If already a ProviderError, re-throw
            if (error instanceof ProviderError) {
                throw error;
            }

            // Handle fetch errors
            if (error.name === 'TypeError' || error.message?.includes('fetch')) {
                throw new ProviderError(
                    'Network error',
                    undefined,
                    'NETWORK_ERROR',
                    true
                );
            }

            // Generic error
            throw new ProviderError(
                error.message || 'Unknown OpenRouter error',
                error.status,
                error.code,
                true
            );
        }
    }
}
