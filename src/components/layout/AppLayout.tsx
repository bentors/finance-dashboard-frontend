import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, Tag, LogOut, TrendingUp, Bell, Search } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

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

  const initials = name
    ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'AU'

  return (
    <div className="flex min-h-screen bg-bg-primary">

      {/* Sidebar */}
      <aside className="w-60 flex flex-col bg-bg-secondary border-r border-border-app flex-shrink-0">

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border-app">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
            <TrendingUp size={14} className="text-white" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-text-primary font-medium text-sm">Aurum</span>
            <span className="text-text-secondary text-xs">Personal Finance</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 p-3 flex-1">
          <p className="text-xs text-text-secondary px-3 py-2 font-medium tracking-wider uppercase">
            Menu
          </p>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-accent/15 text-accent font-medium border border-accent/20'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} className={isActive ? 'text-accent' : ''} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-border-app">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-expense hover:bg-expense/5 transition-all cursor-pointer"
          >
            <LogOut size={16} />
            Sair da conta
          </button>
        </div>

      </aside>

      {/* Área principal */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Topbar */}
        <header className="flex items-center justify-between px-8 py-4 border-b border-border-app bg-bg-primary flex-shrink-0">

          {/* Busca */}
          <div className="relative w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full bg-bg-card border border-border-app rounded-xl pl-9 pr-4 py-2 text-sm text-text-primary placeholder:text-text-secondary outline-none focus:border-accent/50 transition-all"
            />
          </div>

          {/* Direita */}
          <div className="flex items-center gap-3">

            {/* Notificações */}
            <button className="relative w-9 h-9 rounded-xl bg-bg-card border border-border-app flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-accent/30 transition-all cursor-pointer">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent" />
            </button>

            {/* Usuário */}
            <div className="flex items-center gap-3 pl-3 border-l border-border-app">
              <div className="text-right">
                <p className="text-sm font-medium text-text-primary leading-tight">{name}</p>
                <p className="text-xs text-text-secondary leading-tight">Conta pessoal</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                <span className="text-accent text-sm font-medium">{initials}</span>
              </div>
            </div>

          </div>
        </header>

        {/* Conteúdo */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

      </div>
    </div>
  )
}