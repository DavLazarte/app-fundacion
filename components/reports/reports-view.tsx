'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Category, Entity, ReportSummary } from '@/types/api'
import { ReportSummaryCards } from './report-summary-cards'
import { formatCurrency } from '@/lib/format'
import { Button } from '@/components/ui/button'
import {
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Loader2,
} from 'lucide-react'

interface ReportsViewProps {
  summary: ReportSummary
  categories: Category[]
  entities: Entity[]
  canExport: boolean
}

export function ReportsView({
  summary,
  categories,
  entities,
  canExport,
}: ReportsViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [from, setFrom] = useState(searchParams.get('from') || '')
  const [to, setTo] = useState(searchParams.get('to') || '')
  const [type, setType] = useState(searchParams.get('type') || '')
  const [categoryId, setCategoryId] = useState(searchParams.get('category_id') || '')
  const [entityId, setEntityId] = useState(searchParams.get('entity_id') || '')

  const [exportingPdf, setExportingPdf] = useState(false)
  const [exportingXlsx, setExportingXlsx] = useState(false)

  function applyFilters() {
    const params = new URLSearchParams()
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    if (type) params.set('type', type)
    if (categoryId) params.set('category_id', categoryId)
    if (entityId) params.set('entity_id', entityId)

    router.push(`/reports?${params.toString()}`)
  }

  function clearFilters() {
    setFrom('')
    setTo('')
    setType('')
    setCategoryId('')
    setEntityId('')
    router.push('/reports')
  }

  async function handleExport(format: 'pdf' | 'xlsx') {
    if (format === 'pdf') setExportingPdf(true)
    if (format === 'xlsx') setExportingXlsx(true)

    const params = new URLSearchParams(searchParams.toString())
    params.set('format', format)

    try {
      const response = await fetch(`/api/reports/export?${params.toString()}`)
      if (!response.ok) {
        alert('Error al generar el archivo en el servidor.')
        setExportingPdf(false)
        setExportingXlsx(false)
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `informe_tesoreria_${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      alert('Error de conexión al exportar el archivo.')
    } finally {
      setExportingPdf(false)
      setExportingXlsx(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Barra de Filtros y Botones de Descarga */}
      <div className="rounded-2xl border border-[#e1ebe7] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-[#5a736c]">
                Fecha Desde
              </label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-[#dfe8e4] bg-[#fbfcfc] px-3 text-xs text-[#1e3934] outline-none focus:border-[#0d6b5e]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#5a736c]">
                Fecha Hasta
              </label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-[#dfe8e4] bg-[#fbfcfc] px-3 text-xs text-[#1e3934] outline-none focus:border-[#0d6b5e]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#5a736c]">
                Tipo
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-[#dfe8e4] bg-white px-2.5 text-xs text-[#1e3934] outline-none focus:border-[#0d6b5e]"
              >
                <option value="">Todos los flujos</option>
                <option value="ingreso">Solo Ingresos</option>
                <option value="egreso">Solo Egresos</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#5a736c]">
                Categoría
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-[#dfe8e4] bg-white px-2.5 text-xs text-[#1e3934] outline-none focus:border-[#0d6b5e]"
              >
                <option value="">Todas las categorías</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.flow})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="h-10 rounded-xl px-3 text-xs"
            >
              Limpiar
            </Button>
            <Button
              size="sm"
              onClick={applyFilters}
              className="h-10 gap-1.5 rounded-xl bg-[#0d6b5e] px-4 text-xs font-semibold text-white hover:bg-[#0a574c]"
            >
              <Filter className="size-3.5" />
              Filtrar
            </Button>

            {canExport && (
              <div className="flex gap-2 pl-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={exportingPdf}
                  onClick={() => handleExport('pdf')}
                  className="h-10 gap-1.5 rounded-xl border-red-200 bg-red-50 text-xs font-semibold text-red-700 hover:bg-red-100"
                >
                  {exportingPdf ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <FileText className="size-3.5" />
                  )}
                  Exportar PDF
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={exportingXlsx}
                  onClick={() => handleExport('xlsx')}
                  className="h-10 gap-1.5 rounded-xl border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
                >
                  {exportingXlsx ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="size-3.5" />
                  )}
                  Exportar Excel
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tarjetas de Resumen Numérico */}
      <ReportSummaryCards totals={summary.totals} />

      {/* Tablas de Desglose */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Desglose por Categoría */}
        <section className="rounded-2xl border border-[#e1ebe7] bg-white p-6 shadow-sm">
          <h3 className="text-base font-bold text-[#1e3934]">
            Distribución por Categoría
          </h3>
          <p className="mt-0.5 text-xs text-[#82938f]">
            Totales acumulados según el rubro o concepto
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#edf1ef] text-[11px] font-semibold uppercase text-[#93a29e]">
                  <th className="pb-2.5">Categoría</th>
                  <th className="pb-2.5">Flujo</th>
                  <th className="pb-2.5 text-center">Movs</th>
                  <th className="pb-2.5 text-right">Total ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f3f2]">
                {summary.by_category.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-[#8c9e99]">
                      Sin movimientos para el criterio seleccionado.
                    </td>
                  </tr>
                ) : (
                  summary.by_category.map((cat, idx) => (
                    <tr key={idx} className="hover:bg-[#fbfcfc]">
                      <td className="py-3 font-semibold text-[#1e3934]">
                        {cat.category}
                      </td>
                      <td className="py-3">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                            cat.flow === 'ingreso'
                              ? 'bg-[#e8f5f0] text-[#187262]'
                              : 'bg-[#faeee9] text-[#b96847]'
                          }`}
                        >
                          {cat.flow.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 text-center text-[#70817c]">{cat.count}</td>
                      <td className="py-3 text-right font-bold text-[#1e3934]">
                        {formatCurrency(cat.total)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Desglose por Entidad */}
        <section className="rounded-2xl border border-[#e1ebe7] bg-white p-6 shadow-sm">
          <h3 className="text-base font-bold text-[#1e3934]">
            Movimientos por Entidad
          </h3>
          <p className="mt-0.5 text-xs text-[#82938f]">
            Destinatarios u orígenes con mayor volumen de fondos
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#edf1ef] text-[11px] font-semibold uppercase text-[#93a29e]">
                  <th className="pb-2.5">Entidad</th>
                  <th className="pb-2.5">Tipo</th>
                  <th className="pb-2.5 text-center">Movs</th>
                  <th className="pb-2.5 text-right">Total Recibido ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f3f2]">
                {summary.by_entity.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-[#8c9e99]">
                      Sin registros para el criterio seleccionado.
                    </td>
                  </tr>
                ) : (
                  summary.by_entity.map((ent, idx) => (
                    <tr key={idx} className="hover:bg-[#fbfcfc]">
                      <td className="py-3 font-semibold text-[#1e3934]">
                        {ent.entity_name}
                      </td>
                      <td className="py-3">
                        <span className="rounded bg-[#f0f4f2] px-1.5 py-0.5 text-[10px] font-medium text-[#4c665e]">
                          {ent.entity_type}
                        </span>
                      </td>
                      <td className="py-3 text-center text-[#70817c]">{ent.count}</td>
                      <td className="py-3 text-right font-bold text-[#1e3934]">
                        {formatCurrency(ent.total)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
