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
import { intentions, users, bookmarks, userCompletedMissions, dailyActivities, userReadingState } from '@/db/schema';

// Mock dependencies
vi.mock('next-auth', () => ({
    getServerSession: vi.fn(() => Promise.resolve({
        user: { id: 'test-user-id', email: 'test@example.com' }
    }))
}));

// Mock NextRequest and NextResponse
const jsonMock = vi.fn((data, init) => ({ json: async () => data, status: init?.status || 200 }));
vi.mock('next/server', () => ({
    NextRequest: class {
        constructor(input, init) {
            this.body = init?.body;
        }
        json() {
            return Promise.resolve(JSON.parse(this.body));
        }
    },
    NextResponse: {
        json: (data, init) => ({ ...data, status: init?.status || 200 })
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

describe('POST /api/user/sync-guest', () => {
    let txMock: any;

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup transaction mock
        txMock = {
            insert: vi.fn().mockReturnThis(),
            values: vi.fn().mockReturnThis(),
            onConflictDoNothing: vi.fn().mockReturnThis(),
            onConflictDoUpdate: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            set: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            query: {
                intentions: {
                    findMany: vi.fn().mockResolvedValue([])
                }
            }
        };

        (db.transaction as any).mockImplementation(async (callback: any) => {
            await callback(txMock);
        });
    });

    it('should use bulk insert (1 call) for multiple intentions', async () => {
        const payload = {
            intentions: [
                { niatText: 'Intention 1', niatDate: '2023-01-01' },
                { niatText: 'Intention 2', niatDate: '2023-01-02' },
                { niatText: 'Intention 3', niatDate: '2023-01-03' },
            ]
        };

        const req = {
            json: async () => payload,
            headers: new Headers(),
        };

        await POST(req as any);

        expect(db.transaction).toHaveBeenCalled();

        // Filter calls for intentions table
        const insertCalls = txMock.insert.mock.calls.filter((call: any) => call[0] === intentions);

        // Assert optimization: 1 call instead of N
        expect(insertCalls.length).toBe(1);
    });

    it('should use bulk insert (1 call) for multiple completed missions', async () => {
        const payload = {
            completedMissions: [
                { id: 'm1', xpEarned: 10, completedAt: '2023-01-01' },
                { id: 'm2', xpEarned: 20, completedAt: '2023-01-02' },
                { id: 'm3', xpEarned: 30, completedAt: '2023-01-03' },
            ]
        };

        const req = {
            json: async () => payload,
            headers: new Headers(),
        };

        await POST(req as any);

        // Filter calls for userCompletedMissions table
        const insertCalls = txMock.insert.mock.calls.filter((call: any) => call[0] === userCompletedMissions);

        // Expecting 1 call (bulk insert)
        expect(insertCalls.length).toBe(1);

        // Verify values passed to the single insert call
        const bulkInsertValuesCall = txMock.values.mock.calls.find((args: any) => Array.isArray(args[0]) && args[0].length === 3);
        expect(bulkInsertValuesCall).toBeDefined();

        // Verify content of the first item
        const firstItem = bulkInsertValuesCall[0][0];
        expect(firstItem).toMatchObject({
            userId: 'test-user-id',
            missionId: 'm1',
            xpEarned: 10,
        });
    });
});
