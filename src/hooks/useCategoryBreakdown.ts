import { useQuery } from '@tanstack/react-query'
import { getTransactionsByCategory } from '@/api/transactions'
import { getCurrentMonthRange } from '@/utils/date'

export interface CategoryBreakdown {
  name: string
  value: number
  color: string
  percentage: number
}

const COLORS = [
  '#6C63FF', '#22C55E', '#EF4444', '#F59E0B',
  '#3B82F6', '#EC4899', '#14B8A6', '#F97316',
  '#8B5CF6', '#06B6D4',
]

export function useCategoryBreakdown() {
  const { startDate, endDate } = getCurrentMonthRange()

  return useQuery({
    queryKey: ['category-breakdown', startDate, endDate],
    queryFn: async (): Promise<CategoryBreakdown[]> => {
      const transactions = await getTransactionsByCategory(startDate, endDate)

      const expenseTransactions = transactions.filter(
        (tx) => tx.category.type === 'EXPENSE'
      )

      const grouped = expenseTransactions.reduce<Record<string, number>>(
        (acc, tx) => {
          const name = tx.category.name
          acc[name] = (acc[name] ?? 0) + tx.amount
          return acc
        },
        {}
      )

      const total = Object.values(grouped).reduce((a, b) => a + b, 0)

      return Object.entries(grouped)
        .sort(([, a], [, b]) => b - a)
        .map(([name, value], i) => ({
          name,
          value,
          color: COLORS[i % COLORS.length],
          percentage: total > 0 ? Math.round((value / total) * 100) : 0,
        }))
    },
  })
}