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
import { getCurrentTimeContext, type TimeContext } from '@/lib/time-context';
import { getServerSession } from "@/lib/auth";
import { ModelRouter } from '@/lib/llm-providers/model-router';
import { ProviderError } from '@/lib/llm-providers/provider-interface';
import { getSpiritualItemOfDay } from '@/data/spiritual-content';
import { logger } from "@/lib/logger";

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
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
    context: { name: string; prayerStreak: number; lastPrayer: string },
    chatHistory: ChatMessage[] = [], // Chat history untuk context
    timeContext?: TimeContext // Optional time context
) {
    // ===== SECURITY LAYER 1: Input Validation =====
    if (!message || message.trim().length === 0) {
        return "Pesan tidak boleh kosong ya 😊";
    }

    if (message.length > 500) {
        return "Pesan terlalu panjang kak. Coba dipersingkat ya, maksimal 500 karakter 🙏";
    }

    const session = await getServerSession();
    if (!session || !session.user?.id) {
        return "Maaf, kamu harus login dulu ya untuk menggunakan fitur ini 😊";
    }

    // ===== SECURITY LAYER 2: Rate Limiting =====
    const identifier = `chat:${session.user.id}`;
    const rateLimit = await chatRateLimiter.check(identifier);

    if (!rateLimit.success) {
        return `Wah, terlalu banyak pesan nih 😅 Tunggu sebentar ya, kamu bisa tanya lagi dalam 1 menit. Santai aja~`;
    }

    try {
        // Check Upstash Redis RAG Cache for sub-50ms response
        const isSirahTopic = /sirah|sejarah|rasul|badr|uhud|khandaq|hubaidiyah|hijrah|fath/i.test(message);
        if (isSirahTopic && chatHistory.length === 0) {
            const cachedRes = await getCachedSirahResponse(message);
            if (cachedRes) {
                return cachedRes;
            }
        }

        const timeCtx = timeContext || getCurrentTimeContext();
        const spiritualItem = getSpiritualItemOfDay();

        const { response, provider } = await modelRouter.chat(
            message,
            { ...context, dailySpiritualItem: spiritualItem },
            chatHistory
        );

        if (isSirahTopic && response && chatHistory.length === 0) {
            await setCachedSirahResponse(message, response);
        }

        return response;

    } catch (error: any) {
        // Log full error for debugging (server-side only)

        // Handle ProviderError with specific messages
        if (error instanceof ProviderError) {
            if (error.status === 429) {
                return `Maaf kak, sistem lagi sibuk banget nih. Coba lagi dalam beberapa menit ya 🙏`;
            }

            if (error.status === 404) {
                return `Maaf, lagi ada update sistem. Coba lagi ya 🙏`;
            }

            if (error.status === 401 || error.status === 403) {
                return `Maaf, lagi ada kendala sistem. Tim kami akan segera perbaiki 🙏`;
            }

            // Handle Safety/Content Blocks (Gibberish or unsafe input)
            if (error.code === 'SAFETY_BLOCK' || error.code === 'CONTENT_FILTER') {
                return `Maaf, saya kurang paham maksudnya. Bisa gunakan kalimat yang lebih jelas? 😊`;
            }
        }

        // Generic error for everything else
        logger.error("AI error", error, { route: '/mentor-ai' });
        return `Maaf, lagi ada kendala teknis. Coba lagi ya 🙏`;
    }
}
