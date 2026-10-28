import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.API_URL || 'http://tesoreria-api.test/api'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; attachmentId: string }> }
) {
  const token = request.cookies.get('auth_token')?.value

  if (!token) {
    return NextResponse.json({ message: 'No autenticado' }, { status: 401 })
  }

  const { id, attachmentId } = await params

  try {
    const res = await fetch(`${API_URL}/movements/${id}/attachments/${attachmentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      return NextResponse.json(
        { message: 'Archivo no encontrado' },
        { status: res.status }
      )
    }

    const blob = await res.blob()
    const contentType = res.headers.get('content-type') || 'application/octet-stream'
    const contentDisposition = res.headers.get('content-disposition') || ''

    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        ...(contentDisposition ? { 'Content-Disposition': contentDisposition } : {}),
      },
    })
  } catch (error) {
    return NextResponse.json(
      { message: 'Error al descargar el archivo' },
      { status: 500 }
    )
  }
}
