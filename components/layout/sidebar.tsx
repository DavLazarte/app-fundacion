'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User } from '@/types/api'
import { cn } from '@/lib/utils'
import {
  ArrowUpRight,
  BarChart3,
  CircleDollarSign,
  ClipboardList,
  Landmark,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  X,
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: typeof LayoutDashboard
  permission?: string
}

const ALL_NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard, permission: 'movements.view' },
  { href: '/movements', label: 'Movimientos', icon: ArrowUpRight, permission: 'movements.view' },
  { href: '/entities', label: 'Entidades', icon: CircleDollarSign, permission: 'entities.view' },
  { href: '/reports', label: 'Informes', icon: BarChart3, permission: 'reports.view' },
  { href: '/users', label: 'Usuarios y permisos', icon: ShieldCheck, permission: 'users.manage' },
  { href: '/audit', label: 'Auditoría', icon: ClipboardList, permission: 'audit.view' },
]

interface SidebarProps {
  user: User | null
  active: string
  open: boolean
  onClose: () => void
}

export function Sidebar({ user, active, open, onClose }: SidebarProps) {
  const router = useRouter()

  const permissions = user?.permissions || []

  // Filtrar navegación según los permisos reales del usuario
  const navItems = ALL_NAV_ITEMS.filter((item) => {
    if (!item.permission) return true
    return permissions.includes(item.permission)
  })

  // Obtener iniciales del usuario
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U'

  const roleName = user?.roles?.[0]
    ? user.roles[0].charAt(0).toUpperCase() + user.roles[0].slice(1)
    : 'Usuario'

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex w-[260px] flex-col border-r border-[#dfe8e4] bg-white transition-transform lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-[88px] items-center gap-3 border-b border-[#edf1ef] px-7">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#0d6b5e] text-white">
            <Landmark />
          </div>
          <div>
            <p className="text-[17px] font-bold tracking-tight text-[#18463f]">Fundación</p>
            <p className="text-xs text-[#78908a]">Tesorería</p>
          </div>
          <button
            aria-label="Cerrar menú"
            onClick={onClose}
            className="ml-auto rounded-lg p-2 text-[#71827e] lg:hidden"
          >
            <X />
          </button>
        </div>

        <nav aria-label="Navegación principal" className="flex flex-1 flex-col gap-1 px-4 py-7">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.13em] text-[#96a8a3]">
            Menú principal
          </p>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = active === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex min-h-12 items-center gap-3 rounded-xl px-3 text-[15px] font-medium transition-colors',
                  isActive
                    ? 'bg-[#e6f3ef] text-[#0c6b5e]'
                    : 'text-[#526661] hover:bg-[#f2f6f4]'
                )}
              >
                <Icon className="size-[19px]" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-[#edf1ef] p-4">
          <div className="flex items-center gap-3 rounded-xl p-2">
            <div className="flex size-9 items-center justify-center rounded-full bg-[#d9ebe5] text-sm font-bold text-[#176657]">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#1e3934]">{user?.name || 'Usuario'}</p>
              <p className="truncate text-xs text-[#80918d]">{roleName}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="rounded-lg p-1.5 text-[#91a19d] transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {open && (
        <button
          aria-label="Cerrar menú"
          className="fixed inset-0 z-20 bg-[#183b34]/20 lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  )
}
