import Link from 'next/link'
import { Movement } from '@/types/api'
import { formatCurrency, formatDate } from '@/lib/format'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RecentMovementsProps {
  movements: Movement[]
}

export function RecentMovements({ movements }: RecentMovementsProps) {
  return (
    <section className="rounded-2xl border border-[#e1ebe7] bg-white">
      <div className="flex items-center justify-between border-b border-[#edf1ef] px-6 py-5">
        <div>
          <h2 className="text-lg font-bold text-[#1e3934]">Movimientos recientes</h2>
          <p className="mt-1 text-sm text-[#82938f]">Últimas operaciones registradas</p>
        </div>
        <Link
          href="/movements"
          className="text-sm font-semibold text-[#147261] transition-colors hover:underline"
        >
          Ver todos
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left">
          <thead>
            <tr className="border-b border-[#edf1ef] text-xs uppercase tracking-wide text-[#93a29e]">
              <th className="px-6 py-3 font-semibold">Fecha</th>
              <th className="px-6 py-3 font-semibold">Concepto</th>
              <th className="px-6 py-3 font-semibold">Categoría / Entidad</th>
              <th className="px-6 py-3 font-semibold">Tipo</th>
              <th className="px-6 py-3 text-right font-semibold">Importe</th>
            </tr>
          </thead>
          <tbody>
            {movements.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-sm text-[#8b9b96]">
                  Aún no hay movimientos registrados.
                </td>
              </tr>
            ) : (
              movements.map((movement) => {
                const isIncome = movement.type === 'ingreso'
                const Icon = isIncome ? ArrowDownLeft : ArrowUpRight
                const isVoided = movement.is_voided

                return (
                  <tr
                    key={movement.id}
                    className={cn(
                      'border-b border-[#f0f3f2] last:border-0 hover:bg-[#fbfcfc]',
                      isVoided && 'opacity-50'
                    )}
                  >
                    <td className="px-6 py-4 text-sm text-[#70817c]">
                      {formatDate(movement.movement_date)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            'flex size-9 items-center justify-center rounded-lg',
                            isIncome
                              ? 'bg-[#e8f5f0] text-[#338c77]'
                              : 'bg-[#faeee9] text-[#bb7454]'
                          )}
                        >
                          <Icon className="size-4" />
                        </span>
                        <div>
                          <p
                            className={cn(
                              'text-sm font-semibold text-[#38534c]',
                              isVoided && 'line-through'
                            )}
                          >
                            {movement.concept}
                          </p>
                          {movement.reference && (
                            <p className="text-xs text-[#91a09c]">Ref: {movement.reference}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#5d736d]">
                      <div>{movement.category?.name || '—'}</div>
                      {movement.entity && (
                        <div className="text-xs text-[#8c9e99]">{movement.entity.name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isVoided ? (
                        <span className="rounded-md bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                          ANULADO
                        </span>
                      ) : (
                        <span
                          className={cn(
                            'rounded-md px-2.5 py-1 text-xs font-semibold',
                            isIncome
                              ? 'bg-[#e8f5f0] text-[#267560]'
                              : 'bg-[#faeee9] text-[#ae6548]'
                          )}
                        >
                          {isIncome ? 'Ingreso' : 'Egreso'}
                        </span>
                      )}
                    </td>
                    <td
                      className={cn(
                        'px-6 py-4 text-right text-sm font-bold',
                        isVoided
                          ? 'text-[#8c9e99] line-through'
                          : isIncome
                          ? 'text-[#287b68]'
                          : 'text-[#b76547]'
                      )}
                    >
                      {isIncome ? '+ ' : '− '}
                      {formatCurrency(movement.amount)}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
