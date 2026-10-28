import { Landmark, ArrowUpRight, ArrowDownLeft, CircleDollarSign } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  label: string
  value: string | number
  note: string
  icon: typeof Landmark
  tone: 'teal' | 'red' | 'blue'
}

export function MetricCard({ label, value, note, icon: Icon, tone }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-[#e1ebe7] bg-white p-5 shadow-[0_2px_10px_rgba(33,73,63,0.03)]">
      <div className="mb-5 flex items-start justify-between">
        <p className="text-sm font-medium text-[#71837d]">{label}</p>
        <div
          className={cn(
            'flex size-10 items-center justify-center rounded-xl',
            tone === 'teal' && 'bg-[#e7f4ef] text-[#187262]',
            tone === 'blue' && 'bg-[#e9f0f8] text-[#3972a2]',
            tone === 'red' && 'bg-[#f8efe9] text-[#b96847]'
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>
      <p className="text-[25px] font-bold tracking-tight text-[#1e3934]">
        {formatCurrency(value)}
      </p>
      <p className="mt-2 text-xs text-[#8b9b96]">{note}</p>
    </div>
  )
}
