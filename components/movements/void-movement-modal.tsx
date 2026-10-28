'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Movement } from '@/types/api'
import { formatCurrency } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Loader2, X } from 'lucide-react'

interface VoidMovementModalProps {
  movement: Movement | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function VoidMovementModal({
  movement,
  isOpen,
  onClose,
  onSuccess,
}: VoidMovementModalProps) {
  const router = useRouter()
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen || !movement) return null

  async function handleVoid(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch(`/api/movements/${movement.id}/void`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'No se pudo anular el movimiento.')
        setLoading(false)
        return
      }

      setLoading(false)
      onSuccess()
      onClose()
      router.refresh()
    } catch {
      setError('Ocurrió un error inesperado al conectar con el servidor.')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#183b34]/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1e3934]">Anular movimiento</h2>
              <p className="text-xs text-[#7c8f89]">Operación #{movement.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#71827e] hover:bg-[#f3f7f5]"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="my-4 rounded-xl bg-[#f8faf9] p-3 text-sm text-[#4c665e]">
          <p>
            <strong>Concepto:</strong> {movement.concept}
          </p>
          <p className="mt-1">
            <strong>Monto:</strong> {formatCurrency(movement.amount)}
          </p>
        </div>

        <p className="text-xs text-[#71827e]">
          Por la regla de inmutabilidad, los movimientos no se eliminan: se registran con estado
          anulado y dejan de contar en el saldo de la caja.
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleVoid} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4c665e]">
              Motivo de la anulación *
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explicá detalladamente por qué se anula (ej. Error en importe, factura duplicada, etc.)"
              className="mt-1.5 w-full rounded-xl border border-[#dfe8e4] bg-[#fbfcfc] p-3 text-sm text-[#1e3934] outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-200"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={onClose}
              className="h-10 rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !reason.trim()}
              className="h-10 rounded-xl bg-red-600 font-semibold text-white hover:bg-red-700"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" /> Anulando...
                </span>
              ) : (
                'Confirmar anulación'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
