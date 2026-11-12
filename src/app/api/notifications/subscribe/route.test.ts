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

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { POST, DELETE } from './route';
import { db } from '@/db';
import { pushSubscriptions } from '@/db/schema';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/db', () => ({
    db: {
        select: vi.fn(),
        update: vi.fn(),
        insert: vi.fn(),
        query: {
            users: {
                findFirst: vi.fn().mockResolvedValue({ id: 'test-user-id' }),
            },
        },
    }
}));

vi.mock('@/db/schema', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/db/schema')>();
    return {
        ...actual,
        pushSubscriptions: {
            token: { name: 'token' },
            updatedAt: { name: 'updated_at' },
            active: { name: 'active' },
            deviceType: { name: 'device_type' },
            timezone: { name: 'timezone' },
            userLocation: { name: 'user_location' },
            latitude: { name: 'latitude' },
            longitude: { name: 'longitude' },
            city: { name: 'city' },
            prayerPreferences: { name: 'prayer_preferences' },
            userId: { name: 'userId' },
            lastUsedAt: { name: 'last_used_at' },
        }
    };
});

vi.mock('drizzle-orm', async (importOriginal) => {
    const actual = await importOriginal<typeof import('drizzle-orm')>();
    return {
        ...actual,
        eq: vi.fn(),
        relations: vi.fn(),
    };
});

vi.mock('@/lib/auth', () => ({
    authOptions: {},
    getServerSession: vi.fn().mockResolvedValue({
        user: { id: 'test-user-id' }
    })
}));

