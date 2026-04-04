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

type CategoryFormData = {
  name: string
  type: CategoryType
}

function EmptyColumn({ type }: { type: 'INCOME' | 'EXPENSE' }) {
  const isIncome = type === 'INCOME'
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-14 h-14 rounded-2xl bg-bg-primary border border-border-app/50 shadow-inner flex items-center justify-center relative">
        <div className={`absolute inset-0 blur-md rounded-2xl ${isIncome ? 'bg-income/5' : 'bg-expense/5'}`} />
        <Tag size={24} className="text-text-secondary relative z-10" />
      </div>
      <div className="text-center px-4">
        <p className="text-sm font-medium text-text-primary tracking-wide">
          Nenhuma categoria de {isIncome ? 'receita' : 'despesa'}
        </p>
        <p className="text-xs text-text-secondary mt-1">
          Clique em adicionar para criar uma nova.
        </p>
      </div>
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
  } = useForm<CategoryFormData>({ defaultValues: { type: 'INCOME' } })

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
    mutationFn: ({ id, dto }: { id: string; dto: CategoryFormData }) =>
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

  async function onSubmit(data: CategoryFormData) {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, dto: data })
    } else {
      await createMutation.mutateAsync(data)
    }
  }

  const skeletonRows = Array.from({ length: 3 })

  return (
    <div className="p-8 flex flex-col gap-8 max-w-[1600px] mx-auto w-full">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-text-primary tracking-tight">Categorias</h1>
          <p className="text-sm text-text-secondary mt-1.5">
            {categories.length > 0
              ? `${income.length} de receita · ${expense.length} de despesa`
              : 'Nenhuma categoria cadastrada'}
          </p>
        </div>
        <button
          onClick={() => openCreate('INCOME')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-all shadow-[0_4px_14px_0_rgba(108,99,255,0.2)] hover:shadow-[0_6px_20px_rgba(108,99,255,0.3)] cursor-pointer"
        >
          <Plus size={16} />
          Nova categoria
        </button>
      </div>

      {/* Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Receitas */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-income shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
              <span className="text-base font-medium text-text-primary tracking-wide">Receitas</span>
              <span className="text-xs font-medium text-text-secondary bg-bg-card border border-border-app/60 px-2.5 py-0.5 rounded-full">
                {income.length}
              </span>
            </div>
            <button
              onClick={() => openCreate('INCOME')}
              className="flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-income transition-colors cursor-pointer"
            >
              <Plus size={14} />
              Adicionar
            </button>
          </div>

          <div className="bg-bg-card border border-border-app/60 rounded-2xl overflow-hidden shadow-sm">
            {isLoading ? (
              skeletonRows.map((_, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-4 border-b border-border-app/40 last:border-0">
                  <div className="h-4 w-32 bg-bg-secondary rounded animate-pulse" />
                  <div className="h-7 w-16 bg-bg-secondary rounded-lg animate-pulse" />
                </div>
              ))
            ) : income.length === 0 ? (
              <EmptyColumn type="INCOME" />
            ) : (
              income.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between px-5 py-4 border-b border-border-app/40 last:border-0 hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-1 h-6 rounded-full bg-income shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                    <span className="text-sm font-medium text-text-primary group-hover:text-white transition-colors">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-2 rounded-lg text-text-secondary hover:text-white hover:bg-bg-secondary transition-colors cursor-pointer"
                      title="Editar"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(cat.id)}
                      className="p-2 rounded-lg text-text-secondary hover:text-expense hover:bg-expense/10 transition-colors cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Despesas */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-expense shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
              <span className="text-base font-medium text-text-primary tracking-wide">Despesas</span>
              <span className="text-xs font-medium text-text-secondary bg-bg-card border border-border-app/60 px-2.5 py-0.5 rounded-full">
                {expense.length}
              </span>
            </div>
            <button
              onClick={() => openCreate('EXPENSE')}
              className="flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-expense transition-colors cursor-pointer"
            >
              <Plus size={14} />
              Adicionar
            </button>
          </div>

          <div className="bg-bg-card border border-border-app/60 rounded-2xl overflow-hidden shadow-sm">
            {isLoading ? (
              skeletonRows.map((_, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-4 border-b border-border-app/40 last:border-0">
                  <div className="h-4 w-32 bg-bg-secondary rounded animate-pulse" />
                  <div className="h-7 w-16 bg-bg-secondary rounded-lg animate-pulse" />
                </div>
              ))
            ) : expense.length === 0 ? (
              <EmptyColumn type="EXPENSE" />
            ) : (
              expense.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between px-5 py-4 border-b border-border-app/40 last:border-0 hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-1 h-6 rounded-full bg-expense shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                    <span className="text-sm font-medium text-text-primary group-hover:text-white transition-colors">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-2 rounded-lg text-text-secondary hover:text-white hover:bg-bg-secondary transition-colors cursor-pointer"
                      title="Editar"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(cat.id)}
                      className="p-2 rounded-lg text-text-secondary hover:text-expense hover:bg-expense/10 transition-colors cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 size={14} />
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
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-200"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-bg-card border border-border-app/80 rounded-2xl p-7 w-full max-w-sm mx-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3.5 mb-7">
              <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shadow-inner">
                {editing ? <Pencil size={18} className="text-accent" /> : <Plus size={18} className="text-accent" />}
              </div>
              <div>
                <h2 className="text-lg font-medium text-text-primary tracking-wide">
                  {editing ? 'Editar categoria' : 'Nova categoria'}
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  {editing ? 'Atualize os dados abaixo' : 'Adicione uma nova organização'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary uppercase tracking-wider ml-1">Nome</label>
                <input
                  type="text"
                  placeholder="Ex: Alimentação"
                  className="w-full bg-bg-primary border border-border-app rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-inner"
                  {...register('name', { required: 'Nome obrigatório' })}
                />
                {errors.name && (
                  <span className="text-xs text-expense ml-1 font-medium">{errors.name.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary uppercase tracking-wider ml-1">Tipo</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['INCOME', 'EXPENSE'] as CategoryType[]).map((type) => {
                    const isSelected = selectedType === type
                    const isIncome = type === 'INCOME'
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setValue('type', type)}
                        className={`flex items-center justify-center gap-2.5 px-3 py-3 rounded-xl border text-sm font-medium transition-all shadow-sm ${
                          isSelected
                            ? isIncome
                              ? 'border-income/40 bg-income/10 text-income shadow-[0_0_15px_rgba(34,197,94,0.15)]'
                              : 'border-expense/40 bg-expense/10 text-expense shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                            : 'border-border-app/60 bg-bg-primary text-text-secondary hover:bg-bg-secondary hover:border-border-app'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${
                          isSelected 
                            ? isIncome ? 'bg-income shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-expense shadow-[0_0_8px_rgba(239,68,68,0.6)]' 
                            : 'bg-text-secondary/50'
                        }`} />
                        {isIncome ? 'Receita' : 'Despesa'}
                      </button>
                    )
                  })}
                </div>
                <input type="hidden" {...register('type', { required: true })} />
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
                  {isSubmitting ? 'Salvando...' : editing ? 'Salvar' : 'Criar'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal confirmar delete */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-bg-card border border-border-app/80 rounded-2xl p-7 w-full max-w-sm mx-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-expense/10 border border-expense/20 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                <Trash2 size={20} className="text-expense" />
              </div>
              <h2 className="text-lg font-medium text-text-primary tracking-wide">Excluir categoria</h2>
              <p className="text-sm text-text-secondary mt-2">
                Tem certeza? Transações vinculadas podem ser afetadas. Essa ação não pode ser desfeita.
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