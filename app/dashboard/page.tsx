import { getMe } from '@/lib/api/auth'
import { getDashboardMetrics } from '@/lib/api/dashboard'
import { AppLayout } from '@/components/layout/app-layout'
import { MetricCard } from '@/components/dashboard/metric-card'
import { MonthlyEvolution } from '@/components/dashboard/monthly-evolution'
import { ExpensesByType } from '@/components/dashboard/expenses-by-type'
import { RecentMovements } from '@/components/dashboard/recent-movements'
import { ArrowDownLeft, ArrowUpRight, Landmark } from 'lucide-react'
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

  return (
    <AppLayout
      user={user}
      active="/dashboard"
      title={`Buen día, ${user.name.split(' ')[0]}`}
      subtitle="Este es el resumen financiero y de movimientos de la fundación."
    >
      {/* Tarjetas de métricas principales */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
          note="Entregas a entidades y gastos propios"
          icon={ArrowUpRight}
          tone="red"
        />
      </div>

      {/* Gráfico y Distribución por Sector */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <MonthlyEvolution data={metrics?.monthly || []} />
        <ExpensesByType data={metrics?.expenses_by_entity_type || []} />
      </div>

      {/* Tabla de Movimientos Recientes */}
      <div className="mt-6">
        <RecentMovements movements={metrics?.latest_movements || []} />
      </div>
    </AppLayout>
  )
}
