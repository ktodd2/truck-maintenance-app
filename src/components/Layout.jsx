import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Truck, Plus, Clock, BarChart3, Settings } from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/trucks', icon: Truck, label: 'Trucks' },
  { to: '/maintenance/new', icon: Plus, label: 'Add', isAdd: true },
  { to: '/timeline', icon: Clock, label: 'Timeline' },
  { to: '/analytics', icon: BarChart3, label: 'Stats' },
]

export default function Layout({ children }) {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main className="max-w-lg mx-auto">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom">
        <div className="max-w-lg mx-auto flex justify-around items-center h-16">
          {navItems.map(({ to, icon: Icon, label, isAdd }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `
                flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all
                ${isAdd
                  ? 'bg-blue-500 text-white -mt-4 shadow-lg shadow-blue-500/30 hover:bg-blue-600'
                  : isActive
                    ? 'text-blue-500'
                    : 'text-gray-400 hover:text-gray-600'
                }
              `}
            >
              <Icon size={isAdd ? 24 : 22} strokeWidth={isAdd ? 2.5 : 2} />
              {!isAdd && <span className="text-xs mt-0.5 font-medium">{label}</span>}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
