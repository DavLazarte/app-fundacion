'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AccessLog, AuditLog, PaginatedResponse } from '@/types/api'
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
import {
  Activity,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  KeyRound,
  LogIn,
  LogOut,
  RotateCcw,
  ShieldAlert,
  X,
} from 'lucide-react'

interface AuditViewProps {
  auditLogs: PaginatedResponse<AuditLog>
  accessLogs: PaginatedResponse<AccessLog>
  activeTab: 'actions' | 'access'
}

export function AuditView({ auditLogs, accessLogs, activeTab: initialTab }: AuditViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [activeTab, setActiveTab] = useState<'actions' | 'access'>(initialTab)
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLog | null>(null)

  // Filtros
  const [from, setFrom] = useState(searchParams.get('from') || '')
  const [to, setTo] = useState(searchParams.get('to') || '')
  const [eventFilter, setEventFilter] = useState(searchParams.get('event') || '')

  function handleFilter(tabOverride?: 'actions' | 'access') {
    const tab = tabOverride || activeTab
    const params = new URLSearchParams()
    params.set('tab', tab)
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    if (eventFilter) params.set('event', eventFilter)
    router.push(`/audit?${params.toString()}`)
  }

  function handleReset() {
    setFrom('')
    setTo('')
    setEventFilter('')
    router.push(`/audit?tab=${activeTab}`)
  }

  function switchTab(tab: 'actions' | 'access') {
    setActiveTab(tab)
    setEventFilter('')
    handleFilter(tab)
  }

  const currentLogs = activeTab === 'actions' ? auditLogs : accessLogs

  function getEventBadge(event: string) {
    if (event.includes('attachment')) {
      return 'bg-purple-100 text-purple-800 border-purple-200'
    }
    if (event.includes('voided') || event === 'login_failed') {
      return 'bg-red-100 text-red-700 border-red-200'
    }
    if (event.includes('created') || event === 'login') {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    }
    if (event.includes('updated')) {
      return 'bg-blue-100 text-blue-800 border-blue-200'
    }
    if (event === 'logout') {
      return 'bg-gray-100 text-gray-700 border-gray-200'
    }
    return 'bg-slate-100 text-slate-700 border-slate-200'
  }

  function formatEventLabel(event: string) {
    const labels: Record<string, string> = {
      'movement.created': 'Movimiento creado',
      'movement.voided': 'Movimiento anulado',
      'movement.attachment_uploaded': 'Comprobante subido',
      'movement.attachment_downloaded': 'Comprobante descargado',
      'entity.created': 'Entidad creada',
      'entity.updated': 'Entidad actualizada',
      'fund.created': 'Caja creada',
      'fund.updated': 'Caja actualizada',
      'user.created': 'Usuario creado',
      'user.updated': 'Usuario modificado',
      'role.permissions_changed': 'Permisos cambiados',
      'report.exported': 'Informe exportado',
      login: 'Inicio de sesión',
      logout: 'Cierre de sesión',
      login_failed: 'Intento fallido',
    }
    return labels[event] || event
  }

  return (
    <div className="space-y-6">
      {/* Selector de Solapas */}
      <div className="flex border-b border-[#e1ebe7]">
        <button
          onClick={() => switchTab('actions')}
          className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-sm font-semibold transition-all ${
            activeTab === 'actions'
              ? 'border-[#0d6b5e] text-[#0d6b5e]'
              : 'border-transparent text-[#71827e] hover:text-[#1e3934]'
          }`}
        >
          <Activity className="size-4" />
          Acciones en el Sistema ({auditLogs.meta?.total ?? auditLogs.data?.length ?? 0})
        </button>
        <button
          onClick={() => switchTab('access')}
          className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-sm font-semibold transition-all ${
            activeTab === 'access'
              ? 'border-[#0d6b5e] text-[#0d6b5e]'
              : 'border-transparent text-[#71827e] hover:text-[#1e3934]'
          }`}
        >
          <KeyRound className="size-4" />
          Inicios de Sesión ({accessLogs.meta?.total ?? accessLogs.data?.length ?? 0})
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-[#e1ebe7] bg-white p-4 shadow-sm">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#57726b]">Desde</label>
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[#71827e]" />
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-9 rounded-xl border border-[#d2dfda] bg-white pl-8 pr-3 text-xs text-[#1e3934] outline-none focus:border-[#0d6b5e]"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#57726b]">Hasta</label>
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[#71827e]" />
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-9 rounded-xl border border-[#d2dfda] bg-white pl-8 pr-3 text-xs text-[#1e3934] outline-none focus:border-[#0d6b5e]"
            />
          </div>
        </div>

        {activeTab === 'actions' ? (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#57726b]">Evento</label>
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="h-9 rounded-xl border border-[#d2dfda] bg-white px-3 text-xs text-[#1e3934] outline-none focus:border-[#0d6b5e]"
            >
              <option value="">Todos los eventos</option>
              <option value="movement.created">Movimiento creado</option>
              <option value="movement.voided">Movimiento anulado</option>
              <option value="movement.attachment_uploaded">Comprobante subido</option>
              <option value="entity.created">Entidad creada</option>
              <option value="entity.updated">Entidad modificada</option>
              <option value="user.created">Usuario creado</option>
              <option value="user.updated">Usuario modificado</option>
              <option value="report.exported">Informe exportado</option>
            </select>
          </div>
        ) : (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#57726b]">Resultado</label>
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="h-9 rounded-xl border border-[#d2dfda] bg-white px-3 text-xs text-[#1e3934] outline-none focus:border-[#0d6b5e]"
            >
              <option value="">Todos los accesos</option>
              <option value="login">Inicios exitosos</option>
              <option value="login_failed">Intentos fallidos</option>
              <option value="logout">Cierres de sesión</option>
            </select>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={() => handleFilter()}
            className="h-9 gap-1.5 rounded-xl bg-[#0d6b5e] px-4 text-xs font-semibold text-white hover:bg-[#0a574c]"
          >
            <Filter className="size-3.5" />
            Filtrar
          </Button>
          {(from || to || eventFilter) && (
            <Button
              variant="outline"
              onClick={handleReset}
              className="h-9 gap-1.5 rounded-xl border-[#d2dfda] px-3 text-xs text-[#57726b] hover:bg-[#f3f7f5]"
            >
              <RotateCcw className="size-3.5" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Tabla según solapa activa */}
      {activeTab === 'actions' ? (
        <div className="overflow-hidden rounded-2xl border border-[#e1ebe7] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#edf1ef] bg-[#fafcfb] text-xs uppercase tracking-wider text-[#93a29e]">
                <th className="px-6 py-3.5 font-semibold">Fecha y Hora</th>
                <th className="px-6 py-3.5 font-semibold">Usuario</th>
                <th className="px-6 py-3.5 font-semibold">Evento</th>
                <th className="px-6 py-3.5 font-semibold">Recurso</th>
                <th className="px-6 py-3.5 font-semibold">IP</th>
                <th className="px-6 py-3.5 text-right font-semibold">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f3f2]">
              {auditLogs.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-xs text-[#71827e]">
                    No se encontraron registros de auditoría con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                auditLogs.data.map((log) => (
                  <tr key={log.id} className="hover:bg-[#fbfcfc]">
                    <td className="whitespace-nowrap px-6 py-4 text-xs font-semibold text-[#1e3934]">
                      {safeFormatDateTime(log.created_at)}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="font-semibold text-[#1e3934]">{log.user?.name || 'Sistema'}</div>
                      <div className="text-[11px] text-[#71827e]">{log.user?.email || '—'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold ${getEventBadge(
                          log.event
                        )}`}
                      >
                        {formatEventLabel(log.event)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-[#57726b]">
                      <span className="font-semibold text-[#1e3934]">{log.auditable_type}</span>
                      {log.auditable_id && <span className="ml-1 text-[#71827e]">#{log.auditable_id}</span>}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-[#71827e]">
                      {log.ip_address || '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedAuditLog(log)}
                        className="h-8 gap-1 rounded-lg px-2 text-xs text-[#0d6b5e] hover:bg-[#eaf3f0]"
                      >
                        <Eye className="size-3.5" />
                        Ver cambios
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#e1ebe7] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#edf1ef] bg-[#fafcfb] text-xs uppercase tracking-wider text-[#93a29e]">
                <th className="px-6 py-3.5 font-semibold">Fecha y Hora</th>
                <th className="px-6 py-3.5 font-semibold">Usuario / Intento</th>
                <th className="px-6 py-3.5 font-semibold">Resultado</th>
                <th className="px-6 py-3.5 font-semibold">Dirección IP</th>
                <th className="px-6 py-3.5 font-semibold">Navegador / Dispositivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f3f2]">
              {accessLogs.data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-xs text-[#71827e]">
                    No se encontraron registros de accesos con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                accessLogs.data.map((log) => {
                  const isSuccess = log.event === 'login'
                  const isFailed = log.event === 'login_failed'

                  return (
                    <tr key={log.id} className="hover:bg-[#fbfcfc]">
                      <td className="whitespace-nowrap px-6 py-4 text-xs font-semibold text-[#1e3934]">
                        {safeFormatDateTime(log.created_at)}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div className="font-semibold text-[#1e3934]">
                          {log.user?.name || log.email_attempted || '—'}
                        </div>
                        {log.user?.email && (
                          <div className="text-[11px] text-[#71827e]">{log.user.email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold ${getEventBadge(
                            log.event
                          )}`}
                        >
                          {isSuccess && <LogIn className="size-3" />}
                          {isFailed && <ShieldAlert className="size-3" />}
                          {log.event === 'logout' && <LogOut className="size-3" />}
                          {formatEventLabel(log.event)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-[#71827e]">
                        {log.ip_address || '—'}
                      </td>
                      <td className="max-w-xs truncate px-6 py-4 text-xs text-[#71827e]" title={log.user_agent || ''}>
                        {log.user_agent || '—'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Paginación */}
      {currentLogs.meta && currentLogs.meta.last_page > 1 && (
        <div className="flex items-center justify-between border-t border-[#edf1ef] pt-4 text-xs text-[#71827e]">
          <div>
            Mostrando página {currentLogs.meta.current_page} de {currentLogs.meta.last_page} ({currentLogs.meta.total} registros)
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentLogs.meta.current_page <= 1}
              onClick={() => {
                const p = new URLSearchParams(searchParams.toString())
                p.set('page', String(currentLogs.meta!.current_page - 1))
                router.push(`/audit?${p.toString()}`)
              }}
              className="h-8 gap-1 rounded-xl"
            >
              <ChevronLeft className="size-3.5" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentLogs.meta.current_page >= currentLogs.meta.last_page}
              onClick={() => {
                const p = new URLSearchParams(searchParams.toString())
                p.set('page', String(currentLogs.meta!.current_page + 1))
                router.push(`/audit?${p.toString()}`)
              }}
              className="h-8 gap-1 rounded-xl"
            >
              Siguiente
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal para ver detalle de valores antes y después */}
      {selectedAuditLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#183b34]/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-start justify-between border-b border-[#edf1ef] pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#1e3934]">Detalle de Auditoría #{selectedAuditLog.id}</h3>
                <p className="text-xs text-[#71827e]">
                  {formatEventLabel(selectedAuditLog.event)} • {safeFormatDateTime(selectedAuditLog.created_at)}
                </p>
              </div>
              <button
                onClick={() => setSelectedAuditLog(null)}
                className="rounded-lg p-2 text-[#71827e] hover:bg-[#f3f7f5]"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 rounded-xl bg-[#f8faf9] p-3 text-[#57726b]">
                <div>
                  <span className="font-semibold text-[#1e3934]">Usuario:</span>{' '}
                  {selectedAuditLog.user?.name || 'Sistema'} ({selectedAuditLog.user?.email || 'N/A'})
                </div>
                <div>
                  <span className="font-semibold text-[#1e3934]">IP:</span> {selectedAuditLog.ip_address || '—'}
                </div>
                <div>
                  <span className="font-semibold text-[#1e3934]">Recurso:</span> {selectedAuditLog.auditable_type} #
                  {selectedAuditLog.auditable_id || 'N/A'}
                </div>
                <div className="truncate" title={selectedAuditLog.user_agent || ''}>
                  <span className="font-semibold text-[#1e3934]">Agente:</span> {selectedAuditLog.user_agent || '—'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-1.5 font-bold text-[#1e3934]">Valores Anteriores (old)</h4>
                  <pre className="max-h-60 overflow-auto rounded-xl border border-[#e1ebe7] bg-[#fafcfb] p-3 font-mono text-[11px] text-[#334155]">
                    {selectedAuditLog.old_values
                      ? JSON.stringify(selectedAuditLog.old_values, null, 2)
                      : 'Sin valores previos (nuevo registro)'}
                  </pre>
                </div>
                <div>
                  <h4 className="mb-1.5 font-bold text-[#1e3934]">Valores Nuevos (new)</h4>
                  <pre className="max-h-60 overflow-auto rounded-xl border border-[#e1ebe7] bg-[#fafcfb] p-3 font-mono text-[11px] text-[#334155]">
                    {selectedAuditLog.new_values
                      ? JSON.stringify(selectedAuditLog.new_values, null, 2)
                      : 'Sin valores nuevos'}
                  </pre>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setSelectedAuditLog(null)}
                className="h-9 rounded-xl border-[#d2dfda] px-4 text-xs font-semibold text-[#1e3934]"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
