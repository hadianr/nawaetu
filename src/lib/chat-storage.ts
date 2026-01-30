// Utility for localStorage chat history management

const CHAT_STORAGE_KEY = 'nawaetu_chat_history';
const MAX_STORED_MESSAGES = 50; // Limit to prevent localStorage overflow

export interface StoredMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

/**
 * Save chat messages to localStorage
 */
export function saveChatHistory(messages: StoredMessage[]): boolean {
    try {
        // Only store last N messages to save space
        const messagesToStore = messages.slice(-MAX_STORED_MESSAGES);
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messagesToStore));
        return true;
    } catch (error) {
        console.error('Failed to save chat history:', error);
        // localStorage might be full or disabled
        return false;
    }
}

/**
 * Load chat messages from localStorage
 */
export function loadChatHistory(): StoredMessage[] {
    try {
        const stored = localStorage.getItem(CHAT_STORAGE_KEY);
        if (!stored) return [];

        const messages = JSON.parse(stored) as StoredMessage[];

        // Validate messages structure
        if (!Array.isArray(messages)) return [];

        // Filter out invalid messages and old messages (> 7 days)
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        return messages.filter(msg =>
            msg.id &&
            msg.role &&
            msg.content &&
            msg.timestamp &&
            msg.timestamp > sevenDaysAgo
        );
    } catch (error) {
        console.error('Failed to load chat history:', error);
        return [];
    }
}

/**
 * Clear chat history from localStorage
 */
export function clearChatHistory(): boolean {
    try {
        localStorage.removeItem(CHAT_STORAGE_KEY);
        return true;
    } catch (error) {
        console.error('Failed to clear chat history:', error);
        return false;
    }
}

/**
 * Check if localStorage is available
 */
export function isStorageAvailable(): boolean {
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch {
        return false;
    }
}
