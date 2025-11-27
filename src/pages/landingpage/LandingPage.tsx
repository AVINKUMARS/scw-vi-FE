import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import bg from '../../assets/nlogo.jpg';
import { ArrowRight } from 'lucide-react'
import Modal from '../../components/Modal'
import { api } from '../../lib/api'
import { saveToken } from '../../lib/auth'
import { Link } from 'react-router-dom'

const LandingPage: React.FC = () => {
  const nav = useNavigate()
  const [loginOpen, setLoginOpen] = useState(false)
  return (
    <div className="min-h-screen flex flex-col">
      {/* HERO on background image */}
      <section
        className="relative text-white"
        style={{ backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        {/* Brand gradient overlay for hero */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-purple-600/25 via-blue-600/20 to-transparent" />
        <div className="min-h-screen relative bg-black/10 flex flex-col">
          {/* Top header over hero */}
          <header className="w-full flex justify-between items-center py-4 px-4 sm:px-6 md:px-8">
            <div className="text-base sm:text-lg font-bold">Scalingwolf AI</div>
            <nav className="hidden md:flex items-center gap-5 text-sm">
              <button
                onClick={() => nav('/pricing')}
                className="hover:underline"
              >Pricing</button>
              <button
                onClick={() => {
                  if (window.location.pathname !== '/landing') nav('/landing#features')
                  else document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="hover:underline"
              >Features</button>
              <button
                onClick={() => {
                  if (window.location.pathname !== '/landing') nav('/landing#how-it-works')
                  else document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="hover:underline"
              >How it works</button>
            </nav>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLoginOpen(true)}
                className="px-4 py-2 rounded-md bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 text-white"
              >Sign in</button>
              <button
                onClick={() => nav('/register')}
                className="px-4 py-2 rounded-md bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 text-white"
              >Get started</button>
            </div>
          </header>
          <div className="flex-1 flex flex-col items-center text-center px-4">
          <div className="mt-16 inline-block bg-white/10 backdrop-blur px-4 py-1 rounded-full text-sm">Operate smarter, grow faster</div>
          <h1 className="mt-6 text-4xl sm:text-5xl font-extrabold tracking-tight">
            Scale your business with <span className="italic">AI‑powered</span> insights
          </h1>
          <p className="mt-3 text-base sm:text-lg text-white/80 max-w-3xl">One workspace for Team, Finance, Process, Sales, and Founder ops — with a chat copilot on your data.</p>

          <RollingPrompt onAsk={(q, cat) => {
            try { localStorage.setItem('lp_draft_query', JSON.stringify({ q, cat })) } catch {}
            // Open inline login modal on landing page
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            (setLoginOpen || (()=>{}))(true)
          }} />
          <div className="h-10" />
          </div>
        </div>
      </section>

      {/* Removed sticky header below; header now sits at top of page over hero */}

      {/* CONTENT below background image */}
      <section id="features" className="bg-[var(--bg)] text-neutral-900 dark:text-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[ 
              { title: 'Team Health', desc: 'Structure, productivity, and hiring adequacy.' },
              { title: 'Finance Health', desc: 'Margins, runway, and revenue per employee.' },
              { title: 'Process Health', desc: 'SOPs, bottlenecks, and automation opportunities.' },
              { title: 'Sales Insights', desc: 'Growth, ARPU, and revenue consistency.' },
              { title: 'Founder OS', desc: 'Habits, cadence, and leverage to scale.' },
              { title: 'Chat Copilot', desc: 'Ask anything. Grounded in your data.' },
            ].map((f) => (
              <div key={f.title} className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60">
                <h3 className="text-base font-semibold">{f.title}</h3>
                <p className="text-sm mt-1 text-neutral-700 dark:text-neutral-300">{f.desc}</p>
              </div>
            ))}
          </div>

          <section id="how-it-works" className="mt-12 w-full grid gap-3 text-left">
            <h2 className="text-xl font-semibold text-center">How it works</h2>
            <ol className="grid sm:grid-cols-3 gap-3 text-sm mt-2">
              <li className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60">
                <div className="font-semibold mb-1">1. Set up company</div>
                <p className="text-neutral-700 dark:text-neutral-300">Add revenue, team, and core processes.</p>
              </li>
              <li className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60">
                <div className="font-semibold mb-1">2. Invite your team</div>
                <p className="text-neutral-700 dark:text-neutral-300">Capture ops data in minutes — not weeks.</p>
              </li>
              <li className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60">
                <div className="font-semibold mb-1">3. Ask the copilot</div>
                <p className="text-neutral-700 dark:text-neutral-300">Get prioritized insights and a 90‑day plan.</p>
              </li>
            </ol>
          </section>

          <div className="mt-10 flex items-center justify-center gap-3">
            <button onClick={() => nav('/register')} className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold">Start free</button>
            <button onClick={() => nav('/pricing')} className="px-5 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700">See pricing</button>
          </div>
        </div>
      </section>
      <Modal open={loginOpen} onClose={() => setLoginOpen(false)} noBackdrop>
        <LoginInline onSuccess={(token) => { try { saveToken(token) } catch {}; setLoginOpen(false) }} />
      </Modal>
    </div>
  );
};

export default LandingPage;

function LoginInline({ onSuccess }: { onSuccess: (token: string) => void }) {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string | undefined
  const gsiBtnRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    try {
      const fromStore = localStorage.getItem('last_login_email') || ''
      if (fromStore) setEmail(fromStore)
    } catch {}
  }, [])
  useEffect(() => { try { localStorage.setItem('last_login_email', email || '') } catch {} }, [email])
  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!email || !password) { setError('Enter email and password'); return }
    setLoading(true); setError(null)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      const token = data?.token
      if (!token) throw new Error('Missing token')
      onSuccess(token)
      // If a landing draft exists, auto-send now and go to that chat
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
      } catch {}
      nav('/new-chat', { replace: true })
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Login failed')
    } finally { setLoading(false) }
  }
  useEffect(() => {
    let cancelled = false
    const onCredentialResponse = async (res: any) => {
      if (!res?.credential) return
      try {
        const { data } = await api.post('/auth/sso/google', { id_token: res.credential })
        try { console.log('SSO /auth/sso/google response (landing):', data) } catch {}
        const token = data?.token
        if (!token) throw new Error('Missing token')
        onSuccess(token)
        const isNewUser = data && (data.is_new || data.new_user)
        const needsSetup = data && (data.needs_setup || (data.profile && data.profile.needs_setup))
        const needsMobileVerification = data && data.needs_mobile_verification
        if (isNewUser || needsMobileVerification) {
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
          // Try auto-send landing draft; else open latest chat or create one
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
            // No draft
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
      } catch (e) {
        // fallback: do nothing special here; error surfaced via email flow UI if needed
      }
    }
    const initGsi = () => {
      if (cancelled || !CLIENT_ID) return
      const g = (window as any).google?.accounts?.id
      if (!g) return
      g.initialize({ client_id: CLIENT_ID, callback: onCredentialResponse })
      if (gsiBtnRef.current) {
        g.renderButton(gsiBtnRef.current, { theme: 'outline', size: 'large', text: 'continue_with', shape: 'rectangular' })
      }
    }
    initGsi()
    const iv = window.setInterval(() => {
      const g = (window as any).google?.accounts?.id
      if (g) { window.clearInterval(iv); initGsi() }
    }, 200)
    return () => { cancelled = true; window.clearInterval(iv) }
  }, [CLIENT_ID, onSuccess])

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome Back</h2>
        <form onSubmit={submit} className="grid gap-4">
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-md border border-neutral-300 bg-white text-neutral-900 px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-md border border-neutral-300 bg-white text-neutral-900 px-3 py-2 text-sm"
              required
            />
          </div>
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-700">Forgot password?</Link>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded-md text-white text-sm font-semibold ${loading ? 'bg-neutral-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90'}`}
          >{loading ? 'Signing in…' : 'Sign In'}</button>
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
          <div ref={gsiBtnRef} id="google-signin-landing" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 56 }}></div>
          {CLIENT_ID && (
            <p className="text-xs text-center text-gray-500">Google button should appear above</p>
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
}

// Rolling prompt component for hero
function RollingPrompt({ onAsk }: { onAsk?: (q: string, cat?: string) => void }) {
  const prompts = [
    "What's my sales trend and ARPU this month?",
    'Find bottlenecks across Team and Process',
    'Draft a 90-day roadmap from our scores',
    'Summarize last upload into action items',
  ]
  const [idx, setIdx] = useState(0)
  const [placeholder, setPlaceholder] = useState('')
  const [userInput, setUserInput] = useState('')
  const [focused, setFocused] = useState(false)
  const [category, setCategory] = useState<string | undefined>(undefined)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const canAsk = userInput.trim().length > 0
  const textRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    let mounted = true
    let typeTimer: number | null = null
    let holdTimer: number | null = null
    const phrase = prompts[idx]
    let i = 0
    const type = () => {
      if (!mounted) return
      if (i <= phrase.length && !userInput) {
        setPlaceholder(phrase.slice(0, i))
        i += 1
        typeTimer = window.setTimeout(type, 40)
      } else {
        holdTimer = window.setTimeout(() => {
          if (!mounted) return
          setIdx((idx + 1) % prompts.length)
        }, 1200)
      }
    }
    type()
    return () => {
      mounted = false
      if (typeTimer) window.clearTimeout(typeTimer)
      if (holdTimer) window.clearTimeout(holdTimer)
    }
  }, [idx, userInput])

  const chips = ['Team', 'Finance', 'Sales', 'Process', 'Founder']

  const ask = () => {
    if (!canAsk) return
    const q = userInput.trim()
    onAsk?.(q, category)
  }

  // Persist draft so landing login can auto-send after auth
  useEffect(() => {
    try {
      const q = userInput.trim()
      if (q) {
        localStorage.setItem('lp_draft_query', JSON.stringify({ q, cat: category }))
      } else {
        // Clear if empty to avoid stale sends
        const existing = localStorage.getItem('lp_draft_query')
        if (existing) localStorage.removeItem('lp_draft_query')
      }
    } catch {}
  }, [userInput, category])

  return (
    <div className="mt-8 w-full flex flex-col items-center">
      <div className="w-full max-w-2xl bg-neutral-900/70 border border-white/20 rounded-lg px-4 py-3">
        <div className="flex items-start gap-2">
          <textarea
            ref={textRef}
            value={userInput}
            onChange={e => {
              setUserInput(e.target.value)
              const el = textRef.current
              if (el) { el.style.height = '2.25rem'; el.style.height = Math.min(el.scrollHeight, 96) + 'px' }
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (canAsk) ask()
              }
            }}
            placeholder={focused ? '' : placeholder}
            className="flex-1 bg-transparent outline-none text-white placeholder-white/70 text-sm resize-none scrollbar-edge"
            aria-label="Ask a question"
            rows={1}
            style={{ minHeight: '2.25rem', maxHeight: '6rem', overflowY: 'auto' }}
          />
        </div>
        <div className="mt-6 flex items-center gap-2 justify-between">
          <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
            {/* Upload button (plus icon) */}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-white/90 border border-white/30 hover:bg-white/20"
              title="Attach files"
              aria-label="Attach files"
            >
              <span className="text-lg leading-none">+</span>
            </button>
            <input
              ref={fileRef}
              type="file"
              multiple
              hidden
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
            />
            {files.length > 0 && (
              <span className="px-2 py-1 rounded-md text-xs bg-white/10 border border-white/30 text-white/80">
                {files.length} selected
              </span>
            )}
            {chips.map(c => (
              <button
                key={c}
                onClick={() => setCategory(prev => prev === c ? undefined : c)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${category===c ? 'bg-blue-600 text-white border-blue-600' : 'bg-white/10 text-white/90 border-white/30 hover:bg-white/20'}`}
              >{c}</button>
            ))}
          </div>
          <div className="shrink-0">
            <button
              onClick={ask}
              disabled={!canAsk}
              className={`${canAsk ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 text-white' : 'bg-white/10 text-white/40 border border-white/20 cursor-not-allowed'} inline-flex items-center justify-center w-9 h-9 rounded-full`}
              aria-label="Ask"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
