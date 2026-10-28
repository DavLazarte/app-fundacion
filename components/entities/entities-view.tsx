'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Entity, EntityType, PaginatedResponse } from '@/types/api'
import { Button } from '@/components/ui/button'
import { EntityFormModal } from './entity-form-modal'
import { DeleteEntityModal } from './delete-entity-modal'
import {
  Edit2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface EntitiesViewProps {
  initialData: PaginatedResponse<Entity>
  entityTypes: EntityType[]
  canManage: boolean
}

export function EntitiesView({
  initialData,
  entityTypes,
  canManage,
}: EntitiesViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [q, setQ] = useState(searchParams.get('q') || '')
  const [typeId, setTypeId] = useState(searchParams.get('type_id') || '')

  // Modales
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Entity | null>(null)

  function applyFilters(newType?: string) {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    const effectiveType = newType !== undefined ? newType : typeId
    if (effectiveType) params.set('type_id', effectiveType)

    router.push(`/entities?${params.toString()}`)
  }

  function handleTypeFilter(id: string) {
    setTypeId(id)
    applyFilters(id)
  }

  function handlePageChange(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    router.push(`/entities?${params.toString()}`)
  }

  const entities = initialData.data || []
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
            placeholder="Buscar por nombre, documento o teléfono..."
            className="h-11 w-full rounded-xl border border-[#dfe8e4] bg-white pl-10 pr-3.5 text-sm text-[#1e3934] outline-none focus:border-[#0d6b5e] focus:ring-2 focus:ring-[#0d6b5e]/20"
          />
        </div>

        {canManage && (
          <Button
            onClick={() => {
              setEditingEntity(null)
              setFormModalOpen(true)
            }}
            className="h-11 gap-2 rounded-xl bg-[#0d6b5e] px-5 font-semibold text-white hover:bg-[#0a574c]"
          >
            <Plus className="size-4" />
            Nueva entidad
          </Button>
        )}
      </div>

      {/* Pestañas de tipos de entidad (Comedores, Iglesias, Proveedores, etc.) */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => handleTypeFilter('')}
          className={cn(
            'rounded-xl px-4 py-2 text-xs font-semibold transition-all',
            !typeId
              ? 'bg-[#0d6b5e] text-white shadow-sm'
              : 'border border-[#dfe8e4] bg-white text-[#58716a] hover:bg-[#f3f7f5]'
          )}
        >
          Todas
        </button>
        {entityTypes.map((t) => (
          <button
            key={t.id}
            onClick={() => handleTypeFilter(String(t.id))}
            className={cn(
              'rounded-xl px-4 py-2 text-xs font-semibold transition-all',
              typeId === String(t.id)
                ? 'bg-[#0d6b5e] text-white shadow-sm'
                : 'border border-[#dfe8e4] bg-white text-[#58716a] hover:bg-[#f3f7f5]'
            )}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Grid de tarjetas de entidades */}
      {entities.length === 0 ? (
        <div className="rounded-2xl border border-[#e1ebe7] bg-white p-12 text-center text-sm text-[#8c9e99]">
          No se encontraron entidades con los filtros aplicados.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entities.map((ent) => (
            <div
              key={ent.id}
              className="flex flex-col justify-between rounded-2xl border border-[#e1ebe7] bg-white p-5 shadow-sm transition-all hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-md bg-[#e7f4ef] px-2.5 py-0.5 text-xs font-semibold text-[#187262]">
                    {ent.entity_type?.name || 'Entidad'}
                  </span>
                  <span
                    className={cn(
                      'size-2 rounded-full',
                      ent.is_active ? 'bg-emerald-500' : 'bg-gray-400'
                    )}
                    title={ent.is_active ? 'Activa' : 'Inactiva'}
                  />
                </div>

                <h3 className="mt-3 text-base font-bold text-[#1e3934]">{ent.name}</h3>

                {ent.document_number && (
                  <p className="mt-0.5 text-xs font-medium text-[#7c8f89]">
                    Doc: {ent.document_number}
                  </p>
                )}

                <div className="mt-4 space-y-2 text-xs text-[#57726b]">
                  {ent.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="size-3.5 text-[#8c9e99]" />
                      <span>{ent.phone}</span>
                    </div>
                  )}

                  {ent.email && (
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="size-3.5 shrink-0 text-[#8c9e99]" />
                      <span className="truncate">{ent.email}</span>
                    </div>
                  )}

                  {ent.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="size-3.5 shrink-0 text-[#8c9e99]" />
                      <span className="truncate">{ent.address}</span>
                    </div>
                  )}
                </div>

                {ent.notes && (
                  <p className="mt-3 rounded-lg bg-[#f8faf9] p-2.5 text-[11px] text-[#6b827c]">
                    {ent.notes}
                  </p>
                )}
              </div>

              {canManage && (
                <div className="mt-5 flex items-center justify-end gap-2 border-t border-[#edf1ef] pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingEntity(ent)
                      setFormModalOpen(true)
                    }}
                    className="h-8 gap-1.5 rounded-lg px-2 text-xs text-[#57726b] hover:bg-[#eaf3f0] hover:text-[#0d6b5e]"
                  >
                    <Edit2 className="size-3.5" /> Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(ent)}
                    className="h-8 gap-1.5 rounded-lg px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="size-3.5" /> Dar de baja
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {meta && meta.last_page > 1 && (
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-[#e1ebe7] bg-white px-6 py-4 text-xs text-[#71827e]">
          <span>
            Mostrando {meta.from || 0} - {meta.to || 0} de {meta.total} entidades
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

      {/* Modales */}
      <EntityFormModal
        entity={editingEntity}
        entityTypes={entityTypes}
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false)
          setEditingEntity(null)
        }}
        onSuccess={() => {
          setFormModalOpen(false)
          setEditingEntity(null)
          router.refresh()
        }}
      />

      <DeleteEntityModal
        entity={deleteTarget}
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onSuccess={() => {
          setDeleteTarget(null)
          router.refresh()
        }}
      />
    </div>
  )
}
