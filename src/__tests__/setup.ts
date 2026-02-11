import { vi } from 'vitest'

process.env.MAYAR_API_KEY = 'test-key';
process.env.NEXTAUTH_URL = 'http://localhost';

// Mock Drizzle
vi.mock('@/db', () => ({
    db: {
        query: {
            transactions: {
                findFirst: vi.fn(),
            },
            users: {
                findFirst: vi.fn(),
            }
        },
        update: vi.fn(() => ({
            set: vi.fn(() => ({
                where: vi.fn(),
            })),
        })),
        insert: vi.fn(() => ({
            values: vi.fn(),
        })),
        select: vi.fn(() => ({
            from: vi.fn(() => ({
                where: vi.fn(() => ({
                    orderBy: vi.fn(() => ({
                        limit: vi.fn(),
                    }))
                }))
            }))
        }))
    },
}))

// Mock Next server
vi.mock('next/server', () => ({
    NextResponse: {
        json: vi.fn((body, init) => ({ body, status: init?.status || 200 })),
    },
    NextRequest: class MockNextRequest {
        body: any
        headers: Headers
        constructor(input: string, init?: any) {
            this.body = init?.body || null;
            this.headers = new Headers(init?.headers || {});
        }
        async json() {
            return JSON.parse(this.body || '{}');
        }
    }
}))

// Mock Drizzle ORM
vi.mock('drizzle-orm', () => ({
    eq: vi.fn(),
    and: vi.fn(),
    or: vi.fn(),
    desc: vi.fn(),
    sql: vi.fn(),
}))

// Mock Drizzle Adapter for NextAuth
vi.mock('@auth/drizzle-adapter', () => ({
    DrizzleAdapter: vi.fn(() => ({})),
}))


// Mock schema
vi.mock('@/db/schema', () => ({
    transactions: {
        id: 'id',
        mayarId: 'mayarId',
        paymentLinkId: 'paymentLinkId',
        status: 'status',
        userId: 'userId',
        amount: 'amount',
        customerEmail: 'customerEmail',
        createdAt: 'createdAt'
    },
    users: {
        id: 'id',
        totalInfaq: 'totalInfaq',
        isMuhsinin: 'isMuhsinin',
        muhsininSince: 'muhsininSince'
    },
    accounts: { id: 'id', userId: 'userId' },
    sessions: { id: 'id', userId: 'userId' },
    verificationTokens: { identifier: 'identifier', token: 'token' }
}))
