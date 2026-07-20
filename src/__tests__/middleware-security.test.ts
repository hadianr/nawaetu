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

import { vi, describe, it, expect } from 'vitest';

vi.mock('next/server', () => {
  return {
    NextResponse: {
      next: vi.fn(() => ({
        headers: new Headers(),
      })),
      rewrite: vi.fn(() => ({
        headers: new Headers(),
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

import { config } from '../../middleware';

describe('Middleware Security', () => {
  it('should NOT exclude API routes in the configuration (vulnerability fixed)', () => {
    const matcher = config.matcher[0];
    // The pattern should NOT contain '?!api' or any exclusion of api
    expect(matcher).not.toContain('?!api');
  });
});
