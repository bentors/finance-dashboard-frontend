import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, Tag, LogOut } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const navItems = [
  { to: '/dashboard',    label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/transactions', label: 'Transações',  icon: ArrowLeftRight },
  { to: '/categories',   label: 'Categorias',  icon: Tag },
]

export default function AppLayout() {
  const navigate = useNavigate()
  const { name, logout } = useAuthStore()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-bg-primary">

      {/* Sidebar */}
      <aside className="w-56 flex flex-col bg-bg-card border-r border-border-app">

        {/* Logo */}
        <div className="px-5 py-6 border-b border-border-app">
          <span className="text-text-primary font-medium text-sm">Finance</span>
          <span className="text-accent font-medium text-sm">Dashboard</span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 p-3 flex-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-accent text-white'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="p-3 border-t border-border-app">
          <div className="px-3 py-2 mb-1">
            <p className="text-xs text-text-secondary">Logado como</p>
            <p className="text-sm text-text-primary font-medium truncate">{name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-expense hover:bg-bg-secondary transition-colors cursor-pointer"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>

      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

    </div>
  )
}