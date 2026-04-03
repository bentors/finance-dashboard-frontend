import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, User, TrendingUp } from 'lucide-react'
import api from '@/api/axios'

type FormData = {
  name: string
  email: string
  password: string
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>()

  async function onSubmit(data: FormData) {
    try {
      setServerError(null)
      await api.post('/auth/register', data)
      navigate('/login')
    } catch (err: any) {
      const message = err.response?.data?.message
      if (message?.includes('e-mail')) {
        setServerError('Este e-mail já está cadastrado.')
      } else {
        setServerError('Erro ao criar conta. Tente novamente.')
      }
    }
  }

  return (
    <div className="min-h-screen flex bg-bg-primary">

      {/* Painel esquerdo — branding */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 border-r border-border-app">

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <TrendingUp size={16} className="text-white" />
          </div>
          <span className="text-text-primary font-medium text-base">Aurum</span>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-medium text-text-primary leading-snug">
              Comece sua jornada<br />
              <span className="text-accent">financeira agora.</span>
            </h1>
            <p className="text-text-secondary text-sm mt-3 leading-relaxed max-w-xs">
              Crie sua conta gratuitamente e tenha controle total sobre suas finanças pessoais.
            </p>
          </div>

          {/* Feature list */}
          <ul className="flex flex-col gap-3 mt-4">
            {[
              'Dashboard com visão completa do mês',
              'Categorias personalizadas',
              'Exportação de extratos em CSV',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-text-secondary">
                <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-text-secondary">
          © {new Date().getFullYear()} Aurum Personal Finance
        </p>

      </div>

      {/* Painel direito — formulário */}
      <div className="flex flex-1 flex-col items-center justify-center px-8 py-12">

        {/* Logo mobile */}
        <div className="flex lg:hidden items-center gap-2.5 mb-10">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <TrendingUp size={16} className="text-white" />
          </div>
          <span className="text-text-primary font-medium text-base">Aurum</span>
        </div>

        <div className="w-full max-w-sm">

          <div className="mb-8">
            <h2 className="text-2xl font-medium text-text-primary">Criar conta</h2>
            <p className="text-sm text-text-secondary mt-1.5">Preencha os dados para começar</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-text-secondary">Nome</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Seu nome completo"
                  className="w-full bg-bg-card border border-border-app rounded-lg pl-9 pr-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                  {...register('name', { required: 'Nome obrigatório' })}
                />
              </div>
              {errors.name && (
                <span className="text-xs text-expense">{errors.name.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-text-secondary">E-mail</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  className="w-full bg-bg-card border border-border-app rounded-lg pl-9 pr-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                  {...register('email', { required: 'E-mail obrigatório' })}
                />
              </div>
              {errors.email && (
                <span className="text-xs text-expense">{errors.email.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-text-secondary">Senha</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-bg-card border border-border-app rounded-lg pl-9 pr-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                  {...register('password', {
                    required: 'Senha obrigatória',
                    minLength: { value: 6, message: 'Mínimo de 6 caracteres' },
                  })}
                />
              </div>
              {errors.password && (
                <span className="text-xs text-expense">{errors.password.message}</span>
              )}
            </div>

            {serverError && (
              <div className="bg-expense/10 border border-expense/20 rounded-lg px-3 py-2.5">
                <p className="text-xs text-expense">{serverError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 w-full bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg py-2.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Criando conta...' : 'Criar conta'}
            </button>

          </form>

          <p className="text-xs text-text-secondary text-center mt-6">
            Já tem conta?{' '}
            <Link to="/login" className="text-accent hover:text-accent-hover font-medium transition-colors">
              Entrar
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}