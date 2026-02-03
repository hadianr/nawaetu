import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
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

  // Add early hints for critical resources
  if (request.nextUrl.pathname === '/') {
    response.headers.set(
      'Link',
      '</fonts/geist-sans.woff2>; rel=preload; as=font; crossorigin=anonymous'
    );
  }

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
