import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../components/common/toast/ToastProvider'

export default function Profile() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [initial, setInitial] = useState({ token: '', name: '', email: '', avatar: '' })
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [avatar, setAvatar] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login', { replace: true })
      return
    }
    const n = localStorage.getItem('name') || ''
    const e = localStorage.getItem('email') || ''
    const a = localStorage.getItem('avatar') || ''
    setInitial({ token, name: n, email: e, avatar: a })
    setName(n)
    setEmail(e)
    setAvatar(a)
  }, [navigate])

  const dirty = useMemo(() => name !== initial.name || avatar !== initial.avatar, [name, avatar, initial])

  async function handleSave() {
    if (!dirty || saving) return
    setSaving(true)
    try {
      const token = initial.token
      const res = await fetch('http://localhost:5000/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, name, avatar }),
      })
      let json = null
      try { json = await res.json() } catch {}
      if (!res.ok) throw new Error((json && (json.message || json.error)) || 'Failed to update profile')
      try {
        localStorage.setItem('name', name)
        if (avatar) localStorage.setItem('avatar', avatar)
      } catch {}
      setInitial((i) => ({ ...i, name, avatar }))
      showToast('success', 'Profile updated')
    } catch (e) {
      showToast('error', e?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  function handleChangePhoto() {
    const url = window.prompt('Enter image URL for your avatar:')
    if (url) setAvatar(url)
  }

  return (
    <div className="p-4 space-y-4 md:p-0 md:space-y-6">
      <h1 className="h1-heading text-2xl font-bold">Profile</h1>

      {/* Avatar Block */}
      <section className="card-base p-6 flex items-center gap-6">
        <div className="relative">
          {avatar ? (
            <img src={avatar} alt="Avatar" className="mx-auto md:mx-0 h-24 w-24 md:h-20 md:w-20 rounded-full object-cover" />
          ) : (
            <div className="mx-auto md:mx-0 h-24 w-24 md:h-20 md:w-20 rounded-full" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
          )}
        </div>
        <div className="space-y-2">
          <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            Your avatar
          </div>
          <button
            onClick={handleChangePhoto}
            className="px-3 py-2 rounded-lg border"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
          >
            Change photo
          </button>
        </div>
      </section>

      {/* Account Details */}
      <section className="card-base p-6 space-y-4 max-w-2xl">
        <div className="rounded-2xl p-4 space-y-4 md:bg-transparent md:p-0 md:space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Name
              </label>
              <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Your name" className="rounded-lg px-3 py-2" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Email
              </label>
              <input type="email" value={email} readOnly className="rounded-lg px-3 py-2 opacity-80" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button disabled={!dirty || saving} onClick={handleSave} className="px-4 py-2 rounded-lg primary-button disabled:opacity-60 disabled:cursor-not-allowed">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
