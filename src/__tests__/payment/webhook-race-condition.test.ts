
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { POST } from '@/app/api/payment/webhook/route';
import { db } from '@/db';
import { NextRequest } from 'next/server';
import crypto from 'crypto';

// Update Chain Mock
const updateChain = {
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnValue([]), // Default to empty array (simulate race failure)
};

// Override the global mock for db strictly for this test file
vi.mock('@/db', () => ({
    db: {
        query: {
            transactions: { findFirst: vi.fn() },
            users: { findFirst: vi.fn() }
        },
        update: vi.fn(() => updateChain),
    }
}));

// Override/Extend the global mock for drizzle-orm to include 'ne'
vi.mock('drizzle-orm', () => ({
    eq: vi.fn(),
    and: vi.fn(),
    or: vi.fn(),
    desc: vi.fn(),
    sql: vi.fn(),
    ne: vi.fn(),
}));

describe('Payment Webhook Race Condition', () => {
    const originalEnv = process.env;
    const SECRET = 'test-secret';

    beforeEach(() => {
        vi.clearAllMocks();
        process.env = { ...originalEnv };
        process.env.MAYAR_WEBHOOK_SECRET = SECRET;

        // Reset chain mocks
        updateChain.set.mockClear();
        updateChain.where.mockClear();
        updateChain.returning.mockClear();
        updateChain.returning.mockReturnValue([]); // Default fail
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    const createSignedRequest = (payload: any) => {
        const body = JSON.stringify(payload);
        const signature = crypto.createHmac('sha256', SECRET).update(body).digest('hex');

        return new NextRequest('http://localhost/api/payment/webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Mayar-Signature': signature
            },
            body: body
        });
    };

    it('should NOT update user status if transaction status update fails (race condition)', async () => {
        // Mock: Find pending transaction
        const mockTransaction = { id: 'tx-race', userId: 'user-race', mayarId: 'mayar-race', amount: 10000, status: 'pending' };
        (db.query.transactions.findFirst as Mock).mockResolvedValue(mockTransaction);

        // Mock: Update transaction returns EMPTY array (simulating race condition failure)
        updateChain.returning.mockReturnValue([]);

        const payload = {
            id: 'mayar-race',
            status: 'SETTLEMENT',
            amount: 10000
        };

        const req = createSignedRequest(payload);
        const res: any = await POST(req);

        if (res.status !== 200) {
            console.error('Test Failed Response:', res.body || res);
        }

        expect(res.status).toBe(200);

        // Assert: Transaction update WAS attempted
        expect(db.update).toHaveBeenCalled();

        // Assert: User update was NOT attempted (because tx update returned empty)
        expect(db.update).toHaveBeenCalledTimes(1);
    });
});
