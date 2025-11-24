import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../components/common/toast/ToastProvider'

export default function Login() {
  const navigate = useNavigate()
  const { resolvedTheme } = useTheme()
  const { showToast } = useToast()

  // On load: if already logged in, go to dashboard.
  useEffect(() => {
    const existing = localStorage.getItem('token')
    if (existing) navigate('/dashboard', { replace: true })
  }, [navigate])

  const logoSrc = resolvedTheme === 'dark' ? '/darkMode.png' : '/lightMode.png'

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md card-base p-6 space-y-6 text-center">
        <img src={logoSrc} alt="Logo" className="mx-auto h-16 w-16" />
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Sign in</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Continue with your Google account</p>
        <button
          onClick={() => { window.location.href = 'http://localhost:5000/api/auth/google/login' }}
          className="primary-button inline-flex items-center justify-center w-full py-2 rounded-lg"
        >
          Continue with Google
        </button>
      </div>
    </div>
  )
}
