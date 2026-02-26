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
import { POST } from './route';
import { db } from '@/db';
import { pushSubscriptions } from '@/db/schema';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/db', () => ({
    db: {
        select: vi.fn(),
        update: vi.fn(),
        insert: vi.fn(),
    }
}));

vi.mock('@/db/schema', () => ({
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
}));

vi.mock('drizzle-orm', () => ({
    eq: vi.fn(),
}));

describe('POST /api/notifications/subscribe', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should upsert subscription using single query (Optimized)', async () => {
        // Mock insert().values().onConflictDoUpdate() chain
        const mockOnConflictDoUpdate = vi.fn().mockResolvedValue({});
        const mockValues = vi.fn().mockReturnValue({
            onConflictDoUpdate: mockOnConflictDoUpdate
        });
        const mockInsert = vi.fn().mockReturnValue({
             values: mockValues
        });
        (db.insert as any).mockImplementation(mockInsert);

        const req = new NextRequest('http://localhost', {
            method: 'POST',
            body: JSON.stringify({ token: 'token123', prayerPreferences: { fajr: true } })
        });

        await POST(req);

        // Verify optimized behavior: Only Insert called (with upsert logic)
        expect(db.insert).toHaveBeenCalledTimes(1);
        expect(db.select).not.toHaveBeenCalled(); // No read before write
        expect(db.update).not.toHaveBeenCalled(); // No separate update

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

    it('should handle missing prayerPreferences correctly in upsert', async () => {
        // Mock insert().values().onConflictDoUpdate() chain
        const mockOnConflictDoUpdate = vi.fn().mockResolvedValue({});
        const mockValues = vi.fn().mockReturnValue({
            onConflictDoUpdate: mockOnConflictDoUpdate
        });
        const mockInsert = vi.fn().mockReturnValue({
             values: mockValues
        });
        (db.insert as any).mockImplementation(mockInsert);

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
