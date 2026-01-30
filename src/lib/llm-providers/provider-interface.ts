// Common interface for all LLM providers

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface UserContext {
    name: string;
    prayerStreak: number;
    lastPrayer: string;
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
