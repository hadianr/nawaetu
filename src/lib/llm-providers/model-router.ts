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
import { GeminiProvider } from './gemini-provider';
import { GroqProvider } from './groq-provider';
import { OpenRouterProvider } from './openrouter-provider';

/**
 * Model router with 3-tier fallback
 * 1st: Gemini (primary)
 * 2nd: Groq (fast fallback)
 * 3rd: OpenRouter (final fallback)
 */
export class ModelRouter {
    private primaryProvider: LLMProvider;
    private secondaryProvider: LLMProvider;
    private tertiaryProvider: LLMProvider;

    constructor() {
        this.primaryProvider = new GeminiProvider();
        this.secondaryProvider = new GroqProvider();
        this.tertiaryProvider = new OpenRouterProvider();
    }

    async chat(
        message: string,
        context: UserContext,
        history: ChatMessage[]
    ): Promise<{ response: string; provider: string }> {

        // Try primary provider (Gemini)
        try {
            const response = await this.primaryProvider.chat(message, context, history);
            return {
                response,
                provider: this.primaryProvider.name
            };
        } catch (primaryError) {
            // Only fallback on rate limit errors
            if (primaryError instanceof ProviderError && primaryError.status === 429) {

                // Try secondary provider (Groq)
                try {
                    const response = await this.secondaryProvider.chat(message, context, history);
                    return {
                        response,
                        provider: this.secondaryProvider.name
                    };
                } catch (secondaryError) {
                    // If secondary also fails with rate limit, try tertiary
                    if (secondaryError instanceof ProviderError && secondaryError.status === 429) {

                        try {
                            const response = await this.tertiaryProvider.chat(message, context, history);
                            return {
                                response,
                                provider: this.tertiaryProvider.name
                            };
                        } catch (tertiaryError) {
                            throw tertiaryError;
                        }
                    }

                    // If secondary failed for non-rate-limit reason, throw that error
                    throw secondaryError;
                }
            }

            // For non-rate-limit errors from primary, don't fallback
            throw primaryError;
        }
    }
}
