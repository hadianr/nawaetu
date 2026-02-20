
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

        // Verify values passed to the single insert call
        // The first argument to .values() should be an array of length 3
        const valuesCall = txMock.values.mock.calls[0]; // Assuming it's the first call to values globally?
        // No, txMock.values is shared. I need to match it to the insert call.
        // But since I mock `insert` to return `this` (which is `txMock`), checking `txMock.values` calls is fine if order matches.

        // However, robust way is to spy on result of insert.
        // But let's assume if insertCalls.length is 1 and we passed 3 intentions, it must be bulk insert
        // because loop logic would call insert 3 times.

        // We can inspect the arguments to `values`.
        // txMock.values might be called multiple times if other sync steps run.
        // But intentions is step 5.
        // We can check if *any* call to values received an array of length 3.
        const bulkInsertCall = txMock.values.mock.calls.find((args: any) => Array.isArray(args[0]) && args[0].length === 3);
        expect(bulkInsertCall).toBeDefined();
    });
});
