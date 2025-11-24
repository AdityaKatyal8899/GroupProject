// Centralized API base and fetch wrapper
// Determines API base via Vite env when present, otherwise falls back
// to localhost in dev and Render URL in production.

const DEFAULT_DEV = 'http://localhost:5000'
const DEFAULT_DEV_ALT = 'http://127.0.0.1:5000'
const DEFAULT_PROD = 'https://myexpesnetrackerbackend-aditya.onrender.com'

function resolveApiBase() {
  const viteEnv = (typeof import.meta !== 'undefined' && import.meta && import.meta.env) ? import.meta.env : {}
  const viteUrl = viteEnv && viteEnv.VITE_API_URL
  if (viteUrl) return viteUrl.replace(/\/$/, '')

  // Prioritize production by default; fallbacks handled in apiFetch
  return DEFAULT_PROD
}

export const apiBase = resolveApiBase()

function getFallbackBases(primary) {
  const list = [primary]
  if (!list.includes(DEFAULT_DEV)) list.push(DEFAULT_DEV)
  if (!list.includes(DEFAULT_DEV_ALT)) list.push(DEFAULT_DEV_ALT)
  return list
}

export async function apiFetch(path, options = {}) {
  const opts = { credentials: 'include', ...options }

  // Absolute URLs: no fallback logic, just fetch
  if (path.startsWith('http')) {
    return fetch(path, opts)
  }

  const bases = getFallbackBases(apiBase)
  let lastError = null
  for (let i = 0; i < bases.length; i++) {
    const base = bases[i].replace(/\/$/, '')
    const url = `${base}${path.startsWith('/') ? '' : '/'}${path}`
    try {
      const res = await fetch(url, opts)
      return res
    } catch (e) {
      lastError = e
      // On network error, try next base
      continue
    }
  }
  // If all attempts failed, rethrow last error
  if (lastError) throw lastError
  // Fallback: this should not happen, but return a rejected promise
  return Promise.reject(new Error('All API endpoints unreachable'))
}
