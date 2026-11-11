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

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

type MockChain = {
  from: ReturnType<typeof vi.fn>;
  where: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
  orderBy: ReturnType<typeof vi.fn>;
  values: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
  returning: ReturnType<typeof vi.fn>;
  then: (resolve: (value: never[]) => unknown) => unknown;
};

type DailyResponseBody = {
  success: boolean;
  data?: { current_streak: number };
  error?: string;
  details?: unknown;
};

// Define mockChain and attach it to global so hoisted mocks can access it
const mockChain = {
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn(),
  orderBy: vi.fn(),
  values: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  returning: vi.fn(),
  then: (resolve: (value: never[]) => unknown) => resolve([]),
};
const testGlobal = globalThis as typeof globalThis & { mockChain: MockChain };
testGlobal.mockChain = mockChain;

vi.mock('@/db', () => ({
  db: {
    select: vi.fn(() => (globalThis as typeof globalThis & { mockChain: MockChain }).mockChain),
    insert: vi.fn(() => (globalThis as typeof globalThis & { mockChain: MockChain }).mockChain),
    update: vi.fn(() => (globalThis as typeof globalThis & { mockChain: MockChain }).mockChain),
    from: vi.fn(() => (globalThis as typeof globalThis & { mockChain: MockChain }).mockChain),
  },
  checkConnection: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
  and: vi.fn(),
  sql: vi.fn(),
  gte: vi.fn(),
  lt: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
  getServerSession: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/db/schema', () => ({
  pushSubscriptions: {},
  users: {},
  intentions: {},
  accounts: {},
  sessions: {},
  verificationTokens: {},
}));


const mocks = vi.hoisted(() => ({ processProgressionEvidence: vi.fn().mockResolvedValue({}) }));
vi.mock('@/core/repositories/progression.repository', () => ({ processProgressionEvidence: mocks.processProgressionEvidence }));

import { POST } from './route';
import { pushSubscriptions } from '@/db/schema';

describe('POST /api/intentions/daily', () => {
  // Mock environment variables using vi.stubEnv

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
    vi.unstubAllEnvs();
  });

  it('should correctly calculate streak with optimized Set logic', async () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const dayBeforeYesterday = new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0];
    const userId = 'user-1';

    // Mock sequence of DB calls

    // 1. User check (limit) -> [{ id: userId }] (Existing anonymous user)
    mockChain.limit.mockResolvedValueOnce([{ id: userId }]);

    // 2. Intention check (limit) -> [] (No intention for today yet)
    mockChain.limit.mockResolvedValueOnce([]);

    // 4. Insert intention (returning)
    mockChain.returning.mockResolvedValueOnce([{
      id: 'int-1',
      intentionDate: today,
      intentionText: 'Test intention'
    }]);

    // 5. Streak calculation: Fetch intentions (orderBy)
    // Return 3 consecutive days including today
    mockChain.orderBy.mockResolvedValueOnce([
      { intentionDate: today },
      { intentionDate: yesterday },
      { intentionDate: dayBeforeYesterday }
    ]);

    // 6. Get user for longest streak check (limit)
    mockChain.limit.mockResolvedValueOnce([{
      id: userId,
      intentionStreakLongest: 5
    }]);

    const req = new NextRequest('http://localhost:3000/api/intentions/daily', {
      method: 'POST',
      body: JSON.stringify({
        user_token: 'test-token',
        intention_text: 'Test intention',
      }),
    });

    const response = await POST(req);
    const data = (response as unknown as {
      body: DailyResponseBody & { data: { current_streak: number } };
    }).body;

    expect(data.success).toBe(true);
    expect(data.data.current_streak).toBe(3);
    // A device token must never be looked up as a login: push subscriptions are not consulted.
    expect(mockChain.from.mock.calls.flat()).not.toContain(pushSubscriptions);
  });

  it("counts an intention written at 04:30 WIB as today's, not as backdated", async () => {
    // 04:30 on 11 Nov in Jakarta is still 10 Nov in UTC, where the server clock runs.
    // The server runs in UTC; pin it so the test does not depend on the developer's own timezone.
    const originalTz = process.env.TZ;
    process.env.TZ = 'UTC';
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-10T21:30:00Z'));
    try {
      mockChain.limit.mockResolvedValueOnce([{ id: 'user-1' }]);
      mockChain.limit.mockResolvedValueOnce([]);
      mockChain.returning.mockResolvedValueOnce([{ id: 'int-1', intentionDate: '2026-11-11', intentionText: 'Test' }]);
      mockChain.orderBy.mockResolvedValueOnce([{ intentionDate: new Date('2026-11-11T00:00:00Z') }]);
      mockChain.limit.mockResolvedValueOnce([{ id: 'user-1', intentionStreakLongest: 0 }]);

      const req = new NextRequest('http://localhost:3000/api/intentions/daily', {
        method: 'POST',
        body: JSON.stringify({
          user_token: 'test-token',
          intention_text: 'Test',
          intention_date: '2026-11-11',
          timezone: 'Asia/Jakarta',
        }),
      });
      const response = await POST(req);
      const data = (response as unknown as { body: { data: { intention_points_earned: number; current_streak: number } } }).body;

      expect(data.data.intention_points_earned).toBe(10);
      expect(mocks.processProgressionEvidence).toHaveBeenCalledWith('user-1', expect.objectContaining({
        source: 'intention', sourceId: 'intention:2026-11-11', hasanah: 10, localDate: '2026-11-11', timezone: 'Asia/Jakarta',
      }));
      expect(data.data.current_streak).toBe(1);
    } finally {
      vi.useRealTimers();
      if (originalTz === undefined) delete process.env.TZ; else process.env.TZ = originalTz;
    }
  });

  it('refuses to mint anonymous accounts without limit from one address', async () => {
    const { anonymousUserRateLimiter } = await import('@/lib/rate-limit');
    for (let i = 0; i < 10; i++) await anonymousUserRateLimiter.check('anon-user:203.0.113.9');
    mockChain.limit.mockResolvedValueOnce([]); // no existing anonymous user for this token

    const req = new NextRequest('http://localhost:3000/api/intentions/daily', {
      method: 'POST',
      headers: { 'x-forwarded-for': '203.0.113.9' },
      body: JSON.stringify({ user_token: 'brand-new-token', intention_text: 'Test' }),
    });
    const result = (await POST(req)) as unknown as { status: number; body: DailyResponseBody };

    expect(result.status).toBe(429);
    expect(mockChain.values).not.toHaveBeenCalled();
  });

  it('should NOT expose error details in development environment', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    mockChain.limit.mockRejectedValueOnce(new Error('Database connection failed: confidential info'));

    const req = new NextRequest('http://localhost:3000/api/intentions/daily', {
      method: 'POST',
      body: JSON.stringify({
        user_token: 'test-token',
        intention_text: 'Test intention',
      }),
    });

    const response = await POST(req);
    const result = response as unknown as { body: DailyResponseBody; status: number };
    const data = result.body;
    const status = result.status;

    expect(status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Internal server error');
    expect(data.details).toBeUndefined();
  });

  it('should NOT expose error details in production environment', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    mockChain.limit.mockRejectedValueOnce(new Error('Database connection failed: confidential info'));

    const req = new NextRequest('http://localhost:3000/api/intentions/daily', {
      method: 'POST',
      body: JSON.stringify({
        user_token: 'test-token',
        intention_text: 'Test intention',
      }),
    });

    const response = await POST(req);
    const result = response as unknown as { body: DailyResponseBody; status: number };
    const data = result.body;
    const status = result.status;

    expect(status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Internal server error');
    expect(data.details).toBeUndefined();
  });
});
