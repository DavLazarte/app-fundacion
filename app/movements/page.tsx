import { getMe } from '@/lib/api/auth'
import { getMovements, getMovementCatalogs } from '@/lib/api/movements'
import { getAccountabilities } from '@/lib/api/accountabilities'
import { getGeneralFundBalance } from '@/lib/api/funds'
import { AppLayout } from '@/components/layout/app-layout'
import { MovementsAndAccountabilitiesTabs } from '@/components/movements/movements-and-accountabilities-tabs'
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
    tab?: string
  }>
}

export default async function MovementsPage({ searchParams }: PageProps) {
  const user = await getMe()

  if (!user) {
    redirect('/login')
  }

  const params = await searchParams
  const isAccountabilitiesTab = params.tab === 'accountabilities'

  const [movementsData, accountabilitiesData, catalogs, currentBalance] =
    await Promise.all([
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
      isAccountabilitiesTab
        ? getAccountabilities({
            q: params.q,
            page: params.page ? parseInt(params.page) : 1,
            per_page: 15,
          }).catch(() => ({
            data: [],
            links: { first: '', last: '', prev: null, next: null },
            meta: {
              current_page: 1,
              from: 0,
              last_page: 1,
              links: [],
              path: '',
              per_page: 15,
              to: 0,
              total: 0,
            },
          }))
        : Promise.resolve({
            data: [],
            links: { first: '', last: '', prev: null, next: null },
            meta: {
              current_page: 1,
              from: 0,
              last_page: 1,
              links: [],
              path: '',
              per_page: 15,
              to: 0,
              total: 0,
            },
          }),
      getMovementCatalogs(),
      getGeneralFundBalance(),
    ])

  const canCreate = user.permissions.includes('movements.create')
  const canVoid = user.permissions.includes('movements.void')

  return (
    <AppLayout
      user={user}
      active="/movements"
      title="Libro de Movimientos y Rendiciones"
      subtitle="Registro inmutable de ingresos, egresos y comprobantes de rendición de cuentas."
    >
      <MovementsAndAccountabilitiesTabs
        initialTab={params.tab || 'movements'}
        movementsData={movementsData}
        accountabilitiesData={accountabilitiesData}
        categories={catalogs.categories}
        entities={catalogs.entities}
        entityTypes={catalogs.entityTypes}
        currentBalance={currentBalance}
        canCreate={canCreate}
        canVoid={canVoid}
      />
    </AppLayout>
  )
}
