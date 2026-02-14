import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Define mocks first
const mocks = vi.hoisted(() => ({
    findFirstUser: vi.fn(),
    findManyBookmarks: vi.fn(),
    findManyMissions: vi.fn(),
    findManyIntentions: vi.fn(),
    findManyActivities: vi.fn(),
}));

// Mock next/server to support new NextResponse and NextRequest.url
vi.mock('next/server', () => {
    return {
        NextRequest: class MockNextRequest {
            body: any
            headers: Headers
            url: string
            constructor(input: string, init?: any) {
                this.body = init?.body || null;
                this.headers = new Headers(init?.headers || {});
                this.url = input;
            }
            async json() { return JSON.parse(this.body || '{}'); }
        },
        NextResponse: class MockNextResponse {
            static json(body: any, init?: any) {
                return { body, status: init?.status || 200 };
            }
            constructor(body: any, init?: any) {
                 // Return a plain object structure matching what we expect in tests
                 return { body, status: init?.status || 200 } as any;
            }
        }
    }
});

vi.mock('@/db', () => ({
    db: {
        query: {
            users: {
                findFirst: mocks.findFirstUser,
            },
            bookmarks: {
                findMany: mocks.findManyBookmarks,
            },
            userCompletedMissions: {
                findMany: mocks.findManyMissions,
            },
            intentions: {
                findMany: mocks.findManyIntentions,
            },
            dailyActivities: {
                findMany: mocks.findManyActivities,
            },
        },
    },
}));

vi.mock('@/db/schema', () => ({
    users: { email: 'email' },
    bookmarks: { userId: 'userId' },
    userCompletedMissions: { userId: 'userId' },
    intentions: { userId: 'userId' },
    dailyActivities: { userId: 'userId' },
}));

vi.mock('drizzle-orm', () => ({
    eq: vi.fn(),
}));

// Import AFTER mocking
import { GET } from '../../app/api/debug/user-data/route';
import { NextRequest } from 'next/server';

describe('GET /api/debug/user-data', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.resetModules();
        process.env = { ...originalEnv };
        vi.clearAllMocks();
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('should return user data when email is provided (VULNERABILITY REPRODUCTION)', async () => {
        // Setup mock return values
        mocks.findFirstUser.mockResolvedValue({ id: 'user-1', email: 'test@example.com', settings: {} });
        mocks.findManyBookmarks.mockResolvedValue([]);
        mocks.findManyMissions.mockResolvedValue([]);
        mocks.findManyIntentions.mockResolvedValue([]);
        mocks.findManyActivities.mockResolvedValue([]);

        const url = 'http://localhost/api/debug/user-data?email=test@example.com';
        const req = new NextRequest(url);

        const res = await GET(req) as any;

        // Assert it returns 200 and data
        if (res.status === 500) {
             console.error('API Error:', res.body);
        }
        expect(res.status).toBe(200);
        expect(res.body.user.email).toBe('test@example.com');
    });

    it('should return 404 or 403 in production environment', async () => {
        process.env.NODE_ENV = 'production';

        // Setup mock return values to avoid null pointer if code proceeds
        mocks.findFirstUser.mockResolvedValue({ id: 'user-1', email: 'test@example.com', settings: {} });

        const url = 'http://localhost/api/debug/user-data?email=test@example.com';
        const req = new NextRequest(url);

        const res = await GET(req) as any;

        expect(res.status).toBe(404);
    });
});
