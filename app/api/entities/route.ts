import { NextRequest, NextResponse } from 'next/server'
import { ApiErrorResponse } from '@/types/api'

const API_URL = process.env.API_URL || 'http://tesoreria-api.test/api'

export async function POST(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value

  if (!token) {
    return NextResponse.json({ message: 'No autenticado' }, { status: 401 })
  }

  try {
    const body = await request.json()

    const res = await fetch(`${API_URL}/entities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok) {
      const errorData = data as ApiErrorResponse
      return NextResponse.json(
        {
          message: errorData.message || 'Error al guardar la entidad',
          errors: errorData.errors,
        },
        { status: res.status }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { message: 'Error de conexión con el servidor' },
      { status: 500 }
    )
  }
}
