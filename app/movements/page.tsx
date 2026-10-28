import { getMe } from '@/lib/api/auth'
import { getMovements, getMovementCatalogs } from '@/lib/api/movements'
import { getDashboardMetrics } from '@/lib/api/dashboard'
import { AppLayout } from '@/components/layout/app-layout'
import { MovementsView } from '@/components/movements/movements-view'
import { redirect } from 'next/navigation'

interface PageProps {
  searchParams: Promise<{
    from?: string
    to?: string
    type?: 'ingreso' | 'egreso'
    category_id?: string
    entity_id?: string
    voided?: string
    q?: string
    page?: string
  }>
}

export default async function MovementsPage({ searchParams }: PageProps) {
  const user = await getMe()

  if (!user) {
    redirect('/login')
  }

  const params = await searchParams

  const [movementsData, catalogs, dashboardData] = await Promise.all([
    getMovements({
      from: params.from,
      to: params.to,
      type: params.type,
      category_id: params.category_id,
      entity_id: params.entity_id,
      voided: params.voided,
      q: params.q,
      page: params.page ? parseInt(params.page) : 1,
      per_page: 15,
    }),
    getMovementCatalogs(),
    getDashboardMetrics().catch(() => null),
  ])

  const currentBalance = dashboardData?.general_available || '0.00'
  const canCreate = user.permissions.includes('movements.create')
  const canVoid = user.permissions.includes('movements.void')

  return (
    <AppLayout
      user={user}
      active="/movements"
      title="Libro de Movimientos"
      subtitle="Registro inmutable de ingresos y egresos de la tesorería."
    >
      <MovementsView
        initialData={movementsData}
        categories={catalogs.categories}
        entities={catalogs.entities}
        currentBalance={currentBalance}
        canCreate={canCreate}
        canVoid={canVoid}
      />
    </AppLayout>
  )
}
