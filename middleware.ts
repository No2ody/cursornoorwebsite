import { NextRequest, NextResponse } from 'next/server'
import { applySecurityHeaders } from './lib/security-headers'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Determine the type of security headers to apply based on the path
  let headerType: 'default' | 'api' | 'static' = 'default'
  
  if (request.nextUrl.pathname.startsWith('/api/')) {
    headerType = 'api'
  } else if (
    request.nextUrl.pathname.startsWith('/_next/static/') ||
    request.nextUrl.pathname.startsWith('/images/') ||
    request.nextUrl.pathname.startsWith('/icons/') ||
    request.nextUrl.pathname.includes('.') // Files with extensions
  ) {
    headerType = 'static'
  }
  
  // Apply appropriate security headers
  return applySecurityHeaders(response, headerType)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}