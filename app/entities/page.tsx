import { getMe } from '@/lib/api/auth'
import { getEntities, getEntityTypes } from '@/lib/api/entities'
import { getCategories } from '@/lib/api/categories'
import { AppLayout } from '@/components/layout/app-layout'
import { EntitiesAndCategoriesTabs } from '@/components/entities/entities-and-categories-tabs'
import { redirect } from 'next/navigation'

interface PageProps {
  searchParams: Promise<{
    type_id?: string
    is_active?: string
    q?: string
    page?: string
    tab?: string
  }>
}

export default async function EntitiesPage({ searchParams }: PageProps) {
  const user = await getMe()

  if (!user) {
    redirect('/login')
  }

  const params = await searchParams

  const [entitiesData, entityTypesRes, categoriesRes] = await Promise.all([
    getEntities({
      type_id: params.type_id,
      is_active: params.is_active,
      q: params.q,
      page: params.page ? parseInt(params.page) : 1,
      per_page: 15,
    }),
    getEntityTypes(),
    getCategories(),
  ])

  const canManage = user.permissions.includes('entities.manage')

  return (
    <AppLayout
      user={user}
      active="/entities"
      title="Entidades y Categorías"
      subtitle="Administrá las organizaciones beneficiarias, proveedores y los rubros de fondos."
    >
      <EntitiesAndCategoriesTabs
        initialTab={params.tab || 'entities'}
        entitiesData={entitiesData}
        entityTypes={entityTypesRes.data || []}
        categories={categoriesRes.data || []}
        canManage={canManage}
      />
    </AppLayout>
  )
}
