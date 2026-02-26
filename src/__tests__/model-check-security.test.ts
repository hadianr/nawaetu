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

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkAvailableModels } from '../app/mentor-ai/model-check';

// Mock next-auth
vi.mock('next-auth', () => ({
    getServerSession: vi.fn(),
}));

// Mock @/lib/auth
vi.mock('@/lib/auth', () => ({
    authOptions: {},
}));

describe('model-check security', () => {
    beforeEach(() => {
        process.env.GEMINI_API_KEY = "test-key";
        vi.clearAllMocks();

        // Mock global fetch
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should deny access if not authenticated', async () => {
        const { getServerSession } = await import('next-auth');
        // @ts-ignore
        vi.mocked(getServerSession).mockResolvedValue(null);

        const result = await checkAvailableModels();
        expect(result).toBe("Unauthorized");
    });

    it('should handle missing API key', async () => {
        const { getServerSession } = await import('next-auth');
        // @ts-ignore
        vi.mocked(getServerSession).mockResolvedValue({ user: { name: 'Test User' } });
        delete process.env.GEMINI_API_KEY;

        const result = await checkAvailableModels();
        expect(result).toBe("No Key");
    });

    it('should list models if authenticated and API works', async () => {
        const { getServerSession } = await import('next-auth');
        // @ts-ignore
        vi.mocked(getServerSession).mockResolvedValue({ user: { name: 'Test User' } });

        const mockModelsResponse = {
            models: [
                { name: "models/gemini-pro" },
                { name: "models/gemini-ultra" }
            ]
        };

        // Mock successful fetch response
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => mockModelsResponse,
        });

        const result = await checkAvailableModels();
        expect(result).toBe("Available models: gemini-pro, gemini-ultra");
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining("https://generativelanguage.googleapis.com/v1beta/models?key=test-key")
        );
    });

    it('should return error message if fetch fails', async () => {
        const { getServerSession } = await import('next-auth');
        // @ts-ignore
        vi.mocked(getServerSession).mockResolvedValue({ user: { name: 'Test User' } });

        // Mock failed fetch response
        (global.fetch as any).mockResolvedValue({
            ok: false,
            status: 403,
            statusText: "Forbidden",
            text: async () => "API key not valid",
        });

        const result = await checkAvailableModels();
        expect(result).toContain("Error listing/checking models: Failed to list models: 403 Forbidden - API key not valid");
    });
});
