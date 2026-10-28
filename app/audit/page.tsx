import { getMe } from '@/lib/api/auth'
import { getAuditLogs, getAccessLogs } from '@/lib/api/users-audit'
import { AppLayout } from '@/components/layout/app-layout'
import { AuditView } from '@/components/audit/audit-view'
import { redirect } from 'next/navigation'

interface PageProps {
  searchParams: Promise<{
    tab?: 'actions' | 'access'
    from?: string
    to?: string
    event?: string
    page?: string
  }>
}

export default async function AuditPage({ searchParams }: PageProps) {
  const user = await getMe()

  if (!user) {
    redirect('/login')
  }

  // Verificar permiso de auditoría
  if (!user.permissions.includes('audit.view')) {
    redirect('/dashboard')
  }

  const params = await searchParams
  const activeTab = params.tab === 'access' ? 'access' : 'actions'
  const page = params.page ? parseInt(params.page) : 1

  const [auditLogs, accessLogs] = await Promise.all([
    getAuditLogs({
      page: activeTab === 'actions' ? page : 1,
      from: params.from,
      to: params.to,
      event: activeTab === 'actions' ? params.event : undefined,
    }),
    getAccessLogs({
      page: activeTab === 'access' ? page : 1,
      from: params.from,
      to: params.to,
      event: activeTab === 'access' ? params.event : undefined,
    }),
  ])

  return (
    <AppLayout
      user={user}
      active="/audit"
      title="Libro de Auditoría y Accesos"
      subtitle="Registro inmutable de todas las modificaciones de negocio e inicios de sesión."
    >
      <AuditView
        auditLogs={auditLogs}
        accessLogs={accessLogs}
        activeTab={activeTab}
      />
    </AppLayout>
  )
}
