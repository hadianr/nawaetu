
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/intentions/daily/route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/db', () => ({
    db: {
        select: vi.fn(() => ({
            from: vi.fn(() => ({
                where: vi.fn(() => ({
                    limit: vi.fn(() => Promise.resolve([])), // Default: no existing data
                    orderBy: vi.fn(() => Promise.resolve([]))
                })),
                orderBy: vi.fn(() => Promise.resolve([]))
            })),
        })),
        insert: vi.fn(() => ({
            values: vi.fn(() => ({
                returning: vi.fn(() => Promise.resolve([{ id: 'test-id' }])),
            })),
        })),
        update: vi.fn(() => ({
            set: vi.fn(() => ({
                where: vi.fn(() => ({
                    returning: vi.fn(() => Promise.resolve([{ id: 'test-id' }])),
                })),
            })),
        })),
    },
}));

// Mock Schema
vi.mock('@/db/schema', () => ({
    pushSubscriptions: {
        token: 'token',
        userId: 'userId',
    },
    intentions: {
        id: 'id',
        userId: 'userId',
        niatDate: 'niatDate',
        niatText: 'niatText',
        isPrivate: 'isPrivate',
    },
    users: {
        id: 'id',
        email: 'email',
        niatStreakCurrent: 'niatStreakCurrent',
        niatStreakLongest: 'niatStreakLongest',
    },
}));

describe('POST /api/intentions/daily Security', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should reject user_token exceeding 255 characters', async () => {
        const longToken = 'a'.repeat(256);
        const req = new NextRequest('http://localhost/api/intentions/daily', {
            method: 'POST',
            body: JSON.stringify({
                user_token: longToken,
                niat_text: 'Test Intention',
            }),
        });

        const response = await POST(req);

        // Assertions
        // The mock NextResponse returns { body: ..., status: ... }
        expect((response as any).status).toBe(400);
        expect((response as any).body).toEqual({
            success: false,
            error: expect.stringContaining('User token must be a string of 255 characters or less'),
        });
    });

    it('should allow valid user_token', async () => {
        const validToken = 'valid-token-123';
        const req = new NextRequest('http://localhost/api/intentions/daily', {
            method: 'POST',
            body: JSON.stringify({
                user_token: validToken,
                niat_text: 'Test Intention',
            }),
        });

        const response = await POST(req);

        // If validation passes, it should return 200 (or fail later due to mocks, but not 400)
        // With default mocks returning empty arrays, it might proceed to create user/intention and return 200
        expect((response as any).status).toBe(200);
    });
});
