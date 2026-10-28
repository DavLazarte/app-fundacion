import { getMe } from '@/lib/api/auth'
import { getReportSummary } from '@/lib/api/reports'
import { getMovementCatalogs } from '@/lib/api/movements'
import { AppLayout } from '@/components/layout/app-layout'
import { ReportsView } from '@/components/reports/reports-view'
import { redirect } from 'next/navigation'

interface PageProps {
  searchParams: Promise<{
    from?: string
    to?: string
    type?: 'ingreso' | 'egreso'
    category_id?: string
    entity_id?: string
  }>
}

export default async function ReportsPage({ searchParams }: PageProps) {
  const user = await getMe()

  if (!user) {
    redirect('/login')
  }

  const params = await searchParams

  const [summaryData, catalogs] = await Promise.all([
    getReportSummary({
      from: params.from,
      to: params.to,
      type: params.type,
      category_id: params.category_id,
      entity_id: params.entity_id,
    }),
    getMovementCatalogs(),
  ])

  const canExport = user.permissions.includes('reports.export')

  return (
    <AppLayout
      user={user}
      active="/reports"
      title="Informes y Balances"
      subtitle="Auditoría contable, estadísticas y descargas oficiales en PDF y Excel."
    >
      <ReportsView
        summary={summaryData}
        categories={catalogs.categories}
        entities={catalogs.entities}
        canExport={canExport}
      />
    </AppLayout>
  )
}
