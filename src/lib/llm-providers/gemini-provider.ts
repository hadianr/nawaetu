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
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatMessage, LLMProvider, ProviderError, UserContext } from './provider-interface';
import { sanitizeUserContext } from './utils';
import { SYSTEM_INSTRUCTION } from './system-instruction';

export class GeminiProvider implements LLMProvider {
    name = 'Gemini';
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY not found in environment variables');
        }

        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({
            model: "gemini-flash-lite-latest",
            systemInstruction: SYSTEM_INSTRUCTION,
            generationConfig: {
                temperature: 0.9,
                topP: 0.9,
                topK: 30,
                maxOutputTokens: 2000,
            },
        });
    }

    async chat(message: string, context: UserContext, history: ChatMessage[]): Promise<string> {
        try {
            // Convert history to Gemini format and ensure it starts with a 'user' role
            const geminiHistory = history.slice(-10).map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            }));

            // Gemini requires the first message in history to be from the 'user'
            while (geminiHistory.length > 0 && geminiHistory[0].role !== 'user') {
                geminiHistory.shift();
            }

            // Start chat session with history
            const chat = this.model.startChat({ history: geminiHistory });

            // Send message with context (only on first message)
            const safeName = sanitizeUserContext(context.name);
            let contextStr = `[User: ${safeName}, Streak: ${context.prayerStreak} hari, Date: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}]`;

            const contextualMessage = history.length === 0
                ? `${message}\n\n[App language: ${context.locale}]\n${contextStr}`
                : `${message}\n\n[App language: ${context.locale}]`;

            const result = await chat.sendMessage(contextualMessage);
            const response = await result.response;

            try {
                return response.text();
            } catch (textError) {
                // Check if blocked due to safety
                if (response.promptFeedback?.blockReason) {
                    throw new ProviderError(
                        `Response blocked: ${response.promptFeedback.blockReason}`,
                        400,
                        'SAFETY_BLOCK',
                        false
                    );
                }
                // Check for safety ratings if available in candidates
                if (response.candidates && response.candidates[0]?.finishReason) {
                    const reason = response.candidates[0].finishReason;
                    if (reason === 'SAFETY' || reason === 'RECITATION' || reason === 'OTHER') {
                        throw new ProviderError(
                            `Response filtered: ${reason}`,
                            400,
                            'CONTENT_FILTER',
                            false
                        );
                    }
                }
                throw textError;
            }

        } catch (error: any) {

            // Map Gemini errors to ProviderError
            if (error.status === 429 || error.code === 'RESOURCE_EXHAUSTED') {
                throw new ProviderError(
                    'Rate limit exceeded',
                    429,
                    'RATE_LIMIT',
                    true
                );
            }

            if (error.status === 404 || error.message?.includes('models/')) {
                throw new ProviderError(
                    'Model not found',
                    404,
                    'MODEL_NOT_FOUND',
                    false
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
                error.message || 'Unknown Gemini error',
                error.status,
                error.code,
                true
            );
        }
    }
}
