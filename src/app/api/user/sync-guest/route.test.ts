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
import { intentions, userCompletedMissions } from '@/db/schema';
import { getServerSession } from '@/lib/auth';

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
        update: vi.fn(() => ({
            set: vi.fn().mockReturnThis(),
            where: vi.fn().mockResolvedValue([]),
        })),
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
    let txMock = createTransactionMock();

    function createTransactionMock() {
        return {
            insert: vi.fn().mockReturnThis(),
            values: vi.fn().mockReturnThis(),
            onConflictDoNothing: vi.fn().mockReturnThis(),
            onConflictDoUpdate: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            set: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            query: {
                intentions: {
                    findMany: vi.fn().mockResolvedValue([]),
                },
            },
        };
    }

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup transaction mock
        txMock = createTransactionMock();

        vi.mocked(db.transaction).mockImplementation(async (callback) => {
            await callback(txMock as never);
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

        await POST(req as Parameters<typeof POST>[0]);

        expect(db.transaction).toHaveBeenCalled();

        // Filter calls for intentions table
        const insertCalls = txMock.insert.mock.calls.filter((call: unknown[]) => call[0] === intentions);

        // Assert optimization: 1 call instead of N
        expect(insertCalls.length).toBe(1);
    });

    it('should use bulk insert (1 call) for multiple completed missions', async () => {
        const payload = {
            completedMissions: [
                { id: 'm1', hasanahEarned: 10, completedAt: '2023-01-01' },
                { id: 'm2', hasanahEarned: 20, completedAt: '2023-01-02' },
                { id: 'm3', hasanahEarned: 30, completedAt: '2023-01-03' },
            ]
        };

        const req = {
            json: async () => payload,
            headers: new Headers(),
        };

        await POST(req as Parameters<typeof POST>[0]);

        // Filter calls for userCompletedMissions table
        const insertCalls = txMock.insert.mock.calls.filter((call: unknown[]) => call[0] === userCompletedMissions);

        // Expecting 1 call (bulk insert)
        expect(insertCalls.length).toBe(1);

        // Verify values passed to the single insert call
        const bulkInsertValuesCall = txMock.values.mock.calls.find((args: unknown[]) => Array.isArray(args[0]) && args[0].length === 3);
        expect(bulkInsertValuesCall).toBeDefined();
        if (!bulkInsertValuesCall) throw new Error('Expected one bulk values call');

        // Verify content of the first item
        const firstItem = bulkInsertValuesCall[0][0];
        expect(firstItem).toMatchObject({
            userId: 'test-user-id',
            missionId: 'm1',
            hasanahEarned: 10,
        });
    });

    it('rejects unauthenticated, malformed, and invalid payloads', async () => {
        vi.mocked(getServerSession).mockResolvedValueOnce(null as never);
        const unauthorized = await POST({ json: async () => ({}) } as Parameters<typeof POST>[0]);
        expect(unauthorized.status).toBe(401);

        vi.mocked(getServerSession).mockResolvedValueOnce({ user: { id: 'test-user-id' } } as never);
        const malformed = await POST({ json: async () => { throw new Error('invalid'); } } as unknown as Parameters<typeof POST>[0]);
        expect(malformed.status).toBe(400);

        const invalid = await POST({ json: async () => ({ bookmarks: [{ surahId: 'bad' }] }) } as Parameters<typeof POST>[0]);
        expect(invalid.status).toBe(400);
    });

    it('consumes guest eligibility without opening a transaction', async () => {
        const req = { json: async () => ({ consumeOnly: true }), headers: new Headers() };
        const response = await POST(req as Parameters<typeof POST>[0]);

        expect(response.status).toBe(200);
        expect(response.status).toBe(200);
        expect(db.transaction).not.toHaveBeenCalled();
    });

    it('syncs profile, settings, bookmarks, activity, and reading state in one transaction', async () => {
        const payload = {
            profile: { name: 'Aisyah', gender: 'female' },
            settings: {
                theme: 'dark',
                locale: 'id',
                calculationMethod: 20,
                ignored: { value: true },
                adhanPreferences: { fajr: true },
            },
            bookmarks: [{ surahId: 2, verseId: 255, surahName: 'Al-Baqarah', verseText: 'Ayah', tags: ['favorite'] }],
            completedMissions: [{ id: 'fajr_prayer', hasanahEarned: 10, completedAt: '2026-01-15' }],
            intentions: [
                { intentionText: 'Read Quran', intentionType: 'daily', intentionDate: '2026-01-15', reflectionText: 'Good', reflectionRating: 5 },
                { niatText: 'Second', niatDate: '2026-01-15' },
            ],
            activity: { date: '2026-01-15', quranAyat: 3, hasanahGained: 10, tasbihCount: 33, prayersLogged: ['fajr'] },
            readingState: { quranLastRead: { surahId: 2, surahName: 'Al-Baqarah', verseId: 255, timestamp: 1768478400000 } },
        };
        const req = { json: async () => payload, headers: new Headers() };
        const response = await POST(req as Parameters<typeof POST>[0]);

        expect(response.status).toBe(200);
        expect(response.status).toBe(200);
        expect(txMock.insert).toHaveBeenCalled();
        expect(txMock.update).toHaveBeenCalled();
        expect(txMock.query.intentions.findMany).toHaveBeenCalled();
    });
});
