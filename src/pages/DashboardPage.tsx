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
    <div className="bg-bg-card border border-border-app rounded-xl p-3 text-sm shadow-xl">
      <p className="text-text-secondary mb-2 text-xs">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.stroke ?? entry.fill }} />
          <span className="text-text-secondary text-xs">
            {entry.name === 'income' ? 'Receitas' : entry.name === 'expense' ? 'Despesas' : 'Tendência'}:
          </span>
          <span className="font-medium text-text-primary text-xs">
            {entry.name === 'trend' ? '' : formatCurrency(entry.value)}
          </span>
        </div>
      ))}
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
    income:  { bg: 'bg-income/10',  text: 'text-income',  icon: 'text-income'  },
    expense: { bg: 'bg-expense/10', text: 'text-expense', icon: 'text-expense' },
    accent:  { bg: 'bg-accent/10',  text: 'text-accent',  icon: 'text-accent'  },
  }

  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : null
  const c = colorMap[color]

  return (
    <div className="bg-bg-card border border-border-app rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-secondary">{title}</span>
        <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon size={16} className={c.icon} />
        </div>
      </div>
      {isLoading ? (
        <div className="h-8 w-36 bg-bg-secondary rounded-lg animate-pulse" />
      ) : (
        <div className="flex items-end justify-between">
          <span className={`text-2xl font-medium ${c.text}`}>
            {formatCurrency(value)}
          </span>
          {TrendIcon && (
            <div className={`flex items-center gap-1 text-xs ${c.text} ${c.bg} px-2 py-1 rounded-lg`}>
              <TrendIcon size={12} />
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
    <div className="p-8 flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-medium text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1">
            {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
          </p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium ${
          balancePositive
            ? 'bg-income/10 border-income/20 text-income'
            : 'bg-expense/10 border-expense/20 text-expense'
        }`}>
          {balancePositive ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
          Saldo: {formatCurrency(balance)}
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-3 gap-4">
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
      <div className="grid grid-cols-3 gap-4">

        <div className="col-span-2 bg-bg-card border border-border-app rounded-2xl p-6">
          <div className="mb-4">
            <h2 className="text-sm font-medium text-text-primary">Gastos por categoria</h2>
            <p className="text-xs text-text-secondary mt-0.5">Despesas do mês atual</p>
          </div>
          <CategoryDonut
            data={breakdown ?? []}
            isLoading={breakdownLoading}
          />
        </div>

        <div className="bg-bg-card border border-border-app rounded-2xl p-6 flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-medium text-text-primary">Maior gasto</h2>
            <p className="text-xs text-text-secondary mt-0.5">Categoria do mês</p>
          </div>
          {breakdownLoading ? (
            <div className="flex flex-col gap-2">
              <div className="h-5 w-24 bg-bg-secondary rounded animate-pulse" />
              <div className="h-8 w-32 bg-bg-secondary rounded animate-pulse" />
              <div className="h-3 w-full bg-bg-secondary rounded animate-pulse mt-2" />
            </div>
          ) : breakdown && breakdown.length > 0 ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: breakdown[0].color }}
                />
                <span className="text-sm font-medium text-text-primary">{breakdown[0].name}</span>
              </div>
              <span className="text-2xl font-medium text-expense">
                {formatCurrency(breakdown[0].value)}
              </span>
              <div className="flex flex-col gap-1.5">
                <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${breakdown[0].percentage}%`,
                      background: breakdown[0].color,
                    }}
                  />
                </div>
                <span className="text-xs text-text-secondary">
                  {breakdown[0].percentage}% das despesas totais
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-text-secondary">Nenhuma despesa este mês</p>
          )}
        </div>

      </div>

      {/* Gráfico de evolução */}
      <div className="bg-bg-card border border-border-app rounded-2xl p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-sm font-medium text-text-primary">Evolução financeira</h2>
            <p className="text-xs text-text-secondary mt-0.5">Receitas e despesas em {currentYear}</p>
          </div>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-income" />
              <span className="text-xs text-text-secondary">Receitas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-expense" />
              <span className="text-xs text-text-secondary">Despesas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-accent" />
              <span className="text-xs text-text-secondary">Tendência</span>
            </div>
          </div>
        </div>

        {monthlyLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={256}>
            <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#22C55E" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#3F3F46" opacity={0.4} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#A1A1AA', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#A1A1AA', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} width={52} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="income" stroke="#22C55E" strokeWidth={2.5} fill="url(#incomeGrad)" dot={false} activeDot={{ r: 4, fill: '#22C55E', strokeWidth: 0 }} />
              <Area type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2} fill="url(#expenseGrad)" dot={false} activeDot={{ r: 4, fill: '#EF4444', strokeWidth: 0 }} />
              <Line type="monotone" dataKey="trend" stroke="#6C63FF" strokeWidth={2} strokeDasharray="5 4" dot={false} activeDot={{ r: 4, fill: '#6C63FF', strokeWidth: 0 }} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
        
      </div>
      
      <RecentTransactions />

    </div>
  )
}