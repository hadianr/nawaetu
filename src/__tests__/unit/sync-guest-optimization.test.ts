
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