describe('POST /api/notifications/subscribe', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should upsert subscription using single query (Optimized)', async () => {
        const mockOnConflictDoUpdate = vi.fn().mockResolvedValue({});
        const mockValues = vi.fn().mockReturnValue({
            onConflictDoUpdate: mockOnConflictDoUpdate
        });
        const mockInsert = vi.fn().mockReturnValue({
            values: mockValues
        });
        const insertMock = db.insert as unknown as {
            mockImplementation: (implementation: typeof mockInsert) => void;
        };
        insertMock.mockImplementation(mockInsert);

        const mockWhere = vi.fn().mockResolvedValue({});
        const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
        const updateMock = db.update as unknown as {
            mockReturnValue: (value: unknown) => void;
        };
        updateMock.mockReturnValue({ set: mockSet });

        const req = new NextRequest('http://localhost', {
            method: 'POST',
            body: JSON.stringify({ token: 'token123', prayerPreferences: { fajr: true } })
        });

        await POST(req);

        // Verify insert called
        expect(db.insert).toHaveBeenCalledTimes(1);
        expect(db.select).not.toHaveBeenCalled(); // No read before write
        expect(db.update).not.toHaveBeenCalled(); // Multiple devices stay active

        // Verify arguments
        // 1. insert called with table
        expect(db.insert).toHaveBeenCalledWith(pushSubscriptions);

        // 2. values called with correct data
        expect(mockValues).toHaveBeenCalledWith(expect.objectContaining({
            token: 'token123',
            prayerPreferences: { fajr: true },
            active: 1
        }));

        // 3. onConflictDoUpdate called with correct config
        expect(mockOnConflictDoUpdate).toHaveBeenCalledWith(expect.objectContaining({
            target: pushSubscriptions.token,
            set: expect.objectContaining({
                prayerPreferences: { fajr: true },
                active: 1
            })
        }));
    });

    it('gives a guest subscription to the account that logs in on the device', async () => {
        const onConflictDoUpdate = vi.fn().mockResolvedValue({});
        (db.insert as unknown as { mockImplementation: (fn: unknown) => void }).mockImplementation(
            () => ({ values: vi.fn().mockReturnValue({ onConflictDoUpdate }) }),
        );

        await POST(new NextRequest('http://localhost', { method: 'POST', body: JSON.stringify({ token: 'guest-token' }) }));

        expect(onConflictDoUpdate).toHaveBeenCalledWith(expect.objectContaining({
            set: expect.objectContaining({ userId: 'test-user-id' }),
        }));
    });

    it('stores the device language so a guest gets notifications in it, and ignores anything else', async () => {
        const onConflictDoUpdate = vi.fn().mockResolvedValue({});
        const values = vi.fn().mockReturnValue({ onConflictDoUpdate });
        (db.insert as unknown as { mockImplementation: (fn: unknown) => void }).mockImplementation(() => ({ values }));

        await POST(new NextRequest('http://localhost', { method: 'POST', body: JSON.stringify({ token: 't1', locale: 'en' }) }));
        expect(values).toHaveBeenLastCalledWith(expect.objectContaining({ locale: 'en' }));
        expect(onConflictDoUpdate).toHaveBeenLastCalledWith(expect.objectContaining({ set: expect.objectContaining({ locale: 'en' }) }));

        // An unknown value is not stored.
        await POST(new NextRequest('http://localhost', { method: 'POST', body: JSON.stringify({ token: 't1', locale: 'xx' }) }));
        expect(values.mock.calls.at(-1)?.[0]).not.toHaveProperty('locale', 'xx');

        // A request that does not say keeps whatever is stored: the key is absent from the update.
        await POST(new NextRequest('http://localhost', { method: 'POST', body: JSON.stringify({ token: 't1' }) }));
        expect(onConflictDoUpdate.mock.calls.at(-1)?.[0].set).not.toHaveProperty('locale');
    });

    it('releases the subscription at logout without deleting it', async () => {
        const where = vi.fn().mockResolvedValue({});
        const set = vi.fn().mockReturnValue({ where });
        (db.update as unknown as { mockReturnValue: (value: unknown) => void }).mockReturnValue({ set });

        const res = await DELETE({ url: 'http://localhost/api/notifications/subscribe?token=device-token' } as NextRequest);

        expect(res.status).toBe(200);
        expect(set).toHaveBeenCalledWith(expect.objectContaining({ userId: null }));
    });

    describe('the device token', () => {
        const releaseMocks = () => {
            const where = vi.fn().mockResolvedValue({});
            const set = vi.fn().mockReturnValue({ where });
            (db.update as unknown as { mockReturnValue: (value: unknown) => void }).mockReturnValue({ set });
            return { set };
        };

        it('is read from a header, so it never has to be in a URL', async () => {
            const { set } = releaseMocks();
            const res = await DELETE({ url: 'http://localhost/api/notifications/subscribe', headers: new Headers({ 'x-device-token': 'device-token' }) } as unknown as NextRequest);
            expect(res.status).toBe(200);
            expect(set).toHaveBeenCalledTimes(1);
        });

        it('is still read from the query for app versions already installed', async () => {
            releaseMocks();
            const res = await DELETE({ url: 'http://localhost/api/notifications/subscribe?token=old-client', headers: new Headers() } as unknown as NextRequest);
            expect(res.status).toBe(200);
        });

        it('is required', async () => {
            const { set } = releaseMocks();
            const res = await DELETE({ url: 'http://localhost/api/notifications/subscribe', headers: new Headers() } as unknown as NextRequest);
            expect(res.status).toBe(400);
            expect(set).not.toHaveBeenCalled();
        });
    });

    it('should handle missing prayerPreferences correctly in upsert', async () => {
        // Mock insert().values().onConflictDoUpdate() chain
        const mockOnConflictDoUpdate = vi.fn().mockResolvedValue({});
        const mockValues = vi.fn().mockReturnValue({
            onConflictDoUpdate: mockOnConflictDoUpdate
        });
        const mockInsert = vi.fn().mockReturnValue({
             values: mockValues
        });
        const insertMock = db.insert as unknown as {
            mockImplementation: (implementation: typeof mockInsert) => void;
        };
        insertMock.mockImplementation(mockInsert);

        const req = new NextRequest('http://localhost', {
            method: 'POST',
            body: JSON.stringify({ token: 'token123' }) // missing prayerPreferences
        });

        await POST(req);

        // Verify values received null for prayerPreferences (for insert)
        expect(mockValues).toHaveBeenCalledWith(expect.objectContaining({
            token: 'token123',
            prayerPreferences: null
        }));

        // Verify set received undefined for prayerPreferences (for update - so it's ignored)
        const setArg = mockOnConflictDoUpdate.mock.calls[0][0].set;
        expect(setArg.prayerPreferences).toBeUndefined();
    });
});
