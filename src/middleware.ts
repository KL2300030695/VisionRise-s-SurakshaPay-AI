import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip protection for the Admin Login page itself
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // 2. Protect all routes under /admin and /api/admin
  const isProtectedPath = pathname.startsWith('/admin') || 
                          pathname.startsWith('/api/admin');

  if (isProtectedPath) {
    const adminSession = request.cookies.get('surakshapay_admin_session')?.value;

    if (!adminSession) {
      // For API routes, return a JSON error
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized admin access required.' },
          { status: 401 }
        );
      }
      
      // For Page routes, redirect to login
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Config to apply middleware to specific routes
export const config = {
  matcher: [
    '/admin/:path*', 
    '/api/admin/:path*',
  ],
};
