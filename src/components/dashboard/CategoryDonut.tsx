import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/utils/currency'
import type { CategoryBreakdown } from '@/hooks/useCategoryBreakdown'

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as CategoryBreakdown
  return (
    <div className="bg-bg-card/90 backdrop-blur-md border border-border-app/50 rounded-xl p-3.5 shadow-[0_8px_30px_rgb(0,0,0,0.5)] z-50 min-w-[140px]">
      <div className="flex items-center gap-2.5 mb-3">
        <div 
          className="w-2.5 h-2.5 rounded-full shadow-sm" 
          style={{ background: d.color, boxShadow: `0 0 8px ${d.color}80` }} 
        />
        <span className="text-xs font-semibold text-text-primary tracking-wide">{d.name}</span>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">Valor gasto</p>
        <p className="text-sm font-medium text-text-primary">{formatCurrency(d.value)}</p>
      </div>
      <div className="h-px w-full bg-border-app/40 my-2.5" />
      <div className="flex justify-between items-center">
        <p className="text-xs text-text-secondary">Representação</p>
        <p className="text-xs font-semibold text-text-primary">{d.percentage}%</p>
      </div>
    </div>
  )
}

function DonutSkeleton() {
  return (
    <div className="flex items-center gap-8 w-full py-2">
      <div className="w-40 h-40 rounded-full bg-bg-primary border border-border-app/30 shadow-inner flex-shrink-0 animate-pulse flex items-center justify-center relative">
        <div className="w-24 h-24 rounded-full bg-bg-card" />
      </div>
      <div className="flex flex-col gap-3.5 flex-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-bg-secondary animate-pulse shadow-sm" />
            <div className="h-2.5 bg-bg-secondary rounded-full animate-pulse" style={{ width: `${70 - i * 15}%` }} />
          </div>
        ))}
      </div>
    </div>
  )
}

function EmptyDonut() {
  return (
    <div className="flex flex-col items-center justify-center py-6 gap-4 w-full">
      <div className="w-32 h-32 rounded-full border-2 border-dashed border-border-app/40 flex flex-col items-center justify-center relative">
        <div className="absolute inset-0 bg-bg-primary/40 blur-xl rounded-full" />
        <span className="text-[10px] font-semibold text-text-secondary text-center uppercase tracking-widest relative z-10 opacity-60">
          Sem<br/>Dados
        </span>
      </div>
      <p className="text-xs text-text-secondary mt-1">Nenhuma despesa registrada este mês</p>
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
    <div className="flex items-center gap-8 w-full">

      {/* Gráfico */}
      <div className="relative flex-shrink-0 w-40 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={54}
              outerRadius={76}
              paddingAngle={3}
              dataKey="value"
              stroke="none" // Remove a borda padrão para deixar o paddingAngle fazer o trabalho
            >
              {data.map((entry, i) => (
                <Cell 
                  key={i} 
                  fill={entry.color} 
                  style={{ filter: `drop-shadow(0px 2px 4px ${entry.color}40)` }} 
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          </PieChart>
        </ResponsiveContainer>

        {/* Centro — total */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] uppercase tracking-wider font-medium text-text-secondary mb-0.5">total</span>
          <span className="text-base font-semibold text-text-primary tracking-tight">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        {data.slice(0, 5).map((item) => (
          <div 
            key={item.name} 
            className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/[0.02] transition-colors group cursor-default"
          >
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110"
              style={{ background: item.color, boxShadow: `0 0 8px ${item.color}80` }}
            />
            <span className="text-sm text-text-secondary truncate flex-1 group-hover:text-text-primary transition-colors">
              {item.name}
            </span>
            <span className="text-sm font-semibold text-text-primary flex-shrink-0">
              {item.percentage}%
            </span>
          </div>
        ))}
        {data.length > 5 && (
          <div className="px-2 mt-1">
            <span className="text-xs font-medium text-text-secondary/70">
              +{data.length - 5} outras categorias
            </span>
          </div>
        )}
      </div>

    </div>
  )
}