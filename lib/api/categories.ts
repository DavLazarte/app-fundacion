import { serverFetch } from '@/lib/api/client'
import { Category } from '@/types/api'

export async function getCategories(params?: {
  flow?: 'ingreso' | 'egreso'
  is_active?: boolean | string | number
}): Promise<{ data: (Category & { movements_count?: number })[] }> {
  return serverFetch<{ data: (Category & { movements_count?: number })[] }>('/categories', {
    params: params as Record<string, string | number | boolean>,
    next: { revalidate: 60 },
  })
}
