'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Role, User } from '@/types/api'
import { Button } from '@/components/ui/button'
import { AlertCircle, Loader2, X } from 'lucide-react'

interface UserModalProps {
  user?: User | null
  roles: Role[]
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function UserModal({ user, roles, isOpen, onClose, onSuccess }: UserModalProps) {
  const router = useRouter()
  const isEditing = Boolean(user)

  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(user?.roles?.[0] || 'contador')
  const [isActive, setIsActive] = useState(user ? user.is_active : true)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const payload: Record<string, any> = {
      name,
      email,
      role,
      is_active: isActive,
    }

    if (password) {
      payload.password = password
    }

    try {
      const url = isEditing ? `/api/users/${user!.id}` : '/api/users'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Error al guardar el usuario.')
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
        <div className="mb-5 flex items-start justify-between border-b border-[#edf1ef] pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#1e3934]">
              {isEditing ? 'Editar usuario' : 'Nuevo usuario'}
            </h2>
            <p className="mt-0.5 text-xs text-[#7c8f89]">
              {isEditing ? 'Modificá roles o credenciales.' : 'Asigná acceso a la tesorera o al contador.'}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-[#71827e] hover:bg-[#f3f7f5]">
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4c665e]">
              Nombre completo *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Roberto Gómez"
              className="mt-1 h-10 w-full rounded-xl border border-[#dfe8e4] bg-[#fbfcfc] px-3 text-sm text-[#1e3934] outline-none focus:border-[#0d6b5e]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4c665e]">
              Correo electrónico *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="roberto@devsign.ar"
              className="mt-1 h-10 w-full rounded-xl border border-[#dfe8e4] bg-[#fbfcfc] px-3 text-sm text-[#1e3934] outline-none focus:border-[#0d6b5e]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4c665e]">
              Contraseña {isEditing ? '(dejar en blanco para no cambiar)' : '*'}
            </label>
            <input
              type="password"
              required={!isEditing}
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="mt-1 h-10 w-full rounded-xl border border-[#dfe8e4] bg-[#fbfcfc] px-3 text-sm text-[#1e3934] outline-none focus:border-[#0d6b5e]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4c665e]">
              Rol asignado *
            </label>
            <select
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-[#dfe8e4] bg-white px-3 text-sm text-[#1e3934] outline-none focus:border-[#0d6b5e]"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name === 'tesorera' ? 'Tesorera (Acceso Total)' : 'Contador (Solo Lectura e Informes)'}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="user_active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="size-4 rounded text-[#0d6b5e] focus:ring-[#0d6b5e]"
            />
            <label htmlFor="user_active" className="text-sm font-medium text-[#1e3934]">
              Usuario activo (puede iniciar sesión en la app)
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-[#edf1ef] pt-4">
            <Button type="button" variant="outline" disabled={loading} onClick={onClose} className="h-10 rounded-xl">
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
                'Crear usuario'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
