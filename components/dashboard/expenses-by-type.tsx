import { formatCurrency } from '@/lib/format'

interface ExpensesByTypeProps {
  data: Array<{
    type: string
    amount: string
  }>
}

export function ExpensesByType({ data }: ExpensesByTypeProps) {
  const total = data.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0)

  return (
    <section className="rounded-2xl border border-[#e1ebe7] bg-white p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#1e3934]">Egresos por sector</h2>
          <p className="mt-1 text-sm text-[#82938f]">Distribución del mes actual</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {data.length === 0 ? (
          <p className="py-6 text-center text-xs text-[#82938f]">
            No hay egresos registrados en el mes actual.
          </p>
        ) : (
          data.map((item, index) => {
            const amountNum = parseFloat(item.amount) || 0
            const percentage = total > 0 ? Math.round((amountNum / total) * 100) : 0

            return (
              <div key={item.type}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-semibold text-[#3c5750]">{item.type}</span>
                  <span className="font-bold text-[#28584f]">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#edf2ef]">
                  <div
                    className="h-full rounded-full bg-[#63b59f] transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="mt-1 text-right text-[11px] text-[#90a09b]">
                  {percentage}% del total de egresos
                </p>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
