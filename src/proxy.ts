import { NextRequest, NextResponse } from 'next/server';

// Routes that are part of /admin but DON'T require auth
const PUBLIC_ADMIN_ROUTES = ['/admin/login'];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect /admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Allow the login page itself through
  if (PUBLIC_ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow admin API routes to handle their own auth (ADMIN_SECRET header check)
  if (pathname.startsWith('/api/admin')) {
    return NextResponse.next();
  }

  // Check for valid session cookie
  const session = req.cookies.get('admin_session');
  const sessionSecret = process.env.SESSION_SECRET;

  if (!session?.value || !sessionSecret) {
    const loginUrl = new URL('/admin/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Validate the token: it must decode to something that ends with our secret
  try {
    const decoded = Buffer.from(session.value, 'base64').toString('utf8');
    const expectedSuffix = `:${sessionSecret}`;

    if (!decoded.endsWith(expectedSuffix)) {
      throw new Error('Invalid session');
    }
  } catch {
    const loginUrl = new URL('/admin/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    const res = NextResponse.redirect(loginUrl);
    // Clear the bad cookie
    res.cookies.set('admin_session', '', { maxAge: 0, path: '/' });
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

