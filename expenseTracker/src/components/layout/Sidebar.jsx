import { Home, CreditCard, PieChart, Settings, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const items = [
  { to: '/dashboard', icon: Home, key: 'dashboard' },
  { to: '/expenses', icon: CreditCard, key: 'expenses' },
  { to: '/reports', icon: PieChart, key: 'reports' },
  { to: '/settings', icon: Settings, key: 'settings' },
  { to: '/profile', icon: User, key: 'profile' },
]

export default function Sidebar() {
  return (
    <aside
      className="hidden md:flex fixed left-0 top-16 bottom-0 w-[72px] px-2 py-4"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
      }}
    >
      <nav className="flex flex-col items-center gap-3">
        {items.map(({ to, icon: Icon, key }) => (
          <NavLink
            key={key}
            to={to}
            className={({ isActive }) =>
              `w-11 h-11 grid place-items-center rounded-2xl transition-all duration-200 hover:pl-1 ${
                isActive ? 'ring-1' : ''
              }`
            }
            title={key.charAt(0).toUpperCase() + key.slice(1)}
          >
            <Icon
              size={20}
              style={{
                color: 'var(--icon-color)',
                opacity: 0.9,
              }}
            />
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
