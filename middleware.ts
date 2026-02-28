import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get('better-auth.session_token')

  // If no session and trying to access protected routes
  if (!sessionCookie) {
    // Redirect to home if trying to access dashboard
    if (pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // If has session, redirect away from auth pages
  if (pathname === '/sign-in' || pathname === '/sign-up') {
    return NextResponse.redirect(new URL('/onboarding', request.url))
  }

  // Note: Onboarding completion check is handled client-side
  // because we need to query the database to check onboarding status

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
