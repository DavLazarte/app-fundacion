import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.API_URL || 'http://tesoreria-api.test/api'

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value

  if (!token) {
    return NextResponse.json({ message: 'No autenticado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'pdf'

  try {
    const res = await fetch(`${API_URL}/reports/export?${searchParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept:
          format === 'xlsx'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'application/pdf',
      },
    })

    if (!res.ok) {
      return NextResponse.json(
        { message: 'Error al generar el archivo en el servidor' },
        { status: res.status }
      )
    }

    const blob = await res.blob()
    const contentType =
      res.headers.get('content-type') ||
      (format === 'xlsx'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/pdf')
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
      { message: 'Error de conexión con el servidor al exportar informe' },
      { status: 500 }
    )
  }
}
