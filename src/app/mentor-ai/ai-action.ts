"use server";

/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { chatRateLimiter } from '@/lib/rate-limit';
import { getServerSession } from "@/lib/auth";
import { ModelRouter } from '@/lib/llm-providers/model-router';
import { ProviderError } from '@/lib/llm-providers/provider-interface';
import { logger } from "@/lib/logger";

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

type AppLocale = 'id' | 'en';

const NON_RELIGIOUS_CODE_REQUEST = /\b(javascript|typescript|python|java|c\+\+|c#|ruby|php|sql|html|css|bash|shell|script|program|programming|kode|coding|code|function|for\s*\(|console\.log|<script|```)/i;
const CODE_RESPONSE = /```|<script\b|console\.log\s*\(|\bfunction\s+\w+\s*\(|\b(const|let|var)\s+\w+\s*=|\bfor\s*\([^)]*;[^)]*;[^)]*\)/i;
const CODE_REFUSAL = {
    id: "Maaf, Tanya Nawaetu hanya membantu pertanyaan seputar Islam dan fitur Nawaetu.",
    en: "Sorry, Tanya Nawaetu only answers questions about Islam and Nawaetu features.",
};
const USER_MESSAGES = {
    id: {
        empty: "Pesan tidak boleh kosong ya 😊",
        tooLong: "Pesan terlalu panjang kak. Coba dipersingkat ya, maksimal 500 karakter 🙏",
        login: "Maaf, kamu harus login dulu ya untuk menggunakan fitur ini 😊",
        rateLimit: "Wah, terlalu banyak pesan nih 😅 Tunggu sebentar ya, kamu bisa tanya lagi dalam 1 menit. Santai aja~",
        busy: "Maaf kak, sistem lagi sibuk banget nih. Coba lagi dalam beberapa menit ya 🙏",
        updated: "Maaf, lagi ada update sistem. Coba lagi ya 🙏",
        auth: "Maaf, lagi ada kendala sistem. Tim kami akan segera perbaiki 🙏",
        unclear: "Maaf, saya kurang paham maksudnya. Bisa gunakan kalimat yang lebih jelas? 😊",
        technical: "Maaf, lagi ada kendala teknis. Coba lagi ya 🙏",
    },
    en: {
        empty: "Please enter a message 😊",
        tooLong: "Your message is too long. Please keep it under 500 characters 🙏",
        login: "Sorry, please log in to use this feature 😊",
        rateLimit: "Too many messages. Please wait a minute before asking again 🙏",
        busy: "Sorry, the system is busy. Please try again in a few minutes 🙏",
        updated: "Sorry, the system is being updated. Please try again 🙏",
        auth: "Sorry, the system is having trouble. Our team will fix it soon 🙏",
        unclear: "Sorry, I could not understand that. Could you rephrase it? 😊",
        technical: "Sorry, there is a technical problem. Please try again 🙏",
    },
};
const SCHOLAR_REFERRAL = {
    id: "Maaf, saya tidak dapat memastikan jawaban agama tanpa rujukan yang jelas dari Al-Qur'an, Sunnah, hadits shahih, atau sirah nabawiyyah. Untuk perkara yang kompleks, konsultasikan dengan ulama yang terpercaya.",
    en: "Sorry, I cannot verify a religious answer without a clear reference from the Quran, Sunnah, authentic hadith, or Sirah Nabawiyyah. For complex matters, consult a trusted religious scholar.",
};
const RELIGIOUS_TOPIC = /\b(quran|al-qur['’]an|ayat|surat|hadits?|sunnah|sirah|rasul|nabi|sholat|salat|puasa|zakat|wudhu|doa|hukum|halal|haram|wajib)\b/i;
const REFERENCE_IN_RESPONSE = /(?:\b(?:q\.?s\.?|al-qur['’]an)\b.{0,80}\b(?:ayat|\d{1,3})\b|\b(?:hr\.?|hadits?)\b.{0,80}\b(?:bukhari|muslim|tirmidzi|abu dawud|nasai|ibnu majah)\b|\bsirah nabawiyyah\b)/i;
const NAWAETU_FEATURE = /\bnawaetu\b|fitur|aplikasi|pengaturan|akun|riwayat chat/i;

function isReligiousQuestion(message: string): boolean {
    return RELIGIOUS_TOPIC.test(message) && !NAWAETU_FEATURE.test(message);
}

function sanitizeHistory(history: ChatMessage[]): ChatMessage[] {
    if (!Array.isArray(history)) return [];

    return history
        .filter((item): item is ChatMessage =>
            !!item && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string'
        )
        .slice(-10)
        .map(item => ({ role: item.role, content: item.content.slice(0, 500) }));
}

// Redis RAG Caching helpers
async function getCachedSirahResponse(query: string): Promise<string | null> {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        return null;
    }
    try {
        const { Redis } = await import('@upstash/redis');
        const redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL!,
            token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        });
        const key = `sirah:rag:cache:${Buffer.from(query.toLowerCase().trim()).toString("base64").slice(0, 32)}`;
        const cached = await redis.get<string>(key);
        return cached || null;
    } catch {
        return null;
    }
}

async function setCachedSirahResponse(query: string, response: string): Promise<void> {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        return;
    }
    try {
        const { Redis } = await import('@upstash/redis');
        const redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL!,
            token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        });
        const key = `sirah:rag:cache:${Buffer.from(query.toLowerCase().trim()).toString("base64").slice(0, 32)}`;
        await redis.set(key, response, { ex: 604800 });
    } catch {
        // Silently continue if Redis cache set fails
    }
}

// Initialize model router (with Gemini primary, Groq fallback)
const modelRouter = new ModelRouter();

export async function askMentor(
    message: string,
    context: { name: string; prayerStreak: number; lastPrayer: string; locale?: string },
    chatHistory: ChatMessage[] = [], // Chat history untuk context
) {
    const locale: AppLocale = context.locale === 'en' ? 'en' : 'id';

    // ===== SECURITY LAYER 1: Input Validation =====
    if (!message || message.trim().length === 0) {
        return USER_MESSAGES[locale].empty;
    }

    if (message.length > 500) {
        return USER_MESSAGES[locale].tooLong;
    }

    if (NON_RELIGIOUS_CODE_REQUEST.test(message)) {
        return CODE_REFUSAL[locale];
    }

    const safeHistory = sanitizeHistory(chatHistory);

    const session = await getServerSession();
    if (!session || !session.user?.id) {
        return USER_MESSAGES[locale].login;
    }

    // ===== SECURITY LAYER 2: Rate Limiting =====
    const identifier = `chat:${session.user.id}`;
    const rateLimit = await chatRateLimiter.check(identifier);

    if (!rateLimit.success) {
        return USER_MESSAGES[locale].rateLimit;
    }

    try {
        // Check Upstash Redis RAG Cache for sub-50ms response
        const isSirahTopic = /sirah|sejarah|rasul|badr|uhud|khandaq|hubaidiyah|hijrah|fath/i.test(message);
        if (isSirahTopic && safeHistory.length === 0) {
            const cachedRes = await getCachedSirahResponse(message);
            if (cachedRes) {
                return cachedRes;
            }
        }

        const { response, provider } = await modelRouter.chat(
            message,
            { ...context, locale },
            safeHistory
        );

        if (CODE_RESPONSE.test(response)) {
            return CODE_REFUSAL[locale];
        }

        if (isReligiousQuestion(message) && !REFERENCE_IN_RESPONSE.test(response)) {
            return SCHOLAR_REFERRAL[locale];
        }

        if (isSirahTopic && response && safeHistory.length === 0) {
            await setCachedSirahResponse(message, response);
        }

        return response;

    } catch (error: any) {
        // Log full error for debugging (server-side only)

        // Handle ProviderError with specific messages
        if (error instanceof ProviderError) {
            if (error.status === 429) {
                return USER_MESSAGES[locale].busy;
            }

            if (error.status === 404) {
                return USER_MESSAGES[locale].updated;
            }

            if (error.status === 401 || error.status === 403) {
                return USER_MESSAGES[locale].auth;
            }

            // Handle Safety/Content Blocks (Gibberish or unsafe input)
            if (error.code === 'SAFETY_BLOCK' || error.code === 'CONTENT_FILTER') {
                return USER_MESSAGES[locale].unclear;
            }
        }

        // Generic error for everything else
        logger.error("AI error", error, { route: '/mentor-ai' });
        return USER_MESSAGES[locale].technical;
    }
}
