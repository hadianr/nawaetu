import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { getServerSession } from 'next-auth';

// Mock dependencies
vi.mock('@/db', () => ({
    db: {
        select: vi.fn(),
    }
}));

vi.mock('next-auth', () => ({
    getServerSession: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
    authOptions: {},
}));

// Mock schema
vi.mock('@/db/schema', () => ({
    pushSubscriptions: { token: 'token', userId: 'userId' },
    users: { id: 'id', email: 'email', niatStreakCurrent: 'niatStreakCurrent' },
    intentions: { id: 'id', userId: 'userId', niatDate: 'niatDate', niatText: 'niatText', reflectedAt: 'reflectedAt', reflectionRating: 'reflectionRating', reflectionText: 'reflectionText' },
}));

// Override next/server mock to handle URL and JSON response
vi.mock('next/server', () => {
    return {
        NextRequest: class MockNextRequest {
            url: string;
            body: any;
            headers: Headers;
            constructor(input: string, init?: any) {
                this.url = input;
                this.body = init?.body || null;
                this.headers = new Headers(init?.headers || {});
            }
            async json() {
                return JSON.parse(this.body || '{}');
            }
        },
        NextResponse: {
            json: vi.fn((body, init) => ({
                body,
                status: init?.status || 200,
                json: async () => body
            })),
        }
    };
});

// Import GET after mocking
import { GET } from './route';

// Setup mock return values
const mockDbSelect = db.select as any;
const mockGetServerSession = getServerSession as any;

describe('GET /api/intentions/today', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Mock chainable db methods default return
        mockDbSelect.mockReturnValue({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockReturnValue([]),
                })
            })
        });
    });

    it('should return 401 if user_token is missing', async () => {
        const req = new NextRequest('http://localhost/api/intentions/today');
        const res = await GET(req);

        // Check mocked response structure
        expect(res.status).toBe(401);
        const json = await res.json();
        expect(json.error).toBe("User token is required");
    });

    it('should return 401 (Fixed) for registered user accessing via token WITHOUT session', async () => {
        const userId = 'user-123';
        const token = 'fcm-token-123';

        const mockLimit = vi.fn()
            .mockResolvedValueOnce([{ userId, token }]) // Subscription
            .mockResolvedValueOnce([{ id: userId, email: 'user@example.com' }]) // User check
            .mockResolvedValueOnce([{ id: userId, email: 'user@example.com', niatStreakCurrent: 0 }]) // User stats (refresh streak)
            .mockResolvedValueOnce([]); // Intention fetch (empty)

        mockDbSelect.mockReturnValue({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                     limit: mockLimit,
                     // Add logic for 'and' condition if needed
                })
            })
        });

        // Mock NO session
        mockGetServerSession.mockResolvedValue(null);

        const req = new NextRequest(`http://localhost/api/intentions/today?user_token=${token}`);
        const res = await GET(req);

        // EXPECTATION: 401 (After fix).
        // CURRENTLY: The code returns 200 or 500 (if it crashes on subsequent steps due to mocks).
        // Since we didn't mock intention query, if it proceeds past user check, it might crash or return 200 with empty data.
        // Let's verify what it does CURRENTLY.
        // If it returns 200 or 500, we mark this test as "Expected to fail" or assert current behavior to confirm vulnerability.
        // But for TDD, I'll assert 401 and let it fail, then fix.

        expect(res.status).toBe(401);
    });

    it('should return 200 for ANONYMOUS user accessing via token WITHOUT session', async () => {
        const userId = 'anon-123';
        const token = 'anon-token-123';

        const mockLimit = vi.fn()
            .mockResolvedValueOnce([{ userId, token }]) // Subscription
            .mockResolvedValueOnce([{ id: userId, email: 'anon-token-123@nawaetu.local' }]) // User check
            .mockResolvedValueOnce([{ id: userId, email: 'anon-token-123@nawaetu.local', niatStreakCurrent: 0 }]) // User stats (refetched)
            .mockResolvedValueOnce([]); // Intention check

        mockDbSelect.mockReturnValue({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                     limit: mockLimit,
                     orderBy: vi.fn().mockReturnThis(), // handle orderBy in user intentions query if any (not in GET /today though)
                })
            })
        });

        mockGetServerSession.mockResolvedValue(null);

        const req = new NextRequest(`http://localhost/api/intentions/today?user_token=${token}`);
        const res = await GET(req);

        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.success).toBe(true);
    });

    it('should return 200 for REGISTERED user accessing via token WITH valid session', async () => {
        const userId = 'user-123';
        const token = 'fcm-token-123';

        const mockLimit = vi.fn()
            .mockResolvedValueOnce([{ userId, token }]) // Subscription
            .mockResolvedValueOnce([{ id: userId, email: 'user@example.com' }]) // User check
            .mockResolvedValueOnce([{ id: userId, email: 'user@example.com', niatStreakCurrent: 5 }]) // User stats
            .mockResolvedValueOnce([]); // Intention check

        mockDbSelect.mockReturnValue({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                     limit: mockLimit
                })
            })
        });

        // Mock Valid Session
        mockGetServerSession.mockResolvedValue({ user: { id: userId } });

        const req = new NextRequest(`http://localhost/api/intentions/today?user_token=${token}`);
        const res = await GET(req);

        expect(res.status).toBe(200);
    });
});
