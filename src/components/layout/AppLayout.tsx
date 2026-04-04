import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, Tag, TrendingUp, Bell, Search, LogOut } from 'lucide-react'
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
    <div className="flex h-screen bg-bg-primary overflow-hidden font-sans selection:bg-accent/30 selection:text-text-primary">

      {/* Sidebar */}
      <aside className="w-64 flex flex-col bg-bg-card/30 border-r border-border-app/60 flex-shrink-0 relative">
        
        {/* Glow de fundo da Sidebar */}
        <div className="absolute top-0 left-0 w-full h-32 bg-accent/5 blur-[50px] pointer-events-none" />

        {/* Logo - Agora com altura fixa (h-20) para alinhar perfeitamente com a Topbar */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-border-app/60 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(108,99,255,0.15)]">
            <TrendingUp size={18} className="text-accent" />
          </div>
          <div className="flex flex-col">
            <span className="text-text-primary font-semibold text-base tracking-wide leading-tight">Aurum</span>
            <span className="text-text-secondary text-[10px] uppercase tracking-wider font-medium">Personal Finance</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1.5 p-4 flex-1 relative z-10">
          <p className="text-[11px] text-text-secondary/70 px-3 py-2 font-semibold tracking-widest uppercase mb-1">
            Menu Principal
          </p>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 overflow-hidden ${
                  isActive
                    ? 'bg-accent/10 text-text-primary border border-accent/20 shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.02] border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Indicador lateral ativo */}
                  {isActive && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-accent rounded-r-md shadow-[0_0_8px_rgba(108,99,255,0.6)]" />
                  )}
                  <Icon 
                    size={18} 
                    className={`transition-colors duration-200 ${isActive ? 'text-accent' : 'text-text-secondary group-hover:text-accent/70'}`} 
                  />
                  <span className="tracking-wide">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Rodapé Sidebar (Status do sistema minimalista) */}
        <div className="p-5 border-t border-border-app/60 relative z-10">
          <div className="flex items-center gap-3 px-2">
            <div className="relative flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-income shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
              <div className="absolute inset-0 rounded-full bg-income animate-ping opacity-40" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-text-primary">Serviços online</span>
              <span className="text-[10px] text-text-secondary">v2.0.0</span>
            </div>
          </div>
        </div>

      </aside>

      {/* Área principal */}
      <div className="flex flex-col flex-1 min-w-0 relative">

        {/* Topbar - Agora com altura fixa (h-20) para alinhar com a Logo da Sidebar */}
        <header className="h-20 flex items-center justify-between px-8 border-b border-border-app/60 bg-bg-primary/80 backdrop-blur-xl sticky top-0 z-40">

          {/* Busca */}
          <div className="relative w-80 group">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors" />
            <input
              type="text"
              placeholder="Pesquisar transações..."
              className="w-full bg-bg-card border border-border-app/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/50 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-inner"
            />
          </div>

          {/* Direita */}
          <div className="flex items-center gap-4">

            {/* Notificações */}
            <button className="relative w-10 h-10 rounded-xl bg-bg-card border border-border-app/60 flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border-app hover:bg-white/[0.02] transition-all cursor-pointer shadow-sm group">
              <Bell size={18} className="group-hover:animate-swing origin-top" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(108,99,255,0.8)]">
                <span className="absolute inset-0 rounded-full bg-accent animate-ping opacity-75" />
              </span>
            </button>

            {/* Usuário com logout no hover */}
            <div className="flex items-center gap-3.5 pl-4 border-l border-border-app/60">
              <div className="text-right">
                <p className="text-sm font-semibold text-text-primary tracking-wide leading-tight">{name}</p>
                <p className="text-[11px] text-text-secondary uppercase tracking-wider font-medium leading-tight mt-0.5">Plano Pro</p>
              </div>
              <button
                onClick={handleLogout}
                title="Sair da conta"
                className="relative w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 hover:bg-expense/10 hover:border-expense/30 transition-all duration-300 cursor-pointer group shadow-sm overflow-hidden"
              >
                <span className="absolute inset-0 flex items-center justify-center text-accent text-sm font-bold tracking-wider transition-opacity duration-300 group-hover:opacity-0">
                  {initials}
                </span>
                <LogOut size={16} className="absolute inset-0 m-auto text-expense opacity-0 scale-50 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100" />
              </button>
            </div>

          </div>
        </header>

        {/* Conteúdo */}
        <main className="flex-1 overflow-y-auto bg-bg-primary">
          <Outlet />
        </main>

      </div>
    </div>
  )
}