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

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock dependencies BEFORE importing the route
const mockChain = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn(),
    orderBy: vi.fn(),
    values: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    returning: vi.fn(),
};

// Make chain thenable for await db.update()...
(mockChain as any).then = (resolve: any) => resolve([]);

vi.mock('@/db', () => ({
  db: {
    select: vi.fn(() => mockChain),
    insert: vi.fn(() => mockChain),
    update: vi.fn(() => mockChain),
    from: vi.fn(() => mockChain),
  },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
  and: vi.fn(),
  sql: vi.fn(),
}));

// Override the global schema mock from setup.ts to include needed tables
vi.mock('@/db/schema', () => ({
    pushSubscriptions: {},
    users: {},
    intentions: {},
}));

// Import AFTER mocks
import { POST } from './route';

describe('POST /api/intentions/daily', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.clearAllMocks();
    mockChain.from.mockClear();
    mockChain.where.mockClear();
    mockChain.limit.mockClear();
    mockChain.orderBy.mockClear();
    mockChain.values.mockClear();
    mockChain.set.mockClear();
    mockChain.returning.mockClear();

    // Default chain behavior
    mockChain.from.mockReturnThis();
    mockChain.where.mockReturnThis();
    mockChain.values.mockReturnThis();
    mockChain.set.mockReturnThis();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('should correctly calculate streak with optimized Set logic', async () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const dayBeforeYesterday = new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0];
    const userId = 'user-1';

    // Mock sequence of DB calls

    // 1. Subscription check (limit) -> [] (No subscription)
    mockChain.limit.mockResolvedValueOnce([]);

    // 2. User check (limit) -> [{ id: userId }] (Existing anonymous user)
    mockChain.limit.mockResolvedValueOnce([{ id: userId }]);

    // 3. Intention check (limit) -> [] (No intention for today yet)
    mockChain.limit.mockResolvedValueOnce([]);

    // 4. Insert intention (returning)
    mockChain.returning.mockResolvedValueOnce([{
        id: 'int-1',
        niatDate: today,
        niatText: 'Test intention'
    }]);

    // 5. Streak calculation: Fetch intentions (orderBy)
    // Return 3 consecutive days including today
    mockChain.orderBy.mockResolvedValueOnce([
        { niatDate: today },
        { niatDate: yesterday },
        { niatDate: dayBeforeYesterday }
    ]);

    // 6. Get user for longest streak check (limit)
    mockChain.limit.mockResolvedValueOnce([{
        id: userId,
        niatStreakLongest: 5
    }]);

    const req = new NextRequest('http://localhost:3000/api/intentions/daily', {
      method: 'POST',
      body: JSON.stringify({
        user_token: 'test-token',
        niat_text: 'Test intention',
      }),
    });

    const response = await POST(req);
    const data = (response as any).body;

    expect(data.success).toBe(true);
    expect(data.data.current_streak).toBe(3);
  });

  it('should NOT expose error details in development environment', async () => {
    process.env.NODE_ENV = 'development';
    mockChain.limit.mockRejectedValueOnce(new Error('Database connection failed: confidential info'));

    const req = new NextRequest('http://localhost:3000/api/intentions/daily', {
      method: 'POST',
      body: JSON.stringify({
        user_token: 'test-token',
        niat_text: 'Test intention',
      }),
    });

    const response = await POST(req);
    const data = (response as any).body;
    const status = (response as any).status;

    expect(status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Internal server error');
    expect(data.details).toBeUndefined();
  });

  it('should NOT expose error details in production environment', async () => {
    process.env.NODE_ENV = 'production';
    mockChain.limit.mockRejectedValueOnce(new Error('Database connection failed: confidential info'));

    const req = new NextRequest('http://localhost:3000/api/intentions/daily', {
      method: 'POST',
      body: JSON.stringify({
        user_token: 'test-token',
        niat_text: 'Test intention',
      }),
    });

    const response = await POST(req);
    const data = (response as any).body;
    const status = (response as any).status;

    expect(status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Internal server error');
    expect(data.details).toBeUndefined();
  });
});
