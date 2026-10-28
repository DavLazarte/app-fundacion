import { serverFetch } from '@/lib/api/client'
import {
  Category,
  Entity,
  Movement,
  MovementAttachment,
  PaginatedResponse,
} from '@/types/api'

export interface MovementFilters {
  from?: string
  to?: string
  type?: 'ingreso' | 'egreso'
  category_id?: number | string
  entity_id?: number | string
  voided?: boolean | string
  q?: string
  page?: number
  per_page?: number
}

/**
 * Listar movimientos con filtros y paginación.
 */
export async function getMovements(
  filters: MovementFilters = {}
): Promise<PaginatedResponse<Movement>> {
  return serverFetch<PaginatedResponse<Movement>>('/movements', {
    params: filters as Record<string, string | number | boolean>,
  })
}

/**
 * Obtener detalle de un movimiento por ID.
 */
export async function getMovement(id: number | string): Promise<{ data: Movement }> {
  return serverFetch<{ data: Movement }>(`/movements/${id}`)
}

/**
 * Cargar catálogos necesarios para los selectores del formulario de movimiento.
 */
export async function getMovementCatalogs(): Promise<{
  categories: Category[]
  entities: Entity[]
}> {
  const [categoriesRes, entitiesRes] = await Promise.all([
    serverFetch<{ data: Category[] }>('/categories?is_active=1'),
    serverFetch<{ data: Entity[] }>('/entities?is_active=1&per_page=100'),
  ])

  return {
    categories: categoriesRes.data || [],
    entities: entitiesRes.data || [],
  }
}
