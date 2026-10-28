'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PaginatedResponse, Role, User } from '@/types/api'
import { formatDateTime } from '@/lib/format'
import { Button } from '@/components/ui/button'

function safeFormatDateTime(isoString: string | null | undefined): string {
  if (!isoString) return '—'
  if (typeof formatDateTime === 'function') {
    return formatDateTime(isoString)
  }
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return String(isoString)
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'America/Argentina/Tucuman',
  }).format(date)
}
import { UserModal } from './user-modal'
import { Edit2, Plus, Shield, Trash2, UserCheck, UserX } from 'lucide-react'

interface UsersViewProps {
  initialData: PaginatedResponse<User>
  roles: Role[]
  currentUser: User
}

export function UsersView({ initialData, roles, currentUser }: UsersViewProps) {
  const router = useRouter()
  const users = initialData.data || []

  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  async function handleDelete(u: User) {
    if (u.id === currentUser.id) {
      alert('No podés eliminar tu propia cuenta de usuario.')
      return
    }

    if (!confirm(`¿Estás seguro de que deseás eliminar a ${u.name}?`)) return

    try {
      const res = await fetch(`/api/users/${u.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        alert(data.message || 'Error al eliminar usuario')
        return
      }
      router.refresh()
    } catch {
      alert('Error de conexión')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-[#1e3934]">Usuarios del sistema</h2>
          <p className="text-xs text-[#71827e]">Control de accesos para tesorera y contador.</p>
        </div>
        <Button
          onClick={() => {
            setEditingUser(null)
            setModalOpen(true)
          }}
          className="h-11 gap-2 rounded-xl bg-[#0d6b5e] px-5 font-semibold text-white hover:bg-[#0a574c]"
        >
          <Plus className="size-4" />
          Nuevo usuario
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#e1ebe7] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#edf1ef] bg-[#fafcfb] text-xs uppercase tracking-wider text-[#93a29e]">
              <th className="px-6 py-3.5 font-semibold">Usuario</th>
              <th className="px-6 py-3.5 font-semibold">Rol</th>
              <th className="px-6 py-3.5 font-semibold">Estado</th>
              <th className="px-6 py-3.5 font-semibold">Último Ingreso</th>
              <th className="px-6 py-3.5 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f3f2]">
            {users.map((u) => {
              const roleName = u.roles?.[0] || 'Sin rol'
              const isTesorera = roleName === 'tesorera'

              return (
                <tr key={u.id} className="hover:bg-[#fbfcfc]">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-[#1e3934]">{u.name}</div>
                    <div className="text-xs text-[#71827e]">{u.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                        isTesorera
                          ? 'bg-[#e7f4ef] text-[#0d6b5e]'
                          : 'bg-[#eaf1f8] text-[#3972a2]'
                      }`}
                    >
                      <Shield className="size-3.5" />
                      {isTesorera ? 'Tesorera' : 'Contador'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold ${
                        u.is_active ? 'text-emerald-600' : 'text-gray-400'
                      }`}
                    >
                      {u.is_active ? <UserCheck className="size-3.5" /> : <UserX className="size-3.5" />}
                      {u.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-[#71827e]">
                    {u.last_login_at ? safeFormatDateTime(u.last_login_at) : 'Nunca ingresó'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingUser(u)
                          setModalOpen(true)
                        }}
                        className="h-8 gap-1 rounded-lg px-2 text-xs text-[#57726b] hover:bg-[#eaf3f0] hover:text-[#0d6b5e]"
                      >
                        <Edit2 className="size-3.5" />
                        Editar
                      </Button>
                      {u.id !== currentUser.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(u)}
                          className="h-8 gap-1 rounded-lg px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="size-3.5" />
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        </div>
      </div>

      {initialData.meta && initialData.meta.last_page > 1 && (
        <div className="flex items-center justify-between border-t border-[#edf1ef] px-4 py-3 text-xs text-[#71827e]">
          <span>
            Mostrando {initialData.meta.from || 0} - {initialData.meta.to || 0} de {initialData.meta.total} usuarios
          </span>
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={initialData.meta.current_page <= 1}
              onClick={() => {
                const params = new URLSearchParams(window.location.search)
                params.set('page', String(initialData.meta!.current_page - 1))
                router.push(`/users?${params.toString()}`)
              }}
              className="h-8 rounded-lg text-xs"
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={initialData.meta.current_page >= initialData.meta.last_page}
              onClick={() => {
                const params = new URLSearchParams(window.location.search)
                params.set('page', String(initialData.meta!.current_page + 1))
                router.push(`/users?${params.toString()}`)
              }}
              className="h-8 rounded-lg text-xs"
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      <UserModal
        user={editingUser}
        roles={roles}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingUser(null)
        }}
        onSuccess={() => {
          setModalOpen(false)
          setEditingUser(null)
          router.refresh()
        }}
      />
    </div>
  )
}
