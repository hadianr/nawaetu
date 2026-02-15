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

  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.google.com https://*.googleapis.com https://*.firebaseio.com https://*.firebase.com https://*.gstatic.com https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https://*.googleusercontent.com https://*.githubusercontent.com https://*.google.com https://*.googleapis.com https://www.googletagmanager.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://*.google.com https://*.googleapis.com https://*.firebaseio.com https://*.firebase.com https://*.sentry.io https://*.google-analytics.com https://api.aladhan.com https://www.googletagmanager.com",
    "frame-src 'self' https://*.firebase.com https://*.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');

  // Add performance and security headers
  const headers = {
    // Cache control for static assets
    'Cache-Control': 'public, max-age=31536000, immutable',

    // Security headers
    'Content-Security-Policy': csp,
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Permissions-Policy': 'geolocation=(self), magnetometer=(self), gyroscope=(self), accelerometer=(self)',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
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
