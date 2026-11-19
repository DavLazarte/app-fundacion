'use client'

import { useEffect, useState } from 'react'
import { Category } from '@/types/api'
import { Button } from '@/components/ui/button'
import { AlertCircle, Loader2, X } from 'lucide-react'

interface CategoryFormModalProps {
  category?: Category | null
  isOpen: boolean
  initialFlow?: 'ingreso' | 'egreso'
  onClose: () => void
  onSuccess: (category: Category) => void
}

export function CategoryFormModal({
  category,
  isOpen,
  initialFlow = 'egreso',
  onClose,
  onSuccess,
}: CategoryFormModalProps) {
  const isEditing = Boolean(category)
  const [name, setName] = useState('')
  const [flow, setFlow] = useState<'ingreso' | 'egreso'>(initialFlow)
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setName(category.name)
        setFlow(category.flow)
        setIsActive(category.is_active ?? true)
      } else {
        setName('')
        setFlow(initialFlow)
        setIsActive(true)
      }
      setError(null)
      setLoading(false)
    }
  }, [isOpen, category, initialFlow])

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('El nombre de la categoría es obligatorio.')
      return
    }

    setError(null)
    setLoading(true)

    try {
      const url = isEditing ? `/api/categories/${category!.id}` : '/api/categories'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          flow,
          is_active: isActive,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Error al guardar la categoría.')
        setLoading(false)
        return
      }

      setLoading(false)
      onSuccess(data.data)
      onClose()
    } catch {
      setError('Error de conexión con el servidor.')
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
        <div className="mb-5 flex items-start justify-between border-b border-[#edf1ef] pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#1e3934]">
              {isEditing ? 'Editar categoría' : 'Nueva categoría'}
            </h2>
            <p className="mt-0.5 text-xs text-[#7c8f89]">
              {isEditing
                ? 'Modificá el nombre, flujo o estado del rubro.'
                : 'Creá un nuevo rubro o concepto para clasificar fondos.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#71827e] hover:bg-[#f3f7f5]"
          >
            <X className="size-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-[#5a736c]">
              Nombre de la categoría *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Artículos de limpieza, Mantenimiento"
              className="mt-1 h-10 w-full rounded-xl border border-[#d2dfda] bg-white px-3 text-sm text-[#1e3934] outline-none focus:border-[#0d6b5e]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#5a736c]">
              Flujo de fondos *
            </label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFlow('ingreso')}
                className={`flex h-10 items-center justify-center rounded-xl border text-xs font-semibold transition-all ${
                  flow === 'ingreso'
                    ? 'border-[#0d6b5e] bg-[#e7f4ef] text-[#0d6b5e]'
                    : 'border-[#d2dfda] bg-white text-[#71827e] hover:bg-[#fafcfb]'
                }`}
              >
                Ingreso
              </button>
              <button
                type="button"
                onClick={() => setFlow('egreso')}
                className={`flex h-10 items-center justify-center rounded-xl border text-xs font-semibold transition-all ${
                  flow === 'egreso'
                    ? 'border-[#b96847] bg-[#faeee9] text-[#ae6548]'
                    : 'border-[#d2dfda] bg-white text-[#71827e] hover:bg-[#fafcfb]'
                }`}
              >
                Egreso
              </button>
            </div>
          </div>

          {isEditing && (
            <div className="flex items-center justify-between rounded-xl border border-[#d2dfda] bg-[#f7f9f8] p-3">
              <div>
                <p className="text-xs font-bold text-[#1e3934]">Categoría activa</p>
                <p className="text-[11px] text-[#71827e]">
                  Si se desactiva, no aparecerá en el selector de nuevos movimientos.
                </p>
              </div>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="size-4 accent-[#0d6b5e]"
              />
            </div>
          )}

          <div className="mt-6 flex justify-end gap-2 border-t border-[#edf1ef] pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="h-10 rounded-xl border-[#d2dfda] px-4 text-xs font-semibold text-[#5a736c]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-10 gap-1.5 rounded-xl bg-[#0d6b5e] px-5 text-xs font-semibold text-white hover:bg-[#0a574c]"
            >
              {loading && <Loader2 className="size-3.5 animate-spin" />}
              {isEditing ? 'Guardar cambios' : 'Crear categoría'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
