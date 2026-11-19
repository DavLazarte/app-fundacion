'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Movement, MovementAccountability, PaginatedResponse } from '@/types/api'
import { formatCurrency, formatDate } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { MovementDetailModal } from './movement-detail-modal'
import {
  ArrowDownLeft,
  Calendar,
  Download,
  FileCheck2,
  FileText,
  Search,
  User as UserIcon,
} from 'lucide-react'

interface AccountabilitiesViewProps {
  initialData: PaginatedResponse<MovementAccountability>
  canVoid: boolean
  canCreate: boolean
}

export function AccountabilitiesView({
  initialData,
  canVoid,
  canCreate,
}: AccountabilitiesViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [q, setQ] = useState(searchParams.get('q') || '')
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (q.trim()) {
      params.set('q', q.trim())
    } else {
      params.delete('q')
    }
    params.set('tab', 'accountabilities')
    params.set('page', '1')
    router.push(`/movements?${params.toString()}`)
  }

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(newPage))
    params.set('tab', 'accountabilities')
    router.push(`/movements?${params.toString()}`)
  }

  function openMovementDetail(mov: Movement) {
    setSelectedMovement(mov)
    setDetailModalOpen(true)
  }

  const items = initialData.data || []
  const pagination = initialData.meta

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearch} className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-2.5 size-4 text-[#93a29e]" />
          <input
            type="text"
            placeholder="Buscar por entidad, concepto o detalle de compra..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-10 w-full rounded-xl border border-[#dfe8e4] bg-white pl-9 pr-3 text-xs text-[#1e3934] placeholder:text-[#93a29e] focus:border-[#0d6b5e] focus:outline-none"
          />
        </form>

        <p className="text-xs text-[#71827e]">
          Total rendiciones registradas: <strong>{pagination.total}</strong>
        </p>
      </div>

      {/* Lista de rendiciones */}
      <div className="overflow-hidden rounded-2xl border border-[#dfe8e4] bg-white shadow-xs">
        {items.length === 0 ? (
          <div className="py-14 text-center">
            <FileCheck2 className="mx-auto size-12 text-[#93a29e]" />
            <p className="mt-3 text-sm font-semibold text-[#1e3934]">
              No hay rendiciones de cuentas registradas
            </p>
            <p className="mt-1 text-xs text-[#71827e]">
              Las rendiciones se cargan desde el detalle de cada egreso cuando las entidades entregan sus boletas.
            </p>
          </div>
        ) : (
          <>
            {/* Vista tabla en Desktop */}
            <div className="hidden lg:block">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#edf1ef] bg-[#fbfcfc] text-[11px] font-bold uppercase tracking-wider text-[#78908a]">
                    <th className="py-3.5 pl-6 pr-4">Fecha rendición</th>
                    <th className="px-4 py-3.5">Entidad que rinde</th>
                    <th className="px-4 py-3.5">Egreso original</th>
                    <th className="px-4 py-3.5">Importe rendido</th>
                    <th className="px-4 py-3.5">Detalle de compras / gastos</th>
                    <th className="py-3.5 pl-4 pr-6 text-right">Comprobantes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf1ef]">
                  {items.map((acc) => {
                    const mov = acc.movement
                    return (
                      <tr key={acc.id} className="hover:bg-[#fafcfb]">
                        <td className="py-3.5 pl-6 pr-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-medium text-[#1e3934]">
                            <Calendar className="size-3.5 text-[#0d6b5e]" />
                            <span>{formatDate(acc.rendered_at)}</span>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          {mov?.entity?.name ? (
                            <div>
                              <p className="font-semibold text-[#1e3934]">{mov.entity.name}</p>
                              <span className="text-[11px] text-[#71827e]">
                                {mov.entity.entity_type?.name || 'Entidad'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[#71827e]">Gasto propio directo</span>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          {mov ? (
                            <div>
                              <button
                                onClick={() => openMovementDetail(mov)}
                                className="font-medium text-[#0d6b5e] hover:underline"
                              >
                                Mov. #{mov.id} - {mov.concept}
                              </button>
                              <p className="text-[11px] text-[#71827e]">
                                Entregado: {formatCurrency(mov.amount)}
                              </p>
                            </div>
                          ) : (
                            <span className="text-[#71827e]">Mov. #{acc.movement_id}</span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {acc.amount ? (
                            <span className="font-bold text-[#0d6b5e]">
                              {formatCurrency(acc.amount)}
                            </span>
                          ) : (
                            <span className="text-[#93a29e] italic">Sin monto fijado</span>
                          )}
                        </td>

                        <td className="max-w-xs px-4 py-3.5">
                          <p className="line-clamp-2 text-xs text-[#35534c]">
                            {acc.description}
                          </p>
                        </td>

                        <td className="py-3.5 pl-4 pr-6 text-right whitespace-nowrap">
                          {acc.attachments && acc.attachments.length > 0 ? (
                            <div className="flex flex-col items-end gap-1">
                              {acc.attachments.map((att) => (
                                <a
                                  key={att.id}
                                  href={`/api/movements/${acc.movement_id}/accountabilities/${acc.id}/attachments/${att.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#d2dfda] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#0d6b5e] transition-colors hover:bg-[#e7f4ef]"
                                >
                                  <Download className="size-3 shrink-0" />
                                  <span className="max-w-[120px] truncate" title={att.original_name}>
                                    {att.original_name}
                                  </span>
                                </a>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#93a29e] italic">Sin adjuntos</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Vista tarjetas en Mobile */}
            <div className="divide-y divide-[#edf1ef] lg:hidden">
              {items.map((acc) => {
                const mov = acc.movement
                return (
                  <div key={acc.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-[#0d6b5e] font-bold">
                          <Calendar className="size-3.5" />
                          <span>Rendido el {formatDate(acc.rendered_at)}</span>
                        </div>
                        <h4 className="mt-1 font-bold text-[#1e3934]">
                          {mov?.entity?.name || 'Gasto propio directo'}
                        </h4>
                      </div>

                      {acc.amount && (
                        <div className="text-right">
                          <span className="text-sm font-bold text-[#0d6b5e]">
                            {formatCurrency(acc.amount)}
                          </span>
                        </div>
                      )}
                    </div>

                    {mov && (
                      <div className="rounded-xl border border-[#edf1ef] bg-[#fbfcfc] p-2.5 text-xs">
                        <p className="text-[11px] text-[#71827e]">Movimiento de egreso asociado:</p>
                        <button
                          onClick={() => openMovementDetail(mov)}
                          className="mt-0.5 text-left font-semibold text-[#0d6b5e] hover:underline"
                        >
                          Mov. #{mov.id} - {mov.concept} ({formatCurrency(mov.amount)})
                        </button>
                      </div>
                    )}

                    <div className="text-xs text-[#35534c] bg-[#fafcfb] p-2.5 rounded-xl border border-[#edf1ef]">
                      <p className="font-semibold text-[#1e3934] mb-1">Detalle de gastos:</p>
                      <p className="whitespace-pre-line">{acc.description}</p>
                    </div>

                    {acc.attachments && acc.attachments.length > 0 && (
                      <div className="pt-1">
                        <p className="text-[11px] font-semibold text-[#71827e] mb-1.5">
                          Comprobantes adjuntos ({acc.attachments.length}):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {acc.attachments.map((att) => (
                            <a
                              key={att.id}
                              href={`/api/movements/${acc.movement_id}/accountabilities/${acc.id}/attachments/${att.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-xl border border-[#d2dfda] bg-white px-3 py-1.5 text-xs font-semibold text-[#0d6b5e] shadow-2xs hover:bg-[#e7f4ef]"
                            >
                              <Download className="size-3.5 shrink-0" />
                              <span className="max-w-[140px] truncate">{att.original_name}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Paginación */}
            {pagination.last_page > 1 && (
              <div className="flex items-center justify-between border-t border-[#edf1ef] px-6 py-3 text-xs text-[#71827e]">
                <span>
                  Página {pagination.current_page} de {pagination.last_page} ({pagination.total} rendiciones)
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.current_page <= 1}
                    onClick={() => handlePageChange(pagination.current_page - 1)}
                    className="h-8 rounded-lg border-[#dfe8e4] px-3"
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.current_page >= pagination.last_page}
                    onClick={() => handlePageChange(pagination.current_page + 1)}
                    className="h-8 rounded-lg border-[#dfe8e4] px-3"
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de detalle del movimiento si se hace clic */}
      {selectedMovement && (
        <MovementDetailModal
          movement={selectedMovement}
          isOpen={detailModalOpen}
          canVoid={canVoid}
          canCreate={canCreate}
          onClose={() => {
            setDetailModalOpen(false)
            setSelectedMovement(null)
          }}
          onSuccess={() => {
            setDetailModalOpen(false)
            setSelectedMovement(null)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
