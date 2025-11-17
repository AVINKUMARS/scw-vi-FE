import { API_BASE } from './api'

export function saveToken(token: string){ localStorage.setItem('token', token) }
export function getToken(){ return localStorage.getItem('token') }
export function clearToken(){ localStorage.removeItem('token') }

// SSO helpers
export const SSO_CALLBACK_PATH = (import.meta as any).env?.VITE_SSO_CALLBACK_PATH ?? '/sso/callback'
const SSO_START_BASE: string = (import.meta as any).env?.VITE_SSO_START_BASE ?? `${API_BASE}/auth/sso`

export function beginSso(provider: string) {
  const base = SSO_START_BASE.replace(/\/$/, '')
  const redirect = ((import.meta as any).env?.VITE_SSO_REDIRECT_URL as string) 
    || `${window.location.origin}${SSO_CALLBACK_PATH}`
  const url = `${base}/${encodeURIComponent(provider)}?redirect_uri=${encodeURIComponent(redirect)}`
  window.location.assign(url)
}

export function extractTokenFromLocation(loc: Location): string | null {
  try {
    const url = new URL(loc.href)
    const qp = url.searchParams
    // Common param names used by backends
    const keys = ['token', 'access_token', 'id_token']
    for (const k of keys) {
      const v = qp.get(k)
      if (v) return v
    }
    // Some providers may return in hash
    if (url.hash) {
      const hash = new URLSearchParams(url.hash.replace(/^#/, ''))
      for (const k of keys) {
        const v = hash.get(k)
        if (v) return v
      }
    }
  } catch {}
  return null
}
