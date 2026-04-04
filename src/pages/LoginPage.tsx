import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, TrendingUp } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/api/axios'
import type { TokenResponseDTO } from '@/types/api'

type FormData = {
  email: string
  password: string
}

function CandlestickDecoration() {
  const candles = [
    { x: 30,  h: 60,  y: 120, body: 40, by: 130, bull: true  },
    { x: 70,  h: 90,  y: 90,  body: 55, by: 105, bull: false },
    { x: 110, h: 50,  y: 130, body: 30, by: 138, bull: true  },
    { x: 150, h: 110, y: 70,  body: 70, by: 85,  bull: true  },
    { x: 190, h: 75,  y: 105, body: 48, by: 117, bull: false },
    { x: 230, h: 95,  y: 85,  body: 60, by: 98,  bull: true  },
    { x: 270, h: 65,  y: 115, body: 40, by: 125, bull: false },
    { x: 310, h: 120, y: 60,  body: 80, by: 75,  bull: true  },
  ]

  return (
    <svg width="380" height="260" viewBox="0 0 380 260" className="opacity-30 drop-shadow-md">
      {candles.map((c, i) => (
        <g key={i}>
          <line
            x1={c.x} y1={c.y}
            x2={c.x} y2={c.y + c.h}
            stroke={c.bull ? 'var(--color-income)' : 'var(--color-expense)'}
            strokeWidth="1.5"
          />
          <rect
            x={c.x - 8} y={c.by}
            width="16" height={c.body}
            rx="2"
            fill={c.bull ? 'var(--color-income)' : 'var(--color-expense)'}
            opacity="0.85"
          />
        </g>
      ))}
      <polyline
        points="30,150 70,120 110,160 150,100 190,130 230,110 270,140 310,85"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="2.5"
        opacity="0.8"
      />
    </svg>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>()

  async function onSubmit(data: FormData) {
    try {
      setServerError(null)
      const response = await api.post<TokenResponseDTO>('/auth/login', data)
      login(response.data.name, response.data.token)
      navigate('/dashboard')
    } catch (err: any) {
      const status = err.response?.status
      if (status === 403 || status === 401) {
        setServerError('E-mail ou senha incorretos.')
      } else {
        setServerError('Erro ao conectar com o servidor.')
      }
    }
  }

  return (
    <div className="min-h-screen flex bg-bg-primary">

      {/* Painel esquerdo — branding */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 border-r border-border-app relative overflow-hidden bg-bg-primary/40">
        
        {/* Glow de fundo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-2.5 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shadow-[0_0_15px_rgba(108,99,255,0.15)]">
            <TrendingUp size={20} className="text-accent" />
          </div>
          <span className="text-text-primary font-medium text-lg tracking-wide">Aurum</span>
        </div>

        {/* Centro — tagline */}
        <div className="flex flex-col gap-8 relative z-10">
          <CandlestickDecoration />
          <div>
            <h1 className="text-4xl font-medium text-text-primary leading-tight tracking-tight">
              Controle suas finanças<br />
              <span className="text-accent">com clareza.</span>
            </h1>
            <p className="text-text-secondary text-base mt-4 leading-relaxed max-w-sm">
              Acompanhe receitas, despesas e evolução patrimonial em um só lugar.
            </p>
          </div>
        </div>

        {/* Rodapé */}
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
            <h2 className="text-2xl font-medium text-text-primary">Acesse sua conta</h2>
            <p className="text-sm text-text-secondary mt-2">Insira suas credenciais para continuar</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

            {/* Campo E-mail */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary uppercase tracking-wider ml-1">E-mail</label>
              <div className="relative group">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors" />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  className="w-full bg-bg-card border border-border-app rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                  {...register('email', { required: 'E-mail obrigatório' })}
                />
              </div>
              {errors.email && (
                <span className="text-xs text-expense ml-1">{errors.email.message}</span>
              )}
            </div>

            {/* Campo Senha */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary uppercase tracking-wider ml-1">Senha</label>
              <div className="relative group">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-bg-card border border-border-app rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                  {...register('password', { required: 'Senha obrigatória' })}
                />
              </div>
              {errors.password && (
                <span className="text-xs text-expense ml-1">{errors.password.message}</span>
              )}
            </div>

            {/* Mensagem de erro */}
            {serverError && (
              <div className="bg-expense/10 border border-expense/20 rounded-xl px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-sm font-medium text-expense text-center">{serverError}</p>
              </div>
            )}

            {/* Botão primário */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-xl py-3.5 shadow-[0_4px_14px_0_rgba(108,99,255,0.2)] hover:shadow-[0_6px_20px_rgba(108,99,255,0.3)] transition-all duration-300 disabled:opacity-50 disabled:shadow-none cursor-pointer"
            >
              {isSubmitting ? 'Autenticando...' : 'Entrar'}
            </button>

          </form>

          <p className="text-sm text-text-secondary text-center mt-8">
            Não tem conta?{' '}
            <Link to="/register" className="text-accent hover:text-accent-hover font-medium transition-colors">
              Criar conta
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}