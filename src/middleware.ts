import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractToken } from '@/lib/jwt';

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
];

// Routes that require specific roles
const ROLE_RESTRICTED_ROUTES: Record<string, string[]> = {
  '/api/hospital': ['admin', 'doctor', 'nurse', 'specialist'],
  '/api/seed': ['admin'],
  '/api/access-logs': ['admin', 'doctor', 'nurse'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply to API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname === route)) {
    return NextResponse.next();
  }

  // Extract and verify JWT token
  const token = extractToken(request);

  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const payload = verifyToken(token);

  if (!payload) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  // Check role-based access for restricted routes
  for (const [routePrefix, allowedRoles] of Object.entries(ROLE_RESTRICTED_ROUTES)) {
    if (pathname.startsWith(routePrefix)) {
      if (!allowedRoles.includes(payload.role)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
    }
  }

  // Add security headers to all responses
  const response = NextResponse.next();

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self';"
  );

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
};
