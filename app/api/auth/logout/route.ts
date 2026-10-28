import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.API_URL || 'http://tesoreria-api.test/api'

export async function POST(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value

  if (token) {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })
    } catch {
      // Si falla la revocación en backend, igual eliminamos la cookie
    }
  }

  const response = NextResponse.json({ message: 'Sesión cerrada' })

  response.cookies.set({
    name: 'auth_token',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0, // Eliminar cookie
  })

  return response
}
