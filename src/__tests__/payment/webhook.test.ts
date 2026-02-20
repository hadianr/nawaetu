
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { POST } from '@/app/api/payment/webhook/route';
import { db } from '@/db';
import { transactions, users } from '@/db/schema';
import { NextRequest } from 'next/server';
import crypto from 'crypto';

// Create a stable mock chain for DB updates
const updateChain = {
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnValue([{ status: 'settlement' }]), // Add returning mock
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
    ne: vi.fn(), // Added
}));

describe('Payment Webhook', () => {
    const originalEnv = process.env;
    const SECRET = 'test-secret';

    beforeEach(() => {
        vi.clearAllMocks();
        // Reset chain spies
        updateChain.set.mockClear();
        updateChain.where.mockClear();
        updateChain.returning.mockClear(); // Clear returning spy
        updateChain.returning.mockReturnValue([{ status: 'settlement' }]); // Default success

        process.env = { ...originalEnv };
        process.env.MAYAR_WEBHOOK_SECRET = SECRET;
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

    it('should update transaction status and user status to Muhsinin on direct mayarId match', async () => {
        // Mock DB findFirst
        const mockTransaction = { id: 'tx-123', userId: 'user-1', mayarId: 'mayar-tx-123', amount: 10000 };
        (db.query.transactions.findFirst as Mock).mockResolvedValue(mockTransaction);

        const payload = {
            id: 'mayar-tx-123',
            status: 'PAID',
            amount: 10000
        };

        const req = createSignedRequest(payload);
        const res = await POST(req);

        expect(res.status).toBe(200);

        // Assert: Transaction Updated
        expect(db.update).toHaveBeenCalledTimes(2); // Once for tx, once for user

        // Check first call (transaction)
        expect(updateChain.set).toHaveBeenCalledWith(expect.objectContaining({
            status: 'settlement',
            mayarId: 'mayar-tx-123'
        }));

        // Check second call (user)
        expect(updateChain.set).toHaveBeenCalledWith(expect.objectContaining({
            isMuhsinin: true
        }));
    });

    it('should match via Payment Link ID and update mayarId', async () => {
        const mockTransaction = {
            id: 'tx-456',
            userId: 'user-2',
            paymentLinkId: 'link-abc',
            mayarId: null,
            amount: 50000
        };
        (db.query.transactions.findFirst as Mock).mockResolvedValue(mockTransaction);

        const payload = {
            id: 'mayar-real-tx-456',
            link_id: 'link-abc',
            status: 'SETTLEMENT',
            amount: 50000
        };

        const req = createSignedRequest(payload);

        const res = await POST(req);
        expect(res.status).toBe(200);

        // Assert: mayarId and status updated
        expect(updateChain.set).toHaveBeenCalledWith(expect.objectContaining({
            status: 'settlement',
            mayarId: 'mayar-real-tx-456'
        }));

        // Assert: User Updated
        expect(updateChain.set).toHaveBeenCalledWith(expect.objectContaining({
            isMuhsinin: true
        }));
    });

    it('should fallback to email/amount match if ID not found', async () => {
        // Mock: ID search fails
        (db.query.transactions.findFirst as Mock).mockResolvedValueOnce(null);

        // Mock: Fallback search succeeds
        const mockPendingTx = { id: 'tx-789', userId: 'user-3', amount: 10000, status: 'pending' };
        (db.query.transactions.findFirst as Mock).mockResolvedValueOnce(mockPendingTx);

        const payload = {
            id: 'mayar-tx-789',
            customer_email: 'test@user.com',
            amount: 10000,
            status: 'PAID'
        };

        const req = createSignedRequest(payload);

        await POST(req);

        // Assert: Update with fallback logic
        expect(updateChain.set).toHaveBeenCalledWith(expect.objectContaining({
            status: 'settlement',
            mayarId: 'mayar-tx-789'
        }));

        expect(updateChain.set).toHaveBeenCalledWith(expect.objectContaining({ isMuhsinin: true }));
    });

    it('should return 404 if transaction truly not found', async () => {
        // Mock: All searches fail
        (db.query.transactions.findFirst as Mock).mockResolvedValue(null);

        const payload = {
            id: 'unknown-tx',
            status: 'PAID',
            amount: 10000
        };

        const req = createSignedRequest(payload);

        const res = await POST(req);

        expect(res.status).toBe(404);
        // Should NOT update DB
        expect(db.update).not.toHaveBeenCalled();
    });

    it('should NOT update if transaction is already settled', async () => {
        const mockSettledTx = { id: 'tx-settled', userId: 'user-settled', amount: 10000, status: 'settlement', mayarId: 'mayar-tx-settled' };
        (db.query.transactions.findFirst as Mock).mockResolvedValue(mockSettledTx);

        const payload = {
            id: 'mayar-tx-settled',
            status: 'SETTLEMENT',
            amount: 10000
        };

        const req = createSignedRequest(payload);
        const res = await POST(req);

        expect(res.status).toBe(200);
        const json = (res as any).body;
        expect(json.message).toBe("Already processed");

        expect(db.update).not.toHaveBeenCalled();
    });
});
