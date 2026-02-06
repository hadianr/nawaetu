import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Block debug/testing routes in production
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
    const debugRoutes = ['/notification-debug'];

    if (debugRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
      return NextResponse.rewrite(new URL('/404', request.url));
    }
  }

  const response = NextResponse.next();

  // Add performance and security headers
  const headers = {
    // Cache control for static assets
    'Cache-Control': 'public, max-age=31536000, immutable',

    // Security headers
    'X-DNS-Prefetch-Control': 'on',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'origin-when-cross-origin',

    // Performance headers
    'X-XSS-Protection': '1; mode=block',
  };

  // Apply headers
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
