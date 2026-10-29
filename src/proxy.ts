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

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Ultra-lightweight proxy (formerly middleware).
 *
 * Security headers (CSP, HSTS, etc.) are now defined statically in
 * next.config.ts → headers(), which is compiled into the CDN config and
 * doesn't run per-request middleware runtime.
 *
 * This middleware only handles:
 *   1. Blocking debug/test routes in production.
 */
export function proxy(request: NextRequest) {
  // Block debug/testing routes in production
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
    const path = request.nextUrl.pathname;
    if (
      path.startsWith('/notification-debug') ||
      path.startsWith('/api/debug') ||
      path.startsWith('/api/notifications/debug')
    ) {
      // status: Vercel serves the static /404 page as 200 (soft 404) without it.
      return NextResponse.rewrite(new URL('/404', request.url), { status: 404 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Only the blocked debug routes, so normal page requests never invoke middleware.
    '/notification-debug/:path*',
    '/api/debug/:path*',
    '/api/notifications/debug/:path*',
  ],
};
