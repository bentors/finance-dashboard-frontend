import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/api/categories'
import type { CategoryResponseDTO, CategoryType } from '@/types/api'

type FormData = {
  name: string
  type: CategoryType
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>()

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      closeModal()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: FormData }) =>
      updateCategory(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      closeModal()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setDeleteConfirm(null)
    },
  })

  function openCreate() {
    setEditing(null)
    reset({ name: '', type: 'INCOME' })
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

  const income = categories.filter((c) => c.type === 'INCOME')
  const expense = categories.filter((c) => c.type === 'EXPENSE')

  return (
    <div className="p-8 flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-text-primary">Categorias</h1>
          <p className="text-sm text-text-secondary mt-1">
            {categories.length} categorias cadastradas
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors cursor-pointer"
        >
          <Plus size={15} />
          Nova categoria
        </button>
      </div>

      {/* Listas */}
      <div className="grid grid-cols-2 gap-6">

        {/* Receitas */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-income" />
            <span className="text-sm font-medium text-text-primary">Receitas</span>
            <span className="text-xs text-text-secondary">({income.length})</span>
          </div>
          <div className="bg-bg-card border border-border-app rounded-xl overflow-hidden">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-border-app last:border-0">
                  <div className="h-4 w-32 bg-bg-secondary rounded animate-pulse" />
                  <div className="h-4 w-12 bg-bg-secondary rounded animate-pulse" />
                </div>
              ))
            ) : income.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-text-secondary">
                Nenhuma categoria de receita.
              </div>
            ) : (
              income.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between px-4 py-3 border-b border-border-app last:border-0 hover:bg-bg-secondary/50 transition-colors"
                >
                  <span className="text-sm text-text-primary">{cat.name}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(cat.id)}
                      className="p-1.5 rounded-lg text-text-secondary hover:text-expense hover:bg-bg-secondary transition-colors cursor-pointer"
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
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-expense" />
            <span className="text-sm font-medium text-text-primary">Despesas</span>
            <span className="text-xs text-text-secondary">({expense.length})</span>
          </div>
          <div className="bg-bg-card border border-border-app rounded-xl overflow-hidden">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-border-app last:border-0">
                  <div className="h-4 w-32 bg-bg-secondary rounded animate-pulse" />
                  <div className="h-4 w-12 bg-bg-secondary rounded animate-pulse" />
                </div>
              ))
            ) : expense.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-text-secondary">
                Nenhuma categoria de despesa.
              </div>
            ) : (
              expense.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between px-4 py-3 border-b border-border-app last:border-0 hover:bg-bg-secondary/50 transition-colors"
                >
                  <span className="text-sm text-text-primary">{cat.name}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(cat.id)}
                      className="p-1.5 rounded-lg text-text-secondary hover:text-expense hover:bg-bg-secondary transition-colors cursor-pointer"
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
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-bg-card border border-border-app rounded-xl p-6 w-full max-w-sm mx-4">
            <h2 className="text-base font-medium text-text-primary mb-5">
              {editing ? 'Editar categoria' : 'Nova categoria'}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

              <div className="flex flex-col gap-1">
                <label className="text-sm text-text-secondary">Nome</label>
                <input
                  type="text"
                  placeholder="Ex: Alimentação"
                  className="bg-bg-secondary border border-border-app rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary outline-none focus:ring-2 focus:ring-accent transition-all"
                  {...register('name', { required: 'Nome obrigatório' })}
                />
                {errors.name && (
                  <span className="text-xs text-expense">{errors.name.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-text-secondary">Tipo</label>
                <select
                  className="bg-bg-secondary border border-border-app rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:ring-2 focus:ring-accent transition-all"
                  {...register('type', { required: 'Tipo obrigatório' })}
                >
                  <option value="INCOME">Receita</option>
                  <option value="EXPENSE">Despesa</option>
                </select>
                {errors.type && (
                  <span className="text-xs text-expense">{errors.type.message}</span>
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
            <h2 className="text-base font-medium text-text-primary mb-2">Excluir categoria</h2>
            <p className="text-sm text-text-secondary mb-5">
              Tem certeza? Transações vinculadas a essa categoria podem ser afetadas.
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