'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Movement } from '@/types/api'
import { formatCurrency, formatDate } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { NewAccountabilityModal } from './new-accountability-modal'
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileCheck2,
  FileText,
  Plus,
  Receipt,
  User as UserIcon,
  X,
} from 'lucide-react'

interface MovementDetailModalProps {
  movement: Movement | null
  isOpen: boolean
  onClose: () => void
  onVoidClick: (movement: Movement) => void
  canVoid: boolean
  canCreate?: boolean
}

export function MovementDetailModal({
  movement,
  isOpen,
  onClose,
  onVoidClick,
  canVoid,
  canCreate = false,
}: MovementDetailModalProps) {
  const router = useRouter()
  const [accountabilityModalOpen, setAccountabilityModalOpen] = useState(false)

  if (!isOpen || !movement) return null

  const isIncome = movement.type === 'ingreso'
  const isExpense = movement.type === 'egreso'
  const isVoided = movement.is_voided
  const accountabilities = movement.accountabilities || []

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#183b34]/40 p-0 sm:items-center sm:p-4">
        <div
          role="dialog"
          aria-modal="true"
          className="custom-scrollbar max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
        >
          {/* Header */}
          <div className="mb-6 flex items-start justify-between border-b border-[#edf1ef] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-md px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                    isVoided
                      ? 'bg-red-100 text-red-700'
                      : isIncome
                      ? 'bg-[#e8f5f0] text-[#267560]'
                      : 'bg-[#faeee9] text-[#ae6548]'
                  }`}
                >
                  {isVoided ? 'ANULADO' : isIncome ? 'INGRESO' : 'EGRESO'}
                </span>
                <span className="text-xs text-[#8c9e99]">#{movement.id}</span>
              </div>
              <h2 className="mt-2 text-xl font-bold text-[#1e3934]">{movement.concept}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-[#71827e] hover:bg-[#f3f7f5]"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Importe y Fecha */}
          <div className="mb-6 grid grid-cols-2 gap-4 rounded-2xl bg-[#f7f9f8] p-4 text-center">
            <div>
              <p className="text-xs text-[#71827e]">Importe</p>
              <p
                className={`mt-1 text-2xl font-bold ${
                  isVoided
                    ? 'text-gray-400 line-through'
                    : isIncome
                    ? 'text-[#0d6b5e]'
                    : 'text-[#b96847]'
                }`}
              >
                {isIncome ? '+ ' : '− '}
                {formatCurrency(movement.amount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#71827e]">Fecha del movimiento</p>
              <p className="mt-1 text-base font-semibold text-[#1e3934]">
                {formatDate(movement.movement_date)}
              </p>
            </div>
          </div>

          {/* Ficha técnica */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-[#f0f3f2] pb-2">
              <span className="text-[#71827e]">Categoría:</span>
              <span className="font-semibold text-[#1e3934]">
                {movement.category?.name || '—'}
              </span>
            </div>

            <div className="flex justify-between border-b border-[#f0f3f2] pb-2">
              <span className="text-[#71827e]">Entidad / Destinatario:</span>
              <span className="font-semibold text-[#1e3934]">
                {movement.entity?.name || 'Gasto propio directo'}
              </span>
            </div>

            {movement.reference && (
              <div className="flex justify-between border-b border-[#f0f3f2] pb-2">
                <span className="text-[#71827e]">Referencia / Factura:</span>
                <span className="font-mono text-xs font-semibold text-[#1e3934]">
                  {movement.reference}
                </span>
              </div>
            )}

            <div className="flex justify-between border-b border-[#f0f3f2] pb-2">
              <span className="text-[#71827e]">Registrado por:</span>
              <span className="flex items-center gap-1.5 font-medium text-[#1e3934]">
                <UserIcon className="size-3.5 text-[#8c9e99]" />
                {movement.creator?.name || 'Sistema'}
              </span>
            </div>

            {movement.note && (
              <div className="border-b border-[#f0f3f2] pb-2">
                <span className="block text-xs text-[#71827e]">Nota adicional:</span>
                <p className="mt-1 text-xs text-[#4c665e]">{movement.note}</p>
              </div>
            )}
          </div>

          {/* Sección de Anulación si corresponde */}
          {isVoided && movement.void && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">
              <p className="font-bold uppercase tracking-wider text-red-900">
                Datos de Anulación
              </p>
              <p className="mt-1">
                <strong>Motivo:</strong> {movement.void.reason}
              </p>
              <p className="mt-0.5">
                <strong>Fecha:</strong> {formatDate(movement.void.voided_at)}
              </p>
              {movement.void.voided_by && (
                <p className="mt-0.5">
                  <strong>Anulado por:</strong> {movement.void.voided_by.name}
                </p>
              )}
            </div>
          )}

          {/* Comprobantes adjuntos del movimiento inicial */}
          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-wider text-[#4c665e]">
              Comprobante de entrega inicial
            </p>
            {movement.attachments && movement.attachments.length > 0 ? (
              <div className="mt-2 space-y-2">
                {movement.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between rounded-xl border border-[#dfe8e4] bg-[#fbfcfc] p-3 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="size-4 shrink-0 text-[#0d6b5e]" />
                      <span className="truncate font-medium text-[#1e3934]">
                        {att.original_name}
                      </span>
                    </div>
                    <a
                      href={`/api/movements/${movement.id}/attachments/${att.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex shrink-0 items-center gap-1 font-semibold text-[#0d6b5e] hover:underline"
                    >
                      <Download className="size-3.5" /> Descargar
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-1 text-xs text-[#8c9e99]">
                No hay comprobantes de entrega adjuntos a esta operación.
              </p>
            )}
          </div>

          {/* SECCIÓN RENDICIÓN DE CUENTAS (Para movimientos de egreso) */}
          {isExpense && (
            <div className="mt-8 rounded-2xl border border-[#d2dfda] bg-[#f8faf9] p-4">
              <div className="flex items-center justify-between border-b border-[#e2ece7] pb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="size-4 text-[#0d6b5e]" />
                  <h3 className="text-sm font-bold text-[#1e3934]">
                    Rendición de cuentas ({accountabilities.length})
                  </h3>
                </div>
                {!isVoided && canCreate && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setAccountabilityModalOpen(true)}
                    className="h-8 gap-1 rounded-xl bg-[#0d6b5e] px-3 text-xs font-semibold text-white hover:bg-[#0a574c]"
                  >
                    <Plus className="size-3.5" />
                    Cargar rendición
                  </Button>
                )}
              </div>

              {accountabilities.length > 0 ? (
                <div className="mt-3 space-y-3">
                  {accountabilities.map((acc) => (
                    <div
                      key={acc.id}
                      className="rounded-xl border border-[#dfe8e4] bg-white p-3.5 text-xs shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 font-semibold text-[#1e3934]">
                            <Calendar className="size-3 text-[#71827e]" />
                            <span>Rendida el {formatDate(acc.rendered_at)}</span>
                            {acc.amount && (
                              <span className="ml-1 rounded-md bg-[#e7f4ef] px-2 py-0.5 text-[11px] font-bold text-[#0d6b5e]">
                                {formatCurrency(acc.amount)}
                              </span>
                            )}
                          </div>
                          {acc.creator && (
                            <p className="mt-0.5 text-[11px] text-[#71827e]">
                              Cargado por: {acc.creator.name}
                            </p>
                          )}
                        </div>
                      </div>

                      <p className="mt-2 text-xs leading-relaxed text-[#3b514b]">
                        {acc.description}
                      </p>

                      {/* Boletas y facturas adjuntas a la rendición */}
                      {acc.attachments && acc.attachments.length > 0 && (
                        <div className="mt-3 border-t border-[#edf1ef] pt-2">
                          <p className="text-[11px] font-semibold text-[#5a736c]">
                            Boletas y comprobantes adjuntos ({acc.attachments.length}):
                          </p>
                          <div className="mt-1.5 space-y-1.5">
                            {acc.attachments.map((file) => (
                              <div
                                key={file.id}
                                className="flex items-center justify-between rounded-lg bg-[#f7f9f8] px-2.5 py-1 text-xs"
                              >
                                <span className="truncate font-medium text-[#1e3934]">
                                  {file.original_name}
                                </span>
                                <a
                                  href={`/api/movements/${movement.id}/accountabilities/${acc.id}/attachments/${file.id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="ml-2 flex items-center gap-1 font-semibold text-[#0d6b5e] hover:underline"
                                >
                                  <Download className="size-3" /> Descargar
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-xs text-[#71827e]">
                    Aún no se han cargado rendiciones de cuenta ni boletas para este egreso.
                  </p>
                  {!isVoided && canCreate && (
                    <button
                      type="button"
                      onClick={() => setAccountabilityModalOpen(true)}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#0d6b5e] hover:underline"
                    >
                      <Plus className="size-3" /> Cargar comprobantes de rendición ahora
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Acciones de pie */}
          <div className="mt-8 flex justify-between gap-3 border-t border-[#edf1ef] pt-4">
            <div>
              {!isVoided && canVoid && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onClose()
                    onVoidClick(movement)
                  }}
                  className="h-10 rounded-xl border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  Anular este movimiento
                </Button>
              )}
            </div>
            <Button
              type="button"
              onClick={onClose}
              className="h-10 rounded-xl bg-[#0d6b5e] px-5 text-xs font-semibold text-white hover:bg-[#0a574c]"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </div>

      {/* Modal para cargar nueva rendición */}
      <NewAccountabilityModal
        movement={movement}
        isOpen={accountabilityModalOpen}
        onClose={() => setAccountabilityModalOpen(false)}
        onSuccess={() => {
          setAccountabilityModalOpen(false)
          onClose()
          router.refresh()
        }}
      />
    </>
  )
}
