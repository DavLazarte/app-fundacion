'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Category, Entity, Movement, PaginatedResponse } from '@/types/api'
import { formatCurrency, formatDate } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { NewMovementModal } from './new-movement-modal'
import { VoidMovementModal } from './void-movement-modal'
import { MovementDetailModal } from './movement-detail-modal'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Eye,
  Filter,
  Plus,
  Search,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MovementsViewProps {
  initialData: PaginatedResponse<Movement>
  categories: Category[]
  entities: Entity[]
  currentBalance: string
  canCreate: boolean
  canVoid: boolean
}

export function MovementsView({
  initialData,
  categories,
  entities,
  currentBalance,
  canCreate,
  canVoid,
}: MovementsViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Filtros en estado local
  const [q, setQ] = useState(searchParams.get('q') || '')
  const [type, setType] = useState(searchParams.get('type') || '')
  const [categoryId, setCategoryId] = useState(searchParams.get('category_id') || '')
  const [entityId, setEntityId] = useState(searchParams.get('entity_id') || '')
  const [voided, setVoided] = useState(searchParams.get('voided') || '')
  const [from, setFrom] = useState(searchParams.get('from') || '')
  const [to, setTo] = useState(searchParams.get('to') || '')

  const [showFilters, setShowFilters] = useState(false)

  // Modales
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null)
  const [voidTarget, setVoidTarget] = useState<Movement | null>(null)

  function applyFilters() {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (type) params.set('type', type)
    if (categoryId) params.set('category_id', categoryId)
    if (entityId) params.set('entity_id', entityId)
    if (voided) params.set('voided', voided)
    if (from) params.set('from', from)
    if (to) params.set('to', to)

    router.push(`/movements?${params.toString()}`)
  }

  function clearFilters() {
    setQ('')
    setType('')
    setCategoryId('')
    setEntityId('')
    setVoided('')
    setFrom('')
    setTo('')
    router.push('/movements')
  }

  function handlePageChange(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    router.push(`/movements?${params.toString()}`)
  }

  const movements = initialData.data || []
  const meta = initialData.meta

  return (
    <div>
      {/* Barra de acción superior */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#8c9e99]" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            placeholder="Buscar por concepto o referencia..."
            className="h-11 w-full rounded-xl border border-[#dfe8e4] bg-white pl-10 pr-3.5 text-sm text-[#1e3934] outline-none focus:border-[#0d6b5e] focus:ring-2 focus:ring-[#0d6b5e]/20"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'h-11 gap-2 rounded-xl border-[#dfe8e4] bg-white text-[#2d4d44]',
              showFilters && 'border-[#0d6b5e] bg-[#e7f4ef] text-[#0d6b5e]'
            )}
          >
            <Filter className="size-4" />
            Filtros
          </Button>

          {canCreate && (
            <Button
              onClick={() => setIsNewModalOpen(true)}
              className="h-11 gap-2 rounded-xl bg-[#0d6b5e] px-5 font-semibold text-white hover:bg-[#0a574c]"
            >
              <Plus className="size-4" />
              Nuevo movimiento
            </Button>
          )}
        </div>
      </div>

      {/* Panel colapsable de filtros avanzados */}
      {showFilters && (
        <div className="mb-6 rounded-2xl border border-[#e1ebe7] bg-white p-5 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <div>
              <label className="block text-xs font-semibold uppercase text-[#5a736c]">
                Tipo
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-[#dfe8e4] bg-white px-2.5 text-xs text-[#1e3934] outline-none"
              >
                <option value="">Todos</option>
                <option value="ingreso">Ingreso</option>
                <option value="egreso">Egreso</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#5a736c]">
                Categoría
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-[#dfe8e4] bg-white px-2.5 text-xs text-[#1e3934] outline-none"
              >
                <option value="">Todas</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.flow})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#5a736c]">
                Entidad
              </label>
              <select
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-[#dfe8e4] bg-white px-2.5 text-xs text-[#1e3934] outline-none"
              >
                <option value="">Todas</option>
                {entities.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#5a736c]">
                Estado
              </label>
              <select
                value={voided}
                onChange={(e) => setVoided(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-[#dfe8e4] bg-white px-2.5 text-xs text-[#1e3934] outline-none"
              >
                <option value="">Todos</option>
                <option value="0">Solo Activos</option>
                <option value="1">Solo Anulados</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#5a736c]">
                Fecha Desde
              </label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-[#dfe8e4] bg-white px-2 text-xs text-[#1e3934] outline-none"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2 border-t border-[#edf1ef] pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs text-[#71827e]"
            >
              Limpiar filtros
            </Button>
            <Button
              size="sm"
              onClick={applyFilters}
              className="bg-[#0d6b5e] text-xs text-white hover:bg-[#0a574c]"
            >
              Aplicar filtros
            </Button>
          </div>
        </div>
      )}

      {/* Tabla de movimientos */}
      <div className="overflow-hidden rounded-2xl border border-[#e1ebe7] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead>
              <tr className="border-b border-[#edf1ef] bg-[#fafcfb] text-xs uppercase tracking-wider text-[#93a29e]">
                <th className="px-6 py-3.5 font-semibold">Fecha</th>
                <th className="px-6 py-3.5 font-semibold">Concepto / Ref</th>
                <th className="px-6 py-3.5 font-semibold">Categoría</th>
                <th className="px-6 py-3.5 font-semibold">Entidad</th>
                <th className="px-6 py-3.5 font-semibold">Tipo</th>
                <th className="px-6 py-3.5 text-right font-semibold">Importe</th>
                <th className="px-6 py-3.5 text-center font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-sm text-[#8c9e99]">
                    No se encontraron movimientos registrados con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                movements.map((m) => {
                  const isIncome = m.type === 'ingreso'
                  const isVoided = m.is_voided
                  const Icon = isIncome ? ArrowDownLeft : ArrowUpRight

                  return (
                    <tr
                      key={m.id}
                      className={cn(
                        'border-b border-[#f0f3f2] last:border-0 hover:bg-[#fbfcfc]',
                        isVoided && 'opacity-60 bg-[#fefbfb]'
                      )}
                    >
                      <td className="px-6 py-4 text-xs font-medium text-[#70817c]">
                        {formatDate(m.movement_date)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              'flex size-8 items-center justify-center rounded-lg',
                              isIncome
                                ? 'bg-[#e8f5f0] text-[#338c77]'
                                : 'bg-[#faeee9] text-[#bb7454]'
                            )}
                          >
                            <Icon className="size-4" />
                          </span>
                          <div>
                            <p
                              className={cn(
                                'text-sm font-semibold text-[#38534c]',
                                isVoided && 'line-through'
                              )}
                            >
                              {m.concept}
                            </p>
                            {m.reference && (
                              <p className="font-mono text-[11px] text-[#91a09c]">
                                Ref: {m.reference}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-[#5d736d]">
                        {m.category?.name || '—'}
                      </td>
                      <td className="px-6 py-4 text-xs text-[#5d736d]">
                        {m.entity?.name || 'Gasto directo'}
                      </td>
                      <td className="px-6 py-4">
                        {isVoided ? (
                          <span className="rounded-md bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700">
                            ANULADO
                          </span>
                        ) : (
                          <span
                            className={cn(
                              'rounded-md px-2 py-0.5 text-[11px] font-semibold',
                              isIncome
                                ? 'bg-[#e8f5f0] text-[#267560]'
                                : 'bg-[#faeee9] text-[#ae6548]'
                            )}
                          >
                            {isIncome ? 'Ingreso' : 'Egreso'}
                          </span>
                        )}
                      </td>
                      <td
                        className={cn(
                          'px-6 py-4 text-right text-sm font-bold',
                          isVoided
                            ? 'text-gray-400 line-through'
                            : isIncome
                            ? 'text-[#287b68]'
                            : 'text-[#b76547]'
                        )}
                      >
                        {isIncome ? '+ ' : '− '}
                        {formatCurrency(m.amount)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedMovement(m)}
                          className="h-8 gap-1.5 rounded-lg px-2 text-xs text-[#57726b] hover:bg-[#eaf3f0] hover:text-[#0d6b5e]"
                        >
                          <Eye className="size-3.5" />
                          Ver
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between border-t border-[#edf1ef] px-6 py-4 text-xs text-[#71827e]">
            <span>
              Mostrando {meta.from || 0} - {meta.to || 0} de {meta.total} movimientos
            </span>
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={meta.current_page <= 1}
                onClick={() => handlePageChange(meta.current_page - 1)}
                className="h-8 rounded-lg text-xs"
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={meta.current_page >= meta.last_page}
                onClick={() => handlePageChange(meta.current_page + 1)}
                className="h-8 rounded-lg text-xs"
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      <NewMovementModal
        currentBalance={currentBalance}
        categories={categories}
        entities={entities}
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={() => {
          setIsNewModalOpen(false)
          router.refresh()
        }}
      />

      <MovementDetailModal
        movement={selectedMovement}
        isOpen={selectedMovement !== null}
        onClose={() => setSelectedMovement(null)}
        onVoidClick={(m) => setVoidTarget(m)}
        canVoid={canVoid}
      />

      <VoidMovementModal
        movement={voidTarget}
        isOpen={voidTarget !== null}
        onClose={() => setVoidTarget(null)}
        onSuccess={() => {
          setVoidTarget(null)
          router.refresh()
        }}
      />
    </div>
  )
}
