import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Download } from 'lucide-react'
import { useForm } from 'react-hook-form'
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  exportTransactionsCsv,
} from '@/api/transactions'
import { useCategories } from '@/hooks/useCategories'
import { formatCurrency } from '@/utils/currency'
import { formatDate, getCurrentMonthRange } from '@/utils/date'
import type { TransactionResponseDTO } from '@/types/api'

type FormData = {
  description: string
  amount: number
  transactionDate: string
  categoryId: string
}

export default function TransactionsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<TransactionResponseDTO | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const { startDate, endDate } = getCurrentMonthRange()

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', page],
    queryFn: () => getTransactions(page, 10),
  })

  const { data: categoriesPage } = useCategories()
  const categories = categoriesPage?.content ?? []

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>()

  const createMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
      queryClient.invalidateQueries({ queryKey: ['monthly-summary'] })
      closeModal()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: FormData }) =>
      updateTransaction(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
      queryClient.invalidateQueries({ queryKey: ['monthly-summary'] })
      closeModal()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
      queryClient.invalidateQueries({ queryKey: ['monthly-summary'] })
      setDeleteConfirm(null)
    },
  })

  function openCreate() {
    setEditing(null)
    reset({
      description: '',
      amount: 0,
      transactionDate: new Date().toISOString().split('T')[0],
      categoryId: '',
    })
    setModalOpen(true)
  }

  function openEdit(tx: TransactionResponseDTO) {
    setEditing(tx)
    reset({
      description: tx.description,
      amount: tx.amount,
      transactionDate: tx.transactionDate,
      categoryId: tx.category.id,
    })
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditing(null)
    reset()
  }

  async function onSubmit(data: FormData) {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, dto: data })
    } else {
      await createMutation.mutateAsync(data)
    }
  }

  const totalPages = data?.totalPages ?? 1

  return (
    <div className="p-8 flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-text-primary">Transações</h1>
          <p className="text-sm text-text-secondary mt-1">
            {data?.totalElements ?? 0} registros encontrados
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportTransactionsCsv(startDate, endDate)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border-app text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer"
          >
            <Download size={15} />
            Exportar CSV
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors cursor-pointer"
          >
            <Plus size={15} />
            Nova transação
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-bg-card border border-border-app rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-app">
              <th className="text-left px-5 py-3 text-xs font-medium text-text-secondary">Descrição</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-text-secondary">Categoria</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-text-secondary">Data</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-text-secondary">Valor</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border-app">
                  <td className="px-5 py-4"><div className="h-4 w-40 bg-bg-secondary rounded animate-pulse" /></td>
                  <td className="px-5 py-4"><div className="h-4 w-24 bg-bg-secondary rounded animate-pulse" /></td>
                  <td className="px-5 py-4"><div className="h-4 w-20 bg-bg-secondary rounded animate-pulse" /></td>
                  <td className="px-5 py-4"><div className="h-4 w-24 bg-bg-secondary rounded animate-pulse ml-auto" /></td>
                  <td className="px-5 py-4" />
                </tr>
              ))
            ) : data?.content.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-sm text-text-secondary">
                  Nenhuma transação encontrada.
                </td>
              </tr>
            ) : (
              data?.content.map((tx) => (
                <tr key={tx.id} className="border-b border-border-app last:border-0 hover:bg-bg-secondary/50 transition-colors">
                  <td className="px-5 py-4 text-sm text-text-primary">{tx.description}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      tx.category.type === 'INCOME'
                        ? 'bg-income/10 text-income'
                        : 'bg-expense/10 text-expense'
                    }`}>
                      {tx.category.name}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-text-secondary">{formatDate(tx.transactionDate)}</td>
                  <td className={`px-5 py-4 text-sm font-medium text-right ${
                    tx.category.type === 'INCOME' ? 'text-income' : 'text-expense'
                  }`}>
                    {tx.category.type === 'INCOME' ? '+' : '-'} {formatCurrency(tx.amount)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(tx)}
                        className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(tx.id)}
                        className="p-1.5 rounded-lg text-text-secondary hover:text-expense hover:bg-bg-secondary transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border-app">
            <span className="text-xs text-text-secondary">
              Página {page + 1} de {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 rounded-lg text-xs border border-border-app text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="px-3 py-1.5 rounded-lg text-xs border border-border-app text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal criar/editar */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-bg-card border border-border-app rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-base font-medium text-text-primary mb-5">
              {editing ? 'Editar transação' : 'Nova transação'}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

              <div className="flex flex-col gap-1">
                <label className="text-sm text-text-secondary">Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Supermercado"
                  className="bg-bg-secondary border border-border-app rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary outline-none focus:ring-2 focus:ring-accent transition-all"
                  {...register('description', { required: 'Descrição obrigatória' })}
                />
                {errors.description && (
                  <span className="text-xs text-expense">{errors.description.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-text-secondary">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  className="bg-bg-secondary border border-border-app rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary outline-none focus:ring-2 focus:ring-accent transition-all"
                  {...register('amount', {
                    valueAsNumber: true,
                    required: 'Valor obrigatório',
                    min: { value: 0.01, message: 'Valor deve ser maior que zero' },
                  })}
                />
                {errors.amount && (
                  <span className="text-xs text-expense">{errors.amount.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-text-secondary">Data</label>
                <input
                  type="date"
                  className="bg-bg-secondary border border-border-app rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:ring-2 focus:ring-accent transition-all"
                  {...register('transactionDate', { required: 'Data obrigatória' })}
                />
                {errors.transactionDate && (
                  <span className="text-xs text-expense">{errors.transactionDate.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-text-secondary">Categoria</label>
                <select
                  className="bg-bg-secondary border border-border-app rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:ring-2 focus:ring-accent transition-all"
                  {...register('categoryId', { required: 'Categoria obrigatória' })}
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.type === 'INCOME' ? 'Receita' : 'Despesa'})
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <span className="text-xs text-expense">{errors.categoryId.message}</span>
                )}
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border-app text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Salvando...' : editing ? 'Salvar' : 'Criar'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal confirmar delete */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-bg-card border border-border-app rounded-xl p-6 w-full max-w-sm mx-4">
            <h2 className="text-base font-medium text-text-primary mb-2">Excluir transação</h2>
            <p className="text-sm text-text-secondary mb-5">
              Tem certeza? Essa ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-border-app text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirm)}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2.5 rounded-lg bg-expense hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
              >
                {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}