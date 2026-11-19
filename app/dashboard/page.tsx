import { getMe } from '@/lib/api/auth'
import { getDashboardMetrics } from '@/lib/api/dashboard'
import { AppLayout } from '@/components/layout/app-layout'
import { MetricCard } from '@/components/dashboard/metric-card'
import { MonthlyEvolution } from '@/components/dashboard/monthly-evolution'
import { ExpensesByType } from '@/components/dashboard/expenses-by-type'
import { TopEntitiesDeliveries } from '@/components/dashboard/top-entities-deliveries'
import { RecentMovements } from '@/components/dashboard/recent-movements'
import { ArrowDownLeft, ArrowUpRight, FileCheck2, Landmark } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const user = await getMe()

  if (!user) {
    redirect('/login')
  }

  let metrics = null
  try {
    metrics = await getDashboardMetrics()
  } catch (err) {
    // Si la API no está disponible o da error
  }

  const generalAvailable = metrics?.general_available ?? '0.00'
  const expensesMonth = metrics?.month.expenses ?? '0.00'
  const incomesMonth = metrics?.month.incomes ?? '0.00'
  const renderedMonth = metrics?.month.rendered ?? '0.00'
  const pendingCount = metrics?.month.pending_count ?? 0

  return (
    <AppLayout
      user={user}
      active="/dashboard"
      title={`Buen día, ${user.name.split(' ')[0]}`}
      subtitle="Este es el resumen financiero, entregas y rendiciones de la fundación."
    >
      {/* Tarjetas de métricas principales (4 tarjetas responsivas) */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Caja general disponible"
          value={generalAvailable}
          note="Disponibilidad real de la fundación"
          icon={Landmark}
          tone="teal"
        />
        <MetricCard
          label="Ingresos del mes"
          value={incomesMonth}
          note="Donaciones y aportes recibidos"
          icon={ArrowDownLeft}
          tone="teal"
        />
        <MetricCard
          label="Egresos del mes"
          value={expensesMonth}
          note="Entregas a entidades y gastos"
          icon={ArrowUpRight}
          tone="red"
        />
        <MetricCard
          label="Rendido en boletas (mes)"
          value={renderedMonth}
          note={
            pendingCount > 0
              ? `${pendingCount} ${pendingCount === 1 ? 'egreso pendiente' : 'egresos pendientes'}`
              : 'Al día con las rendiciones'
          }
          icon={FileCheck2}
          tone="teal"
        />
      </div>

      {/* Gráfico y Distribución por Sector */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <MonthlyEvolution data={metrics?.monthly || []} />
        <ExpensesByType data={metrics?.expenses_by_entity_type || []} />
      </div>

      {/* Card de Entregas y Rendición por Entidad */}
      {metrics?.top_entities && metrics.top_entities.length > 0 && (
        <div className="mt-6">
          <TopEntitiesDeliveries entities={metrics.top_entities} />
        </div>
      )}

      {/* Tabla de Movimientos Recientes */}
      <div className="mt-6">
        <RecentMovements movements={metrics?.latest_movements || []} />
      </div>
    </AppLayout>
  )
}
