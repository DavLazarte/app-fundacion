import { NextRequest, NextResponse } from 'next/server'
import { ApiErrorResponse } from '@/types/api'

const API_URL = process.env.API_URL || 'http://tesoreria-api.test/api'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get('auth_token')?.value

  if (!token) {
    return NextResponse.json({ message: 'No autenticado' }, { status: 401 })
  }

  const { id } = await params

  try {
    const formData = await request.formData()

    const res = await fetch(`${API_URL}/movements/${id}/attachments`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    const data = await res.json()

    if (!res.ok) {
      const errorData = data as ApiErrorResponse
      return NextResponse.json(
        {
          message: errorData.message || 'Error al subir el comprobante',
          errors: errorData.errors,
        },
        { status: res.status }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { message: 'Error de conexión con el servidor al subir archivo' },
      { status: 500 }
    )
  }
}
