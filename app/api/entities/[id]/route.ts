import { NextRequest, NextResponse } from 'next/server'
import { ApiErrorResponse } from '@/types/api'

const API_URL = process.env.API_URL || 'http://tesoreria-api.test/api'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get('auth_token')?.value

  if (!token) {
    return NextResponse.json({ message: 'No autenticado' }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await request.json()

    const res = await fetch(`${API_URL}/entities/${id}`, {
      method: 'PUT',
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
          message: errorData.message || 'Error al actualizar la entidad',
          errors: errorData.errors,
        },
        { status: res.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { message: 'Error de conexión con el servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get('auth_token')?.value

  if (!token) {
    return NextResponse.json({ message: 'No autenticado' }, { status: 401 })
  }

  const { id } = await params

  try {
    const res = await fetch(`${API_URL}/entities/${id}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || 'Error al eliminar la entidad' },
        { status: res.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { message: 'Error de conexión con el servidor' },
      { status: 500 }
    )
  }
}
