import { NextRequest, NextResponse } from 'next/server'
import { ApiErrorResponse, AuthResponse } from '@/types/api'

const API_URL = process.env.API_URL || 'http://tesoreria-api.test/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok) {
      const errorData = data as ApiErrorResponse
      return NextResponse.json(
        {
          message: errorData.message || 'Error al iniciar sesión',
          code: errorData.code,
          errors: errorData.errors,
        },
        { status: res.status }
      )
    }

    const authData = data as AuthResponse

    // Crear la respuesta con la cookie httpOnly
    const response = NextResponse.json({
      user: authData.user,
    })

    response.cookies.set({
      name: 'auth_token',
      value: authData.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 días
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { message: 'No se pudo conectar con el servidor de autenticación' },
      { status: 500 }
    )
  }
}
