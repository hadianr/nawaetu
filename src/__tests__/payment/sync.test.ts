/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */


import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { GET } from '@/app/api/payment/sync/route';
import { db } from '@/db';
import { transactions } from '@/db/schema';
import { NextRequest } from 'next/server';
import { getServerSession } from '@/lib/auth';

vi.mock('@/lib/auth', () => ({
    authOptions: {},
    getServerSession: vi.fn(),
}));

const updateChain = {
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
};

vi.mock('@/db', () => ({
    db: {
        query: {
            transactions: { findFirst: vi.fn() },
            users: { findFirst: vi.fn() }
        },
        update: vi.fn(() => updateChain),
    }
}));

// Mock global fetch
global.fetch = vi.fn();

describe('Payment Sync', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        updateChain.set.mockClear();
    });

    it('should sync transaction status via direct mayarId lookup', async () => {
        // Mock Session
        (getServerSession as Mock).mockResolvedValue({ user: { email: 'user@test.com' } });

        // Mock DB: User
        (db.query.users.findFirst as Mock).mockResolvedValue({ id: 'user-1', email: 'user@test.com', isMuhsinin: false });

        // Mock DB: Find latest transaction
        const mockTx = { id: 'tx-1', mayarId: 'mayar-real-tx', status: 'pending', amount: 10000, userId: 'user-1' };
        (db.query.transactions.findFirst as Mock).mockResolvedValue(mockTx);

        // Mock Mayar API response
        (global.fetch as Mock).mockResolvedValue({
            ok: true,
            json: async () => ({
                data: { status: 'paid' }
            })
        });

        const req = {} as unknown as NextRequest;
        const res = await GET(req);

        expect(db.update).toHaveBeenCalledWith(transactions);
        expect(updateChain.set).toHaveBeenCalledWith(expect.objectContaining({ status: 'settlement' }));
        expect(res.status).toBe(200);
    });

    it('should fallback to v2 unpaid transactions when mayarId is missing', async () => {
        (getServerSession as Mock).mockResolvedValue({ user: { email: 'user@test.com' } });

        // Mock DB: User
        (db.query.users.findFirst as Mock).mockResolvedValue({ id: 'user-2', email: 'user@test.com', isMuhsinin: false });

        // DB: Transaction has only paymentLinkId
        const mockTx = { id: 'tx-2', mayarId: null, paymentLinkId: 'link-999', status: 'pending', amount: 25000, userId: 'user-2' };
        (db.query.transactions.findFirst as Mock).mockResolvedValue(mockTx);

        // Mayar v2: unpaid transactions are queried by payment link ID.
        (global.fetch as Mock).mockResolvedValue({
            ok: true,
            json: async () => ({
                data: [
                    { id: 'real-tx-999', paymentLinkId: 'link-999', status: 'active', amount: 25000 }
                ]
            })
        });

        const req = {} as unknown as NextRequest;
        await GET(req);

        // Assert: Found via v2 unpaid list and retained as pending.
        expect(updateChain.set).toHaveBeenCalledWith(expect.objectContaining({
            mayarId: 'real-tx-999',
            status: 'pending'
        }));
        expect(global.fetch).toHaveBeenCalledWith(
            'https://api.mayar.id/hl/v2/transactions/unpaid?paymentLinkId=link-999&limit=50',
            expect.any(Object)
        );
    });
});
