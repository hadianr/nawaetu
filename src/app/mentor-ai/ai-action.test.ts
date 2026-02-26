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
import { askMentor } from './ai-action';
import { chatRateLimiter } from '@/lib/rate-limit';
import { getServerSession } from 'next-auth';

// Mocks
vi.mock('next-auth', () => ({
    getServerSession: vi.fn()
}));

vi.mock('@/lib/auth', () => ({
    authOptions: {}
}));

vi.mock('@/lib/rate-limit', () => ({
    chatRateLimiter: {
        check: vi.fn().mockResolvedValue({ success: true, remaining: 9 })
    }
}));

vi.mock('@/lib/llm-providers/model-router', () => {
    return {
        ModelRouter: vi.fn().mockImplementation(() => ({
            chat: vi.fn().mockResolvedValue({ response: "AI Response", provider: "Mock" })
        }))
    }
});

vi.mock('@/lib/time-context', () => ({
    getCurrentTimeContext: vi.fn().mockReturnValue({})
}));

describe('askMentor', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should use user ID for rate limiting identifier (security fix)', async () => {
        // Setup authenticated session
        const mockUserId = 'user-123';
        (getServerSession as any).mockResolvedValue({
            user: { id: mockUserId }
        });

        const context = { name: 'Alice', prayerStreak: 5, lastPrayer: 'Fajr' };

        await askMentor('Hello', context);

        // Expect rate limiter to be called with user ID, not name
        // BEFORE FIX: This will fail because it uses `chat:Alice`
        // AFTER FIX: This should pass because it uses `chat:user-123`
        expect(chatRateLimiter.check).toHaveBeenCalledWith(10, `chat:${mockUserId}`);
    });
});
