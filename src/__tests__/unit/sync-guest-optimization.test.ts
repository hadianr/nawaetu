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


import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Unmock dependencies to allow real schema imports
vi.unmock('@/db/schema');
vi.unmock('drizzle-orm');
vi.unmock('drizzle-orm/pg-core'); // Just in case

import { bookmarks } from '@/db/schema';
import { db } from '@/db'; // Import BEFORE route so mock is active? No, hoisting handles it.
import { POST } from '@/app/api/user/sync-guest/route';

// Mock db
vi.mock('@/db', () => {
    const insertMock = vi.fn(() => ({
        values: vi.fn(() => ({
            onConflictDoUpdate: vi.fn(() => Promise.resolve()),
            onConflictDoNothing: vi.fn(() => Promise.resolve()),
        })),
    }));

    const updateMock = vi.fn(() => ({
        set: vi.fn(() => ({
            where: vi.fn(() => Promise.resolve()),
        })),
    }));

    const dbMock = {
        insert: insertMock,
        update: updateMock,
        transaction: vi.fn(async (cb) => {
            return cb({
                insert: insertMock,
                update: updateMock,
            });
        }),
    };

    return {
        db: dbMock
    };
});

vi.mock('next-auth', () => ({
    getServerSession: vi.fn(() => Promise.resolve({ user: { id: 'test-user', email: 'test@example.com' } })),
}));

vi.mock('@/lib/auth', () => ({
    authOptions: {},
}));


describe('Sync Guest Optimization', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should use bulk insert for bookmarks', async () => {
        const mockBookmarks = [
            {
                surahId: 1,
                verseId: 1,
                surahName: 'Al-Fatiha',
                verseText: 'Test',
                note: 'Note 1',
                tags: ['tag1'],
                createdAt: Date.now(),
            },
            {
                surahId: 1,
                verseId: 2,
                surahName: 'Al-Fatiha',
                verseText: 'Test 2',
                note: 'Note 2',
                tags: ['tag2'],
                createdAt: Date.now(),
            },
        ];

        // Create mock request
        const req = {
            json: async () => ({
                bookmarks: mockBookmarks,
            }),
        } as any;

        const response: any = await POST(req);

        expect(response.status).toBe(200);

        // Get calls to insert
        const insertCalls = (db.insert as any).mock.calls;

        // Filter for bookmarks table insertions
        const bookmarkInserts = insertCalls.filter((args: any[]) => args[0] === bookmarks);

        console.log(`db.insert(bookmarks) called ${bookmarkInserts.length} times.`);

        // Expect 1 call for bulk insert (will fail now, expected 2)
        expect(bookmarkInserts.length).toBe(1);
    });
});
