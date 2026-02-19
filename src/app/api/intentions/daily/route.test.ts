import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

// Mock the dependencies
// The db mock needs to return objects that allow chaining as used in the route
vi.mock('@/db', () => ({
  db: {
    select: vi.fn(),
    from: vi.fn(),
    where: vi.fn(),
    limit: vi.fn(),
    insert: vi.fn(),
    values: vi.fn(),
    returning: vi.fn(),
    update: vi.fn(),
    set: vi.fn(),
  },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
  and: vi.fn(),
  sql: vi.fn(),
}));

// We rely on the global mock for next/server from setup.ts
// But if we need to inspect the response, we need to know its shape.
// Based on src/__tests__/setup.ts, NextResponse.json returns { body, status }

describe('POST /api/intentions/daily', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = originalEnv;
  });

  it('should NOT expose error details in development environment', async () => {
    // Setup
    process.env.NODE_ENV = 'development';
    const { db } = await import('@/db');

    // Mock db failure
    (db.select as any).mockImplementation(() => {
        throw new Error('Database connection failed: confidential info');
    });

    // using the mocked NextRequest from setup.ts
    const req = new NextRequest('http://localhost:3000/api/intentions/daily', {
      method: 'POST',
      body: JSON.stringify({
        user_token: 'test-token',
        niat_text: 'Test intention',
      }),
    });

    // Execute
    const response = await POST(req);
    // The mocked NextResponse.json returns { body, status }
    const data = (response as any).body;
    const status = (response as any).status;

    // Verify
    expect(status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Internal server error');
    // details should NOT be present even in dev
    expect(data.details).toBeUndefined();
  });

  it('should NOT expose error details in production environment', async () => {
    // Setup
    process.env.NODE_ENV = 'production';
    const { db } = await import('@/db');

    // Mock db failure
    (db.select as any).mockImplementation(() => {
        throw new Error('Database connection failed: confidential info');
    });

    const req = new NextRequest('http://localhost:3000/api/intentions/daily', {
      method: 'POST',
      body: JSON.stringify({
        user_token: 'test-token',
        niat_text: 'Test intention',
      }),
    });

    // Execute
    const response = await POST(req);
    // The mocked NextResponse.json returns { body, status }
    const data = (response as any).body;
    const status = (response as any).status;

    // Verify
    expect(status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Internal server error');
    // In prod, details should be undefined.
    expect(data.details).toBeUndefined();
  });
});
