import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Download, Search, SlidersHorizontal, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  searchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  exportTransactionsCsv,
  getTransactions,
} from '@/api/transactions'
import { useCategories } from '@/hooks/useCategories'
import { formatCurrency } from '@/utils/currency'
import { formatDate, getCurrentMonthRange } from '@/utils/date'
import type { TransactionResponseDTO, CategoryType } from '@/types/api'

type TransactionFormData = {
  description: string
  amount: number
  transactionDate: string
  categoryId: string
}

type Filters = {
  description: string
  categoryId: string
  type: CategoryType | ''
  startDate: string
  endDate: string
}

function EmptyState() {
  return (
    <tr>
      <td colSpan={5}>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-14 h-14 rounded-2xl bg-bg-primary border border-border-app/50 shadow-inner flex items-center justify-center relative">
            <div className="absolute inset-0 bg-accent/5 blur-md rounded-2xl" />
            <SlidersHorizontal size={24} className="text-text-secondary relative z-10" />
          </div>
          <div className="text-center">
            <p className="text-base font-medium text-text-primary tracking-wide">Nenhuma transação encontrada</p>
            <p className="text-sm text-text-secondary mt-1">Tente ajustar os filtros ou crie uma nova transação</p>
          </div>
        </div>
      </td>
    </tr>
  )
}

