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

import { createHash } from 'node:crypto';
import { chatRateLimiter, chatDailyRateLimiter } from '@/lib/rate-limit';
import { getServerSession } from "@/lib/auth";
import { ModelRouter } from '@/lib/llm-providers/model-router';
import { ProviderError } from '@/lib/llm-providers/provider-interface';
import { logger } from "@/lib/logger";
import { CODE_REFUSAL, SCHOLAR_REFERRAL, USER_MESSAGES, type AppLocale } from './mentor-messages';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

const NON_RELIGIOUS_CODE_REQUEST = /\b(javascript|typescript|python|java|c\+\+|c#|ruby|php|sql|html|css|bash|shell|script|program|programming|kode|coding|code|function|for\s*\(|console\.log|<script|```)/i;
const CODE_RESPONSE = /```|<script\b|console\.log\s*\(|\bfunction\s+\w+\s*\(|\b(const|let|var)\s+\w+\s*=|\bfor\s*\([^)]*;[^)]*;[^)]*\)/i;
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
// The cache is shared by every user, so the key covers the whole question and its language: a prefix key let one
// user's answer (or one they steered) be served for other users' different questions.
function sirahCacheKey(query: string, locale: AppLocale): string {
    const normalized = query.toLowerCase().trim().replace(/\s+/g, " ");
    return `sirah:rag:v2:${createHash("sha256").update(`${locale}:${normalized}`).digest("hex")}`;
}

async function getCachedSirahResponse(query: string, locale: AppLocale): Promise<string | null> {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        return null;
    }
    try {
        const { Redis } = await import('@upstash/redis');
        const redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL!,
            token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        });
        const key = sirahCacheKey(query, locale);
        const cached = await redis.get<string>(key);
        return cached || null;
    } catch {
        return null;
    }
}

async function setCachedSirahResponse(query: string, locale: AppLocale, response: string): Promise<void> {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        return;
    }
    try {
        const { Redis } = await import('@upstash/redis');
        const redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL!,
            token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        });
        const key = sirahCacheKey(query, locale);
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

    // The daily allowance lives here, not on the device. It is only looked at now and used once an answer is
    // delivered, so a refusal, an error or a retry never costs the user one.
    const dailyKey = `chatday:${session.user.id}`;
    if (!(await chatDailyRateLimiter.hasRoom(dailyKey))) {
        return USER_MESSAGES[locale].dailyLimit;
    }

    try {
        // Check Upstash Redis RAG Cache for sub-50ms response
        const isSirahTopic = /sirah|sejarah|rasul|badr|uhud|khandaq|hubaidiyah|hijrah|fath/i.test(message);
        const cacheable = isSirahTopic && safeHistory.length === 0;
        if (cacheable) {
            const cachedRes = await getCachedSirahResponse(message, locale);
            if (cachedRes) {
                await chatDailyRateLimiter.check(dailyKey);
                return cachedRes;
            }
        }

        const { response } = await modelRouter.chat(
            message,
            // A cached answer is served to other users, so it must not be written from this user's name or streak.
            cacheable ? { ...context, name: "Hamba Allah", prayerStreak: 0, locale } : { ...context, locale },
            safeHistory
        );

        if (CODE_RESPONSE.test(response)) {
            return CODE_REFUSAL[locale];
        }

        if (isReligiousQuestion(message) && !REFERENCE_IN_RESPONSE.test(response)) {
            return SCHOLAR_REFERRAL[locale];
        }

        if (cacheable && response) {
            await setCachedSirahResponse(message, locale, response);
        }

        await chatDailyRateLimiter.check(dailyKey);
        return response;

    } catch (error: unknown) {
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
