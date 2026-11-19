import { serverFetch } from '@/lib/api/client'
import { MovementAccountability, PaginatedResponse } from '@/types/api'

export interface AccountabilityFilters {
  entity_id?: number | string
  movement_id?: number | string
  from?: string
  to?: string
  q?: string
  page?: number
  per_page?: number
}

export async function getAccountabilities(
  filters: AccountabilityFilters = {}
): Promise<PaginatedResponse<MovementAccountability>> {
  return serverFetch<PaginatedResponse<MovementAccountability>>('/accountabilities', {
    params: filters as Record<string, string | number | boolean>,
  })
}
