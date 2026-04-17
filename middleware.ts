import { type NextRequest, NextResponse } from 'next/server';

/**
 * Route protection middleware.
 *
 * The auth service sets a lightweight `cts-session=1` cookie on login and
 * clears it on logout. The cookie holds NO sensitive data — the actual JWT
 * lives only in memory (Zustand) and sessionStorage on the client.
 *
 * We use this cookie purely as a server-readable presence signal so Next.js
 * can redirect unauthenticated users before any page renders.
 */

const SESSION_COOKIE = 'cts-session';

/** App routes that require authentication */
const PROTECTED_PREFIX = [
  '/dashboard',
  '/conversations',
  '/orders',
  '/payments',
  '/customers',
  '/settings',
  '/test',
  '/onboarding',
];

/** Auth routes — authenticated users should not see these */
const AUTH_ROUTES = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.has(SESSION_COOKIE);

  const isProtected = PROTECTED_PREFIX.some((p) => pathname === p || pathname.startsWith(p + '/'));
  const isAuthRoute = AUTH_ROUTES.some((p) => pathname === p || pathname.startsWith(p + '/'));

  // Unauthenticated user hitting a protected route → redirect to login
  if (isProtected && !isAuthenticated) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user hitting login/signup → redirect to dashboard
  if (isAuthRoute && isAuthenticated) {
    const dashUrl = request.nextUrl.clone();
    dashUrl.pathname = '/dashboard';
    dashUrl.searchParams.delete('next');
    return NextResponse.redirect(dashUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static  (static files)
     * - _next/image   (image optimisation)
     * - favicon.ico
     * - api routes    (backend proxy handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};
