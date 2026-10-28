import { serverFetch } from '@/lib/api/client'
import { ReportSummary } from '@/types/api'

export interface ReportFilters {
  from?: string
  to?: string
  type?: 'ingreso' | 'egreso'
  category_id?: number | string
  entity_id?: number | string
}

/**
 * Obtener estadísticas y resumen de movimientos para la pantalla de informes.
 */
export async function getReportSummary(
  filters: ReportFilters = {}
): Promise<ReportSummary> {
  return serverFetch<ReportSummary>('/reports/summary', {
    params: filters as Record<string, string | number | boolean>,
  })
}
