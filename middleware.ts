import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  let response = NextResponse.next();

  // Block debug/testing routes in production
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
    const debugRoutes = ['/notification-debug', '/api/debug'];

    if (debugRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
      response = NextResponse.rewrite(new URL('/404', request.url));
    }
  }

  // Add performance and security headers
  const headers = {
    // Cache control for static assets
    'Cache-Control': 'public, max-age=31536000, immutable',

    // Security headers
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'Permissions-Policy': 'geolocation=(self), magnetometer=(self), gyroscope=(self), accelerometer=(self)',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'origin-when-cross-origin',
    'X-XSS-Protection': '1; mode=block',

    // Content Security Policy
    'Content-Security-Policy': `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googletagmanager.com https://*.google-analytics.com https://va.vercel-scripts.com https://vercel.live;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' data: https://*.google.com https://*.googleapis.com https://*.googletagmanager.com https://*.google-analytics.com https://avatar.vercel.sh https://lh3.googleusercontent.com https://cdn.islamic.network;
      font-src 'self' data: https://fonts.gstatic.com;
      connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://api.aladhan.com https://*.sentry.io https://*.google-analytics.com https://quran-api-id.vercel.app https://api.quran.gading.dev https://api.quran.com https://api.bigdatacloud.net https://openrouter.ai https://cdn.islamic.network;
      media-src 'self' https://raw.githubusercontent.com https://www.ayouby.com https://cdn.islamic.network;
      frame-src 'self' https://*.google.com https://vercel.live;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim(),
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
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
