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

import 'server-only';
import { ChatMessage, LLMProvider, ProviderError, UserContext } from './provider-interface';
import { sanitizeUserContext } from './utils';
import { SYSTEM_INSTRUCTION } from './system-instruction';

export class GroqProvider implements LLMProvider {
    name = 'Groq';
    private apiKey: string;
    private modelName: string;

    constructor() {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error('GROQ_API_KEY not found in environment variables');
        }

        this.apiKey = apiKey;
        this.modelName = "llama-3.1-8b-instant"; // Fast and supported replacement
    }

    async chat(message: string, context: UserContext, history: ChatMessage[]): Promise<string> {
        try {
            // Convert history to Groq format (OpenAI compatible)
            const safeName = sanitizeUserContext(context.name);
            const groqMessages: any[] = [
                { role: "system", content: SYSTEM_INSTRUCTION },
                ...history.map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'assistant',
                    content: msg.content
                })),
                {
                    role: "user",
                    content: `${message}\n\n[App language: ${context.locale}]\n[Context: User=${safeName}, Streak=${context.prayerStreak}]`
                }
            ];

            const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messages: groqMessages,
                    model: this.modelName,
                    temperature: 0.7,
                    max_tokens: 1024,
                    top_p: 1,
                }),
            });

            if (!res.ok) {
                if (res.status === 429) {
                    throw new ProviderError('Rate limit exceeded', 429, 'RATE_LIMIT', true);
                }
                const errorData = await res.json().catch(() => ({}));
                throw new ProviderError(
                    errorData.error?.message || `Groq API HTTP error ${res.status}`,
                    res.status,
                    errorData.error?.code || 'API_ERROR',
                    true
                );
            }

            const data = await res.json();
            return data.choices?.[0]?.message?.content || "Maaf, saya tidak dapat menjawab saat ini.";

        } catch (error: any) {
            if (error instanceof ProviderError) throw error;
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
