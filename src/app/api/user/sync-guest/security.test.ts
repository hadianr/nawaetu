
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { db } from '@/db';

// Mock dependencies
vi.mock('next-auth', () => ({
    getServerSession: vi.fn(() => Promise.resolve({
        user: { id: 'test-user-id', email: 'test@example.com' }
    }))
}));

// Mock NextRequest and NextResponse
vi.mock('next/server', () => ({
    NextRequest: class {
        constructor(input: any, init: any) {
            this.body = init?.body;
        }
        json() {
            return Promise.resolve(JSON.parse(this.body));
        }
    },
    NextResponse: {
        json: (data: any, init: any) => ({ ...data, status: init?.status || 200 })
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
