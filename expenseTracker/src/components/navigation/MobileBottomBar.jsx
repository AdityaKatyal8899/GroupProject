import { Grid2x2, Receipt, BarChart3, User, Settings as SettingsIcon } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'

const ITEMS = [
  { key: 'dashboard', icon: Grid2x2, path: '/dashboard' },
  { key: 'expenses', icon: Receipt, path: '/expenses' },
  { key: 'reports', icon: BarChart3, path: '/reports' },
  { key: 'profile', icon: User, path: '/profile' },
  { key: 'settings', icon: SettingsIcon, path: '/settings' },
]

export default function MobileBottomBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const containerStyle = {
    width: 'calc(100vw - 16px)', // full viewport width with small side margin
    maxWidth: '100%',
    height: 64,
    borderRadius: 16,
    paddingInline: 12,
    background: isDark
      ? 'linear-gradient(90deg, #9b4dff, #b06bfc)'
      : 'var(--primary-gradient)',
    backgroundColor: isDark ? '#9b4dff' : 'var(--primary-color)',
    backgroundClip: 'padding-box',
    border: '1px solid var(--border-color)',
    boxShadow: isDark
      ? 'rgba(0, 0, 0, 0.25) 0px 5px 15px, rgba(155, 77, 255, 0.4) 0px 8px 18px'
      : 'rgba(0, 0, 0, 0.25) 0px 5px 15px, var(--primary-color) 0px 8px 18px',
  }

  return (
    <div
      className="fixed bottom-3 left-1/2 -translate-x-1/2 md:hidden z-50 flex justify-center"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div
        className="button-container flex items-center justify-between backdrop-blur-xl"
        style={containerStyle}
      >
        {ITEMS.map(({ key, icon: Icon, path }) => {
          const isActive = location.pathname.startsWith(path)

          const baseIconColor = isDark ? '#ffffff' : '#111111'
          const activeIconColor = isDark ? '#9b4dff' : getComputedStyle(document.documentElement).getPropertyValue('--primary-color') || '#1d13d6'

          return (
            <button
              key={key}
              type="button"
              onClick={() => navigate(path)}
              className="button focus:outline-none transition-transform duration-150 active:scale-95"
              style={{
                outline: '0',
                border: '0',
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: isActive ? '#ffffff' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                opacity: isActive ? 1 : 0.8,
                boxShadow: isActive ? '0 0 12px rgba(155, 77, 255, 0.7)' : 'none',
              }}
            >
              <Icon size={20} style={{ color: isActive ? activeIconColor : baseIconColor }} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
