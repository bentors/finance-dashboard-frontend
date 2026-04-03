import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'

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

        <Route path="/dashboard" element={
          <PrivateRoute>
            <div className="p-8 text-gray-600">Dashboard — em breve</div>
          </PrivateRoute>
        } />

        <Route path="/transactions" element={
          <PrivateRoute>
            <div className="p-8 text-gray-600">Transações — em breve</div>
          </PrivateRoute>
        } />

        <Route path="/categories" element={
          <PrivateRoute>
            <div className="p-8 text-gray-600">Categorias — em breve</div>
          </PrivateRoute>
        } />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}