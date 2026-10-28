'use client'

import { useState } from 'react'
import { User } from '@/types/api'
import { Sidebar } from './sidebar'
import { Bell, ChevronDown, Menu, Search } from 'lucide-react'

interface AppLayoutProps {
  user: User | null
  active: string
  title: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
}

export function AppLayout({
  user,
  active,
  title,
  subtitle,
  action,
  children,
}: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U'

  return (
    <div className="min-h-screen bg-[#f7f9f8] text-[#203330]">
      <Sidebar
        user={user}
        active={active}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="lg:pl-[260px]">
        {/* Header superior */}
        <header className="flex h-[88px] items-center justify-between border-b border-[#e4ebe8] bg-white px-5 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              aria-label="Abrir menú"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-[#58716a] lg:hidden"
            >
              <Menu />
            </button>
            <div>
              <p className="text-sm text-[#82938f]">
                Fundación / <span className="font-medium text-[#4a635d]">{title}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              aria-label="Notificaciones"
              className="relative rounded-xl p-2.5 text-[#71827e] hover:bg-[#f3f7f5]"
            >
              <Bell className="size-5" />
              <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-[#d27c56] ring-2 ring-white" />
            </button>
            <div className="hidden h-8 w-px bg-[#e5ece9] sm:block" />
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-full bg-[#d9ebe5] text-sm font-bold text-[#176657]">
                {initials}
              </div>
              <span className="hidden text-sm font-semibold text-[#1e3934] sm:inline">
                {user?.name}
              </span>
            </div>
          </div>
        </header>

        {/* Contenido principal */}
        <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10">
          <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-[30px] font-bold tracking-[-0.03em] text-[#1e3934]">{title}</h1>
              {subtitle && <p className="mt-1 text-[16px] text-[#71837d]">{subtitle}</p>}
            </div>
            {action && <div>{action}</div>}
          </div>

          {children}
        </div>
      </main>
    </div>
  )
}
