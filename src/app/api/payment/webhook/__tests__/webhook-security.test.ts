import { POST } from '../route';
import { NextRequest } from 'next/server';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
// We don't import db here directly for mocking, we rely on vi.mock('@/db')
import crypto from 'crypto';

// Mock DB - This will override the mock in setup.ts for this file
const { mockFindFirst, mockUpdate } = vi.hoisted(() => {
    return {
        mockFindFirst: vi.fn(),
        mockUpdate: vi.fn(),
    }
});

vi.mock('@/db', () => ({
    db: {
        query: {
            transactions: {
                findFirst: mockFindFirst,
            },
            users: {
                findFirst: vi.fn(),
            }
        },
        update: mockUpdate
    }
}));

// We need to access the mocked functions to set return values
import { db } from '@/db';

describe('Payment Webhook Security', () => {
    const originalEnv = process.env;
    const SECRET = 'test-secret';

    beforeEach(() => {
        vi.clearAllMocks();
        process.env = { ...originalEnv };
        process.env.MAYAR_WEBHOOK_SECRET = SECRET;
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('REJECTS webhook with invalid signature', async () => {
        const payload = {
            id: 'txn_123',
            status: 'SETTLEMENT',
            amount: 10000
        };
        const body = JSON.stringify(payload);

        // Create a request with an invalid signature
        const req = new NextRequest('http://localhost/api/payment/webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Mayar-Signature': 'invalid-signature'
            },
            body: body
        });

        const res = await POST(req);

        // Assert: 401 Unauthorized
        expect(res.status).toBe(401);
        // Helper to get body from mock response
        const json = (res as any).body;
        expect(json.error).toBe("Invalid Signature");

        // Verify that it did NOT process the update
        expect(db.update).not.toHaveBeenCalled();
    });

    it('REJECTS webhook with missing signature', async () => {
        const payload = {
            id: 'txn_123',
            status: 'SETTLEMENT',
            amount: 10000
        };
        const body = JSON.stringify(payload);

        const req = new NextRequest('http://localhost/api/payment/webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
                // No signature header
            },
            body: body
        });

        const res = await POST(req);

        // Assert: 400 Bad Request (Missing Signature)
        expect(res.status).toBe(400);
        const json = (res as any).body;
        expect(json.error).toBe("Missing Signature");

        expect(db.update).not.toHaveBeenCalled();
    });

    it('ACCEPTS webhook with VALID signature', async () => {
        const payload = {
            id: 'txn_123',
            status: 'SETTLEMENT',
            amount: 10000
        };
        const body = JSON.stringify(payload);

        // Calculate valid signature
        const signature = crypto.createHmac('sha256', SECRET)
            .update(body)
            .digest('hex');

        const req = new NextRequest('http://localhost/api/payment/webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Mayar-Signature': signature
            },
            body: body
        });

        // Mock DB finding a transaction
        const mockTransaction = {
            id: 'tx_1',
            status: 'pending',
            amount: 10000,
            userId: 'user_1',
            paymentLinkId: 'link_123',
            mayarId: 'txn_123'
        };

        vi.mocked(db.query.transactions.findFirst).mockResolvedValue(mockTransaction as any);

        // Mock update
        vi.mocked(db.update).mockReturnValue({
             set: vi.fn().mockReturnValue({
                 where: vi.fn().mockResolvedValue({})
             })
        } as any);

        const res = await POST(req);

        // Assert: 200 OK
        expect(res.status).toBe(200);

        // Verify that it processed the update
        expect(db.update).toHaveBeenCalled();
    });
});
