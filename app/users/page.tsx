import { getMe } from '@/lib/api/auth'
import { getUsers, getRoles } from '@/lib/api/users-audit'
import { AppLayout } from '@/components/layout/app-layout'
import { UsersView } from '@/components/users/users-view'
import { redirect } from 'next/navigation'

interface PageProps {
  searchParams: Promise<{
    page?: string
    role?: string
    is_active?: string
    q?: string
  }>
}

export default async function UsersPage({ searchParams }: PageProps) {
  const user = await getMe()

  if (!user) {
    redirect('/login')
  }

  // Verificar permiso de administración de usuarios
  if (!user.permissions.includes('users.manage')) {
    redirect('/dashboard')
  }

  const params = await searchParams

  const [usersData, rolesData] = await Promise.all([
    getUsers({
      page: params.page ? parseInt(params.page) : 1,
      role: params.role,
      is_active: params.is_active,
      q: params.q,
    }),
    getRoles(),
  ])

  return (
    <AppLayout
      user={user}
      active="/users"
      title="Usuarios y Roles"
      subtitle="Control de cuentas, perfiles de tesorera y contador, y permisos del sistema."
    >
      <UsersView
        initialData={usersData}
        roles={rolesData.data}
        currentUser={user}
      />
    </AppLayout>
  )
}
