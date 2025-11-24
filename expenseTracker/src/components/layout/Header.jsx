import { Plus } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useNavigate } from 'react-router-dom'

export default function Header() {
  const { resolvedTheme, setTheme } = useTheme()
  const navigate = useNavigate()
  function handleLogout() {
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('name')
      localStorage.removeItem('email')
      localStorage.removeItem('avatar')
      localStorage.removeItem('picture')
    } catch {}
    navigate('/login', { replace: true })
  }
  return (
    <>
      {/* Desktop header (unchanged), hidden on mobile */}
      <header
        className="hidden md:flex fixed top-0 left-0 right-0 z-[999] h-16 px-6 items-center justify-between"
        style={{
          backgroundColor: 'rgba(0,0,0,0.02)',
          borderBottom: '1px solid var(--border-color)',
          boxShadow: '0 4px 10px var(--shadow-soft)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="font-heading font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
          ExpenseWise
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/expenses?add=1')}
            className="px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 primary-button relative z-[1001]"
            style={{ cursor: 'pointer', userSelect: 'none', pointerEvents: 'auto' }}
          >
            <Plus size={16} />
            Add Expense
          </button>
          <label className="ui-switch" style={{ '--switch-bg': resolvedTheme === 'dark' ? '#2d2d2d' : '#caced6' }}>
            <input
              id="theme-toggle"
              type="checkbox"
              checked={resolvedTheme === 'dark'}
              onChange={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            />
            <div className="slider">
              <div className="circle" style={{ '--dark-purple': '#7a00ff' }}>
                {/* Icon will swap automatically with CSS */}
                <svg className="icon sun" viewBox="0 0 24 24">
                  <path d="M12 4V2m0 20v-2m8-8h2M2 12h2m12.95 7.05l1.41 1.41M4.64 4.64l1.41 1.41m0 12.02l-1.41 1.41m14.14-14.14l-1.41 1.41"/>
                  <circle cx="12" cy="12" r="5"></circle>
                </svg>
                <svg className="icon moon" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 0 1 11.21 3 7 7 0 1 0 21 12.79z"/>
                </svg>
              </div>
            </div>
          </label>
          <button
            onClick={handleLogout}
            className="px-3 py-2 rounded-full text-xs font-medium border"
            style={{ borderColor: 'var(--border-color)' }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Mobile header - full width */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 h-14 px-4 flex items-center justify-between z-50 backdrop-blur-xl"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          boxShadow: '0 4px 10px var(--shadow-soft)',
        }}
      >
        <div className="font-heading font-bold text-base" style={{ color: 'var(--text-primary)' }}>
          ExpenseWise
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/expenses?add=1')}
            className="px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 primary-button relative z-[1001]"
            style={{ cursor: 'pointer', userSelect: 'none', pointerEvents: 'auto' }}
          >
            <Plus size={14} />
            Add Expense
          </button>
          <label className="ui-switch" style={{ '--switch-bg': resolvedTheme === 'dark' ? '#2d2d2d' : '#caced6' }}>
            <input
              id="theme-toggle"
              type="checkbox"
              checked={resolvedTheme === 'dark'}
              onChange={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            />
            <div className="slider">
              <div className="circle" style={{ '--dark-purple': '#7a00ff' }}>
                {/* Icon will swap automatically with CSS */}
                <svg className="icon sun" viewBox="0 0 24 24">
                  <path d="M12 4V2m0 20v-2m8-8h2M2 12h2m12.95 7.05l1.41 1.41M4.64 4.64l1.41 1.41m0 12.02l-1.41 1.41m14.14-14.14l-1.41 1.41"/>
                  <circle cx="12" cy="12" r="5"></circle>
                </svg>
                <svg className="icon moon" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 0 1 11.21 3 7 7 0 1 0 21 12.79z"/>
                </svg>
              </div>
            </div>
          </label>
          <button
            onClick={handleLogout}
            className="px-3 py-1 rounded-full text-xs font-medium border"
            style={{ borderColor: 'var(--border-color)' }}
          >
            Logout
          </button>
        </div>
      </header>
    </>
  )
}
