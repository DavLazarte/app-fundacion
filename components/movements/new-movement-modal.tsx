'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Category, Entity } from '@/types/api'
import { formatCurrency } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, FileUp, Loader2, X } from 'lucide-react'

interface NewMovementModalProps {
  currentBalance: string
  categories: Category[]
  entities: Entity[]
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function NewMovementModal({
  currentBalance,
  categories,
  entities,
  isOpen,
  onClose,
  onSuccess,
}: NewMovementModalProps) {
  const router = useRouter()

  const [type, setType] = useState<'ingreso' | 'egreso'>('egreso')
  const [movementDate, setMovementDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [amount, setAmount] = useState('')
  const [concept, setConcept] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [entityId, setEntityId] = useState('')
  const [reference, setReference] = useState('')
  const [note, setNote] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  // Filtrar categorías según el tipo seleccionado (ingreso o egreso)
  const filteredCategories = categories.filter((cat) => cat.flow === type)

  // Cálculo del disponible resultante proyectado
  const currentNum = parseFloat(currentBalance) || 0
  const inputNum = parseFloat(amount) || 0
  const projectedBalance =
    type === 'ingreso' ? currentNum + inputNum : currentNum - inputNum

  const hasInsufficientFunds = type === 'egreso' && inputNum > currentNum

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (hasInsufficientFunds) {
      setError('El importe supera el saldo disponible actual de la Caja General.')
      return
    }

    if (!categoryId) {
      setError('Debe seleccionar una categoría.')
      return
    }

    setLoading(true)

    try {
      // 1. Registrar movimiento
      const res = await fetch('/api/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          movement_date: movementDate,
          amount: parseFloat(amount).toFixed(2),
          concept,
          category_id: parseInt(categoryId),
          entity_id: entityId ? parseInt(entityId) : null,
          reference: reference || null,
          note: note || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Error al guardar el movimiento.')
        setLoading(false)
        return
      }

      const movementId = data.data.id

      // 2. Si adjuntó un archivo, subirlo
      if (file && movementId) {
        const formData = new FormData()
        formData.append('file', file)

        await fetch(`/api/movements/${movementId}/attachments`, {
          method: 'POST',
          body: formData,
        })
      }

      setLoading(false)
      onSuccess()
      onClose()
      router.refresh()
    } catch {
      setError('Ocurrió un error inesperado al registrar el movimiento.')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#183b34]/30 p-0 sm:items-center sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#1e3934]">Nuevo movimiento</h2>
            <p className="mt-1 text-sm text-[#7c8f89]">
              Cargá una operación en el libro de tesorería.
            </p>
          </div>
          <button
            aria-label="Cerrar"
            onClick={onClose}
            className="rounded-lg p-2 text-[#71827e] hover:bg-[#f3f7f5]"
          >
            <X className="size-5" />
          </button>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 size-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de movimiento */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4c665e]">
              Tipo de movimiento
            </label>
            <div className="mt-1.5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setType('ingreso')
                  setCategoryId('')
                }}
                className={`h-11 rounded-xl border text-sm font-semibold transition-all ${
                  type === 'ingreso'
                    ? 'border-[#0d6b5e] bg-[#e7f4ef] text-[#0d6b5e] ring-2 ring-[#0d6b5e]/20'
                    : 'border-[#dfe8e4] bg-[#fbfcfc] text-[#58716a] hover:bg-white'
                }`}
              >
                + Ingreso (Entrada)
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('egreso')
                  setCategoryId('')
                }}
                className={`h-11 rounded-xl border text-sm font-semibold transition-all ${
                  type === 'egreso'
                    ? 'border-[#b96847] bg-[#faeee9] text-[#b96847] ring-2 ring-[#b96847]/20'
                    : 'border-[#dfe8e4] bg-[#fbfcfc] text-[#58716a] hover:bg-white'
                }`}
              >
                − Egreso (Salida)
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Importe */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#4c665e]">
                Importe ($ ARS) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="mt-1.5 h-11 w-full rounded-xl border border-[#dfe8e4] bg-[#fbfcfc] px-3.5 text-sm font-medium text-[#1e3934] outline-none transition-all focus:border-[#0d6b5e] focus:bg-white focus:ring-2 focus:ring-[#0d6b5e]/20"
              />
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#4c665e]">
                Fecha *
              </label>
              <input
                type="date"
                required
                value={movementDate}
                onChange={(e) => setMovementDate(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl border border-[#dfe8e4] bg-[#fbfcfc] px-3.5 text-sm text-[#1e3934] outline-none transition-all focus:border-[#0d6b5e] focus:bg-white focus:ring-2 focus:ring-[#0d6b5e]/20"
              />
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4c665e]">
              Categoría de {type} *
            </label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1.5 h-11 w-full rounded-xl border border-[#dfe8e4] bg-white px-3.5 text-sm text-[#1e3934] outline-none transition-all focus:border-[#0d6b5e] focus:ring-2 focus:ring-[#0d6b5e]/20"
            >
              <option value="">Seleccionar categoría...</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Entidad (opcional o destino) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4c665e]">
              Entidad / Destinatario / Origen (Opcional)
            </label>
            <select
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              className="mt-1.5 h-11 w-full rounded-xl border border-[#dfe8e4] bg-white px-3.5 text-sm text-[#1e3934] outline-none transition-all focus:border-[#0d6b5e] focus:ring-2 focus:ring-[#0d6b5e]/20"
            >
              <option value="">Ninguna / Gasto propio directo</option>
              {entities.map((ent) => (
                <option key={ent.id} value={ent.id}>
                  {ent.name} {ent.entity_type ? `(${ent.entity_type.name})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Concepto */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4c665e]">
              Concepto / Descripción *
            </label>
            <input
              type="text"
              required
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Ej. Partida alimentos comedores o compra insumos"
              className="mt-1.5 h-11 w-full rounded-xl border border-[#dfe8e4] bg-[#fbfcfc] px-3.5 text-sm text-[#1e3934] outline-none transition-all focus:border-[#0d6b5e] focus:bg-white focus:ring-2 focus:ring-[#0d6b5e]/20"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Referencia o N° Comprobante */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#4c665e]">
                Referencia / N° Recibo (Opcional)
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Ej. Factura B-0001-002"
                className="mt-1.5 h-11 w-full rounded-xl border border-[#dfe8e4] bg-[#fbfcfc] px-3.5 text-sm text-[#1e3934] outline-none transition-all focus:border-[#0d6b5e] focus:bg-white focus:ring-2 focus:ring-[#0d6b5e]/20"
              />
            </div>

            {/* Comprobante Adjunto */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#4c665e]">
                Adjuntar comprobante (PDF/Img)
              </label>
              <label className="mt-1.5 flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#a3beba] bg-[#f4f9f7] px-3 text-xs font-medium text-[#256b5d] hover:bg-[#eaf4f0]">
                <FileUp className="size-4" />
                <span className="truncate">{file ? file.name : 'Subir archivo'}</span>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>
          </div>

          {/* Resumen de saldo disponible en tiempo real */}
          <div
            className={`mt-4 rounded-xl border p-4 transition-all ${
              hasInsufficientFunds
                ? 'border-red-300 bg-red-50 text-red-900'
                : 'border-[#cfe6de] bg-[#f2faf7] text-[#256b5d]'
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-wider">
              Control de disponibilidad en Caja General
            </p>
            <div className="mt-2 flex justify-between text-sm">
              <span>Saldo disponible actual:</span>
              <strong className="font-semibold">{formatCurrency(currentBalance)}</strong>
            </div>
            <div className="mt-1 flex justify-between text-sm">
              <span>Saldo proyectado luego del movimiento:</span>
              <strong
                className={`font-bold ${
                  hasInsufficientFunds ? 'text-red-700' : 'text-[#0d6b5e]'
                }`}
              >
                {inputNum > 0 ? formatCurrency(projectedBalance) : '—'}
              </strong>
            </div>
            {hasInsufficientFunds && (
              <p className="mt-2 text-xs font-semibold text-red-600">
                Atención: No hay fondos suficientes para registrar este egreso.
              </p>
            )}
          </div>

          {/* Botones de acción */}
          <div className="mt-6 flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={onClose}
              className="h-11 rounded-xl px-5"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || hasInsufficientFunds}
              className="h-11 rounded-xl bg-[#0d6b5e] px-6 font-semibold text-white hover:bg-[#0a574c]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" /> Guardando...
                </span>
              ) : (
                'Registrar movimiento'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
