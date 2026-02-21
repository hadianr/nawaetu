import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '../../middleware';

// Shared state for the mock
const headersMap = new Map();

vi.mock('next/server', () => {
  return {
    NextResponse: {
      next: vi.fn(() => ({
        headers: {
          set: (key: string, value: string) => headersMap.set(key, value),
          get: (key: string) => headersMap.get(key),
        },
      })),
      rewrite: vi.fn(() => ({
        headers: {
          set: (key: string, value: string) => headersMap.set(key, value),
          get: (key: string) => headersMap.get(key),
        },
      })),
    },
    NextRequest: class {
      url: string;
      nextUrl: URL;
      constructor(url: string) {
        this.url = url;
        this.nextUrl = new URL(url);
      }
    }
  };
});

describe('Middleware Debug Route Blocking', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    headersMap.clear();
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should block /api/debug in production', () => {
    process.env.NODE_ENV = 'production';
    const request = new NextRequest('https://nawaetu.com/api/debug');

    // @ts-expect-error - Mocking NextRequest partial
    middleware(request);

    // Check if rewrite was called with /404
    expect(NextResponse.rewrite).toHaveBeenCalled();
    const rewriteCall = (NextResponse.rewrite as any).mock.calls[0];
    expect(rewriteCall[0].pathname).toBe('/404');
  });

  it('should block /api/notifications/debug in production', () => {
    process.env.NODE_ENV = 'production';
    const request = new NextRequest('https://nawaetu.com/api/notifications/debug');

    // @ts-expect-error - Mocking NextRequest partial
    middleware(request);

    expect(NextResponse.rewrite).toHaveBeenCalled();
    const rewriteCall = (NextResponse.rewrite as any).mock.calls[0];
    expect(rewriteCall[0].pathname).toBe('/404');
  });

  it('should NOT block /api/debug in development', () => {
    process.env.NODE_ENV = 'development';
    const request = new NextRequest('https://nawaetu.com/api/debug');

    // @ts-expect-error - Mocking NextRequest partial
    middleware(request);

    expect(NextResponse.rewrite).not.toHaveBeenCalled();
    expect(NextResponse.next).toHaveBeenCalled();
  });
});
