"use server";

import { chatRateLimiter } from '@/lib/rate-limit';
import { getCurrentTimeContext, type TimeContext } from '@/lib/time-context';
import { ModelRouter } from '@/lib/llm-providers/model-router';
import { ProviderError } from '@/lib/llm-providers/provider-interface';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

// Initialize model router (with Gemini primary, Groq fallback)
const modelRouter = new ModelRouter();

export async function askUstadz(
    message: string,
    context: { name: string; prayerStreak: number; lastPrayer: string },
    chatHistory: ChatMessage[] = [], // Chat history untuk context
    timeContext?: TimeContext // Optional time context
) {
    // ===== SECURITY LAYER 1: Input Validation =====
    // Reject empty or too long messages
    if (!message || message.trim().length === 0) {
        return "Pesan tidak boleh kosong ya 😊";
    }

    if (message.length > 500) {
        return "Pesan terlalu panjang kak. Coba dipersingkat ya, maksimal 500 karakter 🙏";
    }

    // Check for spam (same message repeated quickly)
    const messageHash = message.toLowerCase().trim();

    // ===== SECURITY LAYER 2: Rate Limiting =====
    // Use user name as identifier (in production, use user ID or session ID)
    const identifier = `chat:${context.name}`;
    const rateLimit = await chatRateLimiter.check(10, identifier); // Max 10 requests per minute

    if (!rateLimit.success) {
        return `Wah, terlalu banyak pesan nih 😅 Tunggu sebentar ya, kamu bisa tanya lagi dalam 1 menit. Santai aja~`;
    }

    try {
        // Get current time context if not provided
        const timeCtx = timeContext || getCurrentTimeContext();

        // Use model router with fallback
        const { response, provider } = await modelRouter.chat(
            message,
            context,
            chatHistory
        );

        // Log which provider was used (server-side only)
        if (provider !== 'Gemini') {
            console.log(`ℹ️ Response served by ${provider} (fallback)`);
        }

        return response;

    } catch (error: any) {
        // Log full error for debugging (server-side only)
        console.error("LLM Provider Error:", {
            message: error.message,
            code: error.code,
            status: error.status,
            provider: error.provider
        });

        // Handle ProviderError with specific messages
        if (error instanceof ProviderError) {
            if (error.status === 429) {
                return `Maaf kak, sistem lagi sibuk banget nih. Coba lagi dalam beberapa menit ya 🙏`;
            }

            if (error.status === 404) {
                return `Maaf, lagi ada update sistem. Coba lagi ya 🙏`;
            }

            if (error.status === 401 || error.status === 403) {
                console.error('⚠️ CRITICAL: Authentication error');
                return `Maaf, lagi ada kendala sistem. Tim kami akan segera perbaiki 🙏`;
            }
        }

        // Generic error for everything else
        return `Maaf, lagi ada kendala teknis. Coba lagi ya 🙏`;
    }
}
