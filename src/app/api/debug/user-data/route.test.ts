import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from './route';

// Mock NextRequest and NextResponse locally
vi.mock('next/server', () => {
  return {
    NextResponse: class MockNextResponse {
      body: any;
      status: number;
      constructor(body: any, init?: any) {
        this.body = body;
        this.status = init?.status || 200;
      }
      static json(body: any, init?: any) {
        return { body, status: init?.status || 200 };
      }
    },
    NextRequest: class MockNextRequest {
      url: string;
      constructor(input: string) {
        this.url = input;
      }
    }
  };
});

// Mock DB
vi.mock('@/db', () => ({
  db: {
    query: {
      users: { findFirst: vi.fn() },
      bookmarks: { findMany: vi.fn() },
      userCompletedMissions: { findMany: vi.fn() },
      intentions: { findMany: vi.fn() },
      dailyActivities: { findMany: vi.fn() },
    }
  }
}));

describe('Debug User Data API', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should return 404 with empty body in production environment', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    // Dynamically import NextRequest to use the mocked class
    const { NextRequest } = await import('next/server');
    // @ts-ignore
    const req = new NextRequest('http://localhost/api/debug/user-data?email=test@example.com');

    const response = await GET(req);

    expect(response.status).toBe(404);
    // In production we return new NextResponse(null, { status: 404 })
    // With our mock, body is null.
    expect(response.body).toBeNull();
  });

  it('should attempt to fetch data in development environment', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    const { NextRequest } = await import('next/server');
    // @ts-ignore
    const req = new NextRequest('http://localhost/api/debug/user-data?email=test@example.com');

    const response = await GET(req);

    // In dev, it should proceed. With empty db mock, it returns 404 "User not found"
    // We check that it is NOT the empty object blocked response
    expect(response.body).not.toBeNull();
    // It returns json error
    expect(response.body).toHaveProperty('error');
  });
});
