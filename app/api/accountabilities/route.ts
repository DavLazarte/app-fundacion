import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.API_URL || 'http://tesoreria-api.test/api'

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value

  if (!token) {
    return NextResponse.json({ message: 'No autenticado' }, { status: 401 })
  }

  const { search } = new URL(request.url)

  try {
    const res = await fetch(`${API_URL}/accountabilities${search}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json(
      { message: 'Error de conexión con el servidor' },
      { status: 500 }
    )
  }
}
