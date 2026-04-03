import { create } from 'zustand'

interface AuthState {
  name: string | null
  token: string | null
  isAuthenticated: boolean
  login: (name: string, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  name: localStorage.getItem('name'),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),

  login: (name, token) => {
    localStorage.setItem('name', name)
    localStorage.setItem('token', token)
    set({ name, token, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('name')
    localStorage.removeItem('token')
    set({ name: null, token: null, isAuthenticated: false })
  },
}))