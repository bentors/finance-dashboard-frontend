import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import AppLayout from '../components/layout/AppLayout'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import DashboardPage from '../pages/DashboardPage'
import TransactionsPage from '../pages/TransactionsPage'
import CategoriesPage from '@/pages/CategoriesPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>
}

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/login" element={
          <PublicRoute><LoginPage /></PublicRoute>
        } />

        <Route path="/register" element={
          <PublicRoute><RegisterPage /></PublicRoute>
        } />

        {/* Rotas protegidas — todas dentro do AppLayout */}
        <Route element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/transactions" element={<TransactionsPage />} />
          
          <Route path="/categories" element={<CategoriesPage />} />
          
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}