import { serverFetch } from '@/lib/api/client'
import { Fund } from '@/types/api'

export async function getGeneralFundBalance(): Promise<string> {
  try {
    const res = await serverFetch<{ data: Fund[] }>('/funds?kind=general')
    return res.data?.[0]?.balance ?? '0.00'
  } catch {
    return '0.00'
  }
}
