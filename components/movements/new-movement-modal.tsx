'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Category, Entity, EntityType } from '@/types/api'
import { formatCurrency } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { CurrencyInput } from '@/components/ui/currency-input'
import { CategoryFormModal } from '@/components/categories/category-form-modal'
import { EntityFormModal } from '@/components/entities/entity-form-modal'
import { AlertCircle, CheckCircle2, FileUp, Loader2, Plus, X } from 'lucide-react'

interface NewMovementModalProps {
  currentBalance: string
  categories: Category[]
  entities: Entity[]
  entityTypes?: EntityType[]
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function NewMovementModal({
  currentBalance,
  categories,
  entities,
  entityTypes = [],
  isOpen,
  onClose,
  onSuccess,
}: NewMovementModalProps) {
  const router = useRouter()

  const [localCategories, setLocalCategories] = useState<Category[]>(categories)
  const [localEntities, setLocalEntities] = useState<Entity[]>(entities)

  useEffect(() => {
    setLocalCategories(categories)
  }, [categories])

  useEffect(() => {
    setLocalEntities(entities)
  }, [entities])

  const [isNewCategoryOpen, setIsNewCategoryOpen] = useState(false)
  const [isNewEntityOpen, setIsNewEntityOpen] = useState(false)

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

  // Limpiar y resetear el formulario cada vez que se abre el modal
  useEffect(() => {
    if (isOpen) {
      setType('egreso')
      setMovementDate(new Date().toISOString().split('T')[0])
      setAmount('')
      setConcept('')
      setCategoryId('')
      setEntityId('')
      setReference('')
      setNote('')
      setFile(null)
      setError(null)
      setLoading(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  // Filtrar categorías según el tipo seleccionado (ingreso o egreso)
  const filteredCategories = localCategories.filter((cat) => cat.flow === type)

  // Cálculo del disponible resultante proyectado
  const currentNum = parseFloat(currentBalance) || 0
  const inputNum = parseFloat(amount) || 0
  const projectedBalance =
    type === 'ingreso' ? currentNum + inputNum : currentNum - inputNum

  const hasInsufficientFunds = type === 'egreso' && inputNum > currentNum

  function handleCategoryCreated(newCat: Category) {
    setLocalCategories((prev) => [...prev, newCat])
    if (newCat.flow === type) {
      setCategoryId(String(newCat.id))
    } else {
      setType(newCat.flow)
      setCategoryId(String(newCat.id))
    }
    setIsNewCategoryOpen(false)
  }

  function handleEntityCreated(newEnt?: Entity) {
    if (newEnt) {
      setLocalEntities((prev) => [...prev, newEnt])
      setEntityId(String(newEnt.id))
    }
    setIsNewEntityOpen(false)
  }

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
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#183b34]/30 p-0 sm:items-center sm:p-6">
        <div
          role="dialog"
          aria-modal="true"
          className="custom-scrollbar max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
        >
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#1e3934]">Nuevo movimiento</h2>
              <p className="mt-1 text-sm text-[#7c8f89]">
                Cargá una operación en el libro de tesorería.
              </p>
            </div>
            <button
              type="button"
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
                  className={`h-11 rounded-xl border text-base font-semibold transition-all sm:text-sm ${
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
                  className={`h-11 rounded-xl border text-base font-semibold transition-all sm:text-sm ${
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
              {/* Importe con formateo visual en vivo */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4c665e]">
                  Importe ($ ARS) *
                </label>
                <div className="mt-1.5">
                  <CurrencyInput
                    value={amount}
                    onChange={(val) => setAmount(val)}
                    placeholder="0"
                    required
                  />
                </div>
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
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#dfe8e4] bg-[#fbfcfc] px-3.5 text-base text-[#1e3934] outline-none transition-all focus:border-[#0d6b5e] focus:bg-white focus:ring-2 focus:ring-[#0d6b5e]/20 sm:text-sm"
                />
              </div>
            </div>

            {/* Categoría con botón de creación rápida */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4c665e]">
                  Categoría de {type} *
                </label>
                <button
                  type="button"
                  onClick={() => setIsNewCategoryOpen(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-[#0d6b5e] hover:underline"
                >
                  <Plus className="size-3.5" />
                  Nueva categoría
                </button>
              </div>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl border border-[#dfe8e4] bg-white px-3.5 text-base text-[#1e3934] outline-none transition-all focus:border-[#0d6b5e] focus:ring-2 focus:ring-[#0d6b5e]/20 sm:text-sm"
              >
                <option value="">Seleccionar categoría...</option>
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Entidad con botón de creación rápida */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4c665e]">
                  Entidad / Destinatario / Origen (Opcional)
                </label>
                <button
                  type="button"
                  onClick={() => setIsNewEntityOpen(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-[#0d6b5e] hover:underline"
                >
                  <Plus className="size-3.5" />
                  Nueva entidad
                </button>
              </div>
              <select
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl border border-[#dfe8e4] bg-white px-3.5 text-base text-[#1e3934] outline-none transition-all focus:border-[#0d6b5e] focus:ring-2 focus:ring-[#0d6b5e]/20 sm:text-sm"
              >
                <option value="">Ninguna / Gasto propio directo</option>
                {localEntities.map((ent) => (
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
                className="mt-1.5 h-11 w-full rounded-xl border border-[#dfe8e4] bg-[#fbfcfc] px-3.5 text-base text-[#1e3934] outline-none transition-all focus:border-[#0d6b5e] focus:bg-white focus:ring-2 focus:ring-[#0d6b5e]/20 sm:text-sm"
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
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#dfe8e4] bg-[#fbfcfc] px-3.5 text-base text-[#1e3934] outline-none transition-all focus:border-[#0d6b5e] focus:bg-white focus:ring-2 focus:ring-[#0d6b5e]/20 sm:text-sm"
                />
              </div>

              {/* Adjuntar comprobante */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4c665e]">
                  Adjuntar Comprobante (PDF/Img)
                </label>
                <label className="mt-1.5 flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#b9cec7] bg-[#fbfcfc] px-3 text-xs font-medium text-[#4c665e] transition-colors hover:border-[#0d6b5e] hover:bg-[#f2f7f5]">
                  <FileUp className="size-4 text-[#0d6b5e]" />
                  <span className="truncate">
                    {file ? file.name : 'Subir archivo'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setFile(e.target.files[0])
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Nota interna opcional */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#4c665e]">
                Nota interna (Opcional)
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Aclaración adicional para registro de tesorería..."
                className="mt-1.5 w-full rounded-xl border border-[#dfe8e4] bg-[#fbfcfc] p-3 text-base text-[#1e3934] outline-none transition-all focus:border-[#0d6b5e] focus:bg-white focus:ring-2 focus:ring-[#0d6b5e]/20 sm:text-sm"
              />
            </div>

            {/* Panel de control de saldos en tiempo real */}
            <div className="rounded-2xl border border-[#d2dfda] bg-[#f6faf8] p-4 text-xs">
              <p className="font-bold uppercase tracking-wider text-[#1e3934]">
                Control de disponibilidad en Caja General
              </p>
              <div className="mt-2.5 flex justify-between text-[#5a736c]">
                <span>Saldo disponible actual:</span>
                <span className="font-semibold text-[#1e3934]">
                  {formatCurrency(currentBalance)}
                </span>
              </div>
              <div className="mt-1 flex justify-between border-t border-[#e2ece7] pt-1.5 font-bold">
                <span className={hasInsufficientFunds ? 'text-red-600' : 'text-[#1e3934]'}>
                  Saldo proyectado luego del movimiento:
                </span>
                <span className={hasInsufficientFunds ? 'text-red-600' : 'text-[#0d6b5e]'}>
                  {formatCurrency(projectedBalance)}
                </span>
              </div>
              {hasInsufficientFunds && (
                <div className="mt-2 flex items-center gap-1.5 font-semibold text-red-600">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>Atención: El egreso excede el disponible real en caja.</span>
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className="mt-6 flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={onClose}
                className="h-11 rounded-xl px-5 text-sm"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || hasInsufficientFunds}
                className="h-11 rounded-xl bg-[#0d6b5e] px-6 text-sm font-semibold text-white hover:bg-[#0a574c]"
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

      {/* Sub-modales de creación rápida */}
      <CategoryFormModal
        isOpen={isNewCategoryOpen}
        initialFlow={type}
        onClose={() => setIsNewCategoryOpen(false)}
        onSuccess={handleCategoryCreated}
      />

      <EntityFormModal
        entity={null}
        entityTypes={entityTypes}
        isOpen={isNewEntityOpen}
        onClose={() => setIsNewEntityOpen(false)}
        onSuccess={handleEntityCreated}
      />
    </>
  )
}
