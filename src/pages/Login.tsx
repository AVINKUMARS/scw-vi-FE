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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      saveToken(data.token)
      nav('/home')
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
          nav('/home', { replace: true })
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">S</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Scalingwolf AI</h1>
          <p className="text-gray-600 text-sm">Scale your business with AI-powered insights</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome Back</h2>

          <form onSubmit={onSubmit} className="grid gap-4">
            <div>
              <FormInput
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <FormInput
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-80 transition"
              >
                Forgot password?
              </Link>
            </div>

            {err && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
                <span className="text-red-600 text-sm">{err}</span>
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              size="lg"
              className="w-full mt-2"
            >
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-500 text-sm font-medium">or continue with</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google Sign In */}
          <div className="space-y-3">
            {!CLIENT_ID && (
              <p className="text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-lg p-3">
                Missing VITE_GOOGLE_CLIENT_ID. Set it in your environment.
              </p>
            )}
            <div
              ref={gsiBtnRef}
              id="google-signin-btn"
              className="flex justify-center w-full"
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '56px',
                width: '100%'
              }}
            ></div>
            {/* Fallback button if Google doesn't load */}
            {CLIENT_ID && (
              <p className="text-xs text-center text-gray-500 mt-2">
                Google button should appear above
              </p>
            )}
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="text-center">
            <div className="bg-purple-50 rounded-lg p-3 mb-2 flex justify-center">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-xs text-gray-600 font-medium">Fast & Easy</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-50 rounded-lg p-3 mb-2 flex justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xs text-gray-600 font-medium">Secure</p>
          </div>
          <div className="text-center">
            <div className="bg-cyan-50 rounded-lg p-3 mb-2 flex justify-center">
              <Gauge className="w-5 h-5 text-cyan-600" />
            </div>
            <p className="text-xs text-gray-600 font-medium">Reliable</p>
          </div>
        </div>

        {/* Register Link */}
        <div className="text-center pt-4">
          <p className="text-gray-700 text-sm">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-purple-600 hover:text-blue-600 transition-colors duration-200 underline underline-offset-2"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