export default function TransactionsPage() {
  const queryClient = useQueryClient()
  const { startDate: defaultStart, endDate: defaultEnd } = getCurrentMonthRange()

  const [page, setPage] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<TransactionResponseDTO | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [filters, setFilters] = useState<Filters>({
    description: '',
    categoryId: '',
    type: '',
    startDate: defaultStart,
    endDate: defaultEnd,
  })

  const [pendingFilters, setPendingFilters] = useState<Filters>(filters)

    const { data, isLoading } = useQuery({
    queryKey: ['transactions', page, filters],
    queryFn: () => {
        const hasTextFilters =
        filters.description !== '' ||
        filters.categoryId !== '' ||
        filters.type !== '' ||
        filters.startDate !== defaultStart ||
        filters.endDate !== defaultEnd

        if (hasTextFilters) {
        return searchTransactions({
            description: filters.description || undefined,
            categoryId: filters.categoryId || undefined,
            type: (filters.type as 'INCOME' | 'EXPENSE') || undefined,
            startDate: filters.startDate,
            endDate: filters.endDate,
            page,
            size: 10,
        })
        }

        return getTransactions(page, 10)
    },
    })

  const { data: categoriesPage } = useCategories()
  const categories = categoriesPage?.content ?? []

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>()

  const createMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
      queryClient.invalidateQueries({ queryKey: ['monthly-summary'] })
      queryClient.invalidateQueries({ queryKey: ['recent-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['category-breakdown'] })
      toast.success('Transação criada com sucesso')
      closeModal()
    },
    onError: () => toast.error('Erro ao criar transação'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: TransactionFormData }) =>
      updateTransaction(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
      queryClient.invalidateQueries({ queryKey: ['monthly-summary'] })
      queryClient.invalidateQueries({ queryKey: ['recent-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['category-breakdown'] })
      toast.success('Transação atualizada com sucesso')
      closeModal()
    },
    onError: () => toast.error('Erro ao atualizar transação'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
      queryClient.invalidateQueries({ queryKey: ['monthly-summary'] })
      queryClient.invalidateQueries({ queryKey: ['recent-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['category-breakdown'] })
      toast.success('Transação excluída')
      setDeleteConfirm(null)
    },
    onError: () => toast.error('Erro ao excluir transação'),
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

  async function onSubmit(data: TransactionFormData) {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, dto: data })
    } else {
      await createMutation.mutateAsync(data)
    }
  }

  function applyFilters() {
    setFilters(pendingFilters)
    setPage(0)
    setFiltersOpen(false)
  }

  function clearFilters() {
    const cleared: Filters = {
      description: '',
      categoryId: '',
      type: '',
      startDate: defaultStart,
      endDate: defaultEnd,
    }
    setFilters(cleared)
    setPendingFilters(cleared)
    setPage(0)
  }

  const hasActiveFilters =
    filters.description !== '' ||
    filters.categoryId !== '' ||
    filters.type !== '' ||
    filters.startDate !== defaultStart ||
    filters.endDate !== defaultEnd

  const totalPages = data?.totalPages ?? 1
  const totalElements = data?.totalElements ?? 0

  return (
    <div className="p-8 flex flex-col gap-8 max-w-[1600px] mx-auto w-full">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-text-primary tracking-tight">Transações</h1>
          <p className="text-sm text-text-secondary mt-1.5">
            {totalElements > 0 ? `${totalElements} registros encontrados` : 'Nenhum registro ainda'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportTransactionsCsv(filters.startDate, filters.endDate)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border-app text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary hover:border-border-app/80 transition-all cursor-pointer shadow-sm"
          >
            <Download size={16} />
            Exportar CSV
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-all shadow-[0_4px_14px_0_rgba(108,99,255,0.2)] hover:shadow-[0_6px_20px_rgba(108,99,255,0.3)] cursor-pointer"
          >
            <Plus size={16} />
            Nova transação
          </button>
        </div>
      </div>

      {/* Barra de busca + filtros */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md group">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors" />
          <input
            type="text"
            placeholder="Buscar por descrição..."
            value={pendingFilters.description}
            onChange={(e) => setPendingFilters((f) => ({ ...f, description: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            className="w-full bg-bg-card border border-border-app/60 rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-sm"
          />
        </div>

        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all cursor-pointer shadow-sm ${
            filtersOpen || hasActiveFilters
              ? 'border-accent/40 bg-accent/10 text-accent'
              : 'border-border-app/60 text-text-secondary hover:text-text-primary hover:bg-bg-card'
          }`}
        >
          <SlidersHorizontal size={15} />
          Filtros
          {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-expense transition-colors cursor-pointer"
          >
            <X size={13} />
            Limpar
          </button>
        )}
      </div>

      {/* Painel de filtros avançados */}
      {filtersOpen && (
        <div className="bg-bg-card border border-border-app/60 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Filtros avançados</p>

          <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary uppercase tracking-wider ml-1">Data inicial</label>
              <input
                type="date"
                value={pendingFilters.startDate}
                onChange={(e) => setPendingFilters((f) => ({ ...f, startDate: e.target.value }))}
                className="bg-bg-primary border border-border-app rounded-xl px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-inner [color-scheme:dark]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary uppercase tracking-wider ml-1">Data final</label>
              <input
                type="date"
                value={pendingFilters.endDate}
                onChange={(e) => setPendingFilters((f) => ({ ...f, endDate: e.target.value }))}
                className="bg-bg-primary border border-border-app rounded-xl px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-inner [color-scheme:dark]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary uppercase tracking-wider ml-1">Tipo</label>
              <select
                value={pendingFilters.type}
                onChange={(e) => setPendingFilters((f) => ({ ...f, type: e.target.value as CategoryType | '' }))}
                className="bg-bg-primary border border-border-app rounded-xl px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-inner appearance-none"
              >
                <option value="">Todos</option>
                <option value="INCOME">Receitas</option>
                <option value="EXPENSE">Despesas</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary uppercase tracking-wider ml-1">Categoria</label>
              <select
                value={pendingFilters.categoryId}
                onChange={(e) => setPendingFilters((f) => ({ ...f, categoryId: e.target.value }))}
                className="bg-bg-primary border border-border-app rounded-xl px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-inner appearance-none"
              >
                <option value="">Todas</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              onClick={() => setFiltersOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-border-app text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={applyFilters}
              className="px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-all shadow-[0_4px_14px_0_rgba(108,99,255,0.2)] hover:shadow-[0_6px_20px_rgba(108,99,255,0.3)] cursor-pointer"
            >
              Aplicar filtros
            </button>
          </div>
        </div>
      )}

      {/* Tags de filtros ativos */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap -mt-4">
          <span className="text-xs text-text-secondary">Filtrando por:</span>
          {filters.type && (
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              filters.type === 'INCOME' ? 'bg-income/10 text-income' : 'bg-expense/10 text-expense'
            }`}>
              {filters.type === 'INCOME' ? 'Receitas' : 'Despesas'}
            </span>
          )}
          {filters.categoryId && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent font-medium">
              {categories.find((c) => c.id === filters.categoryId)?.name}
            </span>
          )}
          {filters.description && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-bg-card border border-border-app text-text-secondary">
              "{filters.description}"
            </span>
          )}
          {(filters.startDate !== defaultStart || filters.endDate !== defaultEnd) && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-bg-card border border-border-app text-text-secondary">
              {filters.startDate} → {filters.endDate}
            </span>
          )}
        </div>
      )}

      {/* Tabela */}
      <div className="bg-bg-card border border-border-app/60 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border-app/60 bg-bg-secondary/30">
              <th className="text-left px-6 py-4 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Descrição</th>
              <th className="text-left px-6 py-4 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Categoria</th>
              <th className="text-left px-6 py-4 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Data</th>
              <th className="text-right px-6 py-4 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Valor</th>
              <th className="px-6 py-4" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border-app/40 last:border-0">
                  <td className="px-6 py-4"><div className="h-4 w-48 bg-bg-secondary rounded animate-pulse" /></td>
                  <td className="px-6 py-4"><div className="h-5 w-24 bg-bg-secondary rounded-full animate-pulse" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-20 bg-bg-secondary rounded animate-pulse" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-28 bg-bg-secondary rounded animate-pulse ml-auto" /></td>
                  <td className="px-6 py-4" />
                </tr>
              ))
            ) : data?.content.length === 0 ? (
              <EmptyState />
            ) : (
              data?.content.map((tx) => (
                <tr
                  key={tx.id}
                  className="group border-b border-border-app/40 last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-1 h-8 rounded-full flex-shrink-0 shadow-sm ${
                        tx.category.type === 'INCOME'
                          ? 'bg-income shadow-[0_0_8px_rgba(34,197,94,0.4)]'
                          : 'bg-expense shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                      }`} />
                      <span className="text-sm font-medium text-text-primary group-hover:text-white transition-colors">
                        {tx.description}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1.5 rounded-lg font-medium border ${
                      tx.category.type === 'INCOME'
                        ? 'bg-income/10 text-income border-income/20'
                        : 'bg-expense/10 text-expense border-expense/20'
                    }`}>
                      {tx.category.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">
                    {formatDate(tx.transactionDate)}
                  </td>
                  <td className={`px-6 py-4 text-sm font-semibold text-right tracking-tight ${
                    tx.category.type === 'INCOME' ? 'text-income' : 'text-expense'
                  }`}>
                    {tx.category.type === 'INCOME' ? '+' : '−'} {formatCurrency(tx.amount)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(tx)}
                        className="p-2 rounded-lg text-text-secondary hover:text-white hover:bg-bg-secondary transition-colors cursor-pointer"
                        title="Editar transação"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(tx.id)}
                        className="p-2 rounded-lg text-text-secondary hover:text-expense hover:bg-expense/10 transition-colors cursor-pointer"
                        title="Excluir transação"
                      >
                        <Trash2 size={15} />
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
          <div className="flex items-center justify-between px-6 py-4 border-t border-border-app/60 bg-bg-primary/20">
            <span className="text-xs font-medium text-text-secondary">
              Página {page + 1} de {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3.5 py-2 rounded-xl text-xs font-medium border border-border-app/80 text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="px-3.5 py-2 rounded-xl text-xs font-medium border border-border-app/80 text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-bg-card border border-border-app/80 rounded-2xl p-7 w-full max-w-md mx-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-3.5 mb-7">
              <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shadow-inner">
                {editing ? <Pencil size={18} className="text-accent" /> : <Plus size={18} className="text-accent" />}
              </div>
              <div>
                <h2 className="text-lg font-medium text-text-primary tracking-wide">
                  {editing ? 'Editar transação' : 'Nova transação'}
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  {editing ? 'Atualize os dados abaixo' : 'Preencha os dados da nova transação'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary uppercase tracking-wider ml-1">Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Supermercado"
                  className="w-full bg-bg-primary border border-border-app rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-inner"
                  {...register('description', { required: 'Descrição obrigatória' })}
                />
                {errors.description && (
                  <span className="text-xs text-expense ml-1 font-medium">{errors.description.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary uppercase tracking-wider ml-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  className="w-full bg-bg-primary border border-border-app rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-inner"
                  {...register('amount', {
                    valueAsNumber: true,
                    required: 'Valor obrigatório',
                    min: { value: 0.01, message: 'Valor deve ser maior que zero' },
                  })}
                />
                {errors.amount && (
                  <span className="text-xs text-expense ml-1 font-medium">{errors.amount.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary uppercase tracking-wider ml-1">Data</label>
                <input
                  type="date"
                  className="w-full bg-bg-primary border border-border-app rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-inner [color-scheme:dark]"
                  {...register('transactionDate', { required: 'Data obrigatória' })}
                />
                {errors.transactionDate && (
                  <span className="text-xs text-expense ml-1 font-medium">{errors.transactionDate.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary uppercase tracking-wider ml-1">Categoria</label>
                <select
                  className="w-full bg-bg-primary border border-border-app rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-inner appearance-none"
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
                  <span className="text-xs text-expense ml-1 font-medium">{errors.categoryId.message}</span>
                )}
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 rounded-xl border border-border-app text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-all shadow-[0_4px_14px_0_rgba(108,99,255,0.2)] hover:shadow-[0_6px_20px_rgba(108,99,255,0.3)] disabled:opacity-50 disabled:shadow-none cursor-pointer"
                >
                  {isSubmitting ? 'Salvando...' : editing ? 'Salvar alterações' : 'Criar transação'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal confirmar delete */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-bg-card border border-border-app/80 rounded-2xl p-7 w-full max-w-sm mx-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-expense/10 border border-expense/20 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                <Trash2 size={20} className="text-expense" />
              </div>
              <h2 className="text-lg font-medium text-text-primary tracking-wide">Excluir transação</h2>
              <p className="text-sm text-text-secondary mt-2">
                Tem certeza que deseja excluir? Essa ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-3 rounded-xl border border-border-app text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirm)}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-3 rounded-xl bg-expense hover:bg-red-600 text-white text-sm font-medium transition-all shadow-[0_4px_14px_0_rgba(239,68,68,0.2)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.3)] disabled:opacity-50 disabled:shadow-none cursor-pointer"
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