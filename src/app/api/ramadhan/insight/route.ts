import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "@/lib/auth";
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

const FALLBACK_INSIGHTS = [
    "Puasa dan tarawihmu sudah bagus, yuk tingkatkan dzikir dan sholat sunnah lainnya biar ibadah makin lengkap. Semangat istiqomahnya!",
    "Tilawah Quranmu membanggakan — tapi jangan lupa perbanyak dzikir pagi-petang juga, itu amalan ringan tapi pahalanya besar. Semoga Ramadhan ini jadi titik balik terbaik.",
    "Tarawih dan qiyamulailmu luar biasa! Coba lengkapi dengan sholat sunnah rawatib yang konsisten, karena ibadah yang rutin lebih dicintai Allah daripada yang banyak tapi bolong-bolong.",
];

function buildPrompt(stats: any, userName: string, lang: string): string {
    const { fastingCount, bestFastingStreak, totalQuranSeconds, totalAyat, totalTasbih,
        tarawehCount, qiyamulLailCount, topLocation, masjidCount, rumahCount,
        fardhuMasjidDays, fardhuRumahDays, totalDhuha, totalWitir, totalRawatib, totalSunnahAll } = stats;

    const quranHours = Math.floor(totalQuranSeconds / 3600);
    const quranMins = Math.floor((totalQuranSeconds % 3600) / 60);
    const totalQuranTime = quranHours > 0 ? `${quranHours} jam ${quranMins} menit` : `${quranMins} menit`;

    if (lang !== 'en') {
        return `Kamu adalah Nawaetu, teman spiritual yang hangat. Berikan pesan personal yang SANGAT RINGKAS (maksimal 2 kalimat) untuk ${userName}.
1. Berikan 1 pujian singkat atas progres ibadahnya.
2. Berikan 1 saran agar konsistensi ibadah ini tetap terjaga masuk ke bulan Syawal (jangan berhenti di Ramadhan).

Data:
- Puasa: ${fastingCount} hari
- Tarawih: ${tarawehCount} malam
- Masjid vs Rumah: ${fardhuMasjidDays || 0} vs ${fardhuRumahDays || 0} hari
- Qiyamul Lail: ${qiyamulLailCount} malam
- Tilawah: ${totalQuranTime}
- Dzikir: ${totalTasbih} kali
- Sholat Sunnah total: ${totalSunnahAll || 0}

Gunakan bahasa santai, natural, tanpa markdown, dan tanpa salam.`;
    }

    return `You are Nawaetu, a warm spiritual companion. Write a VERY CONCISE personal message (max 2 sentences) for ${userName}:
1. Give 1 brief compliment on their progress.
2. Give 1 tip to maintain this consistency as they enter the month of Syawal.

Stats: Fasting ${fastingCount}d, Tarawih ${tarawehCount}n, Qiyamul Lail ${qiyamulLailCount}n, Quran ${totalQuranTime}, Dhikr ${totalTasbih}, Sunnah ${totalSunnahAll || 0}.
Casual tone, no markdown, no long greetings.`;
}

async function generateWithGemini(prompt: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not set');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: 'gemini-flash-lite-latest',
        generationConfig: { temperature: 0.8, maxOutputTokens: 150 },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    if (!text) throw new Error('Empty Gemini response');
    return text;
}

async function generateWithGroq(prompt: string): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY not set');

    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: 'You are Nawaetu, a warm Islamic spiritual companion. Be concise (max 2 sentences), natural, and constructive.' },
            { role: 'user', content: prompt },
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.8,
        max_tokens: 150,
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) throw new Error('Empty Groq response');
    if ((completion as any).status === 429) throw Object.assign(new Error('Rate limited'), { status: 429 });
    return text;
}

async function generateWithOpenRouter(prompt: string): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error('OPENROUTER_API_KEY not set');

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://nawaetu.com',
            'X-Title': 'Nawaetu',
        },
        body: JSON.stringify({
            model: 'meta-llama/llama-3.1-8b-instruct:free',
            messages: [
                { role: 'system', content: 'You are Nawaetu, a warm Islamic spiritual companion. Be concise (max 2 sentences), natural, and constructive.' },
                { role: 'user', content: prompt },
            ],
            max_tokens: 150,
            temperature: 0.8,
        }),
    });

    if (!res.ok) throw Object.assign(new Error(`OpenRouter error ${res.status}`), { status: res.status });
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error('Empty OpenRouter response');
    return text;
}

function isRateLimitError(err: any): boolean {
    return err?.status === 429 || err?.message?.includes('429') || err?.message?.toLowerCase().includes('rate limit');
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { stats, lang = 'id', userName = 'Sobat Nawaetu' } = body;
        const prompt = buildPrompt(stats, userName, lang);

        // 3-tier LLM fallback: Gemini → Groq → OpenRouter
        let text: string | null = null;

        try {
            text = await generateWithGemini(prompt);
        } catch (geminiErr: any) {
            console.warn('[Insight] Gemini failed, trying Groq:', geminiErr?.message);
            if (isRateLimitError(geminiErr) || geminiErr?.message?.includes('API_KEY')) {
                try {
                    text = await generateWithGroq(prompt);
                } catch (groqErr: any) {
                    console.warn('[Insight] Groq failed, trying OpenRouter:', groqErr?.message);
                    if (isRateLimitError(groqErr) || groqErr?.message?.includes('API_KEY')) {
                        try {
                            text = await generateWithOpenRouter(prompt);
                        } catch (orErr: any) {
                            console.error('[Insight] OpenRouter also failed:', orErr?.message);
                        }
                    }
                }
            }
        }

        if (text) {
            return NextResponse.json({ insight: text });
        }

        // All providers failed → use static fallback
        const fallback = FALLBACK_INSIGHTS[Math.floor(Math.random() * FALLBACK_INSIGHTS.length)];
        return NextResponse.json({ insight: fallback });

    } catch (error) {
        console.error('[Insight] Unexpected error:', error);
        const fallback = FALLBACK_INSIGHTS[Math.floor(Math.random() * FALLBACK_INSIGHTS.length)];
        return NextResponse.json({ insight: fallback });
    }
}
