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
