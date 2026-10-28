'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Entity, EntityType } from '@/types/api'
import { Button } from '@/components/ui/button'
import { AlertCircle, Loader2, X } from 'lucide-react'

interface EntityFormModalProps {
  entity?: Entity | null
  entityTypes: EntityType[]
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EntityFormModal({
  entity,
  entityTypes,
  isOpen,
  onClose,
  onSuccess,
}: EntityFormModalProps) {
  const router = useRouter()
  const isEditing = Boolean(entity)

  const [name, setName] = useState(entity?.name || '')
  const [entityTypeId, setEntityTypeId] = useState(
    entity?.entity_type_id ? String(entity.entity_type_id) : (entityTypes[0]?.id ? String(entityTypes[0].id) : '')
  )
  const [documentNumber, setDocumentNumber] = useState(entity?.document_number || '')
  const [phone, setPhone] = useState(entity?.phone || '')
  const [email, setEmail] = useState(entity?.email || '')
  const [address, setAddress] = useState(entity?.address || '')
  const [notes, setNotes] = useState(entity?.notes || '')
  const [isActive, setIsActive] = useState(entity ? entity.is_active : true)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const payload = {
      name,
      entity_type_id: parseInt(entityTypeId),
      document_number: documentNumber || null,
      phone: phone || null,
      email: email || null,
      address: address || null,
      notes: notes || null,
      is_active: isActive,
    }

    try {
      const url = isEditing ? `/api/entities/${entity!.id}` : '/api/entities'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Error al guardar la entidad.')
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
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between border-b border-[#edf1ef] pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#1e3934]">
              {isEditing ? 'Editar entidad' : 'Nueva entidad'}
            </h2>
            <p className="mt-0.5 text-xs text-[#7c8f89]">
              {isEditing ? 'Modificá los datos del contacto u organización.' : 'Agregá un comedor, iglesia, persona o proveedor.'}
            </p>
          </div>
          <button
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#4c665e]">
                Nombre de la entidad / organización *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Comedor San Cayetano, Ferretería Centro, etc."
                className="mt-1 h-10 w-full rounded-xl border border-[#dfe8e4] bg-[#fbfcfc] px-3 text-sm text-[#1e3934] outline-none focus:border-[#0d6b5e] focus:bg-white focus:ring-2 focus:ring-[#0d6b5e]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#4c665e]">
                Tipo de entidad *
              </label>
              <select
                required
                value={entityTypeId}
                onChange={(e) => setEntityTypeId(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-[#dfe8e4] bg-white px-3 text-sm text-[#1e3934] outline-none focus:border-[#0d6b5e] focus:ring-2 focus:ring-[#0d6b5e]/20"
              >
                {entityTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#4c665e]">
                CUIT / DNI / Documento
              </label>
              <input
                type="text"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="Ej. 30-12345678-9"
                className="mt-1 h-10 w-full rounded-xl border border-[#dfe8e4] bg-[#fbfcfc] px-3 text-sm text-[#1e3934] outline-none focus:border-[#0d6b5e] focus:bg-white focus:ring-2 focus:ring-[#0d6b5e]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#4c665e]">
                Teléfono de contacto
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej. 381-4567890"
                className="mt-1 h-10 w-full rounded-xl border border-[#dfe8e4] bg-[#fbfcfc] px-3 text-sm text-[#1e3934] outline-none focus:border-[#0d6b5e] focus:bg-white focus:ring-2 focus:ring-[#0d6b5e]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#4c665e]">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contacto@entidad.org"
                className="mt-1 h-10 w-full rounded-xl border border-[#dfe8e4] bg-[#fbfcfc] px-3 text-sm text-[#1e3934] outline-none focus:border-[#0d6b5e] focus:bg-white focus:ring-2 focus:ring-[#0d6b5e]/20"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#4c665e]">
                Dirección / Ubicación
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Calle, número, barrio o localidad"
                className="mt-1 h-10 w-full rounded-xl border border-[#dfe8e4] bg-[#fbfcfc] px-3 text-sm text-[#1e3934] outline-none focus:border-[#0d6b5e] focus:bg-white focus:ring-2 focus:ring-[#0d6b5e]/20"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#4c665e]">
                Notas u observaciones
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Datos de la persona responsable, horarios de atención, etc."
                className="mt-1 w-full rounded-xl border border-[#dfe8e4] bg-[#fbfcfc] p-3 text-sm text-[#1e3934] outline-none focus:border-[#0d6b5e] focus:bg-white focus:ring-2 focus:ring-[#0d6b5e]/20"
              />
            </div>

            {isEditing && (
              <div className="flex items-center gap-2 sm:col-span-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="size-4 rounded text-[#0d6b5e] focus:ring-[#0d6b5e]"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-[#1e3934]">
                  Entidad activa (disponible para registrar movimientos)
                </label>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-[#edf1ef] pt-4">
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
              disabled={loading}
              className="h-10 rounded-xl bg-[#0d6b5e] px-5 font-semibold text-white hover:bg-[#0a574c]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" /> Guardando...
                </span>
              ) : isEditing ? (
                'Guardar cambios'
              ) : (
                'Crear entidad'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
