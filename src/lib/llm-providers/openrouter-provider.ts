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

import { ChatMessage, LLMProvider, ProviderError, UserContext } from './provider-interface';
import { fetchWithTimeout } from "@/lib/utils/fetch";
import { API_CONFIG } from "@/config/apis";
import { sanitizeUserContext } from './utils';
import { SYSTEM_INSTRUCTION } from './system-instruction';

export class OpenRouterProvider implements LLMProvider {
    name = 'OpenRouter';
    private apiKey: string;
    private baseURL = API_CONFIG.OPENROUTER.BASE_URL;
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
            const safeName = sanitizeUserContext(context.name);
            const contextualMessage = history.length === 0
                ? `${message}\n\n[App language: ${context.locale}]\n[User: ${safeName}, Streak: ${context.prayerStreak} hari]`
                : `${message}\n\n[App language: ${context.locale}]`;

            messages.push({
                role: 'user',
                content: contextualMessage
            });

            // Call OpenRouter API
            const response = await fetchWithTimeout(`${this.baseURL}/chat/completions`, {
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
                    max_tokens: 2000,
                    top_p: 0.9,
                })
            }, { timeoutMs: 15000 });

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
