import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/utils/currency'
import type { CategoryBreakdown } from '@/hooks/useCategoryBreakdown'

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as CategoryBreakdown
  return (
    <div className="bg-bg-card border border-border-app rounded-xl p-3 shadow-xl">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
        <span className="text-xs font-medium text-text-primary">{d.name}</span>
      </div>
      <p className="text-xs text-text-secondary">{formatCurrency(d.value)}</p>
      <p className="text-xs text-text-secondary">{d.percentage}% do total</p>
    </div>
  )
}

function DonutSkeleton() {
  return (
    <div className="flex items-center gap-6">
      <div className="w-36 h-36 rounded-full bg-bg-secondary animate-pulse flex-shrink-0" />
      <div className="flex flex-col gap-2 flex-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-bg-secondary animate-pulse" />
            <div className="h-3 bg-bg-secondary rounded animate-pulse" style={{ width: `${60 - i * 10}%` }} />
          </div>
        ))}
      </div>
    </div>
  )
}

function EmptyDonut() {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-2">
      <div className="w-24 h-24 rounded-full border-4 border-dashed border-border-app flex items-center justify-center">
        <span className="text-xs text-text-secondary text-center leading-tight">sem<br/>despesas</span>
      </div>
      <p className="text-xs text-text-secondary mt-2">Nenhuma despesa registrada este mês</p>
    </div>
  )
}

interface Props {
  data: CategoryBreakdown[]
  isLoading: boolean
}

export default function CategoryDonut({ data, isLoading }: Props) {
  if (isLoading) return <DonutSkeleton />
  if (data.length === 0) return <EmptyDonut />

  const total = data.reduce((acc, d) => acc + d.value, 0)

  return (
    <div className="flex items-center gap-6">

      {/* Gráfico */}
      <div className="relative flex-shrink-0 w-36 h-36">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={44}
              outerRadius={66}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Centro — total */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs text-text-secondary leading-tight">total</span>
          <span className="text-sm font-medium text-text-primary leading-tight">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        {data.slice(0, 6).map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: item.color }}
            />
            <span className="text-xs text-text-secondary truncate flex-1">{item.name}</span>
            <span className="text-xs font-medium text-text-primary flex-shrink-0">
              {item.percentage}%
            </span>
          </div>
        ))}
        {data.length > 6 && (
          <span className="text-xs text-text-secondary">
            +{data.length - 6} outras categorias
          </span>
        )}
      </div>

    </div>
  )
}