import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Tag } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/api/categories'
import type { CategoryResponseDTO, CategoryType } from '@/types/api'
import { toast } from 'sonner'

type FormData = {
  name: string
  type: CategoryType
}

function EmptyColumn({ type }: { type: 'INCOME' | 'EXPENSE' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="w-10 h-10 rounded-xl bg-bg-secondary flex items-center justify-center">
        <Tag size={16} className="text-text-secondary" />
      </div>
      <p className="text-sm text-text-secondary text-center">
        Nenhuma categoria de {type === 'INCOME' ? 'receita' : 'despesa'} ainda
      </p>
    </div>
  )
}

export default function CategoriesPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CategoryResponseDTO | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
  })

  const categories = data?.content ?? []
  const income  = categories.filter((c) => c.type === 'INCOME')
  const expense = categories.filter((c) => c.type === 'EXPENSE')

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ defaultValues: { type: 'INCOME' } })

  const selectedType = useWatch({ control, name: 'type' })

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Categoria criada com sucesso')
      closeModal()
    },
    onError: () => {
      toast.error('Erro ao criar categoria')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: FormData }) =>
      updateCategory(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Categoria atualizada com sucesso')
      closeModal()
    },
    onError: () => {
      toast.error('Erro ao atualizar categoria')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Categoria excluída')
      setDeleteConfirm(null)
    },
    onError: () => {
      toast.error('Erro ao excluir categoria')
    },
  })

  function openCreate(type: CategoryType) {
    setEditing(null)
    reset({ name: '', type })
    setModalOpen(true)
  }

  function openEdit(cat: CategoryResponseDTO) {
    setEditing(cat)
    reset({ name: cat.name, type: cat.type })
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

  const skeletonRows = Array.from({ length: 3 })

  return (
    <div className="p-8 flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-medium text-text-primary">Categorias</h1>
          <p className="text-sm text-text-secondary mt-1">
            {categories.length > 0
              ? `${income.length} de receita · ${expense.length} de despesa`
              : 'Nenhuma categoria cadastrada'}
          </p>
        </div>
        <button
          onClick={() => openCreate('INCOME')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors cursor-pointer"
        >
          <Plus size={15} />
          Nova categoria
        </button>
      </div>

      {/* Colunas */}
      <div className="grid grid-cols-2 gap-6">

        {/* Receitas */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-income" />
              <span className="text-sm font-medium text-text-primary">Receitas</span>
              <span className="text-xs text-text-secondary bg-bg-card border border-border-app px-2 py-0.5 rounded-full">
                {income.length}
              </span>
            </div>
            <button
              onClick={() => openCreate('INCOME')}
              className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-income transition-colors cursor-pointer"
            >
              <Plus size={12} />
              Adicionar
            </button>
          </div>

          <div className="bg-bg-card border border-border-app rounded-2xl overflow-hidden">
            {isLoading ? (
              skeletonRows.map((_, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3.5 border-b border-border-app last:border-0">
                  <div className="h-4 w-32 bg-bg-secondary rounded animate-pulse" />
                  <div className="h-6 w-16 bg-bg-secondary rounded animate-pulse" />
                </div>
              ))
            ) : income.length === 0 ? (
              <EmptyColumn type="INCOME" />
            ) : (
              income.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between px-4 py-3.5 border-b border-border-app last:border-0 hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 rounded-full bg-income opacity-60" />
                    <span className="text-sm text-text-primary">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(cat.id)}
                      className="p-1.5 rounded-lg text-text-secondary hover:text-expense hover:bg-expense/5 transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Despesas */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-expense" />
              <span className="text-sm font-medium text-text-primary">Despesas</span>
              <span className="text-xs text-text-secondary bg-bg-card border border-border-app px-2 py-0.5 rounded-full">
                {expense.length}
              </span>
            </div>
            <button
              onClick={() => openCreate('EXPENSE')}
              className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-expense transition-colors cursor-pointer"
            >
              <Plus size={12} />
              Adicionar
            </button>
          </div>

          <div className="bg-bg-card border border-border-app rounded-2xl overflow-hidden">
            {isLoading ? (
              skeletonRows.map((_, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3.5 border-b border-border-app last:border-0">
                  <div className="h-4 w-32 bg-bg-secondary rounded animate-pulse" />
                  <div className="h-6 w-16 bg-bg-secondary rounded animate-pulse" />
                </div>
              ))
            ) : expense.length === 0 ? (
              <EmptyColumn type="EXPENSE" />
            ) : (
              expense.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between px-4 py-3.5 border-b border-border-app last:border-0 hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 rounded-full bg-expense opacity-60" />
                    <span className="text-sm text-text-primary">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(cat.id)}
                      className="p-1.5 rounded-lg text-text-secondary hover:text-expense hover:bg-expense/5 transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Modal criar/editar */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-bg-card border border-border-app rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
                {editing ? <Pencil size={14} className="text-accent" /> : <Plus size={14} className="text-accent" />}
              </div>
              <h2 className="text-base font-medium text-text-primary">
                {editing ? 'Editar categoria' : 'Nova categoria'}
              </h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-text-secondary">Nome</label>
                <input
                  type="text"
                  placeholder="Ex: Alimentação"
                  className="bg-bg-secondary border border-border-app rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
                  {...register('name', { required: 'Nome obrigatório' })}
                />
                {errors.name && (
                  <span className="text-xs text-expense">{errors.name.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-text-secondary">Tipo</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['INCOME', 'EXPENSE'] as CategoryType[]).map((type) => {
                    const isSelected = selectedType === type
                    const isIncome = type === 'INCOME'
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setValue('type', type)}
                        className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all ${
                          isSelected
                            ? isIncome
                              ? 'border-income/40 bg-income/10 text-income'
                              : 'border-expense/40 bg-expense/10 text-expense'
                            : 'border-border-app text-text-secondary hover:bg-bg-secondary'
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${isIncome ? 'bg-income' : 'bg-expense'}`} />
                        {isIncome ? 'Receita' : 'Despesa'}
                      </button>
                    )
                  })}
                </div>
                <input type="hidden" {...register('type', { required: true })} />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border-app text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-bg-card border border-border-app rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-expense/10 flex items-center justify-center">
                <Trash2 size={14} className="text-expense" />
              </div>
              <h2 className="text-base font-medium text-text-primary">Excluir categoria</h2>
            </div>
            <p className="text-sm text-text-secondary mb-6">
              Tem certeza? Transações vinculadas podem ser afetadas.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border-app text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirm)}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2.5 rounded-xl bg-expense hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
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