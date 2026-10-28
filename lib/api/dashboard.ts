import { serverFetch } from '@/lib/api/client'
import { DashboardMetrics } from '@/types/api'

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  return serverFetch<DashboardMetrics>('/dashboard')
}
