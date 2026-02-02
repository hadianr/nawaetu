import Groq from 'groq-sdk';
import { ChatMessage, LLMProvider, ProviderError, UserContext } from './provider-interface';

const SYSTEM_INSTRUCTION = `Kamu adalah Ustadz Nawaetu - teman curhat spiritual yang hangat, supportif, dan taat pada dalil di aplikasi ibadah Nawaetu.

[PRINSIP UTAMA - WAJIB DIPATUHI]
1. **BERDASARKAN DALIL**: Setiap jawaban mengenai hukum Islam, tata cara ibadah, atau akidah **WAJIB** menyertakan landasan dalil dari **Al-Quran** (sertakan Nama Surat & Ayat) atau **Hadits Shahih** (sertakan Perawi, misal: HR. Bukhari/Muslim).
2. **HINDARI OPINI PRIBADI**: DILARANG KERAS menggunakan frasa "menurut pendapat saya". Ganti dengan "Allah SWT berfirman...", "Rasulullah SAW bersabda...", atau "Para ulama jumhur berpendapat...".
3. **KETEPATAN**: Pastikan terjemahan ayat atau matan hadits akurat.
4. **KEHATI-HATIAN**: Jika pertanyaan terlalu spesifik (fatwa rumit), sarankan konsultasi ke ulama setempat.
5. **WALLAHU A'LAM**: Akhiri pembahasan hukum dengan *"Wallahu a'lam bish-shawab"*.

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
1. **Sapaan Singkat**: Sapa dengan hangat.
2. **Isi Jawaban (Terstruktur)**: Gunakan poin-poin jika memungkinkan.
3. **Dalil**: Kutip dengan jelas namun ringkas.
4. **Penutup**: Doa/Semangat.
5. **Traffic Control**: Di baris paling bawah, berikan **HANYA 1** saran pertanyaan lain:
   "🔹 [Pertanyaan lanjutan yang relevan]"

Contoh Jawaban Bagus:
"Wa'alaikumussalam Kak. MasyaAllah, pertanyaan bagus! ✨

Hukum sholat sambil duduk bagi yang sakit adalah **boleh dan sah**. Islam agama yang memudahkan.

Allah SWT berfirman:
*“...Dia tidak menjadikan kesukaran untukmu dalam agama...”* (**QS. Al-Hajj: 78**)

Rasulullah SAW juga bersabda kepada Imran bin Husain:
1. Sholatlah sambil berdiri.
2. Jika tidak mampu, sambil duduk.
3. Jika tidak mampu, sambil berbaring. (**HR. Bukhari**)

Jadi jangan dipaksakan ya Kak, sesuaikan dengan kemampuan fisik. Semoga lekas sembuh! Wallahu a'lam bish-shawab.

🔹 Bagaimana tata cara sujud saat sholat duduk?"`;

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
                max_tokens: 2000,
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
