import { serverFetch } from '@/lib/api/client'
import { Entity, EntityType, PaginatedResponse } from '@/types/api'

export interface EntityFilters {
  type_id?: number | string
  is_active?: boolean | string
  q?: string
  page?: number
  per_page?: number
}

/**
 * Listar entidades con filtros y paginación.
 */
export async function getEntities(
  filters: EntityFilters = {}
): Promise<PaginatedResponse<Entity>> {
  return serverFetch<PaginatedResponse<Entity>>('/entities', {
    params: filters as Record<string, string | number | boolean>,
  })
}

/**
 * Obtener listado de tipos de entidad activos.
 */
export async function getEntityTypes(): Promise<{ data: EntityType[] }> {
  return serverFetch<{ data: EntityType[] }>('/entity-types?is_active=1')
}

/**
 * Detalle de una entidad por ID.
 */
export async function getEntity(id: number | string): Promise<{ data: Entity }> {
  return serverFetch<{ data: Entity }>(`/entities/${id}`)
}
