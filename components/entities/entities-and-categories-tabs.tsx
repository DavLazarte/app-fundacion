'use client'

import { useState } from 'react'
import { Category, Entity, EntityType, PaginatedResponse } from '@/types/api'
import { EntitiesView } from './entities-view'
import { CategoriesView } from '@/components/categories/categories-view'
import { Building2, Tags } from 'lucide-react'

interface Props {
  initialTab?: string
  entitiesData: PaginatedResponse<Entity>
  entityTypes: EntityType[]
  categories: (Category & { movements_count?: number })[]
  canManage: boolean
}

export function EntitiesAndCategoriesTabs({
  initialTab = 'entities',
  entitiesData,
  entityTypes,
  categories,
  canManage,
}: Props) {
  const [activeTab, setActiveTab] = useState<'entities' | 'categories'>(
    initialTab === 'categories' ? 'categories' : 'entities'
  )

  return (
    <div className="space-y-6">
      {/* Solapas superiores */}
      <div className="flex border-b border-[#dfe8e4]">
        <button
          onClick={() => setActiveTab('entities')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-all ${
            activeTab === 'entities'
              ? 'border-[#0d6b5e] text-[#0d6b5e]'
              : 'border-transparent text-[#71827e] hover:text-[#183b34]'
          }`}
        >
          <Building2 className="size-4" />
          <span>Entidades y Destinatarios</span>
          <span className="rounded-full bg-[#edf4f1] px-2 py-0.5 text-xs font-semibold text-[#5a736c]">
            {entitiesData.meta?.total ?? entitiesData.data.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-all ${
            activeTab === 'categories'
              ? 'border-[#0d6b5e] text-[#0d6b5e]'
              : 'border-transparent text-[#71827e] hover:text-[#183b34]'
          }`}
        >
          <Tags className="size-4" />
          <span>Categorías de Fondos</span>
          <span className="rounded-full bg-[#edf4f1] px-2 py-0.5 text-xs font-semibold text-[#5a736c]">
            {categories.length}
          </span>
        </button>
      </div>

      {activeTab === 'entities' ? (
        <EntitiesView
          initialData={entitiesData}
          entityTypes={entityTypes}
          canManage={canManage}
        />
      ) : (
        <CategoriesView
          initialCategories={categories}
          canManage={canManage}
        />
      )}
    </div>
  )
}
