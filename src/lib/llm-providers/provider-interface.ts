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

// Common interface for all LLM providers

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface UserContext {
    name: string;
    prayerStreak: number;
    lastPrayer: string;
    dailySpiritualItem?: import('@/data/spiritual-content').SpiritualItem;
}

export interface LLMProvider {
    name: string;
    chat(message: string, context: UserContext, history: ChatMessage[]): Promise<string>;
}

export class ProviderError extends Error {
    constructor(
        message: string,
        public status?: number,
        public code?: string,
        public isRetryable: boolean = false
    ) {
        super(message);
        this.name = 'ProviderError';
    }
}
