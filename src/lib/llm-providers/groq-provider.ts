import 'server-only';
import Groq from "groq-sdk";
import { ChatMessage, LLMProvider, ProviderError, UserContext } from './provider-interface';

const SYSTEM_INSTRUCTION = `Kamu adalah Nawaetu AI - Asisten Muslim Digital yang ramah, supportif, dan cerdas di aplikasi ibadah Nawaetu. Kamu adalah mentor spiritual yang membantu pengguna memahami dan menjalankan ibadah dengan lebih baik. Bisakan menjawab dengan singkat dan padat serta informatif.

[PRINSIP UTAMA]
1. Landaskan jawaban pada Al-Quran & Hadits.
2. Hindari opini pribadi yang spekulatif.
3. Gunakan bahasa Indonesia yang sopan dan mudah dipahami.
4. Akhiri fatwa/hukum dengan "Wallahu a'lam bish-shawab".
5. **JANGAN SALAM**: JANGAN memulai/membalas dengan "Assalamu'alaikum" atau "Wa'alaikumussalam" KECUALI user mengucapkannya duluan.

[VISUAL FORMATTING]
- Gunakan paragraf pendek.
- Gunakan bullet points.
- Bold kata-kata kunci.

[CONTOH JAWABAN]
"Boleh, sholat sambil duduk bagi yang sakit itu sah. Islam tidak memberatkan umatnya. (HR. Bukhari)."`;

export class GroqProvider implements LLMProvider {
    name = 'Groq';
    private groq: Groq;
    private modelName: string;

    constructor() {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error('GROQ_API_KEY not found in environment variables');
        }

        this.groq = new Groq({ apiKey });
        this.modelName = "llama3-8b-8192"; // Default minimal latency model
    }

    async chat(message: string, context: UserContext, history: ChatMessage[]): Promise<string> {
        try {
            // Convert history to Groq format (OpenAI compatible)
            const groqMessages: any[] = [
                { role: "system", content: SYSTEM_INSTRUCTION },
                ...history.map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'assistant', // Groq uses 'assistant' not 'model'
                    content: msg.content
                })),
                {
                    role: "user",
                    content: `${message}\n\n[Context: User=${context.name}, Streak=${context.prayerStreak}]`
                }
            ];

            const chatCompletion = await this.groq.chat.completions.create({
                messages: groqMessages,
                model: this.modelName,
                temperature: 0.7,
                max_tokens: 1024,
                top_p: 1,
            });

            return chatCompletion.choices[0]?.message?.content || "Maaf, saya tidak dapat menjawab saat ini.";

        } catch (error: any) {

            if (error.status === 429) {
                throw new ProviderError('Rate limit exceeded', 429, 'RATE_LIMIT', true);
            }

            throw new ProviderError(
                error.message || 'Unknown Groq error',
                error.status || 500,
                error.code || 'UNKNOWN',
                true
            );
        }
    }
}
