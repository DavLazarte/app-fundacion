import { getMe } from '@/lib/api/auth'
import { getEntities, getEntityTypes } from '@/lib/api/entities'
import { AppLayout } from '@/components/layout/app-layout'
import { EntitiesView } from '@/components/entities/entities-view'
import { redirect } from 'next/navigation'

interface PageProps {
  searchParams: Promise<{
    type_id?: string
    is_active?: string
    q?: string
    page?: string
  }>
}

export default async function EntitiesPage({ searchParams }: PageProps) {
  const user = await getMe()

  if (!user) {
    redirect('/login')
  }

  const params = await searchParams

  const [entitiesData, entityTypesRes] = await Promise.all([
    getEntities({
      type_id: params.type_id,
      is_active: params.is_active,
      q: params.q,
      page: params.page ? parseInt(params.page) : 1,
      per_page: 15,
    }),
    getEntityTypes(),
  ])

  const canManage = user.permissions.includes('entities.manage')

  return (
    <AppLayout
      user={user}
      active="/entities"
      title="Directorio de Entidades"
      subtitle="Organizaciones comunitarias, comedores, iglesias, personas y proveedores."
    >
      <EntitiesView
        initialData={entitiesData}
        entityTypes={entityTypesRes.data || []}
        canManage={canManage}
      />
    </AppLayout>
  )
}
