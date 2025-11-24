// Centralized API base and fetch wrapper
// Determines API base via Vite env when present, otherwise falls back
// to localhost in dev and Render URL in production.

const DEFAULT_DEV = 'http://localhost:5000'
const DEFAULT_PROD = 'https://myexpesnetrackerbackend-aditya.onrender.com'

function resolveApiBase() {
  const viteEnv = (typeof import !== 'undefined' && import.meta && import.meta.env) ? import.meta.env : {}
  const viteUrl = viteEnv && viteEnv.VITE_API_URL
  if (viteUrl) return viteUrl.replace(/\/$/, '')

  // Heuristic: localhost -> dev backend, else -> deployed backend
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    if (host === 'localhost' || host === '127.0.0.1') return DEFAULT_DEV
  }
  return DEFAULT_PROD
}

export const apiBase = resolveApiBase()

export async function apiFetch(path, options = {}) {
  const url = path.startsWith('http') ? path : `${apiBase}${path.startsWith('/') ? '' : '/'}${path}`
  const opts = {
    credentials: 'include',
    ...options,
  }
  return fetch(url, opts)
}
