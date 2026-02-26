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

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkAvailableModels } from '../app/mentor-ai/model-check';

// Mock next-auth
vi.mock('next-auth', () => ({
    getServerSession: vi.fn(),
}));

// Mock @/lib/auth
vi.mock('@/lib/auth', () => ({
    authOptions: {},
}));

// Mock GoogleGenerativeAI
vi.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: vi.fn(() => ({
            getGenerativeModel: vi.fn(() => ({
                generateContent: vi.fn(() => Promise.resolve({ response: { text: () => "mock response" } })),
            })),
        })),
    };
});

describe('model-check security', () => {
    beforeEach(() => {
        process.env.GEMINI_API_KEY = "test-key";
        vi.clearAllMocks();
    });

    it('should deny access if not authenticated', async () => {
        const { getServerSession } = await import('next-auth');
        // @ts-ignore
        vi.mocked(getServerSession).mockResolvedValue(null);

        const result = await checkAvailableModels();
        expect(result).toBe("Unauthorized");
    });

    it('should allow access if authenticated', async () => {
        const { getServerSession } = await import('next-auth');
        // @ts-ignore
        vi.mocked(getServerSession).mockResolvedValue({ user: { name: 'Test User' } });

        const result = await checkAvailableModels();
        // It returns "gemini-3-flash-preview is working!" on success or "No Key" or error
        // But specifically NOT "Unauthorized"
        expect(result).not.toBe("Unauthorized");
    });
});
