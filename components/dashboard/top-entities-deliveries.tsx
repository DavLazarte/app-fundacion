'use client'

import Link from 'next/link'
import { DashboardTopEntity } from '@/types/api'
import { formatCurrency } from '@/lib/format'
import { ArrowUpRight, Building2, CheckCircle2, Clock, FileText } from 'lucide-react'

interface TopEntitiesDeliveriesProps {
  entities: DashboardTopEntity[]
}

export function TopEntitiesDeliveries({ entities = [] }: TopEntitiesDeliveriesProps) {
  if (!entities || entities.length === 0) {
    return null
  }

  return (
    <div className="rounded-2xl border border-[#dfe8e4] bg-white p-5 shadow-xs sm:p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-[#edf1ef] pb-4">
        <div>
          <h3 className="text-base font-bold text-[#1e3934]">
            Entregas y Rendición por Entidad
          </h3>
          <p className="text-xs text-[#71827e]">
            Fondos recibidos por cada organización y estado de sus boletas
          </p>
        </div>
        <Link
          href="/entities"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#0d6b5e] hover:underline"
        >
          <span>Ver todas las entidades</span>
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      <div className="mt-4 divide-y divide-[#edf1ef]">
        {entities.map((item) => {
          const deliveredNum = parseFloat(item.delivered) || 0
          const renderedNum = parseFloat(item.rendered) || 0
          const percentRendered =
            deliveredNum > 0
              ? Math.min(100, Math.round((renderedNum / deliveredNum) * 100))
              : 0

          return (
            <div key={item.id} className="py-3.5 first:pt-1 last:pb-1">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#e7f4ef] text-[#0d6b5e]">
                    <Building2 className="size-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/entities?q=${encodeURIComponent(item.name)}`}
                        className="font-bold text-sm text-[#1e3934] hover:text-[#0d6b5e] hover:underline"
                      >
                        {item.name}
                      </Link>
                      <span className="rounded-md bg-[#edf4f1] px-2 py-0.5 text-[10px] font-semibold text-[#5a736c]">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-xs text-[#71827e]">
                      {item.movements_count} {item.movements_count === 1 ? 'entrega' : 'entregas'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 sm:text-right">
                  <div>
                    <p className="text-[11px] font-semibold text-[#71827e]">Total entregado</p>
                    <p className="text-sm font-bold text-[#1e3934]">
                      {formatCurrency(item.delivered)}
                    </p>
                  </div>

                  <div className="hidden sm:block h-7 w-px bg-[#edf1ef]" />

                  <div>
                    <p className="text-[11px] font-semibold text-[#71827e]">Rendido en boletas</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#0d6b5e]">
                        {formatCurrency(item.rendered)}
                      </span>
                      <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                        {percentRendered}%
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/movements?tab=accountabilities&q=${encodeURIComponent(item.name)}`}
                    title="Ver rendiciones de esta entidad"
                    className="inline-flex items-center justify-center size-8 rounded-lg border border-[#dfe8e4] bg-[#fafcfb] text-[#5a736c] hover:bg-[#e7f4ef] hover:text-[#0d6b5e] transition-colors"
                  >
                    <FileText className="size-4" />
                  </Link>
                </div>
              </div>

              {/* Barra de progreso visual de rendición */}
              <div className="mt-2.5">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#eef3f1]">
                  <div
                    className="h-full rounded-full bg-[#0d6b5e] transition-all"
                    style={{ width: `${percentRendered}%` }}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-[#71827e]">
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="size-3 text-[#0d6b5e]" />
                    {percentRendered === 100
                      ? 'Totalmente rendido'
                      : `${percentRendered}% justificado`}
                  </span>
                  {parseFloat(item.pending) > 0 && (
                    <span className="inline-flex items-center gap-1 text-[#b96847]">
                      <Clock className="size-3" />
                      Pendiente: {formatCurrency(item.pending)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
