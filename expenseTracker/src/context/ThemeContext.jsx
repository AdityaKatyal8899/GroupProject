import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext()
const STORAGE_KEY = 'expensewise.theme.v1'

const getSystemPreference = () => {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved
    } catch {}
    return 'system'
  })
  const [systemTheme, setSystemTheme] = useState(getSystemPreference)
  const resolvedTheme = theme === 'system' ? systemTheme : theme

  useEffect(() => {
    if (typeof window === 'undefined') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => setSystemTheme(e.matches ? 'dark' : 'light')
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    // Apply data-theme attribute for global CSS variables
    root.setAttribute('data-theme', resolvedTheme === 'dark' ? 'dark' : 'light')
    try {
      localStorage.setItem(STORAGE_KEY, theme)
      localStorage.setItem('theme', resolvedTheme)
    } catch {}
  }, [theme, resolvedTheme])

  function toggleTheme() {
    setTheme((current) => {
      const isDark = current === 'dark' || (current === 'system' && resolvedTheme === 'dark')
      return isDark ? 'light' : 'dark'
    })
  }

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
