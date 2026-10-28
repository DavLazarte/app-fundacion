'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Entity } from '@/types/api'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Loader2, X } from 'lucide-react'

interface DeleteEntityModalProps {
  entity: Entity | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function DeleteEntityModal({
  entity,
  isOpen,
  onClose,
  onSuccess,
}: DeleteEntityModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen || !entity) return null

  async function handleDelete() {
    setError(null)
    setLoading(true)

    try {
      const res = await fetch(`/api/entities/${entity!.id}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'No se pudo eliminar la entidad.')
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
              <h2 className="text-lg font-bold text-[#1e3934]">Dar de baja entidad</h2>
              <p className="text-xs text-[#7c8f89]">{entity.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#71827e] hover:bg-[#f3f7f5]"
          >
            <X className="size-5" />
          </button>
        </div>

        <p className="text-sm text-[#4c665e]">
          ¿Estás seguro de que deseás dar de baja a <strong>{entity.name}</strong>?
        </p>
        <p className="mt-2 text-xs text-[#71827e]">
          La entidad no se borrará físicamente para preservar los registros de movimientos
          anteriores en los que haya participado.
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
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
            type="button"
            disabled={loading}
            onClick={handleDelete}
            className="h-10 rounded-xl bg-red-600 font-semibold text-white hover:bg-red-700"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" /> Dando de baja...
              </span>
            ) : (
              'Confirmar baja'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
