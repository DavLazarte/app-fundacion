'use client'

import { Movement } from '@/types/api'
import { formatCurrency, formatDate } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Download, FileText, User as UserIcon, X } from 'lucide-react'

interface MovementDetailModalProps {
  movement: Movement | null
  isOpen: boolean
  onClose: () => void
  onVoidClick: (movement: Movement) => void
  canVoid: boolean
}

export function MovementDetailModal({
  movement,
  isOpen,
  onClose,
  onVoidClick,
  canVoid,
}: MovementDetailModalProps) {
  if (!isOpen || !movement) return null

  const isIncome = movement.type === 'ingreso'
  const isVoided = movement.is_voided

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#183b34]/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
      >
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
              {movement.entity?.name || 'Gasto directo / No asignado'}
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
            <p className="font-bold text-red-900 uppercase tracking-wider">
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

        {/* Comprobantes adjuntos */}
        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-wider text-[#4c665e]">
            Comprobantes adjuntos
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
            <p className="mt-1 text-xs text-[#8c9e99]">No hay comprobantes adjuntos a esta operación.</p>
          )}
        </div>

        {/* Acciones */}
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
  )
}
