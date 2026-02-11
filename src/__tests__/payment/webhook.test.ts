
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { POST } from '@/app/api/payment/webhook/route';
import { db } from '@/db';
import { transactions, users } from '@/db/schema';
import { NextRequest } from 'next/server';

// Create a stable mock chain for DB updates
const updateChain = {
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
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

describe('Payment Webhook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset chain spies
        updateChain.set.mockClear();
        updateChain.where.mockClear();
    });

    it('should update transaction status and user status to Muhsinin on direct mayarId match', async () => {
        // Mock DB findFirst
        const mockTransaction = { id: 'tx-123', userId: 'user-1', mayarId: 'mayar-tx-123', amount: 10000 };
        (db.query.transactions.findFirst as Mock).mockResolvedValue(mockTransaction);

        const payload = {
            id: 'mayar-tx-123',
            status: 'PAID',
            amount: 10000
        };

        const req = {
            json: async () => payload,
            headers: new Map(),
            // Minimum required props to satisfy basic typing if needed, else cast to any
        } as unknown as NextRequest;

        const res = await POST(req);

        // Assert: Transaction Updated
        expect(db.update).toHaveBeenCalledWith(transactions);
        expect(updateChain.set).toHaveBeenCalledWith(expect.objectContaining({
            status: 'paid',
            mayarId: 'mayar-tx-123'
        }));

        // Assert: User Updated to Muhsinin
        expect(db.update).toHaveBeenCalledWith(users);
        expect(updateChain.set).toHaveBeenCalledWith(expect.objectContaining({
            isMuhsinin: true
        }));

        expect(res.status).toBe(200);
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

        const req = {
            json: async () => payload,
            headers: new Map(),
        } as unknown as NextRequest;

        await POST(req);

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

        const req = {
            json: async () => payload,
            headers: new Map(),
        } as unknown as NextRequest;

        await POST(req);

        // Assert: Update with fallback logic
        expect(updateChain.set).toHaveBeenCalledWith(expect.objectContaining({
            status: 'paid',
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

        const req = {
            json: async () => payload,
            headers: new Map(),
        } as unknown as NextRequest;

        const res = await POST(req);

        expect(res.status).toBe(404);
        // Should NOT update DB
        expect(db.update).not.toHaveBeenCalled();
    });
});
