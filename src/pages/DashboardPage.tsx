import { useQuery } from '@tanstack/react-query'
import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Line,
} from 'recharts'
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { getSummary, getMonthlySummary } from '@/api/transactions'
import { formatCurrency } from '@/utils/currency'
import { getCurrentMonthRange, getMonthName } from '@/utils/date'
import { useCategoryBreakdown } from '@/hooks/useCategoryBreakdown'
import CategoryDonut from '@/components/dashboard/CategoryDonut'
import RecentTransactions from '@/components/dashboard/RecentTransactions'

const { startDate, endDate } = getCurrentMonthRange()
const currentYear = new Date().getFullYear()

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-card/90 backdrop-blur-md border border-border-app/50 rounded-xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
      <p className="text-text-secondary font-medium mb-3 text-xs uppercase tracking-wider">{label}</p>
      <div className="flex flex-col gap-2">
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: entry.stroke ?? entry.fill }} />
              <span className="text-text-secondary text-sm">
                {entry.name === 'income' ? 'Receitas' : entry.name === 'expense' ? 'Despesas' : 'Tendência'}
              </span>
            </div>
            <span className="font-medium text-text-primary text-sm">
              {entry.name === 'trend' ? '' : formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  trend,
  color,
  isLoading,
}: {
  title: string
  value: number
  icon: React.ElementType
  trend: 'up' | 'down' | 'neutral'
  color: 'income' | 'expense' | 'accent'
  isLoading: boolean
}) {
  const colorMap = {
    income:  { bg: 'bg-income/10',  text: 'text-income',  icon: 'text-income', border: 'group-hover:border-income/30' },
    expense: { bg: 'bg-expense/10', text: 'text-expense', icon: 'text-expense', border: 'group-hover:border-expense/30' },
    accent:  { bg: 'bg-accent/10',  text: 'text-accent',  icon: 'text-accent', border: 'group-hover:border-accent/30' },
  }

  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : null
  const c = colorMap[color]

  return (
    <div className={`group bg-bg-card border border-border-app/60 rounded-2xl p-6 flex flex-col gap-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 ${c.border} relative overflow-hidden`}>
      {/* Glow sutil no hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        <span className="text-sm font-medium text-text-secondary tracking-wide">{title}</span>
        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center shadow-inner`}>
          <Icon size={18} className={c.icon} />
        </div>
      </div>
      
      {isLoading ? (
        <div className="h-9 w-36 bg-bg-secondary rounded-lg animate-pulse relative z-10" />
      ) : (
        <div className="flex items-end justify-between relative z-10">
          <span className={`text-3xl font-semibold tracking-tight ${c.text}`}>
            {formatCurrency(value)}
          </span>
          {TrendIcon && (
            <div className={`flex items-center gap-1 text-xs font-medium ${c.text} ${c.bg} px-2.5 py-1.5 rounded-lg`}>
              <TrendIcon size={14} />
              {trend === 'up' ? 'Entrada' : 'Saída'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['summary', startDate, endDate],
    queryFn: () => getSummary(startDate, endDate),
  })

  const { data: monthly, isLoading: monthlyLoading } = useQuery({
    queryKey: ['monthly-summary', currentYear],
    queryFn: () => getMonthlySummary(currentYear),
  })

  const { data: breakdown, isLoading: breakdownLoading } = useCategoryBreakdown()

  const rawData = monthly?.map((m) => ({
    name: getMonthName(m.month),
    income: m.income,
    expense: m.expense,
  })) ?? []

  const chartData = rawData.map((d, i) => {
    const slice = rawData.slice(0, i + 1)
    const avg = slice.reduce((acc, s) => acc + (s.income - s.expense), 0) / slice.length
    return { ...d, trend: Math.max(0, avg) }
  })

  const balance = summary?.balance ?? 0
  const balancePositive = balance >= 0

  const monthLabel = new Intl.DateTimeFormat('pt-BR', {
    month: 'long', year: 'numeric',
  }).format(new Date())

  return (
    <div className="p-8 flex flex-col gap-8 max-w-[1600px] mx-auto w-full">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-medium text-text-primary tracking-tight">Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1.5">
            {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
          </p>
        </div>
        <div className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
          balancePositive
            ? 'bg-income/10 border-income/20 text-income shadow-[0_0_20px_rgba(34,197,94,0.15)]'
            : 'bg-expense/10 border-expense/20 text-expense shadow-[0_0_20px_rgba(239,68,68,0.15)]'
        }`}>
          {balancePositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          Saldo: {formatCurrency(balance)}
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-3 gap-6">
        <SummaryCard
          title="Receitas do mês"
          value={summary?.totalIncome ?? 0}
          icon={TrendingUp}
          trend="up"
          color="income"
          isLoading={summaryLoading}
        />
        <SummaryCard
          title="Despesas do mês"
          value={summary?.totalExpense ?? 0}
          icon={TrendingDown}
          trend="down"
          color="expense"
          isLoading={summaryLoading}
        />
        <SummaryCard
          title="Saldo atual"
          value={balance}
          icon={Wallet}
          trend="neutral"
          color="accent"
          isLoading={summaryLoading}
        />
      </div>

      {/* Donut + maior gasto */}
      <div className="grid grid-cols-3 gap-6">

        <div className="col-span-2 bg-bg-card border border-border-app/60 rounded-2xl p-7 shadow-sm">
          <div className="mb-6">
            <h2 className="text-base font-medium text-text-primary tracking-wide">Gastos por categoria</h2>
            <p className="text-xs text-text-secondary mt-1">Distribuição de despesas do mês atual</p>
          </div>
          <CategoryDonut
            data={breakdown ?? []}
            isLoading={breakdownLoading}
          />
        </div>

        <div className="bg-bg-card border border-border-app/60 rounded-2xl p-7 flex flex-col gap-5 shadow-sm">
          <div>
            <h2 className="text-base font-medium text-text-primary tracking-wide">Maior gasto</h2>
            <p className="text-xs text-text-secondary mt-1">Principal ofensor do mês</p>
          </div>
          
          {breakdownLoading ? (
            <div className="flex flex-col gap-3 mt-2">
              <div className="h-5 w-24 bg-bg-secondary rounded animate-pulse" />
              <div className="h-8 w-32 bg-bg-secondary rounded animate-pulse" />
              <div className="h-2 w-full bg-bg-secondary rounded-full animate-pulse mt-3" />
            </div>
          ) : breakdown && breakdown.length > 0 ? (
            <div className="flex flex-col gap-4 mt-auto mb-auto">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                  style={{ background: breakdown[0].color, boxShadow: `0 0 10px ${breakdown[0].color}80` }}
                />
                <span className="text-sm font-medium text-text-primary">{breakdown[0].name}</span>
              </div>
              <span className="text-3xl font-semibold tracking-tight text-expense">
                {formatCurrency(breakdown[0].value)}
              </span>
              
              <div className="flex flex-col gap-2.5 mt-2">
                <div className="h-2 bg-bg-primary rounded-full overflow-hidden relative">
                  <div
                    className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${breakdown[0].percentage}%`,
                      background: breakdown[0].color,
                      boxShadow: `0 0 10px ${breakdown[0].color}`,
                    }}
                  />
                </div>
                <div className="flex justify-between items-center text-xs text-text-secondary">
                  <span>Representatividade</span>
                  <span className="font-medium text-text-primary">{breakdown[0].percentage}%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center gap-2 opacity-60">
              <TrendingDown size={32} className="text-text-secondary" />
              <p className="text-sm text-text-secondary">Nenhuma despesa registrada<br/>este mês.</p>
            </div>
          )}
        </div>

      </div>

      {/* Gráfico de evolução */}
      <div className="bg-bg-card border border-border-app/60 rounded-2xl p-7 shadow-sm">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-base font-medium text-text-primary tracking-wide">Evolução financeira</h2>
            <p className="text-xs text-text-secondary mt-1">Comparativo de receitas e despesas em {currentYear}</p>
          </div>
          <div className="flex items-center gap-6 bg-bg-primary px-4 py-2.5 rounded-xl border border-border-app/50">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-income shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
              <span className="text-xs font-medium text-text-secondary">Receitas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-expense shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
              <span className="text-xs font-medium text-text-secondary">Despesas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_8px_rgba(108,99,255,0.4)]" />
              <span className="text-xs font-medium text-text-secondary">Tendência</span>
            </div>
          </div>
        </div>

        {monthlyLoading ? (
          <div className="h-[280px] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--color-income)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--color-expense)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--color-expense)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-app)" opacity={0.5} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fill: 'var(--color-text-secondary)', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} width={56} dx={-10} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--color-border-app)', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area type="monotone" dataKey="income" stroke="var(--color-income)" strokeWidth={3} fill="url(#incomeGrad)" dot={false} activeDot={{ r: 5, fill: 'var(--color-income)', strokeWidth: 0 }} />
              <Area type="monotone" dataKey="expense" stroke="var(--color-expense)" strokeWidth={2.5} fill="url(#expenseGrad)" dot={false} activeDot={{ r: 5, fill: 'var(--color-expense)', strokeWidth: 0 }} />
              <Line type="monotone" dataKey="trend" stroke="var(--color-accent)" strokeWidth={2} strokeDasharray="6 4" dot={false} activeDot={{ r: 4, fill: 'var(--color-accent)', strokeWidth: 0 }} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
        
      </div>
      
      <RecentTransactions />

    </div>
  )
}