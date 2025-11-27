import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { saveToken } from '../lib/auth'
import FormInput from '../components/FormInput'
import Button from '../components/Button'
import { Zap, Shield, Gauge } from 'lucide-react'

const CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string | undefined

export default function Login() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const gsiBtnRef = useRef<HTMLDivElement>(null)

  // Prefill email from localStorage or URL param
  useEffect(() => {
    try {
      const url = new URL(window.location.href)
      const fromParam = url.searchParams.get('email')
      const fromStore = localStorage.getItem('last_login_email') || ''
      const initial = fromParam || fromStore
      if (initial) setEmail(initial)
    } catch {}
  }, [])

  useEffect(() => {
    try { localStorage.setItem('last_login_email', email || '') } catch {}
  }, [email])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      saveToken(data.token)
      // If a landing draft exists, auto-create a chat and send it immediately; else open latest chat or create one
      try {
        const raw = localStorage.getItem('lp_draft_query')
        if (raw) {
          const parsed = JSON.parse(raw || '{}') as { q?: string }
          const q = (parsed?.q || '').trim()
          if (q) {
            const created = await api.post('/chat/new', { title: 'New Chat' })
            const cid = created.data?.chat_id || created.data?.id || created.data?.chat?.id
            if (cid) {
              try { localStorage.setItem('pending_thinking_chat', String(cid)) } catch {}
              // Fire-and-navigate: do not await send to avoid blocking UI
              api.post('/chat/send', { chat_id: Number(cid), message: q }).catch(() => {})
              localStorage.removeItem('lp_draft_query')
              nav(`/chat/${cid}`, { replace: true })
              return
            }
          }
        }
        // No draft: try to open latest existing chat
        try {
          const { data: list } = await api.get('/chat')
          const arr = Array.isArray(list) ? list : []
          if (arr.length > 0 && arr[0]?.id != null) {
            nav(`/chat/${arr[0].id}`, { replace: true })
            return
          }
        } catch {}
        // If none exist, create one and open it
        const created = await api.post('/chat/new', { title: 'New Chat' })
        const cid = created.data?.chat_id || created.data?.id || created.data?.chat?.id
        if (cid) {
          nav(`/chat/${cid}`, { replace: true })
          return
        }
      } catch {}
      // Fallback
      nav('/new-chat')
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    const onCredentialResponse = async (res: any) => {
      if (!res?.credential) {
        setErr('Google sign-in failed')
        return
      }
      try {
        setErr('')
        const { data } = await api.post('/auth/sso/google', { id_token: res.credential })
        try { console.log('SSO /auth/sso/google response (login):', data) } catch {}
        if (!data?.token) throw new Error('Missing token in response')
        saveToken(data.token)

        // Check if user is new or needs mobile verification
        const isNewUser = data && (data.is_new || data.new_user)
        const needsSetup = data && (data.needs_setup || (data.profile && data.profile.needs_setup))
        const needsMobileVerification = data && data.needs_mobile_verification

        if (isNewUser || needsMobileVerification) {
          // New user or user without phone verification - collect mobile
          nav('/verify-mobile', {
            replace: true,
            state: {
              ssoData: {
                token: data.token,
                user_id: data.user_id,
                user: {
                  name: data.user?.name || '',
                  email: data.user?.email || ''
                }
              }
            }
          })
        } else if (needsSetup) {
          nav('/setup', { replace: true })
        } else {
          // Try to auto-send landing draft if available; otherwise open latest or create new chat
          try {
            const raw = localStorage.getItem('lp_draft_query')
            if (raw) {
              const parsed = JSON.parse(raw || '{}') as { q?: string }
              const q = (parsed?.q || '').trim()
              if (q) {
                const created = await api.post('/chat/new', { title: 'New Chat' })
                const cid = created.data?.chat_id || created.data?.id || created.data?.chat?.id
                if (cid) {
                  try { localStorage.setItem('pending_thinking_chat', String(cid)) } catch {}
                  api.post('/chat/send', { chat_id: Number(cid), message: q }).catch(() => {})
                  localStorage.removeItem('lp_draft_query')
                  nav(`/chat/${cid}`, { replace: true })
                  return
                }
              }
            }
            // No draft: open latest chat if any
            try {
              const { data: list } = await api.get('/chat')
              const arr = Array.isArray(list) ? list : []
              if (arr.length > 0 && arr[0]?.id != null) {
                nav(`/chat/${arr[0].id}`, { replace: true })
                return
              }
            } catch {}
            const created = await api.post('/chat/new', { title: 'New Chat' })
            const cid = created.data?.chat_id || created.data?.id || created.data?.chat?.id
            if (cid) {
              nav(`/chat/${cid}`, { replace: true })
              return
            }
          } catch {}
          nav('/new-chat', { replace: true })
        }
      } catch (e: any) {
        const msg = e?.response?.data?.error || e?.message || 'Google sign-in failed'
        try { console.error('SSO login error:', e?.response?.data || e) } catch {}
        setErr(String(msg))
      }
    }

    function initGsi() {
      if (cancelled || !CLIENT_ID) return
      const g = (window as any).google?.accounts?.id
      if (!g) return
      g.initialize({ client_id: CLIENT_ID, callback: onCredentialResponse })
      if (gsiBtnRef.current) {
        g.renderButton(gsiBtnRef.current, { theme: 'outline', size: 'large', text: 'continue_with', shape: 'rectangular' })
      }
      try { g.prompt() } catch {}
    }

    initGsi()
    const iv = setInterval(() => {
      if ((window as any).google?.accounts?.id) {
        clearInterval(iv)
        initGsi()
      }
    }, 200)

    return () => { cancelled = true; clearInterval(iv) }
  }, [nav])

  const loginCard = (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome Back</h2>
        <form onSubmit={onSubmit} className="grid gap-4">
          <FormInput
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <FormInput
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-700">Forgot password?</Link>
          </div>
          {err && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{err}</div>
          )}
          <Button type="submit" loading={loading} size="lg" className="w-full">Sign In</Button>
        </form>
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-500 text-sm font-medium">or continue with</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="space-y-3">
          {!CLIENT_ID && (
            <p className="text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-lg p-3">Missing VITE_GOOGLE_CLIENT_ID. Set it in your environment.</p>
          )}
          <div
            ref={gsiBtnRef}
            id="google-signin-btn"
            className="flex justify-center w-full"
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '56px', width: '100%' }}
          ></div>
          {CLIENT_ID && (
            <p className="text-xs text-center text-gray-500 mt-2">Google button should appear above</p>
          )}
        </div>
        <div className="text-center pt-4">
          <p className="text-gray-700 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2">Register</Link>
          </p>
        </div>
      </div>
    </div>
  )

  // Render as full page on /login; modal is used only from landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex items-center justify-center px-4 py-8">
      {loginCard}
    </div>
  )
}

