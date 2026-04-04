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
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 border-r border-border-app relative overflow-hidden bg-bg-primary/40">

        {/* Glow de fundo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="flex items-center gap-2.5 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shadow-[0_0_15px_rgba(108,99,255,0.15)]">
            <TrendingUp size={20} className="text-accent" />
          </div>
          <span className="text-text-primary font-medium text-lg tracking-wide">Aurum</span>
        </div>

        <div className="flex flex-col gap-8 relative z-10">
          <div>
            <h1 className="text-4xl font-medium text-text-primary leading-tight tracking-tight">
              Comece sua jornada<br />
              <span className="text-accent">financeira agora.</span>
            </h1>
            <p className="text-text-secondary text-base mt-4 leading-relaxed max-w-sm">
              Crie sua conta gratuitamente e tenha controle total sobre suas finanças pessoais.
            </p>
          </div>

          {/* Feature list */}
          <ul className="flex flex-col gap-4 mt-2">
            {[
              'Dashboard com visão completa do mês',
              'Categorias personalizadas',
              'Exportação de extratos em CSV',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-text-secondary">
                <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(108,99,255,0.5)] flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-text-secondary relative z-10">
          © {new Date().getFullYear()} Aurum Personal Finance
        </p>

      </div>

      {/* Painel direito — formulário */}
      <div className="flex flex-1 flex-col items-center justify-center px-8 py-12 relative">

        {/* Logo mobile */}
        <div className="flex lg:hidden items-center gap-2.5 mb-10">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shadow-[0_0_15px_rgba(108,99,255,0.15)]">
            <TrendingUp size={20} className="text-accent" />
          </div>
          <span className="text-text-primary font-medium text-lg tracking-wide">Aurum</span>
        </div>

        <div className="w-full max-w-sm">

          <div className="mb-10">
            <h2 className="text-2xl font-medium text-text-primary">Criar conta</h2>
            <p className="text-sm text-text-secondary mt-2">Preencha os dados para começar</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary uppercase tracking-wider ml-1">Nome</label>
              <div className="relative group">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors" />
                <input
                  type="text"
                  placeholder="Seu nome completo"
                  className="w-full bg-bg-card border border-border-app rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-inner"
                  {...register('name', { required: 'Nome obrigatório' })}
                />
              </div>
              {errors.name && (
                <span className="text-xs text-expense ml-1 font-medium">{errors.name.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary uppercase tracking-wider ml-1">E-mail</label>
              <div className="relative group">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors" />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  className="w-full bg-bg-card border border-border-app rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-inner"
                  {...register('email', { required: 'E-mail obrigatório' })}
                />
              </div>
              {errors.email && (
                <span className="text-xs text-expense ml-1 font-medium">{errors.email.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary uppercase tracking-wider ml-1">Senha</label>
              <div className="relative group">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors" />
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-bg-card border border-border-app rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-inner"
                  {...register('password', {
                    required: 'Senha obrigatória',
                    minLength: { value: 6, message: 'Mínimo de 6 caracteres' },
                  })}
                />
              </div>
              {errors.password && (
                <span className="text-xs text-expense ml-1 font-medium">{errors.password.message}</span>
              )}
            </div>

            {serverError && (
              <div className="bg-expense/10 border border-expense/20 rounded-xl px-4 py-3 flex items-center justify-center animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-xs font-medium text-expense text-center">{serverError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-xl py-3.5 shadow-[0_4px_14px_0_rgba(108,99,255,0.2)] hover:shadow-[0_6px_20px_rgba(108,99,255,0.3)] transition-all duration-300 disabled:opacity-50 disabled:shadow-none cursor-pointer"
            >
              {isSubmitting ? 'Criando conta...' : 'Criar conta'}
            </button>

          </form>

          <p className="text-sm text-text-secondary text-center mt-8">
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