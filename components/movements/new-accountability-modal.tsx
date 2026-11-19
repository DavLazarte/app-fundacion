'use client'

import { useEffect, useState } from 'react'
import { Movement } from '@/types/api'
import { formatCurrency } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { CurrencyInput } from '@/components/ui/currency-input'
import { AlertCircle, FileText, FileUp, Loader2, X } from 'lucide-react'

interface NewAccountabilityModalProps {
  movement: Movement | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function NewAccountabilityModal({
  movement,
  isOpen,
  onClose,
  onSuccess,
}: NewAccountabilityModalProps) {
  const [renderedAt, setRenderedAt] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<File[]>([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Limpiar y resetear el formulario cada vez que se abre el modal
  useEffect(() => {
    if (isOpen) {
      setRenderedAt(new Date().toISOString().split('T')[0])
      setAmount('') // Dejamos vacío el importe
      setDescription('')
      setFiles([])
      setError(null)
      setLoading(false)
    }
  }, [isOpen, movement?.id])

  if (!isOpen || !movement) return null

  // Calcular lo ya rendido previamente si tiene rendiciones
  const totalAlreadyRendered =
    movement.accountabilities?.reduce(
      (acc, item) => acc + (parseFloat(item.amount || '0') || 0),
      0
    ) || 0

  const movementTotal = parseFloat(movement.amount) || 0
  const remainingToRender = Math.max(0, movementTotal - totalAlreadyRendered)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const selected = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...selected])
    }
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!description.trim()) {
      setError('El detalle explicativo de los gastos es obligatorio.')
      return
    }

    setError(null)
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('rendered_at', renderedAt)
      if (amount) {
        formData.append('amount', parseFloat(amount).toFixed(2))
      }
      formData.append('description', description.trim())

      files.forEach((file) => {
        formData.append('files[]', file)
      })

      const res = await fetch(`/api/movements/${movement.id}/accountabilities`, {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Error al registrar la rendición de cuentas.')
        setLoading(false)
        return
      }

      setLoading(false)
      setDescription('')
      setFiles([])
      onSuccess()
      onClose()
    } catch {
      setError('Ocurrió un error al enviar la rendición de cuentas.')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#183b34]/40 p-0 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="custom-scrollbar max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
      >
        <div className="mb-5 flex items-start justify-between border-b border-[#edf1ef] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#e7f4ef] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-[#0d6b5e]">
                Rendición de cuenta
              </span>
              <span className="text-xs text-[#71827e]">Mov. #{movement.id}</span>
            </div>
            <h2 className="mt-1 text-xl font-bold text-[#1e3934]">
              {movement.entity?.name ? `Rinde: ${movement.entity.name}` : movement.concept}
            </h2>
            <p className="mt-0.5 text-xs text-[#71827e]">
              Monto total entregado originalmente: <strong className="text-[#1e3934]">{formatCurrency(movement.amount)}</strong>
            </p>
            {totalAlreadyRendered > 0 && (
              <p className="mt-0.5 text-xs text-[#0d6b5e]">
                Ya rendido: <strong>{formatCurrency(totalAlreadyRendered)}</strong> • Pendiente: <strong>{formatCurrency(remainingToRender)}</strong>
              </p>
            )}
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
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase text-[#5a736c]">
                Fecha de rendición *
              </label>
              <input
                type="date"
                required
                value={renderedAt}
                onChange={(e) => setRenderedAt(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-[#d2dfda] bg-white px-3 text-base text-[#1e3934] outline-none focus:border-[#0d6b5e] sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#5a736c]">
                Importe rendido ($ ARS)
              </label>
              <div className="mt-1">
                <CurrencyInput
                  value={amount}
                  onChange={(val) => setAmount(val)}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#5a736c]">
              Detalle de gastos y compras realizadas *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej. Compra de 50 kg de carne, verduras varias, y 20 bolsas de alimentos secos según facturas..."
              className="mt-1 w-full rounded-xl border border-[#d2dfda] bg-white p-3 text-base text-[#1e3934] outline-none focus:border-[#0d6b5e] sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#5a736c]">
              Adjuntar comprobantes y boletas (PDF / Fotos)
            </label>
            <label className="mt-1.5 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#b9cec7] bg-[#fbfcfc] p-4 text-xs font-medium text-[#4c665e] transition-colors hover:border-[#0d6b5e] hover:bg-[#f2f7f5]">
              <FileUp className="size-5 text-[#0d6b5e]" />
              <span>Hacé clic para seleccionar una o varias boletas</span>
              <input
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            {files.length > 0 && (
              <div className="mt-3 space-y-1.5">
                <p className="text-[11px] font-semibold text-[#5a736c]">
                  Archivos listos para subir ({files.length}):
                </p>
                {files.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-[#e1ebe7] bg-[#fafcfb] px-3 py-1.5 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="size-3.5 shrink-0 text-[#0d6b5e]" />
                      <span className="truncate text-[#1e3934]">{file.name}</span>
                      <span className="text-[10px] text-[#71827e]">
                        ({(file.size / 1024).toFixed(0)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t border-[#edf1ef] pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={onClose}
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
              Guardar rendición
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
