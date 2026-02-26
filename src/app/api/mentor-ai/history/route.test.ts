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
import { NextRequest } from 'next/server';

// Hoisted Mocks
const {
    mockFindFirst,
    mockUpdate,
    mockInsert,
    mockUpdateSet,
    mockUpdateWhere,
    mockInsertValues,
    mockInsertOnConflictDoUpdate,
    mockInsertReturning
} = vi.hoisted(() => {
    return {
        mockFindFirst: vi.fn(),
        mockUpdate: vi.fn(),
        mockInsert: vi.fn(),
        mockUpdateSet: vi.fn(),
        mockUpdateWhere: vi.fn(),
        mockInsertValues: vi.fn(),
        mockInsertOnConflictDoUpdate: vi.fn(),
        mockInsertReturning: vi.fn(),
    };
});

// Import AFTER mocks
import { POST } from './route';

// Helper for chainable mocks
const createQueryBuilder = (result: any) => {
    return {
        then: (resolve: any, reject: any) => Promise.resolve(result).then(resolve, reject),
        onConflictDoUpdate: mockInsertOnConflictDoUpdate,
        returning: mockInsertReturning,
        where: mockUpdateWhere,
        set: mockUpdateSet,
    };
};

vi.mock('@/db', () => ({
    db: {
        query: {
            chatSessions: {
                findFirst: mockFindFirst,
            },
        },
        update: mockUpdate,
        insert: mockInsert,
    },
}));

// Mock Auth
vi.mock('next-auth', () => ({
    getServerSession: vi.fn(() => Promise.resolve({
        user: { id: 'user-123', name: 'Test User' }
    })),
}));

vi.mock('@/lib/auth', () => ({
    authOptions: {},
}));

// Mock Schema
vi.mock('@/db/schema', () => ({
    chatSessions: {
        id: 'id',
        userId: 'userId',
        title: 'title',
        messages: 'messages',
        updatedAt: 'updatedAt',
        createdAt: 'createdAt'
    },
}));

// Mock Drizzle ORM
vi.mock('drizzle-orm', () => ({
    eq: vi.fn(),
    desc: vi.fn(),
}));

describe('Benchmark: POST /api/mentor-ai/history', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default chainable structure
        mockUpdate.mockReturnValue({
            set: mockUpdateSet,
        });
        mockUpdateSet.mockReturnValue({
            where: mockUpdateWhere,
        });
        mockUpdateWhere.mockImplementation(() => createQueryBuilder({}));

        mockInsert.mockReturnValue({
            values: mockInsertValues,
        });

        // Default behavior
        mockInsertValues.mockImplementation(() => createQueryBuilder([{ id: 'test-id' }]));
        mockInsertOnConflictDoUpdate.mockImplementation(() => createQueryBuilder([{ id: 'test-id' }]));
        mockInsertReturning.mockImplementation(() => createQueryBuilder([{ id: 'test-id' }]));
    });

    it('Scenario A: Update existing session (User matches)', async () => {
        // No need to mock findFirst as it shouldn't be called

        const req = new NextRequest('http://localhost/api/mentor-ai/history', {
            method: 'POST',
            body: JSON.stringify({
                id: 'session-1',
                title: 'New Title',
                messages: [{ role: 'user', content: 'Hello' }]
            })
        });

        const res: any = await POST(req);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ success: true });

        // Optimized: findFirst NOT called
        expect(mockFindFirst).toHaveBeenCalledTimes(0);
        // update NOT called (handled by insert...onConflict)
        expect(mockUpdate).toHaveBeenCalledTimes(0);
        // insert called once
        expect(mockInsert).toHaveBeenCalledTimes(1);
    });

    it('Scenario B: Create new session', async () => {
        const req = new NextRequest('http://localhost/api/mentor-ai/history', {
            method: 'POST',
            body: JSON.stringify({
                id: 'new-session',
                title: 'New Chat',
                messages: [{ role: 'user', content: 'Hi' }]
            })
        });

        const res = await POST(req);

        expect(res.status).toBe(200);

        // Optimized: findFirst NOT called
        expect(mockFindFirst).toHaveBeenCalledTimes(0);
        // insert called once
        expect(mockInsert).toHaveBeenCalledTimes(1);
        expect(mockUpdate).toHaveBeenCalledTimes(0);
    });

    it('Scenario C: Update existing session (Wrong user)', async () => {
        // Setup insert...returning to return EMPTY array (indicating conflict + ownership fail)
        mockInsertReturning.mockImplementation(() => createQueryBuilder([]));

        const req = new NextRequest('http://localhost/api/mentor-ai/history', {
            method: 'POST',
            body: JSON.stringify({
                id: 'session-1',
                title: 'Hacked Title',
                messages: []
            })
        });

        const res: any = await POST(req);

        expect(res.status).toBe(403);
        expect(res.body).toEqual({ error: 'Forbidden' });

        // Optimized: findFirst NOT called
        expect(mockFindFirst).toHaveBeenCalledTimes(0);
        // Insert called (attempted upsert)
        expect(mockInsert).toHaveBeenCalledTimes(1);
        expect(mockUpdate).toHaveBeenCalledTimes(0);
    });
});
