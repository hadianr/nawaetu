
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { POST } from '@/app/api/user/sync/route';
import { db } from '@/db';
import { userCompletedMissions } from '@/db/schema';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';

// Mock NextAuth
vi.mock('next-auth', () => ({
    getServerSession: vi.fn(),
    authOptions: {}
}));

// Mock DB Schema - overriding global mock
vi.mock('@/db/schema', () => ({
    users: { id: 'id', settings: 'settings' },
    bookmarks: { id: 'id', userId: 'userId', key: 'key' },
    intentions: { id: 'id', userId: 'userId', niatDate: 'niatDate' },
    userCompletedMissions: { id: 'id', userId: 'userId', missionId: 'missionId' },
    dailyActivities: { id: 'id', userId: 'userId', date: 'date' },
    userReadingState: { userId: 'userId' },
    transactions: {},
    accounts: {},
    sessions: {},
    verificationTokens: {}
}));

// Mock DB
const insertChain = {
    values: vi.fn().mockReturnThis(),
    onConflictDoNothing: vi.fn().mockResolvedValue([]),
    onConflictDoUpdate: vi.fn().mockResolvedValue([]),
    returning: vi.fn().mockResolvedValue([{ id: 'mock-id' }]),
};

const updateChain = {
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue([]),
};

const queryChain = {
    findFirst: vi.fn(),
};

vi.mock('@/db', () => ({
    db: {
        insert: vi.fn(() => insertChain),
        update: vi.fn(() => updateChain),
        query: {
            users: { findFirst: vi.fn() },
            bookmarks: { findFirst: vi.fn() },
            userCompletedMissions: { findFirst: vi.fn() },
        },
    }
}));

// Mock NextResponse
vi.mock('next/server', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        NextResponse: {
            json: vi.fn().mockImplementation((body, init) => ({ body, status: init?.status || 200 })),
        },
    };
});


describe('User Sync API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset chain mocks
        insertChain.values.mockClear();
        insertChain.onConflictDoNothing.mockClear();
    });

    it('should use bulk insert for syncing legacy missions (N+1 optimization)', async () => {
        // Mock Session
        (getServerSession as Mock).mockResolvedValue({ user: { id: 'test-user-id' } });

        // Mock DB: User settings
        (db.query.users.findFirst as Mock).mockResolvedValue({ settings: {} });

        // Create a large payload of missions
        const missionCount = 100;
        const missions = Array.from({ length: missionCount }, (_, i) => ({
            id: `mission-${i}`,
            xpEarned: 10,
            completedAt: new Date().toISOString(),
        }));

        const body = {
            completedMissions: missions,
        };

        const req = {
            json: async () => body,
        } as unknown as NextRequest;

        await POST(req);

        // Assert number of insert calls
        // We focus on userCompletedMissions inserts.
        // Count how many times db.insert was called with userCompletedMissions
        const insertCalls = (db.insert as Mock).mock.calls.filter(call => call[0] === userCompletedMissions);

        // Should be called only once with bulk insert
        expect(insertCalls.length).toBe(1);

        // Verify the values passed to insert
        // db.insert(table) returns { values: fn }
        // We need to check the call to .values() on the returned object from the first call to db.insert(userCompletedMissions)
        // Since we mock it to return insertChain, we can check insertChain.values

        expect(insertChain.values).toHaveBeenCalledTimes(1);
        const args = insertChain.values.mock.calls[0][0];
        expect(args).toHaveLength(missionCount);
        expect(args[0]).toHaveProperty('missionId', 'mission-0');
    });
});
