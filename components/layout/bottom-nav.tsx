'use client'

import Link from 'next/link'
import { User } from '@/types/api'
import {
  ArrowUpRight,
  BarChart3,
  CircleDollarSign,
  LayoutDashboard,
  Plus,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface BottomNavProps {
  user: User | null
  active: string
}

export function BottomNav({ user, active }: BottomNavProps) {
  const permissions = user?.permissions || []

  const canViewMovements = permissions.includes('movements.view')
  const canViewEntities = permissions.includes('entities.view')
  const canViewReports = permissions.includes('reports.view')

  return (
    <nav
      aria-label="Navegación móvil"
      className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-[#dce6e2] bg-white/95 px-2 backdrop-blur-md lg:hidden"
    >
      <Link
        href="/dashboard"
        className={cn(
          'flex flex-col items-center justify-center gap-0.5 px-3 py-1 text-[11px] font-semibold transition-colors',
          active === '/dashboard'
            ? 'text-[#0d6b5e]'
            : 'text-[#71827e] hover:text-[#1e3934]'
        )}
      >
        <LayoutDashboard className="size-5" />
        <span>Inicio</span>
      </Link>

      {canViewMovements && (
        <Link
          href="/movements"
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 px-3 py-1 text-[11px] font-semibold transition-colors',
            active === '/movements'
              ? 'text-[#0d6b5e]'
              : 'text-[#71827e] hover:text-[#1e3934]'
          )}
        >
          <ArrowUpRight className="size-5" />
          <span>Movimientos</span>
        </Link>
      )}

      {canViewEntities && (
        <Link
          href="/entities"
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 px-3 py-1 text-[11px] font-semibold transition-colors',
            active === '/entities'
              ? 'text-[#0d6b5e]'
              : 'text-[#71827e] hover:text-[#1e3934]'
          )}
        >
          <CircleDollarSign className="size-5" />
          <span>Entidades</span>
        </Link>
      )}

      {canViewReports && (
        <Link
          href="/reports"
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 px-3 py-1 text-[11px] font-semibold transition-colors',
            active === '/reports'
              ? 'text-[#0d6b5e]'
              : 'text-[#71827e] hover:text-[#1e3934]'
          )}
        >
          <BarChart3 className="size-5" />
          <span>Informes</span>
        </Link>
      )}
    </nav>
  )
}
