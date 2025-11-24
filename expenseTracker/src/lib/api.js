// Centralized API base and fetch wrapper
// Always use the deployed backend domain from a single config source
import { API_BASE_URL } from '../config'

export const apiBase = API_BASE_URL.replace(/\/$/, '')

export async function apiFetch(path, options = {}) {
  const opts = { credentials: 'include', ...options }

  // Absolute URLs: no fallback logic, just fetch
  if (path.startsWith('http')) {
    return fetch(path, opts)
  }

  const url = `${apiBase}${path.startsWith('/') ? '' : '/'}${path}`
  return fetch(url, opts)
}
