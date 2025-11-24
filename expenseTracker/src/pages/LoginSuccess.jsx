import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../components/common/toast/ToastProvider'
import { apiFetch } from '../lib/api'

export default function LoginSuccess() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const google_id = params.get('google_id')
    const name = params.get('name')
    const email = params.get('email')
    const picture = params.get('picture')
    const access_token_qp = params.get('access_token')

    async function finalizeLogin() {
      try {
        if (!google_id || !name || !email || !picture) {
          throw new Error('Missing login details')
        }
        const res = await apiFetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ google_id, name, email, picture, token: access_token_qp }),
        })
        let json = null
        try { json = await res.json() } catch {}
        if (!res.ok) throw new Error((json && (json.message || json.error)) || 'Login failed')

        const payload = json || {}
        const appToken = payload.access_token || access_token_qp
        const appName = payload.name || name
        const appEmail = payload.email || email
        const appPicture = payload.picture || picture

        if (!appToken || !appEmail) throw new Error('Invalid backend response')

        try {
          localStorage.setItem('token', appToken)
          if (appName) localStorage.setItem('name', appName)
          localStorage.setItem('email', appEmail)
          if (appPicture) {
            localStorage.setItem('avatar', appPicture)
            localStorage.setItem('picture', appPicture)
          }
        } catch {}

        showToast('success', 'Logged in successfully')
        navigate('/dashboard', { replace: true })
      } catch (e) {
        showToast('error', e?.message || 'Login failed')
        navigate('/login', { replace: true })
      }
    }

    finalizeLogin()
  }, [navigate, showToast])

  return null
}
