// Utility for chat history management using StorageService
import { getStorageService } from "@/core/infrastructure/storage";

const CHAT_STORAGE_KEY = 'nawaetu_chat_history';
const MAX_STORED_MESSAGES = 50; // Limit to prevent storage overflow

const storage = getStorageService();

export interface StoredMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

/**
 * Save chat messages to storage
 */
export function saveChatHistory(messages: StoredMessage[]): boolean {
    try {
        // Only store last N messages to save space
        const messagesToStore = messages.slice(-MAX_STORED_MESSAGES);
        storage.set(CHAT_STORAGE_KEY as any, JSON.stringify(messagesToStore));
        return true;
    } catch (error) {
        console.error('Failed to save chat history:', error);
        // Storage might be full or disabled
        return false;
    }
}

/**
 * Load chat messages from storage
 */
export function loadChatHistory(): StoredMessage[] {
    try {
        const stored = storage.getOptional<string>(CHAT_STORAGE_KEY as any);
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
 * Clear chat history from storage
 */
export function clearChatHistory(): boolean {
    try {
        storage.remove(CHAT_STORAGE_KEY as any);
        return true;
    } catch (error) {
        console.error('Failed to clear chat history:', error);
        return false;
    }
}

/**
 * Check if storage is available
 */
export function isStorageAvailable(): boolean {
    try {
        const test = '__storage_test__';
        storage.set(test as any, test);
        storage.remove(test as any);
        return true;
    } catch {
        return false;
    }
}
