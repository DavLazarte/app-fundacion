import { NextRequest, NextResponse } from 'next/server'

// Rutas públicas que no exigen login
const PUBLIC_PATHS = ['/login']

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const { pathname } = request.nextUrl

  // Si intenta ir a login estando ya autenticado, redirigir a dashboard
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Si la ruta no es pública y no tiene token, redirigir a login
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path))
  if (!isPublic && !token && !pathname.startsWith('/api/auth')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
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
