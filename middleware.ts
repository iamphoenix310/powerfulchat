import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const RESERVED_ROUTES = [
  'auth',
  'dashboard',
  'home',
  'onboarding',
  'api',
  '_next',
  'static',
  'favicon.ico'
]

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const firstSegment = pathname.split('/')[1]

  // ✅ Redirect /subscription/:uuid/:uuid to /unsubscribe
  const unsubscribePattern = /^\/subscription\/[a-f0-9-]{36}\/[a-f0-9-]{36}$/i
  if (unsubscribePattern.test(pathname)) {
    const redirectUrl = new URL('/unsubscribe', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const isReserved = RESERVED_ROUTES.includes(firstSegment)

  // ✅ Redirect to onboarding if logged in but no username
  if (token && !token.username && !isReserved) {
    return NextResponse.redirect(new URL('/onboarding', req.url))
  }

  const protocol = req.headers.get('x-forwarded-proto') || req.nextUrl.protocol
  const host =
    req.headers.get('x-forwarded-host') || req.headers.get('host') || ''
  const baseUrl = `${protocol}${protocol.endsWith(':') ? '//' : '://'}${host}`

  const response = NextResponse.next()
  response.headers.set('x-url', req.url)
  response.headers.set('x-host', host)
  response.headers.set('x-protocol', protocol)
  response.headers.set('x-base-url', baseUrl)

  return response
}

export const config = {
  matcher: [
    '/subscription/:path*',
    '/((?!api|auth|_next|static|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
}
