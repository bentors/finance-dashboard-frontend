import { useQuery } from '@tanstack/react-query'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { getSummary, getMonthlySummary } from '../api/transactions'
import { formatCurrency, } from '../utils/currency'
import { getCurrentMonthRange, getMonthName } from '../utils/date'

const { startDate, endDate } = getCurrentMonthRange()
const currentYear = new Date().getFullYear()

function SummaryCard({
  title,
  value,
  icon: Icon,
  color,
  isLoading,
}: {
  title: string
  value: number
  icon: React.ElementType
  color: string
  isLoading: boolean
}) {
  return (
    <div className="bg-bg-card border border-border-app rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-secondary">{title}</span>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={16} />
        </div>
      </div>
      {isLoading ? (
        <div className="h-7 w-32 bg-bg-secondary rounded animate-pulse" />
      ) : (
        <span className="text-2xl font-medium text-text-primary">
          {formatCurrency(value)}
        </span>
      )}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-card border border-border-app rounded-lg p-3 text-sm">
      <p className="text-text-secondary mb-2">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} style={{ color: entry.fill }} className="font-medium">
          {entry.name === 'income' ? 'Receita' : 'Despesa'}: {formatCurrency(entry.value)}
        </p>
      ))}
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

  const chartData = monthly?.map((m) => ({
    name: getMonthName(m.month),
    income: m.income,
    expense: m.expense,
  })) ?? []

  const balanceColor =
    (summary?.balance ?? 0) >= 0 ? 'text-income' : 'text-expense'

  return (
    <div className="p-8 flex flex-col gap-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-medium text-text-primary">Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">
          Resumo de {new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date())}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard
          title="Receitas"
          value={summary?.totalIncome ?? 0}
          icon={TrendingUp}
          color="bg-income/10 text-income"
          isLoading={summaryLoading}
        />
        <SummaryCard
          title="Despesas"
          value={summary?.totalExpense ?? 0}
          icon={TrendingDown}
          color="bg-expense/10 text-expense"
          isLoading={summaryLoading}
        />
        <SummaryCard
          title="Saldo"
          value={summary?.balance ?? 0}
          icon={Wallet}
          color="bg-accent/10 text-accent"
          isLoading={summaryLoading}
        />
      </div>

      {/* Saldo com cor dinâmica */}
      {!summaryLoading && (
        <div className="bg-bg-card border border-border-app rounded-xl p-5">
          <p className="text-sm text-text-secondary mb-1">Saldo do mês</p>
          <p className={`text-3xl font-medium ${balanceColor}`}>
            {formatCurrency(summary?.balance ?? 0)}
          </p>
        </div>
      )}

      {/* Gráfico mensal */}
      <div className="bg-bg-card border border-border-app rounded-xl p-5">
        <div className="mb-5">
          <h2 className="text-sm font-medium text-text-primary">Evolução mensal</h2>
          <p className="text-xs text-text-secondary mt-0.5">Receitas e despesas em {currentYear}</p>
        </div>

        {monthlyLoading ? (
          <div className="h-56 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={224}>
            <BarChart data={chartData} barGap={4} barSize={10}>
              <XAxis
                dataKey="name"
                tick={{ fill: '#A1A1AA', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#A1A1AA', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                width={48}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="income" radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill="#22C55E" opacity={0.85} />
                ))}
              </Bar>
              <Bar dataKey="expense" radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill="#EF4444" opacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* Legenda */}
        <div className="flex items-center gap-5 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm bg-income" />
            <span className="text-xs text-text-secondary">Receitas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm bg-expense" />
            <span className="text-xs text-text-secondary">Despesas</span>
          </div>
        </div>
      </div>

    </div>
  )
}