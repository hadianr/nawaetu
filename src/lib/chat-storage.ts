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

// Utility for chat history management using StorageService
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "./constants/storage-keys";

const CHAT_SESSIONS_KEY = STORAGE_KEYS.AI_CHAT_SESSIONS;
const OLD_CHAT_HISTORY_KEY = STORAGE_KEYS.AI_CHAT_HISTORY_OLD;
const MAX_SESSIONS = 50;
const MAX_MESSAGES_PER_SESSION = 50;

const storage = getStorageService();

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

export interface ChatSession {
    id: string;
    title: string;
    messages: ChatMessage[];
    createdAt: number;
    updatedAt: number;
}

/**
 * Get all chat sessions
 */
export function getAllSessions(): ChatSession[] {
    try {
        // 1. Check for new session storage
        const storedSessions = storage.getOptional<string>(CHAT_SESSIONS_KEY as any);
        if (storedSessions) {
            const sessions = JSON.parse(storedSessions) as ChatSession[];
            return sessions.sort((a, b) => b.updatedAt - a.updatedAt);
        }

        // 2. Migration: Check for old history and convert to first session
        const oldHistory = storage.getOptional<string>(OLD_CHAT_HISTORY_KEY as any);
        if (oldHistory) {
            const messages = JSON.parse(oldHistory) as ChatMessage[];
            if (messages.length > 0) {
                // Create a session from old history
                const firstUserMsg = messages.find(m => m.role === 'user');
                const title = firstUserMsg ? truncateTitle(firstUserMsg.content) : "Percakapan Lama";

                const initialSession: ChatSession = {
                    id: crypto.randomUUID(),
                    title: title,
                    messages: messages,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                };

                // Save to new format and clear old
                saveAllSessions([initialSession]);
                storage.remove(OLD_CHAT_HISTORY_KEY as any);
                return [initialSession];
            }
        }

        return [];
    } catch (error) {
        return [];
    }
}

/**
 * Get a specific session by ID
 */
export function getSession(id: string): ChatSession | null {
    const sessions = getAllSessions();
    return sessions.find(s => s.id === id) || null;
}

/**
 * Save a specific session (create or update)
 */
export function saveSession(session: ChatSession): void {
    const sessions = getAllSessions();
    const index = sessions.findIndex(s => s.id === session.id);

    // Limit messages in session
    const cleanedSession = {
        ...session,
        messages: session.messages.slice(-MAX_MESSAGES_PER_SESSION)
    };

    if (index >= 0) {
        sessions[index] = cleanedSession;
    } else {
        sessions.unshift(cleanedSession);
    }

    // Limit total number of sessions
    if (sessions.length > MAX_SESSIONS) {
        sessions.length = MAX_SESSIONS;
    }

    saveAllSessions(sessions);
}

/**
 * Create a new empty session
 */
export function createNewSession(): ChatSession {
    return {
        id: crypto.randomUUID(),
        title: "Percakapan Baru",
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
}

/**
 * Delete a session
 */
export function deleteSession(id: string): void {
    const sessions = getAllSessions().filter(s => s.id !== id);
    saveAllSessions(sessions);
}

/**
 * Internal: Save full list of sessions
 */
function saveAllSessions(sessions: ChatSession[]): void {
    try {
        storage.set(CHAT_SESSIONS_KEY as any, JSON.stringify(sessions));
    } catch (error) {
    }
}

/**
 * Helper: Truncate message for title
 */
function truncateTitle(content: string, maxLength = 30): string {
    const clean = content.replace(/\n/g, ' ').trim();
    return clean.length > maxLength ? clean.substring(0, maxLength) + '...' : clean;
}

// Deprecated functions (kept for compatibility during refactor if needed, or safe to remove if we update all calls)
export function loadChatHistory() { return []; }
export function saveChatHistory() { return false; }

