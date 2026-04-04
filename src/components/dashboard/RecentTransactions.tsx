import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, History } from 'lucide-react'
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
    <div className="bg-bg-card border border-border-app/60 rounded-2xl overflow-hidden shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border-app/60 bg-bg-secondary/20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-bg-secondary border border-border-app/50 flex items-center justify-center shadow-inner">
            <History size={16} className="text-text-secondary" />
          </div>
          <div>
            <h2 className="text-base font-medium text-text-primary tracking-wide">Últimas transações</h2>
            <p className="text-xs text-text-secondary mt-0.5">As 5 movimentações mais recentes</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/transactions')}
          className="group flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover transition-colors cursor-pointer"
        >
          Ver todas
          <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>

      {/* Lista */}
      <div>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-6 py-4 border-b border-border-app/40 last:border-0"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-1 h-8 rounded-full bg-bg-secondary animate-pulse" />
                <div className="flex flex-col gap-2">
                  <div className="h-4 w-40 bg-bg-secondary rounded animate-pulse" />
                  <div className="h-3 w-24 bg-bg-secondary rounded animate-pulse" />
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="h-4 w-24 bg-bg-secondary rounded animate-pulse" />
                <div className="h-3 w-16 bg-bg-secondary rounded animate-pulse" />
              </div>
            </div>
          ))
        ) : !transactions?.length ? (
          <div className="px-6 py-12 flex flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-text-primary tracking-wide">Nenhuma transação</p>
            <p className="text-xs text-text-secondary mt-1">As suas movimentações recentes aparecerão aqui.</p>
          </div>
        ) : (
          transactions.map((tx) => (
            <div
              key={tx.id}
              className="group flex items-center justify-between px-6 py-4 border-b border-border-app/40 last:border-0 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className={`w-1 h-8 rounded-full flex-shrink-0 shadow-sm ${
                  tx.category.type === 'INCOME' 
                    ? 'bg-income shadow-[0_0_8px_rgba(34,197,94,0.4)]' 
                    : 'bg-expense shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                }`} />
                <div className="flex flex-col min-w-0 gap-1.5">
                  <span className="text-sm font-medium text-text-primary truncate group-hover:text-white transition-colors">
                    {tx.description}
                  </span>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md w-fit font-semibold border ${
                    tx.category.type === 'INCOME'
                      ? 'bg-income/10 text-income border-income/20'
                      : 'bg-expense/10 text-expense border-expense/20'
                  }`}>
                    {tx.category.name}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end flex-shrink-0 ml-4">
                <span className={`text-sm font-semibold tracking-tight ${
                  tx.category.type === 'INCOME' ? 'text-income' : 'text-expense'
                }`}>
                  {tx.category.type === 'INCOME' ? '+' : '−'} {formatCurrency(tx.amount)}
                </span>
                <span className="text-xs font-medium text-text-secondary mt-1">
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