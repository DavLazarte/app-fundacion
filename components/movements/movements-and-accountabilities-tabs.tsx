'use client'

import { useState } from 'react'
import {
  Category,
  Entity,
  EntityType,
  Movement,
  MovementAccountability,
  PaginatedResponse,
} from '@/types/api'
import { MovementsView } from './movements-view'
import { AccountabilitiesView } from './accountabilities-view'
import { ArrowLeftRight, FileCheck2 } from 'lucide-react'

interface Props {
  initialTab?: string
  movementsData: PaginatedResponse<Movement>
  accountabilitiesData: PaginatedResponse<MovementAccountability>
  categories: Category[]
  entities: Entity[]
  entityTypes: EntityType[]
  currentBalance: string
  canCreate: boolean
  canVoid: boolean
}

export function MovementsAndAccountabilitiesTabs({
  initialTab = 'movements',
  movementsData,
  accountabilitiesData,
  categories,
  entities,
  entityTypes,
  currentBalance,
  canCreate,
  canVoid,
}: Props) {
  const [activeTab, setActiveTab] = useState<'movements' | 'accountabilities'>(
    initialTab === 'accountabilities' ? 'accountabilities' : 'movements'
  )

  return (
    <div className="space-y-6">
      {/* Solapas superiores */}
      <div className="flex border-b border-[#dfe8e4]">
        <button
          onClick={() => setActiveTab('movements')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-all ${
            activeTab === 'movements'
              ? 'border-[#0d6b5e] text-[#0d6b5e]'
              : 'border-transparent text-[#71827e] hover:text-[#183b34]'
          }`}
        >
          <ArrowLeftRight className="size-4" />
          <span>Libro de Movimientos</span>
          <span className="rounded-full bg-[#edf4f1] px-2 py-0.5 text-xs font-semibold text-[#5a736c]">
            {movementsData.meta?.total ?? movementsData.data.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('accountabilities')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-all ${
            activeTab === 'accountabilities'
              ? 'border-[#0d6b5e] text-[#0d6b5e]'
              : 'border-transparent text-[#71827e] hover:text-[#183b34]'
          }`}
        >
          <FileCheck2 className="size-4" />
          <span>Rendiciones de Cuentas</span>
          <span className="rounded-full bg-[#edf4f1] px-2 py-0.5 text-xs font-semibold text-[#5a736c]">
            {accountabilitiesData.meta?.total ?? accountabilitiesData.data.length}
          </span>
        </button>
      </div>

      {activeTab === 'movements' ? (
        <MovementsView
          initialData={movementsData}
          categories={categories}
          entities={entities}
          entityTypes={entityTypes}
          currentBalance={currentBalance}
          canCreate={canCreate}
          canVoid={canVoid}
        />
      ) : (
        <AccountabilitiesView
          initialData={accountabilitiesData}
          canCreate={canCreate}
          canVoid={canVoid}
        />
      )}
    </div>
  )
}
