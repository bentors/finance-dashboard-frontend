import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { getRecentTransactions } from '@/api/transactions'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'

export default function RecentTransactions() {
  const navigate = useNavigate()

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: getRecentTransactions,
  })

  return (
    <div className="bg-bg-card border border-border-app rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-app">
        <div>
          <h2 className="text-sm font-medium text-text-primary">Últimas transações</h2>
          <p className="text-xs text-text-secondary mt-0.5">5 mais recentes</p>
        </div>
        <button
          onClick={() => navigate('/transactions')}
          className="flex items-center gap-1.5 text-xs text-accent hover:text-accent-hover transition-colors cursor-pointer"
        >
          Ver todas
          <ArrowRight size={13} />
        </button>
      </div>

      {/* Lista */}
      <div>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-5 py-3.5 border-b border-border-app last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 rounded-full bg-bg-secondary animate-pulse" />
                <div className="flex flex-col gap-1.5">
                  <div className="h-3.5 w-32 bg-bg-secondary rounded animate-pulse" />
                  <div className="h-3 w-20 bg-bg-secondary rounded animate-pulse" />
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <div className="h-3.5 w-20 bg-bg-secondary rounded animate-pulse" />
                <div className="h-3 w-14 bg-bg-secondary rounded animate-pulse" />
              </div>
            </div>
          ))
        ) : !transactions?.length ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-text-secondary">Nenhuma transação registrada ainda.</p>
          </div>
        ) : (
          transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between px-5 py-3.5 border-b border-border-app last:border-0 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-1 h-8 rounded-full flex-shrink-0 ${
                  tx.category.type === 'INCOME' ? 'bg-income' : 'bg-expense'
                }`} />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm text-text-primary truncate">{tx.description}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full w-fit mt-0.5 font-medium ${
                    tx.category.type === 'INCOME'
                      ? 'bg-income/10 text-income'
                      : 'bg-expense/10 text-expense'
                  }`}>
                    {tx.category.name}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end flex-shrink-0 ml-4">
                <span className={`text-sm font-medium ${
                  tx.category.type === 'INCOME' ? 'text-income' : 'text-expense'
                }`}>
                  {tx.category.type === 'INCOME' ? '+' : '−'} {formatCurrency(tx.amount)}
                </span>
                <span className="text-xs text-text-secondary mt-0.5">
                  {formatDate(tx.transactionDate)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  )
}