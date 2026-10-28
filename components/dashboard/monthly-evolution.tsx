import { formatCurrency } from '@/lib/format'

interface MonthlyEvolutionProps {
  data: Array<{
    month: string
    ingresos: string
    egresos: string
  }>
}

export function MonthlyEvolution({ data }: MonthlyEvolutionProps) {
  // Encontrar el valor máximo para calcular alturas relativas
  const maxValue = Math.max(
    ...data.flatMap((d) => [parseFloat(d.ingresos) || 0, parseFloat(d.egresos) || 0]),
    1
  )

  return (
    <section className="rounded-2xl border border-[#e1ebe7] bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#1e3934]">Ingresos y egresos</h2>
          <p className="mt-1 text-sm text-[#82938f]">Últimos seis meses</p>
        </div>
      </div>

      <div className="flex h-[220px] items-end gap-3 border-b border-l border-[#e8eeeb] px-3 pb-0 pt-5 sm:gap-6">
        {data.length === 0 ? (
          <div className="flex size-full items-center justify-center text-xs text-[#899a95]">
            Sin datos en el período
          </div>
        ) : (
          data.map((item) => {
            const inc = parseFloat(item.ingresos) || 0
            const exp = parseFloat(item.egresos) || 0
            const incHeight = Math.max((inc / maxValue) * 100, 4)
            const expHeight = Math.max((exp / maxValue) * 100, 4)

            // Formatear mes YYYY-MM a nombre corto
            const parts = item.month.split('-')
            const monthLabel = parts.length === 2 ? `${parts[1]}/${parts[0].slice(2)}` : item.month

            return (
              <div key={item.month} className="flex h-full flex-1 flex-col justify-end gap-1">
                <div className="flex h-[84%] items-end justify-center gap-1">
                  <div
                    title={`Ingresos: ${formatCurrency(item.ingresos)}`}
                    className="w-3 rounded-t bg-[#8fc9b9] transition-all sm:w-5"
                    style={{ height: `${incHeight}%` }}
                  />
                  <div
                    title={`Egresos: ${formatCurrency(item.egresos)}`}
                    className="w-3 rounded-t bg-[#d9a58b] transition-all sm:w-5"
                    style={{ height: `${expHeight}%` }}
                  />
                </div>
                <span className="mt-3 text-center text-xs text-[#899a95]">
                  {monthLabel}
                </span>
              </div>
            )
          })
        )}
      </div>

      <div className="mt-5 flex gap-5 text-xs text-[#71837d]">
        <span className="flex items-center gap-2">
          <i className="size-2.5 rounded-full bg-[#8fc9b9]" />
          Ingresos
        </span>
        <span className="flex items-center gap-2">
          <i className="size-2.5 rounded-full bg-[#d9a58b]" />
          Egresos
        </span>
        <span className="ml-auto hidden text-[#9aa9a4] sm:inline">Valores en ARS</span>
      </div>
    </section>
  )
}
