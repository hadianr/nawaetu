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
import { POST } from './route';
import { db } from '@/db';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
    authOptions: {},
    getServerSession: vi.fn(() => Promise.resolve({
        user: { id: 'test-user-id', email: 'test@example.com' }
    }))
}));

// Mock NextRequest and NextResponse
vi.mock('next/server', () => ({
    NextRequest: class {
        body?: string;

        constructor(input: string, init?: { body?: string }) {
            this.body = init?.body;
        }
        json() {
            return Promise.resolve(JSON.parse(this.body ?? '{}'));
        }
    },
    NextResponse: {
        json: (data: Record<string, unknown>, init?: { status?: number }) => ({ ...data, status: init?.status || 200 })
    }
}));

// Mock DB
vi.mock('@/db', () => ({
    db: {
        transaction: vi.fn(),
    }
}));

// Mock Schema
vi.mock('@/db/schema', () => ({
    intentions: { name: 'intentions' },
    users: { name: 'users' },
    bookmarks: { name: 'bookmarks', userId: 'userId', key: 'key' },
    userCompletedMissions: { name: 'userCompletedMissions' },
    dailyActivities: { name: 'dailyActivities', userId: 'userId', date: 'date' },
    userReadingState: { name: 'userReadingState', userId: 'userId' },
    accounts: { name: 'accounts' },
    sessions: { name: 'sessions' },
    verificationTokens: { name: 'verificationTokens' },
}));

describe('POST /api/user/sync-guest - Security Tests', () => {
    let txMock: any;

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup transaction mock
        txMock = {
            query: {
                intentions: {
                    findMany: vi.fn().mockResolvedValue([]),
                }
            },
            insert: vi.fn().mockReturnThis(),
            values: vi.fn().mockReturnThis(),
            onConflictDoNothing: vi.fn().mockReturnThis(),
            onConflictDoUpdate: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            set: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
        };

        (db.transaction as any).mockImplementation(async (callback: any) => {
            await callback(txMock);
        });
    });

    it('should reject request with too many completed missions (>1000)', async () => {
        // Generate 1001 missions
        const missions = Array.from({ length: 1001 }, (_, i) => ({
            id: `mission-${i}`,
            xpEarned: 10,
            completedAt: new Date().toISOString()
        }));

        const payload = {
            completedMissions: missions
        };

        const req = {
            json: async () => payload,
            headers: new Headers(),
        };

        const response: any = await POST(req as any);

        // Should return 400 Bad Request
        expect(response.status).toBe(400);
        expect(response.error).toBe('Invalid data format');
    });

    it('should reject request with too many intentions (>100)', async () => {
        // Generate 101 intentions
        const intentionsList = Array.from({ length: 101 }, (_, i) => ({
            niatText: `Intention ${i}`,
            niatDate: '2023-01-01'
        }));

        const payload = {
            intentions: intentionsList
        };

        const req = {
            json: async () => payload,
            headers: new Headers(),
        };

        const response: any = await POST(req as any);

        expect(response.status).toBe(400);
    });

    it('should reject request with too many bookmarks (>1000)', async () => {
        const bookmarksList = Array.from({ length: 1001 }, (_, i) => ({
            surahId: 1,
            verseId: i,
            surahName: 'Al-Fatiha',
            verseText: 'Test'
        }));

        const payload = {
            bookmarks: bookmarksList
        };

        const req = {
            json: async () => payload,
            headers: new Headers(),
        };

        const response: any = await POST(req as any);

        expect(response.status).toBe(400);
    });
});
