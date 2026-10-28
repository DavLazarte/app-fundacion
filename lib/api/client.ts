import { cookies } from 'next/headers'
import { ApiErrorResponse } from '@/types/api'

const API_URL = process.env.API_URL || 'http://tesoreria-api.test/api'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public errors?: Record<string, string[]>
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | null | undefined>
}

/**
 * Cliente HTTP para invocar a la API de Laravel desde el servidor de Next.js.
 * Agrega automáticamente el token Bearer desde la cookie httpOnly.
 */
export async function serverFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  let url = `${API_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`

  if (options.params) {
    const searchParams = new URLSearchParams()
    Object.entries(options.params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, String(val))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString
    }
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  }

  // Si no enviamos FormData, aseguramos Content-Type application/json
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
    cache: options.cache ?? 'no-store', // Por defecto datos en tiempo real de tesorería
  })

  // Si es un archivo binario (PDF o XLSX)
  const contentType = response.headers.get('content-type') || ''
  if (
    contentType.includes('application/pdf') ||
    contentType.includes('spreadsheetml') ||
    contentType.includes('application/octet-stream')
  ) {
    if (!response.ok) {
      throw new ApiError('Error al descargar el archivo', response.status)
    }
    return response as unknown as T
  }

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const errorData = data as ApiErrorResponse
    throw new ApiError(
      errorData.message || 'Error en la petición al servidor',
      response.status,
      errorData.code,
      errorData.errors
    )
  }

  return data as T
}
