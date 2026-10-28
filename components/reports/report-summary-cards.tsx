import { formatCurrency } from '@/lib/format'
import { ArrowDownLeft, ArrowUpRight, CircleDollarSign, FileSpreadsheet } from 'lucide-react'

interface ReportSummaryCardsProps {
  totals: {
    incomes: string
    expenses: string
    net: string
    count_total: number
    count_voided: number
  }
}

export function ReportSummaryCards({ totals }: ReportSummaryCardsProps) {
  const netNum = parseFloat(totals.net) || 0

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Ingresos */}
      <div className="rounded-2xl border border-[#e1ebe7] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#71837d]">
            Total Ingresos
          </p>
          <div className="flex size-9 items-center justify-center rounded-xl bg-[#e7f4ef] text-[#187262]">
            <ArrowDownLeft className="size-5" />
          </div>
        </div>
        <p className="text-2xl font-bold tracking-tight text-[#187262]">
          + {formatCurrency(totals.incomes)}
        </p>
        <p className="mt-1 text-xs text-[#8c9e99]">Fondos ingresados en el período</p>
      </div>

      {/* Total Egresos */}
      <div className="rounded-2xl border border-[#e1ebe7] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#71837d]">
            Total Egresos
          </p>
          <div className="flex size-9 items-center justify-center rounded-xl bg-[#faeee9] text-[#b96847]">
            <ArrowUpRight className="size-5" />
          </div>
        </div>
        <p className="text-2xl font-bold tracking-tight text-[#b96847]">
          − {formatCurrency(totals.expenses)}
        </p>
        <p className="mt-1 text-xs text-[#8c9e99]">Salidas reales y entregas de fondos</p>
      </div>

      {/* Saldo Neto */}
      <div className="rounded-2xl border border-[#e1ebe7] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#71837d]">
            Saldo Neto del Período
          </p>
          <div className="flex size-9 items-center justify-center rounded-xl bg-[#eaf1f8] text-[#3972a2]">
            <CircleDollarSign className="size-5" />
          </div>
        </div>
        <p
          className={`text-2xl font-bold tracking-tight ${
            netNum >= 0 ? 'text-[#1e3934]' : 'text-red-600'
          }`}
        >
          {formatCurrency(totals.net)}
        </p>
        <p className="mt-1 text-xs text-[#8c9e99]">Diferencia (Ingresos − Egresos)</p>
      </div>

      {/* Volumen de operaciones */}
      <div className="rounded-2xl border border-[#e1ebe7] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#71837d]">
            Movimientos Totales
          </p>
          <div className="flex size-9 items-center justify-center rounded-xl bg-[#f2f6f4] text-[#4d6660]">
            <FileSpreadsheet className="size-5" />
          </div>
        </div>
        <p className="text-2xl font-bold tracking-tight text-[#1e3934]">
          {totals.count_total}
        </p>
        <p className="mt-1 text-xs text-[#8c9e99]">
          {totals.count_voided > 0
            ? `${totals.count_voided} operaciones anuladas`
            : 'Sin operaciones anuladas'}
        </p>
      </div>
    </div>
  )
}
