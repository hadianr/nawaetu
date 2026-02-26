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

import { middleware, config } from '../../middleware';
import { NextRequest } from 'next/server';

describe('Middleware Security', () => {
  beforeEach(() => {
    headersMap.clear();
  });

  it('should NOT exclude API routes in the configuration (vulnerability fixed)', () => {
    const matcher = config.matcher[0];
    // The pattern should NOT contain '?!api' or any exclusion of api
    expect(matcher).not.toContain('?!api');
  });

  it('should set security headers including CSP and HSTS', () => {
    const request = new NextRequest('https://nawaetu.com/');
    // @ts-expect-error - Mocking NextRequest partial
    const response = middleware(request);

    expect(response.headers.get('X-Frame-Options')).toBe('SAMEORIGIN');
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');

    // Verify added headers
    expect(response.headers.get('Content-Security-Policy')).toBeDefined();
    expect(response.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
    expect(response.headers.get('Strict-Transport-Security')).toBeDefined();
    expect(response.headers.get('Strict-Transport-Security')).toContain('max-age=63072000');
  });
});
