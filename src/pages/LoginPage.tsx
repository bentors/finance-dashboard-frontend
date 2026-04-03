import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import api from '../api/axios'
import type { TokenResponseDTO } from '../types/api'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

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
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="w-full max-w-sm bg-bg-card border border-border-app rounded-xl p-8">

        <div className="mb-8">
          <h1 className="text-xl font-medium text-text-primary">Entrar</h1>
          <p className="text-sm text-text-secondary mt-1">Finance Dashboard</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

          <div className="flex flex-col gap-1">
            <label className="text-sm text-text-secondary">E-mail</label>
            <input
              type="email"
              placeholder="seu@email.com"
              className="bg-bg-secondary border border-border-app rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary outline-none focus:ring-2 focus:ring-accent transition-all"
              {...register('email')}
            />
            {errors.email && (
              <span className="text-xs text-expense">{errors.email.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-text-secondary">Senha</label>
            <input
              type="password"
              placeholder="••••••"
              className="bg-bg-secondary border border-border-app rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary outline-none focus:ring-2 focus:ring-accent transition-all"
              {...register('password')}
            />
            {errors.password && (
              <span className="text-xs text-expense">{errors.password.message}</span>
            )}
          </div>

          {serverError && (
            <p className="text-xs text-expense text-center">{serverError}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg py-2.5 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>

        </form>

        <p className="text-xs text-text-secondary text-center mt-6">
          Não tem conta?{' '}
          <Link to="/register" className="text-accent hover:text-accent-hover font-medium transition-colors">
            Criar conta
          </Link>
        </p>

      </div>
    </div>
  )
}